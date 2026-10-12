import { exercises, categories } from '../data/exercises'
import type { Settings, Step } from './model'

export function playlist(settings: Settings, rotation: number): Step[] {
  const enabled = exercises.filter((e) => !settings.excluded.includes(e.id))
  if (!enabled.length) return []
  const steps: Step[] = []
  const total = settings.breakMinutes * 2
  let previous = ''
  for (let i = 0; i < total; i++) {
    const preferred = categories[(rotation + i) % categories.length]
    const categoryPool = enabled.filter((e) => e.category === preferred && e.id !== previous)
    const others = enabled.filter((e) => e.id !== previous)
    const pool = categoryPool.length ? categoryPool : others.length ? others : enabled
    const exercise = pool[(Math.floor((rotation + i) / categories.length) + rotation) % pool.length]
    steps.push({ exerciseId: exercise.id, targetMs: 30000, elapsedMs: 0, skipped: false })
    previous = exercise.id
  }
  return steps
}
