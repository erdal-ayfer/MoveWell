import { dayKey, emptySession, type State, type Settings, type Step } from './model'
import { playlist } from './playlist'
import { exercises } from '../data/exercises'

export type Action =
  | { type: 'tick'; activeElapsedMs?: number }
  | { type: 'start' | 'end' | 'resume' | 'start_break' | 'finish_break' | 'toggle_break' }
  | { type: 'snooze'; minutes: 5 | 10 | 15 | 30 }
  | { type: 'skip' }
  | { type: 'pause'; minutes: 30 | 60 | 90 | null }
  | { type: 'step'; direction: -1 | 1 }
  | { type: 'replace'; exerciseId: string }
  | { type: 'duration'; seconds: number }
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'notified'; key: string }

const totalMs = (steps: Step[]) => steps.reduce((sum, step) => sum + step.elapsedMs, 0)
export { totalMs }

function closeBreak(state: State, now: number) {
  const s = state.session
  const b = s.activeBreak
  if (!b) return
  state.history.push({
    id: b.id,
    day: dayKey(b.startedAt),
    startedAt: b.startedAt,
    endedAt: now,
    outcome: b.steps.every((step) => !step.skipped && step.elapsedMs >= step.targetMs)
      ? 'completed'
      : 'partial',
    steps: b.steps,
  })
  s.status = b.returnTo
  s.activeBreak = null
  s.reminderId = null
  s.notifiedKey = null
  s.nextDueAt = b.returnTo === 'working' ? now + state.settings.intervalMinutes * 60000 : null
  state.rotation += 1
  state.history = state.history.slice(-3000)
}

export function transition(previous: State, action: Action, now: number): State {
  const state = structuredClone(previous)
  let s = state.session
  // A new local calendar day never inherits yesterday's pending reminder.
  if (s.day !== dayKey(now)) {
    closeBreak(state, now)
    state.session = emptySession(now)
    s = state.session
    if (state.settings.autoStart) {
      s.status = 'working'
      s.nextDueAt = now + state.settings.intervalMinutes * 60000
    }
  }
  // Backwards clock changes preserve the remaining wall-clock duration.
  const rollback = s.lastObservedAt - now
  if (rollback > 2000) {
    if (s.nextDueAt !== null) s.nextDueAt = Math.max(now, s.nextDueAt - rollback)
    if (s.pausedUntil !== null) s.pausedUntil = Math.max(now, s.pausedUntil - rollback)
  }
  s.lastObservedAt = now
  switch (action.type) {
    case 'start':
      if (s.status === 'idle' || s.status === 'finished') {
        state.session = {
          ...emptySession(now),
          status: 'working',
          nextDueAt: now + state.settings.intervalMinutes * 60000,
        }
      }
      break
    case 'end':
      closeBreak(state, now)
      state.session = { ...emptySession(now), status: 'finished' }
      break
    case 'pause':
      if (['working', 'snoozed', 'break_due'].includes(s.status)) {
        s.remainingMs = Math.max(0, (s.nextDueAt ?? now) - now)
        s.status = 'paused'
        s.nextDueAt = null
        s.pausedUntil = action.minutes === null ? null : now + action.minutes * 60000
      }
      break
    case 'resume':
      if (s.status === 'paused') resume(state, now)
      break
    case 'snooze':
      if (['break_due', 'snoozed'].includes(s.status)) {
        s.status = 'snoozed'
        s.nextDueAt = now + action.minutes * 60000
        s.reminderAttempt += 1
      }
      break
    case 'skip':
      if (['break_due', 'snoozed'].includes(s.status)) {
        state.history.push({
          id: s.reminderId!,
          day: dayKey(now),
          startedAt: now,
          endedAt: now,
          outcome: 'skipped',
          steps: [],
        })
        s.status = 'working'
        s.nextDueAt = now + state.settings.intervalMinutes * 60000
        s.reminderId = null
        s.notifiedKey = null
      }
      break
    case 'start_break': {
      if (s.status === 'in_break') break
      const steps = playlist(state.settings, state.rotation)
      if (!steps.length) break
      const returnTo = ['idle', 'finished', 'paused'].includes(s.status)
        ? (s.status as 'idle' | 'finished' | 'paused')
        : 'working'
      s.activeBreak = {
        id: `break-${now}-${state.rotation}`,
        startedAt: now,
        steps,
        index: 0,
        playing: true,
        returnTo,
      }
      s.status = 'in_break'
      s.nextDueAt = null
      break
    }
    case 'finish_break':
      closeBreak(state, now)
      break
    case 'toggle_break':
      if (s.activeBreak) s.activeBreak.playing = !s.activeBreak.playing
      break
    case 'step': {
      const b = s.activeBreak
      if (!b) break
      if (action.direction === 1 && b.steps[b.index].elapsedMs < b.steps[b.index].targetMs)
        b.steps[b.index].skipped = true
      const next = b.index + action.direction
      if (next >= b.steps.length) closeBreak(state, now)
      else b.index = Math.max(0, next)
      break
    }
    case 'replace': {
      const b = s.activeBreak
      if (
        !b ||
        state.settings.excluded.includes(action.exerciseId) ||
        !exercises.some((e) => e.id === action.exerciseId)
      )
        break
      const step = b.steps[b.index]
      // Preserve already-performed work as a skipped step instead of deleting its time.
      if (step.elapsedMs > 0) {
        if (b.steps.length >= 20) break
        step.skipped = true
        b.steps.splice(b.index + 1, 0, {
          exerciseId: action.exerciseId,
          targetMs: step.targetMs,
          elapsedMs: 0,
          skipped: false,
        })
        b.index += 1
      } else step.exerciseId = action.exerciseId
      break
    }
    case 'duration': {
      const b = s.activeBreak
      if (b && [15, 30, 45, 60].includes(action.seconds)) {
        const step = b.steps[b.index]
        step.targetMs = Math.max(step.elapsedMs, action.seconds * 1000)
      }
      break
    }
    case 'settings':
      state.settings = { ...state.settings, ...action.patch }
      break
    case 'notified':
      s.notifiedKey = action.key
      break
    case 'tick': {
      if (s.status === 'paused' && s.pausedUntil !== null && now >= s.pausedUntil) {
        // A late wake-up does not consume the preserved work interval.
        resume(state, now)
      }
      if (['working', 'snoozed'].includes(s.status) && s.nextDueAt !== null && now >= s.nextDueAt) {
        s.status = 'break_due'
        s.reminderId ??= `reminder-${s.nextDueAt}`
      }
      const b = s.activeBreak
      if (b?.playing) {
        const elapsed = action.activeElapsedMs ?? 0
        // Discard long scheduling gaps; sleeping/background time is not movement.
        if (elapsed > 0 && elapsed <= 2500) {
          const step = b.steps[b.index]
          step.elapsedMs = Math.min(step.targetMs, step.elapsedMs + elapsed)
          if (step.elapsedMs >= step.targetMs) {
            step.skipped = false
            if (b.index < b.steps.length - 1) b.index += 1
            else closeBreak(state, now)
          }
        } else if (elapsed > 2500) b.playing = false
      }
      break
    }
  }
  state.history = state.history.slice(-3000)
  return state
}

function resume(state: State, now: number) {
  const s = state.session
  s.status = s.remainingMs === 0 ? 'break_due' : s.reminderId ? 'snoozed' : 'working'
  s.nextDueAt = now + s.remainingMs
  s.pausedUntil = null
  if (s.status === 'break_due') s.reminderId ??= `reminder-${now}`
}
