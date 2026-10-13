import { describe, expect, it } from 'vitest'
import { initialState, dayKey, stateSchema } from '../lib/model'
import { transition as send, totalMs } from '../lib/reminderMachine'
import { decode } from '../lib/storage'
import { playlist } from '../lib/playlist'
import { exercises, categories } from '../data/exercises'
import { reminderKey } from '../lib/notifications'

const T = new Date(2026, 9, 12, 9, 0, 0).getTime()
const minute = 60000
const start = () => send(initialState(T), { type: 'start' }, T)
const due = () => send(start(), { type: 'tick' }, T + 60 * minute)

describe('Reminder state machine', () => {
  it('starts exactly one hour after workday start', () => {
    expect(start().session.nextDueAt).toBe(T + 60 * minute)
    expect(start().session.status).toBe('working')
  })
  it('catches up once after a background delay and keeps the reminder identity', () => {
    const first = send(start(), { type: 'tick' }, T + 80 * minute)
    const again = send(first, { type: 'tick' }, T + 100 * minute)
    expect(again.session.status).toBe('break_due')
    expect(again.session.reminderId).toBe(first.session.reminderId)
    expect(again.history).toHaveLength(0)
    expect(again.session.reminderAttempt).toBe(0)
  })
  it('snoozes the same reminder repeatedly from the time of each action', () => {
    const first = send(due(), { type: 'snooze', minutes: 10 }, T + 60 * minute)
    const second = send(first, { type: 'snooze', minutes: 10 }, T + 65 * minute)
    expect(second.session.nextDueAt).toBe(T + 75 * minute)
    expect(second.session.reminderId).toBe(due().session.reminderId)
    expect(second.history).toEqual([])
    expect(send(second, { type: 'tick' }, T + 74 * minute).session.status).toBe('snoozed')
    expect(send(second, { type: 'tick' }, T + 75 * minute).session.status).toBe('break_due')
  })
  it('logs skipped reminders without recording a completed break', () => {
    const result = send(due(), { type: 'skip' }, T + 61 * minute)
    expect(result.history[0].outcome).toBe('skipped')
    expect(result.history[0].steps).toEqual([])
    expect(result.session.nextDueAt).toBe(T + 121 * minute)
  })
  it('records a completed sequence and schedules from actual completion time', () => {
    let state = send(due(), { type: 'start_break' }, T + 60 * minute)
    for (let second = 1; second <= 180; second++)
      state = send(state, { type: 'tick', activeElapsedMs: 1000 }, T + 60 * minute + second * 1000)
    expect(state.history[0].outcome).toBe('completed')
    expect(totalMs(state.history[0].steps)).toBe(180000)
    expect(state.session.nextDueAt).toBe(T + 123 * minute)
    expect(state.session.activeBreak).toBeNull()
  })
  it('saves only actual exercise on an early finish', () => {
    let state = send(due(), { type: 'start_break' }, T + 60 * minute)
    state = send(state, { type: 'tick', activeElapsedMs: 1000 }, T + 60 * minute + 1000)
    state = send(state, { type: 'finish_break' }, T + 62 * minute)
    expect(state.history[0].outcome).toBe('partial')
    expect(totalMs(state.history[0].steps)).toBe(1000)
    expect(state.session.nextDueAt).toBe(T + 122 * minute)
  })
  it('does not count sleep, paused or hidden time as exercise', () => {
    let state = send(start(), { type: 'start_break' }, T)
    state = send(state, { type: 'tick', activeElapsedMs: 20000 }, T + 20000)
    expect(totalMs(state.session.activeBreak!.steps)).toBe(0)
    expect(state.session.activeBreak!.playing).toBe(false)
    state = send(state, { type: 'tick', activeElapsedMs: 1000 }, T + 21000)
    expect(totalMs(state.session.activeBreak!.steps)).toBe(0)
  })
  it('preserves twenty remaining minutes during focus, even after late wake', () => {
    const focused = send(start(), { type: 'pause', minutes: 30 }, T + 40 * minute)
    expect(send(focused, { type: 'tick' }, T + 69 * minute).session.status).toBe('paused')
    const resumed = send(focused, { type: 'tick' }, T + 90 * minute)
    expect(resumed.session.status).toBe('working')
    expect(resumed.session.nextDueAt).toBe(T + 110 * minute)
  })
  it('supports manual resume and immediately restores a previously due reminder', () => {
    const focused = send(due(), { type: 'pause', minutes: null }, T + 60 * minute)
    const resumed = send(focused, { type: 'resume' }, T + 80 * minute)
    expect(resumed.session.status).toBe('break_due')
    expect(resumed.session.reminderId).toBe(due().session.reminderId)
  })
  it('keeps an existing focus pause when taking a manual break', () => {
    let state = send(start(), { type: 'pause', minutes: 60 }, T + 10 * minute)
    state = send(state, { type: 'start_break' }, T + 11 * minute)
    state = send(state, { type: 'finish_break' }, T + 12 * minute)
    expect(state.session.status).toBe('paused')
    expect(state.session.pausedUntil).toBe(T + 70 * minute)
    expect(state.session.remainingMs).toBe(50 * minute)
  })
  it('ends a workday and never re-prompts until explicitly restarted', () => {
    const ended = send(due(), { type: 'end' }, T + 61 * minute)
    const later = send(ended, { type: 'tick' }, T + 180 * minute)
    expect(later.session.status).toBe('finished')
    expect(later.session.nextDueAt).toBeNull()
  })
  it('starts a fresh day without yesterday’s overdue prompt', () => {
    const tomorrow = T + 24 * 60 * minute
    const fresh = send(due(), { type: 'tick' }, tomorrow)
    expect(fresh.session.status).toBe('idle')
    expect(fresh.session.day).toBe(dayKey(tomorrow))
    expect(fresh.session.reminderId).toBeNull()
  })
  it('only auto-starts a new day when explicitly enabled', () => {
    const enabled = send(start(), { type: 'settings', patch: { autoStart: true } }, T)
    expect(send(enabled, { type: 'tick' }, T + 24 * 60 * minute).session.status).toBe('working')
  })
  it('preserves remaining time on a backwards clock correction', () => {
    const later = send(start(), { type: 'tick' }, T + 10 * minute)
    const corrected = send(later, { type: 'tick' }, T + 5 * minute)
    expect(corrected.session.nextDueAt! - (T + 5 * minute)).toBe(50 * minute)
  })
  it('has stable notification keys, renewed only after snoozing', () => {
    const key = reminderKey(due())
    expect(reminderKey(send(due(), { type: 'tick' }, T + 61 * minute))).toBe(key)
    const snoozed = send(due(), { type: 'snooze', minutes: 5 }, T + 61 * minute)
    expect(reminderKey(snoozed)).toBeNull()
    expect(reminderKey(send(snoozed, { type: 'tick' }, T + 66 * minute))).not.toBe(key)
  })
  it('preserves performed seconds when replacing a movement', () => {
    let state = send(start(), { type: 'start_break' }, T)
    state = send(state, { type: 'tick', activeElapsedMs: 1000 }, T + 1000)
    state = send(state, { type: 'replace', exerciseId: 'wrist' }, T + 1000)
    expect(totalMs(state.session.activeBreak!.steps)).toBe(1000)
    expect(state.session.activeBreak!.steps[0].skipped).toBe(true)
    expect(state.session.activeBreak!.steps[1].exerciseId).toBe('wrist')
  })
  it('does not count skipped movements as complete, even if the last movement completes', () => {
    let state = send(start(), { type: 'start_break' }, T)
    for (let i = 0; i < 5; i++) state = send(state, { type: 'step', direction: 1 }, T)
    for (let i = 1; i <= 30; i++)
      state = send(state, { type: 'tick', activeElapsedMs: 1000 }, T + i * 1000)
    expect(state.history[0].outcome).toBe('partial')
    expect(totalMs(state.history[0].steps)).toBe(30000)
  })
  it('a standalone break does not silently start a workday', () => {
    const state = send(
      send(initialState(T), { type: 'start_break' }, T),
      { type: 'finish_break' },
      T + 10000,
    )
    expect(state.session.status).toBe('idle')
    expect(state.session.nextDueAt).toBeNull()
  })
})

describe('Storage and playlists', () => {
  it('restores settings and schedule exactly after serialization', () => {
    const original = send(
      start(),
      { type: 'settings', patch: { theme: 'dark', breakMinutes: 5 } },
      T,
    )
    expect(decode(JSON.stringify(original), T).state).toEqual(original)
  })
  it('recovers safely from invalid JSON and unsupported schema versions', () => {
    expect(decode('{broken', T).recovered).toBe(true)
    expect(decode('{"version":99}', T).state).toEqual(initialState(T))
  })
  it('salvages settings when session structure is corrupted', () => {
    const original = start()
    original.settings.theme = 'dark'
    const raw = JSON.stringify({ ...original, session: { ...original.session, nextDueAt: 'bad' } })
    const recovered = decode(raw, T)
    expect(recovered.recovered).toBe(true)
    expect(recovered.state.settings.theme).toBe('dark')
    expect(recovered.state.session.status).toBe('idle')
  })
  it('rejects missing break state and impossible exercise progress', () => {
    const state = start()
    expect(
      stateSchema.safeParse({ ...state, session: { ...state.session, status: 'in_break' } })
        .success,
    ).toBe(false)
    const active = send(state, { type: 'start_break' }, T)
    active.session.activeBreak!.steps[0].elapsedMs = 90001
    expect(stateSchema.safeParse(active).success).toBe(false)
  })
  it('honors exclusions, rotates categories and meets requested duration', () => {
    const settings = initialState(T).settings
    settings.excluded = ['walk', 'heel']
    const first = playlist(settings, 0)
    expect(first.some((step) => settings.excluded.includes(step.exerciseId))).toBe(false)
    expect(first.reduce((sum, step) => sum + step.targetMs, 0)).toBe(180000)
    expect(
      new Set(first.map((step) => exercises.find((e) => e.id === step.exerciseId)!.category)).size,
    ).toBe(categories.length)
    expect(playlist(settings, 1).map((s) => s.exerciseId)).not.toEqual(
      first.map((s) => s.exerciseId),
    )
  })
  it('keeps expanded exclusion preferences after reload, with one exercise enabled', () => {
    const original = start()
    original.settings.excluded = exercises.slice(1).map((e) => e.id)
    const restored = decode(JSON.stringify(original), T)
    expect(restored.recovered).toBe(false)
    expect(restored.state.settings.excluded).toEqual(original.settings.excluded)
    const steps = playlist(restored.state.settings, 0)
    expect(steps).toHaveLength(6)
    expect(steps.every((step) => step.exerciseId === exercises[0].id)).toBe(true)
    expect(
      stateSchema.safeParse({
        ...original,
        settings: { ...original.settings, excluded: exercises.map((e) => e.id) },
      }).success,
    ).toBe(false)
  })
  it('offers distinct exercises in a five-minute break and reaches the entire catalog', () => {
    const settings = { ...initialState(T).settings, breakMinutes: 5 as const }
    const offered = new Set<string>()
    for (let rotation = 0; rotation < 100; rotation++) {
      const steps = playlist(settings, rotation)
      expect(steps).toHaveLength(10)
      expect(new Set(steps.map((s) => s.exerciseId)).size).toBe(10)
      for (const step of steps) offered.add(step.exerciseId)
    }
    expect(offered.size).toBe(exercises.length)
  })
  it('avoids immediate repeats when only two choices are enabled', () => {
    const settings = initialState(T).settings
    settings.excluded = exercises.slice(2).map((e) => e.id)
    const steps = playlist(settings, 3)
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].exerciseId).not.toBe(steps[i - 1].exerciseId)
    }
  })
})
