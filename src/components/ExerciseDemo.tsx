import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import type { Exercise } from '../data/exercises'
import { assetUrl } from '../lib/assets'

const frames: Record<string, string[]> = {
  fingers: ['/exercises/workrave/finger-stretch-1.png', '/exercises/workrave/finger-stretch-2.png'],
  gaze: ['/exercises/workrave/depth-focus-1.png', '/exercises/workrave/depth-focus-2.png'],
}

export function ExerciseDemo({
  exercise,
  compact = false,
  playing = true,
}: {
  exercise: Exercise
  compact?: boolean
  playing?: boolean
}) {
  const [manualPause, setManualPause] = useState(false)
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [frame, setFrame] = useState(0)
  const [failed, setFailed] = useState(false)
  const [replay, setReplay] = useState(0)
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const run = playing && !manualPause && !reduced && !compact
  const media = frames[exercise.id]
  useEffect(() => {
    if (!run || !media) return
    const timer = window.setInterval(
      () => setFrame((f) => f + 1),
      exercise.id === 'gaze' ? 5000 : 4000,
    )
    return () => clearInterval(timer)
  }, [run, media, exercise.id])
  return (
    <div className={`demo ${compact ? 'compact' : ''}`}>
      <div className={`demo-stage ${run ? '' : 'motion-paused'} ${media ? 'workrave-stage' : ''}`}>
        {media && !failed ? (
          <div
            className="frames"
            role="img"
            aria-label={`${exercise.titleTr}: iki aşamalı hareket gösterimi`}
          >
            {media.map((src, i) => (
              <img
                key={src}
                src={assetUrl(src)}
                alt=""
                aria-hidden="true"
                className={
                  (compact || reduced ? 0 : frame % media.length) === i ? 'frame visible' : 'frame'
                }
                onError={() => setFailed(true)}
              />
            ))}
          </div>
        ) : (
          <MotionDrawing key={replay} id={exercise.id} title={exercise.titleTr} />
        )}
        {!compact && (
          <span className="demo-caption">
            {reduced
              ? 'Sabit gösterim · azaltılmış hareket'
              : media && !failed
                ? `Hareket aşaması ${(reduced ? 0 : frame % 2) + 1} / 2`
                : 'Yavaş ve rahat bir tempoda'}
          </span>
        )}
      </div>
      {!compact && (
        <div className="demo-toolbar">
          <span>
            {media && !failed ? (
              <a href="https://github.com/rcaelers/workrave" target="_blank" rel="noreferrer">
                Workrave · GPL v3 · kareli gösterim
              </a>
            ) : (
              'MoveWell · hareket gösterimi'
            )}
          </span>
          {!reduced && (
            <div className="flex gap-1">
              <button
                className="icon-button"
                disabled={!playing}
                aria-label={manualPause ? 'Gösterimi oynat' : 'Gösterimi duraklat'}
                onClick={() => setManualPause((p) => !p)}
              >
                {manualPause ? <Play size={17} /> : <Pause size={17} />}
              </button>
              <button
                className="icon-button"
                disabled={!playing}
                aria-label="Gösterimi başa al"
                onClick={() => {
                  setFrame(0)
                  setReplay((r) => r + 1)
                  setManualPause(false)
                }}
              >
                <RotateCcw size={17} />
              </button>
            </div>
          )}
        </div>
      )}
      {failed && (
        <p className="muted">Görsel yüklenemedi. Aşağıdaki yazılı yönergeleri kullanabilirsin.</p>
      )}
    </div>
  )
}

function MotionDrawing({ id, title }: { id: string; title: string }) {
  const upper = ['shoulder-roll', 'squeeze', 'chest', 'cross-body'].includes(id)
  return (
    <svg
      viewBox="0 0 400 320"
      role="img"
      aria-label={title}
      className={`motion-drawing movement-${id}`}
    >
      <title>{title}</title>
      <path d="M65 286H335" className="ground" />
      {id === 'wrist' ? (
        <>
          <path d="M62 188H222" className="body-stroke" />
          <path d="M62 212H212" className="support-stroke" />
          <g className="wrist-hand">
            <path
              d="M222 188L274 188L305 177M275 188L309 187M275 188L306 198M275 188L300 208M264 186L276 164"
              className="limb-stroke"
            />
          </g>
          <path d="M305 130Q350 181 316 235" className="direction" />
          <text x="92" y="254">
            Ön kolun destekli kalsın
          </text>
        </>
      ) : id === 'ankle' ? (
        <>
          <path d="M114 128H220V248" className="body-stroke" />
          <path d="M90 149H184V270M90 149V270" className="support-stroke" />
          <g className="ankle-foot">
            <path d="M220 248L285 248" className="limb-stroke" />
          </g>
          <circle cx="220" cy="248" r="6" className="joint" />
          <path d="M289 192Q319 220 290 266" className="direction" />
        </>
      ) : (
        <>
          {id === 'sit-stand' && (
            <path d="M125 190H212M133 190V280M204 190V280M125 190V134" className="support-stroke" />
          )}
          {id === 'heel' && <path d="M282 160H355M324 160V282" className="support-stroke" />}
          <g className="person">
            <g className="upper-body">
              <circle cx="200" cy={upper ? '66' : '64'} r="23" className="head" />
              <path d={upper ? 'M200 99V214' : 'M200 98V192'} className="body-stroke" />
              {upper ? (
                <>
                  {id === 'chest' ? (
                    <>
                      <path d="M195 111L153 166M205 111L247 166" className="limb-stroke" />
                      <g className="chest-left">
                        <path d="M153 166L183 135" className="limb-stroke" />
                      </g>
                      <g className="chest-right">
                        <path d="M247 166L217 135" className="limb-stroke" />
                      </g>
                    </>
                  ) : (
                    <>
                      <g className="left-upper-arm">
                        <path d="M195 111L153 151L140 196" className="limb-stroke" />
                        <circle cx="153" cy="151" r="5" className="joint" />
                      </g>
                      <g className="right-upper-arm">
                        <path d="M205 111L247 151L260 196" className="limb-stroke" />
                        <circle cx="247" cy="151" r="5" className="joint" />
                      </g>
                    </>
                  )}
                  {id === 'squeeze' && (
                    <>
                      <path d="M167 126L180 140L176 158" className="blade-left support-stroke" />
                      <path d="M233 126L220 140L224 158" className="blade-right support-stroke" />
                    </>
                  )}
                  <path d="M200 214L170 278M200 214L230 278" className="limb-stroke legs" />
                </>
              ) : (
                <>
                  <g className="left-arm">
                    <path d="M194 106L164 152L162 180" className="limb-stroke" />
                  </g>
                  <g className="right-arm">
                    <path d="M206 106L241 144L268 151" className="limb-stroke" />
                  </g>
                </>
              )}
            </g>
            {!upper && (
              <>
                <g className="left-leg">
                  <path d="M195 191L177 235L173 279L157 279" className="limb-stroke" />
                </g>
                <g className="right-leg">
                  <path d="M205 191L222 235L227 279L243 279" className="limb-stroke" />
                </g>
              </>
            )}
          </g>
          {id === 'shoulder-roll' && (
            <>
              <path d="M141 93C100 63 95 126 136 123" className="direction" />
              <path d="M259 93C300 63 305 126 264 123" className="direction" />
            </>
          )}
          {id === 'squeeze' && (
            <>
              <path d="M113 179L154 179M287 179L246 179" className="direction" />
              <text x="112" y="313">
                Omuzların aşağıda kalsın
              </text>
            </>
          )}
          {id === 'weight-shift' && <path d="M126 212H274" className="direction" />}
          {id === 'heel' && <path d="M118 261V222" className="direction" />}
        </>
      )}
    </svg>
  )
}
