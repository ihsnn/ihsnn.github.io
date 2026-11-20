import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../../components/shared/SiteHeader'
import {
  COMBO,
  FILTERS,
  FILTER_ORDER,
  HELP,
  LCD,
  LEVEL_COPY,
  MISSION,
  NOTES,
  PRIORITIES,
  PRIORITY_CARD,
  PRIORITY_ORDER,
  STREAK,
  TODO,
  formatClock,
  formatDate,
} from '../../content/todo'
import { MISSION_TARGET, MAX_TEXT } from './quest'
import type { Task } from './types'
import { useTodo } from './useTodo'
import './todo.css'

interface TaskRowProps {
  task: Task
  index: number
  selected: boolean
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  onPriority: (id: string) => void
  onDelete: (id: string) => void
}

/** One LCD line: checkbox, number, text, priority mark, delete. */
function TaskRow({
  task,
  index,
  selected,
  onSelect,
  onToggle,
  onPriority,
  onDelete,
}: TaskRowProps) {
  const priority = PRIORITIES[task.priority]

  return (
    <li
      className={`todo-row${task.done ? ' is-done' : ''}${selected ? ' is-selected' : ''}`}
      data-priority={task.priority}
      data-selected={selected ? 'true' : undefined}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        className="todo-row__check"
        onClick={() => onToggle(task.id)}
        aria-label={LCD.checkAria(task.done, task.text)}
      >
        <span aria-hidden="true" />
      </button>

      <span className="todo-row__index" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>

      <button
        type="button"
        className="todo-row__text"
        onClick={() => onSelect(task.id)}
        aria-pressed={selected}
        aria-label={LCD.selectAria(task.text)}
      >
        {task.text}
      </button>

      <button
        type="button"
        className="todo-row__priority"
        onClick={() => {
          onSelect(task.id)
          onPriority(task.id)
        }}
        disabled={task.done}
        aria-label={LCD.priorityAria(priority.label, priority.xp)}
        title={task.done ? PRIORITY_CARD.locked : priority.hint}
      >
        {priority.mark}
      </button>

      <button
        type="button"
        className="todo-row__delete"
        onClick={() => onDelete(task.id)}
        aria-label={LCD.deleteAria(task.text)}
      >
        ×
      </button>
    </li>
  )
}

interface DangerActionProps {
  label: string
  confirm: string
  yes: string
  no: string
  note: string
  onConfirm: () => void
}

/** A two-step button: arm, then confirm. Nothing destructive on one click. */
function DangerAction({
  label,
  confirm,
  yes,
  no,
  note,
  onConfirm,
}: DangerActionProps) {
  const [armed, setArmed] = useState(false)

  return (
    <div className="todo-action">
      {armed ? (
        <div className="todo-confirm">
          <p>{confirm}</p>
          <div className="todo-confirm__row">
            <button
              type="button"
              className="todo-confirm__yes"
              onClick={() => {
                setArmed(false)
                onConfirm()
              }}
            >
              {yes}
            </button>
            <button
              type="button"
              className="todo-confirm__no"
              onClick={() => setArmed(false)}
            >
              {no}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="todo-action__button"
          onClick={() => setArmed(true)}
        >
          {label}
        </button>
      )}
      <p className="todo-action__note">{note}</p>
    </div>
  )
}

/**
 * TASK-9 — a 1999 pocket organizer that happens to be a to-do list.
 *
 * The device is DOM, not canvas, because the point is writable text: every
 * row is a real checkbox, every moulded key is a real button, and the LCD
 * styling in `todo.css` is what makes it feel like hardware.
 */
export default function TodoPage() {
  const {
    now,
    level,
    streak,
    visibleTasks,
    stats,
    filter,
    selectedId,
    message,
    levelUp,
    combo,
    muted,
    addTask,
    toggleTask,
    deleteTask,
    undoLast,
    clearDone,
    clearAll,
    resetAll,
    selectId,
    moveSelection,
    setFilter,
    cycleFilter,
    cyclePriority,
    toggleMuted,
  } = useTodo()

  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (addTask(draft)) setDraft('')
    focusInput()
  }

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Escape') return
    event.preventDefault()
    setDraft('')
    event.currentTarget.blur()
  }

  // Keep the highlighted row visible without scrolling the page under it.
  useEffect(() => {
    if (!selectedId) return
    const list = listRef.current
    const row = list?.querySelector<HTMLElement>('li[data-selected="true"]')
    if (!list || !row) return

    const top = row.offsetTop
    const bottom = top + row.offsetHeight
    if (top < list.scrollTop) list.scrollTop = top
    else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = bottom - list.clientHeight
    }
  }, [selectedId, visibleTasks])

  // Keyboard: the physical keys, typed out. Inputs keep their own keys.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const element =
        event.target instanceof HTMLElement ? event.target : null
      const typing =
        !!element &&
        (element.tagName === 'INPUT' ||
          element.tagName === 'TEXTAREA' ||
          element.isContentEditable)
      const modified = event.metaKey || event.ctrlKey

      if (
        modified &&
        !event.altKey &&
        event.key.toLowerCase() === 'z' &&
        !typing
      ) {
        event.preventDefault()
        undoLast()
        return
      }
      if (modified || event.altKey) return
      if (typing) return
      if (event.repeat && !event.key.startsWith('Arrow')) return

      const onControl = !!element?.closest(
        'button, a, [role="button"], input',
      )

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          moveSelection(1)
          return
        case 'ArrowUp':
          event.preventDefault()
          moveSelection(-1)
          return
        case 'ArrowLeft':
          event.preventDefault()
          cycleFilter(-1)
          return
        case 'ArrowRight':
          event.preventDefault()
          cycleFilter(1)
          return
        case 'Enter':
        case ' ':
          if (onControl) return
          event.preventDefault()
          if (selectedId) toggleTask(selectedId)
          else focusInput()
          return
        case 'Backspace':
        case 'Delete':
          if (selectedId) {
            event.preventDefault()
            deleteTask(selectedId)
          }
          return
        default:
          break
      }

      const key = event.key.toLowerCase()
      if (key === 'a') {
        if (selectedId) toggleTask(selectedId)
      } else if (key === 'b') {
        if (selectedId) cyclePriority(selectedId)
      } else if (key === 'n' || key === '/' || key === '+') {
        event.preventDefault()
        focusInput()
      } else if (key === 'u') {
        undoLast()
      } else if (key === '1' || key === '2' || key === '3') {
        const next = FILTER_ORDER[Number(key) - 1]
        if (next) setFilter(next)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    cycleFilter,
    cyclePriority,
    deleteTask,
    focusInput,
    moveSelection,
    selectedId,
    setFilter,
    toggleTask,
    undoLast,
  ])

  const missionLeft = Math.max(0, MISSION_TARGET - stats.today)
  const missionNote =
    missionLeft === 0 ? MISSION.done : MISSION.pending(missionLeft)

  const emptyCopy = useMemo(() => {
    if (filter === 'done') {
      return {
        face: LCD.face,
        title: LCD.emptyDoneTitle,
        body: LCD.emptyDoneBody,
      }
    }
    if (filter === 'open' && stats.done > 0) {
      return {
        face: LCD.faceDone,
        title: LCD.emptyOpenTitle,
        body: LCD.emptyOpenBody,
      }
    }
    return { face: LCD.face, title: LCD.emptyTitle, body: LCD.emptyBody }
  }, [filter, stats.done])

  return (
    <div className="todo-page">
      <div className="todo-glow" aria-hidden="true" />
      <div className="todo-dots" aria-hidden="true" />

      <div className="todo-shell-page">
        <SiteHeader
          eyebrow={TODO.eyebrow}
          title={
            <>
              {TODO.titleTop} <em>{TODO.titleBottom}</em>
            </>
          }
          backTo={TODO.backToShelf}
          led="yellow"
          size="md"
        />

        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {message?.text ?? ''}
        </p>

        <section className="todo-hero">
          <p className="todo-hero__kicker">
            <span aria-hidden="true">✦</span> {TODO.kicker}
          </p>
          <h2 className="todo-hero__title">{TODO.headline}</h2>
          <p className="todo-hero__blurb">{TODO.blurb}</p>
          <ul className="todo-badges">
            {TODO.badges.map((badge) => (
              <li key={badge.label}>
                <span>{badge.label}</span>
                <b>{badge.value}</b>
              </li>
            ))}
          </ul>
        </section>

        <main className="todo-layout">
          <div className="todo-device">
            <div className="todo-case">
              <div className="todo-case__top">
                <p className="todo-brand">
                  <span>{TODO.brand}</span>
                  <em>{TODO.brandMeta}</em>
                </p>
                <div className="todo-case__status">
                  <span className="todo-ir" aria-hidden="true" />
                  <span
                    className={`todo-led${combo >= 2 || levelUp ? ' is-hot' : ''}`}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="todo-lcd">
                <div
                  className="todo-screen"
                  role="group"
                  aria-label={LCD.title}
                >
                  <div className="todo-lcd__top">
                    <span className="todo-lcd__brand">{LCD.brand}</span>
                    <span className="todo-lcd__clock">
                      {formatDate(now)}
                      <i aria-hidden="true"> · </i>
                      {formatClock(now)}
                    </span>
                    <span
                      className="todo-lcd__level"
                      title={`Level ${level.level} — ${level.title}`}
                    >
                      LV.{level.level}
                    </span>
                  </div>

                  <div className="todo-lcd__mission">
                    <span className="todo-lcd__mission-label">
                      {LCD.mission}
                    </span>
                    <span
                      className="todo-pips"
                      role="img"
                      aria-label={LCD.missionAria(
                        Math.min(stats.today, MISSION_TARGET),
                        MISSION_TARGET,
                      )}
                    >
                      {Array.from({ length: MISSION_TARGET }, (_, index) => (
                        <i
                          key={index}
                          className={index < stats.today ? 'is-full' : undefined}
                        />
                      ))}
                    </span>
                    <b className="todo-lcd__mission-count">
                      {Math.min(stats.today, MISSION_TARGET)}/{MISSION_TARGET}
                    </b>
                    <span
                      className={`todo-lcd__meta${combo >= 2 ? ' is-combo' : ''}`}
                    >
                      {combo >= 2
                        ? `${COMBO.label} x${combo}`
                        : `${stats.open} ${LCD.remaining}`}
                    </span>
                  </div>

                  <ul className="todo-list" ref={listRef} aria-label={LCD.title}>
                    {visibleTasks.map((task, index) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        index={index}
                        selected={selectedId === task.id}
                        onSelect={selectId}
                        onToggle={toggleTask}
                        onPriority={cyclePriority}
                        onDelete={deleteTask}
                      />
                    ))}
                  </ul>

                  {visibleTasks.length === 0 && (
                    <div className="todo-empty">
                      <p className="todo-empty__face" aria-hidden="true">
                        {emptyCopy.face}
                      </p>
                      <p className="todo-empty__title">{emptyCopy.title}</p>
                      <p className="todo-empty__body">{emptyCopy.body}</p>
                    </div>
                  )}

                  <form className="todo-input" onSubmit={onSubmit}>
                    <label className="sr-only" htmlFor="todo-input">
                      {LCD.inputLabel}
                    </label>
                    <span className="todo-input__prompt" aria-hidden="true">
                      &gt;
                    </span>
                    <input
                      id="todo-input"
                      ref={inputRef}
                      type="text"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={onInputKeyDown}
                      maxLength={MAX_TEXT}
                      placeholder={LCD.inputPlaceholder}
                      autoComplete="off"
                      spellCheck={false}
                      enterKeyHint="done"
                    />
                    <button type="submit" className="todo-input__add">
                      {LCD.add}
                    </button>
                  </form>

                  <div className="todo-lcd__status" aria-live="polite">
                    {message ? (
                      <span
                        key={message.id}
                        className={`todo-lcd__message is-${message.tone}`}
                      >
                        {message.text}
                      </span>
                    ) : (
                      <span className="todo-lcd__hint">
                        {combo >= 2
                          ? `${COMBO.label} x${combo}`
                          : LCD.statusIdle}
                      </span>
                    )}
                    <span className="todo-battery" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>

                  {levelUp && (
                    <div
                      className="todo-levelup"
                      aria-hidden="true"
                      key={levelUp.id}
                    >
                      <span>LEVEL</span>
                      <b>{levelUp.level}</b>
                      <em>{levelUp.title}</em>
                    </div>
                  )}
                </div>
              </div>

              <div className="todo-filters" role="group" aria-label="Filter daftar">
                {FILTER_ORDER.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`todo-filter${filter === id ? ' is-active' : ''}`}
                    aria-pressed={filter === id}
                    onClick={() => setFilter(id)}
                  >
                    {FILTERS[id].label}
                  </button>
                ))}
              </div>

              <div className="todo-controls">
                <div className="todo-dpad" role="group" aria-label="Navigasi daftar">
                  <button
                    type="button"
                    className="todo-dpad__key todo-dpad__key--up"
                    onClick={() => moveSelection(-1)}
                    disabled={visibleTasks.length === 0}
                    aria-label="Tugas sebelumnya"
                    title="Tugas sebelumnya"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="todo-dpad__key todo-dpad__key--left"
                    onClick={() => cycleFilter(-1)}
                    aria-label="Filter sebelumnya"
                    title="Filter sebelumnya"
                  >
                    ◀
                  </button>
                  <span className="todo-dpad__center" aria-hidden="true" />
                  <button
                    type="button"
                    className="todo-dpad__key todo-dpad__key--right"
                    onClick={() => cycleFilter(1)}
                    aria-label="Filter berikutnya"
                    title="Filter berikutnya"
                  >
                    ▶
                  </button>
                  <button
                    type="button"
                    className="todo-dpad__key todo-dpad__key--down"
                    onClick={() => moveSelection(1)}
                    disabled={visibleTasks.length === 0}
                    aria-label="Tugas berikutnya"
                    title="Tugas berikutnya"
                  >
                    ▼
                  </button>
                </div>

                <div className="todo-ab">
                  <div className="todo-ab__keys">
                    <button
                      type="button"
                      className="todo-ab__key todo-ab__key--b"
                      onClick={() => selectedId && cyclePriority(selectedId)}
                      disabled={!selectedId}
                      aria-label="Putar prioritas tugas terpilih"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      className="todo-ab__key todo-ab__key--a"
                      onClick={() =>
                        selectedId ? toggleTask(selectedId) : focusInput()
                      }
                      disabled={!selectedId}
                      aria-label="Tandai tugas terpilih selesai"
                    >
                      A
                    </button>
                  </div>
                  <span className="todo-ab__legend" aria-hidden="true">
                    A SELESAI · B PRIORITAS
                  </span>
                </div>
              </div>

              <div className="todo-keys" role="group" aria-label="Perintah daftar">
                <button
                  type="button"
                  className="todo-key"
                  onClick={focusInput}
                  aria-label="Tambah tugas"
                >
                  <b aria-hidden="true">+</b>
                  <span>TAMBAH</span>
                  <em aria-hidden="true">N</em>
                </button>
                <button
                  type="button"
                  className="todo-key"
                  onClick={() => selectedId && deleteTask(selectedId)}
                  disabled={!selectedId}
                  aria-label="Hapus tugas terpilih"
                >
                  <b aria-hidden="true">×</b>
                  <span>HAPUS</span>
                  <em aria-hidden="true">DEL</em>
                </button>
                <button
                  type="button"
                  className="todo-key"
                  onClick={undoLast}
                  aria-label="Batalkan penghapusan terakhir"
                >
                  <b aria-hidden="true">↺</b>
                  <span>UNDO</span>
                  <em aria-hidden="true">CTRL+Z</em>
                </button>
                <button
                  type="button"
                  className="todo-key"
                  onClick={clearDone}
                  disabled={stats.done === 0}
                  aria-label={`Bersihkan ${stats.done} tugas selesai`}
                >
                  <b aria-hidden="true">✓</b>
                  <span>BERSIH</span>
                  <em aria-hidden="true">{stats.done}</em>
                </button>
              </div>

              <div className="todo-foot">
                <span className="todo-speaker" aria-hidden="true" />
                <span className="todo-serial" aria-hidden="true">
                  SERI 09 · HEMAT BATERAI
                </span>
                <span className="todo-screw" aria-hidden="true" />
                <button
                  type="button"
                  className={`todo-mute${muted ? ' is-muted' : ''}`}
                  onClick={toggleMuted}
                  aria-pressed={muted}
                  aria-label={muted ? TODO.soundOff : TODO.soundOn}
                  title={muted ? TODO.soundOff : TODO.soundOn}
                >
                  <span aria-hidden="true">{muted ? '✕' : '♪'}</span>
                </button>
              </div>
            </div>
          </div>

          <aside className="todo-side">
            <section className="todo-card" aria-labelledby="todo-level-title">
              <header className="todo-card__head">
                <h2 id="todo-level-title">{LEVEL_COPY.title}</h2>
                <span>LV.{level.level}</span>
              </header>

              <div className="todo-level">
                <span className="todo-level__badge">
                  <em aria-hidden="true">LV</em>
                  <b>{level.level}</b>
                </span>
                <div className="todo-level__body">
                  <p className="todo-level__title">{level.title}</p>
                  <div
                    className="todo-xp"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={level.need}
                    aria-valuenow={level.into}
                    aria-label={`XP level ${level.level}`}
                  >
                    <i style={{ width: `${Math.round(level.progress * 100)}%` }} />
                  </div>
                  <p className="todo-level__xp">
                    {LEVEL_COPY.progress(level.into, level.need)}
                  </p>
                </div>
              </div>

              <dl className="todo-stats">
                <div>
                  <dt>{STREAK.title}</dt>
                  <dd>
                    {streak} <small>{STREAK.unit}</small>
                  </dd>
                </div>
                <div>
                  <dt>{MISSION.title}</dt>
                  <dd>
                    {Math.min(stats.today, MISSION_TARGET)}
                    <small>/{MISSION_TARGET}</small>
                  </dd>
                </div>
                <div>
                  <dt>{FILTERS.done.label}</dt>
                  <dd>{stats.done}</dd>
                </div>
                <div>
                  <dt>{LCD.remaining}</dt>
                  <dd>{stats.open}</dd>
                </div>
              </dl>

              <div className="todo-mission">
                <span
                  className="todo-mission__pips"
                  role="img"
                  aria-label={LCD.missionAria(
                    Math.min(stats.today, MISSION_TARGET),
                    MISSION_TARGET,
                  )}
                >
                  {Array.from({ length: MISSION_TARGET }, (_, index) => (
                    <i
                      key={index}
                      className={index < stats.today ? 'is-full' : undefined}
                    />
                  ))}
                </span>
                <p className="todo-mission__text">{missionNote}</p>
              </div>

              <p className="todo-card__note">
                {streak > 0 ? STREAK.active(streak) : STREAK.zero}
                <br />
                {LEVEL_COPY.lifetimeNote}
              </p>
            </section>

            <section className="todo-card" aria-labelledby="todo-priority-title">
              <header className="todo-card__head">
                <h2 id="todo-priority-title">{PRIORITY_CARD.title}</h2>
                <span>XP</span>
              </header>

              <ul className="todo-priorities">
                {PRIORITY_ORDER.map((id) => {
                  const priority = PRIORITIES[id]
                  return (
                    <li key={id} data-priority={id}>
                      <span className="todo-priorities__mark" aria-hidden="true">
                        {priority.mark}
                      </span>
                      <span className="todo-priorities__name">
                        {priority.label}
                      </span>
                      <b className="todo-priorities__xp">{priority.xp} XP</b>
                    </li>
                  )
                })}
              </ul>

              <p className="todo-card__hint">{PRIORITY_CARD.hint}</p>
              <p className="todo-combo">
                <b>{COMBO.label}</b> {COMBO.hint}
              </p>
            </section>

            <section className="todo-card" aria-labelledby="todo-help-title">
              <header className="todo-card__head">
                <h2 id="todo-help-title">{HELP.title}</h2>
                <span>{HELP.keyboardTitle}</span>
              </header>

              <ul className="todo-help">
                {HELP.rows.map((row) => (
                  <li key={row}>
                    <span aria-hidden="true">↳</span>
                    {row}
                  </li>
                ))}
              </ul>

              <div className="todo-actions">
                <DangerAction
                  label={HELP.reset}
                  confirm={HELP.resetConfirm}
                  yes={HELP.resetYes}
                  no={HELP.resetNo}
                  note={HELP.resetNote}
                  onConfirm={clearAll}
                />
                <DangerAction
                  label={HELP.resetAll}
                  confirm={HELP.resetAllConfirm}
                  yes={HELP.resetAllYes}
                  no={HELP.resetNo}
                  note={HELP.resetAllNote}
                  onConfirm={resetAll}
                />
              </div>
            </section>
          </aside>
        </main>

        <section className="todo-notes" aria-labelledby="todo-notes-title">
          <header className="todo-notes__head">
            <p>MANUAL</p>
            <h2 id="todo-notes-title">{NOTES.title}</h2>
          </header>
          <ul>
            {NOTES.rows.map((row) => (
              <li key={row}>
                <span aria-hidden="true">▣</span>
                {row}
              </li>
            ))}
          </ul>
        </section>

        <footer className="todo-footer">
          <p>{NOTES.footer}</p>
          <p>{NOTES.sourceNote}</p>
          <Link to={TODO.backToShelf}>{NOTES.footerShelf}</Link>
        </footer>
      </div>
    </div>
  )
}
