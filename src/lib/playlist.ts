import { exercises, categories } from '../data/exercises'
import type { Settings, Step } from './model'

export function playlist(settings: Settings, rotation: number): Step[] {
  const enabled = exercises.filter((e) => !settings.excluded.includes(e.id))
  if (!enabled.length) return []
  const steps: Step[] = []
  const total = settings.breakMinutes * 2
  let previous = ''
  const used = new Set<string>()
  for (let i = 0; i < total; i++) {
    const preferred = categories[(rotation + i) % categories.length]
    const unused = enabled.filter((e) => !used.has(e.id))
    const categoryPool = unused.filter((e) => e.category === preferred)
    const others = enabled.filter((e) => e.id !== previous)
    const pool = categoryPool.length
      ? categoryPool
      : unused.length
        ? unused
        : others.length
          ? others
          : enabled
    const exercise = pool[(Math.floor((rotation + i) / categories.length) + rotation) % pool.length]
    steps.push({ exerciseId: exercise.id, targetMs: 30000, elapsedMs: 0, skipped: false })
    previous = exercise.id
    used.add(exercise.id)
  }
  return steps
}
