import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SUARA,
  resultBand,
  type CategoryFilter,
  type SoundId,
} from '../../content/suara'
import SoundArt from './SoundArt'
import SoundButton from './SoundButton'
import type { UiSound } from './audio'
import type { ArtMode, BestRun } from './storage'
import { useQuiz } from './useQuiz'

interface QuizPanelProps {
  filter: CategoryFilter
  art: ArtMode
  playing: SoundId | null
  play: (id: SoundId, force?: boolean) => void
  stop: () => void
  blip: (kind: UiSound) => void
  best: BestRun | null
  recordRun: (score: number, total: number) => boolean
  onExplore: () => void
}

/**
 * The listening test: one sound, four pictures. The run is capped at the size
 * of the shelf so a category with four sounds asks four fair questions.
 */
export default function QuizPanel({
  filter,
  art,
  playing,
  play,
  stop,
  blip,
  best,
  recordRun,
  onExplore,
}: QuizPanelProps) {
  const quiz = useQuiz(filter)
  const [runId, setRunId] = useState(0)
  const [newRecord, setNewRecord] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)

  const current = quiz.current
  const answerId = current?.answer.id
  const finished = quiz.session.finished

  // Every new round starts by playing its sound. `force = false` keeps the
  // quiz silent when the speaker is muted — only a real press unmutes.
  useEffect(() => {
    if (!answerId) return
    play(answerId, false)
    return () => stop()
  }, [answerId, runId, play, stop])

  useEffect(() => {
    if (quiz.answered) nextRef.current?.focus()
  }, [quiz.answered])

  const choose = useCallback(
    (id: string) => {
      if (!current || quiz.answered) return
      const correct = id === current.answer.id
      quiz.answer(id)
      blip(correct ? 'right' : 'wrong')
    },
    [blip, current, quiz],
  )

  const handleNext = () => {
    if (!current) return
    const last = quiz.session.index + 1 >= quiz.total
    blip('tap')
    quiz.next()
    if (last) {
      // The score already includes this round, so it can be banked right here
      // instead of in an effect that would need the whole session as a dep.
      setNewRecord(recordRun(quiz.session.score, quiz.total))
      blip('win')
    }
  }

  const restart = () => {
    stop()
    quiz.restart()
    setNewRecord(false)
    setRunId((value) => value + 1)
  }

  const solved = quiz.session.results.filter(Boolean).length
  const total = quiz.total

  return (
    <section className="suara-quiz" aria-labelledby="suara-quiz-title">
      <header className="suara-quiz__head">
        <div className="suara-quiz__headline">
          <p className="suara-quiz__kicker">{SUARA.quizTitle}</p>
          <h2 className="suara-quiz__title" id="suara-quiz-title">
            {finished
              ? SUARA.quizResultKicker
              : SUARA.quizRun(Math.min(quiz.session.index + 1, total), total)}
          </h2>
        </div>

        <div className="suara-quiz__meter">
          <span>{SUARA.quizScore}</span>
          <b>
            {solved}
            <em>/{total}</em>
          </b>
        </div>
      </header>

      <ol className="suara-quiz__dots" aria-hidden="true">
        {quiz.session.rounds.map((round, index) => {
          const result = quiz.session.results[index]
          const state =
            result === undefined
              ? index === quiz.session.index
                ? 'is-now'
                : ''
              : result
                ? 'is-right'
                : 'is-wrong'
          return <li key={round.answer.id} className={state} />
        })}
      </ol>

      {finished ? (
        <div className="suara-result">
          <p className="suara-result__score">
            {SUARA.quizResultScore(quiz.session.score, total)}
          </p>
          <h3 className="suara-result__title">
            {resultBand(quiz.session.score, total).title}
          </h3>
          <p className="suara-result__text">
            {resultBand(quiz.session.score, total).text}
          </p>

          <p className="suara-result__best">
            <span>{SUARA.quizBest}</span>
            {best ? (
              <b>
                {best.score}/{best.total}
              </b>
            ) : (
              <b>{SUARA.quizNoBest}</b>
            )}
          </p>

          {newRecord && (
            <p className="suara-result__record">{SUARA.quizRecord}</p>
          )}

          <div className="suara-result__actions">
            <button
              type="button"
              className="suara-quiz__primary"
              onClick={restart}
            >
              {SUARA.quizAgain}
            </button>
            <button
              type="button"
              className="suara-quiz__ghost"
              onClick={onExplore}
            >
              {SUARA.quizToExplore}
            </button>
          </div>
        </div>
      ) : (
        current && (
          <>
            <div className="suara-quiz__hero">
              <p className="suara-quiz__prompt">{SUARA.quizQuestion}</p>
              <SoundButton
                playing={playing === current.answer.id}
                onClick={() => play(current.answer.id)}
                label={SUARA.playQuestion}
                text={SUARA.play}
                size="lg"
              />
              <p className="suara-quiz__hint">{SUARA.quizHint}</p>
            </div>

            <div
              className="suara-quiz__choices"
              role="group"
              aria-label={SUARA.quizChoices}
            >
              {current.choices.map((choice, index) => {
                const isAnswer = choice.id === current.answer.id
                const isPicked = quiz.session.picked === choice.id
                const state = !quiz.answered
                  ? ''
                  : isAnswer
                    ? ' is-correct'
                    : isPicked
                      ? ' is-wrong'
                      : ' is-dim'
                return (
                  <button
                    key={choice.id}
                    type="button"
                    className={`suara-choice${state}`}
                    onClick={() => choose(choice.id)}
                    disabled={quiz.answered}
                    aria-label={SUARA.choiceAria(index + 1)}
                  >
                    <SoundArt item={choice} mode={art} decorative eager />
                    {quiz.answered && isAnswer && (
                      <span className="suara-choice__mark" aria-hidden="true">
                        ✓
                      </span>
                    )}
                    {quiz.answered && isPicked && !isAnswer && (
                      <span
                        className="suara-choice__mark suara-choice__mark--wrong"
                        aria-hidden="true"
                      >
                        ✕
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="suara-quiz__feedback">
              {quiz.answered && (
                <div
                  className={`suara-feedback${quiz.wasCorrect ? ' is-correct' : ' is-wrong'}`}
                  role="status"
                  aria-live="polite"
                >
                  <p className="suara-feedback__verdict">
                    {quiz.wasCorrect ? SUARA.quizCorrect : SUARA.quizWrong}
                  </p>
                  <p className="suara-feedback__answer">
                    {SUARA.quizAnswer(current.answer.name)}
                  </p>
                  <p className="suara-feedback__note">{current.answer.note}</p>
                  <div className="suara-feedback__actions">
                    <button
                      type="button"
                      className="suara-quiz__ghost"
                      onClick={() => play(current.answer.id)}
                    >
                      {SUARA.replay}
                    </button>
                    <button
                      type="button"
                      className="suara-quiz__primary"
                      onClick={handleNext}
                      ref={nextRef}
                    >
                      {quiz.session.index + 1 >= total
                        ? SUARA.quizFinish
                        : SUARA.quizNext}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )
      )}
    </section>
  )
}
