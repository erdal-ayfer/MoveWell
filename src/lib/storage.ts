import {
  initialState,
  stateSchema,
  settingsSchema,
  sessionSchema,
  recordSchema,
  type State,
} from './model'

export const STORAGE_KEY = 'movewell:v1'
export function decode(raw: string | null, now: number): { state: State; recovered: boolean } {
  if (!raw) return { state: initialState(now), recovered: false }
  try {
    const parsed: unknown = JSON.parse(raw)
    const result = stateSchema.safeParse(parsed)
    if (result.success) return { state: result.data, recovered: false }
    const clean = initialState(now)
    if (typeof parsed === 'object' && parsed && 'version' in parsed && parsed.version === 1) {
      const candidate = parsed as Record<string, unknown>
      const settings = settingsSchema.safeParse(candidate.settings)
      if (settings.success) clean.settings = settings.data
      const session = sessionSchema.safeParse(candidate.session)
      if (session.success) clean.session = session.data
      if (Array.isArray(candidate.history))
        clean.history = candidate.history.slice(-3000).flatMap((item) => {
          const record = recordSchema.safeParse(item)
          return record.success ? [record.data] : []
        })
    }
    return { state: clean, recovered: true }
  } catch {
    return { state: initialState(now), recovered: true }
  }
}

export function readState(now = Date.now()) {
  try {
    return { ...decode(localStorage.getItem(STORAGE_KEY), now), unavailable: false }
  } catch {
    return { state: initialState(now), recovered: false, unavailable: true }
  }
}

export function saveState(state: State): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
