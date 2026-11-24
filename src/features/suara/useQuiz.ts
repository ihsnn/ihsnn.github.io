import { useCallback, useState } from 'react'
import {
  QUIZ_CHOICES,
  QUIZ_LENGTH,
  SOUND_ITEMS,
  itemsIn,
  type CategoryFilter,
  type SoundItem,
} from '../../content/suara'

export interface QuizRound {
  answer: SoundItem
  choices: readonly SoundItem[]
}

export interface QuizSession {
  rounds: readonly QuizRound[]
  index: number
  score: number
  /** Which picture was tapped this round, or `null` while it is open. */
  picked: string | null
  /** One entry per finished round, in order — drives the progress dots. */
  results: readonly boolean[]
  finished: boolean
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = items.slice()
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Builds one run: a shuffled answer list capped at `QUIZ_LENGTH`, and for each
 * answer three distractors. Distractors come from the same category first so
 * the round is a real listening test (a cow is never offered next to a train
 * if two other animals are available), then from the rest of the shelf.
 */
function buildRounds(category: CategoryFilter): QuizRound[] {
  const pool = itemsIn(category)
  const count = Math.max(1, Math.min(QUIZ_LENGTH, pool.length))
  const answers = shuffle(pool).slice(0, count)

  return answers.map((answer) => {
    const near = shuffle(pool.filter((item) => item.id !== answer.id))
    const far = shuffle(
      SOUND_ITEMS.filter(
        (item) => item.id !== answer.id && item.category !== answer.category,
      ),
    )
    const distractors: SoundItem[] = []
    for (const item of near) {
      if (distractors.length >= QUIZ_CHOICES - 1) break
      distractors.push(item)
    }
    for (const item of far) {
      if (distractors.length >= QUIZ_CHOICES - 1) break
      distractors.push(item)
    }
    return { answer, choices: shuffle([answer, ...distractors]) }
  })
}

function freshSession(category: CategoryFilter): QuizSession {
  return {
    rounds: buildRounds(category),
    index: 0,
    score: 0,
    picked: null,
    results: [],
    finished: false,
  }
}

export function useQuiz(category: CategoryFilter) {
  const [session, setSession] = useState<QuizSession>(() => freshSession(category))

  const current = session.finished ? null : session.rounds[session.index]
  const answered = session.picked !== null
  const wasCorrect = answered && current ? current.answer.id === session.picked : false

  const answer = useCallback((id: string) => {
    setSession((prev) => {
      if (prev.finished || prev.picked !== null) return prev
      const round = prev.rounds[prev.index]
      if (!round) return prev
      const correct = round.answer.id === id
      return {
        ...prev,
        picked: id,
        score: prev.score + (correct ? 1 : 0),
        results: [...prev.results, correct],
      }
    })
  }, [])

  const next = useCallback(() => {
    setSession((prev) => {
      if (prev.picked === null) return prev
      if (prev.index + 1 >= prev.rounds.length) {
        return { ...prev, finished: true }
      }
      return { ...prev, index: prev.index + 1, picked: null }
    })
  }, [])

  const restart = useCallback(() => {
    setSession(freshSession(category))
  }, [category])

  return {
    session,
    current,
    answered,
    wasCorrect,
    total: session.rounds.length,
    answer,
    next,
    restart,
  }
}
