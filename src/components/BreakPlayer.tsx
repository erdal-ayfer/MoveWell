import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
} from 'lucide-react'
import { exercises, exerciseById } from '../data/exercises'
import type { State } from '../lib/model'
import { totalMs, type Action } from '../lib/reminderMachine'
import { ExerciseDemo } from './ExerciseDemo'
import { Modal } from './Modal'
import { formatTime } from '../lib/format'

export function BreakPlayer({
  state,
  dispatch,
  leader,
}: {
  state: State
  dispatch: (action: Action) => void
  leader: boolean
}) {
  const [replace, setReplace] = useState(false)
  const active = state.session.activeBreak!
  const step = active.steps[active.index]
  const exercise = exerciseById(step.exerciseId)
  const total = active.steps.reduce((sum, s) => sum + s.targetMs, 0)
  return (
    <section className="break-view">
      <div className="page-heading">
        <div>
          <p className="muted">
            Hareket molası · {active.index + 1} / {active.steps.length}
          </p>
          <h1>{exercise.titleTr}</h1>
        </div>
        <span className="category-label">{exercise.category}</span>
      </div>
      <progress
        className="break-progress"
        value={totalMs(active.steps)}
        max={total}
        aria-label="Molanın tamamlanan süresi"
      />
      <div className="break-layout">
        <ExerciseDemo key={exercise.id} exercise={exercise} playing={active.playing && leader} />
        <div className="break-instructions">
          <div
            className="exercise-time"
            aria-label={`Kalan süre ${formatTime(step.targetMs - step.elapsedMs)}`}
          >
            {formatTime(step.targetMs - step.elapsedMs)}
          </div>
          <p className="muted">
            {active.playing
              ? 'Rahat ettiğin kadar hareket et.'
              : 'Mola duraklatıldı. Hazır olduğunda devam et.'}
          </p>
          <ol>
            {exercise.instructionsTr.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ol>
          {exercise.cautionTr && <p className="caution">{exercise.cautionTr}</p>}
          <fieldset disabled={!leader}>
            <label className="duration-label">
              Hareket süresi
              <select
                aria-label="Hareket süresi"
                value={Math.ceil(step.targetMs / 1000)}
                onChange={(event) =>
                  dispatch({ type: 'duration', seconds: Number(event.target.value) })
                }
              >
                {![15, 30, 45, 60].includes(Math.ceil(step.targetMs / 1000)) && (
                  <option value={Math.ceil(step.targetMs / 1000)}>
                    {Math.ceil(step.targetMs / 1000)} sn
                  </option>
                )}
                {[15, 30, 45, 60].map((n) => (
                  <option key={n} value={n}>
                    {n} saniye
                  </option>
                ))}
              </select>
            </label>
            <button
              className="button primary full"
              onClick={() => dispatch({ type: 'toggle_break' })}
            >
              {active.playing ? <Pause size={18} /> : <Play size={18} />}
              {active.playing ? 'Duraklat' : 'Devam et'}
            </button>
            <div className="player-navigation">
              <button
                className="button"
                disabled={active.index === 0}
                onClick={() => dispatch({ type: 'step', direction: -1 })}
              >
                <ArrowLeft size={17} />
                Önceki
              </button>
              <button className="button" onClick={() => dispatch({ type: 'step', direction: 1 })}>
                {step.elapsedMs >= step.targetMs ? (
                  <ArrowRight size={17} />
                ) : (
                  <SkipForward size={17} />
                )}
                {step.elapsedMs >= step.targetMs ? 'Sonraki' : 'Hareketi atla'}
              </button>
            </div>
            <button
              className="text-button"
              disabled={active.steps.length >= 20}
              onClick={() => setReplace(true)}
            >
              <RefreshCw size={15} />
              Hareketi değiştir
            </button>
          </fieldset>
        </div>
      </div>
      <div className="break-bottom">
        <p className="muted">
          Kaydedilen hareket: <strong>{Math.floor(totalMs(active.steps) / 1000)} saniye</strong>
        </p>
        <button
          disabled={!leader}
          className="button"
          onClick={() => dispatch({ type: 'finish_break' })}
        >
          <CheckCheck size={18} />
          Molayı bitir
        </button>
      </div>
      <p className="footnote">
        Erken bitirirsen yaptığın süre kaydedilir ve mola kısmen tamamlandı olarak görünür. Sekmeden
        ayrılınca hareket sayacı duraklar.
      </p>
      <div className="sequence-list" aria-label="Mola hareketleri">
        {active.steps.map((s, i) => (
          <div key={`${i}-${s.exerciseId}`} className={i === active.index ? 'current' : ''}>
            <span>
              {s.elapsedMs >= s.targetMs && !s.skipped ? (
                <Check size={16} />
              ) : (
                String(i + 1).padStart(2, '0')
              )}
            </span>
            <span>{exerciseById(s.exerciseId).titleTr}</span>
            <span>{s.skipped ? 'Atlandı' : `${Math.round(s.targetMs / 1000)} sn`}</span>
          </div>
        ))}
      </div>
      {replace && (
        <Modal title="Başka bir hareket seç" onClose={() => setReplace(false)}>
          <div className="replacement-list">
            {exercises
              .filter((e) => !state.settings.excluded.includes(e.id) && e.id !== exercise.id)
              .map((e) => (
                <button
                  className="replacement"
                  key={e.id}
                  onClick={() => {
                    dispatch({ type: 'replace', exerciseId: e.id })
                    setReplace(false)
                  }}
                >
                  <span>{e.titleTr}</span>
                  <span className="muted">{e.category}</span>
                  <ArrowRight size={16} />
                </button>
              ))}
          </div>
        </Modal>
      )}
    </section>
  )
}
