import { z } from 'zod'
import { exercises } from '../data/exercises'

const time = z.number().finite().nonnegative().max(8640000000000000)
const id = z.string().refine((value) => exercises.some((e) => e.id === value))
export const settingsSchema = z.object({
  intervalMinutes: z
    .union([z.literal(30), z.literal(45), z.literal(60), z.literal(90)])
    .default(60),
  breakMinutes: z.union([z.literal(2), z.literal(3), z.literal(5)]).default(3),
  sound: z.boolean().default(false),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  excluded: z.array(id).max(11).default([]),
  autoStart: z.boolean().default(false),
  onboardingDone: z.boolean().default(false),
})
export const stepSchema = z
  .object({
    exerciseId: id,
    targetMs: z.number().min(15000).max(90000),
    elapsedMs: z.number().min(0).max(90000),
    skipped: z.boolean(),
  })
  .refine((s) => s.elapsedMs <= s.targetMs)
export const breakSchema = z
  .object({
    id: z.string().max(100),
    startedAt: time,
    steps: z.array(stepSchema).min(1).max(20),
    index: z.number().int().min(0).max(19),
    playing: z.boolean(),
    returnTo: z.enum(['idle', 'working', 'paused', 'finished']),
  })
  .refine((b) => b.index < b.steps.length)
export const recordSchema = z.object({
  id: z.string().max(100),
  startedAt: time,
  endedAt: time,
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  outcome: z.enum(['completed', 'partial', 'skipped']),
  steps: z.array(stepSchema).max(20),
})
const baseSessionSchema = z.object({
  status: z.enum(['idle', 'working', 'break_due', 'snoozed', 'paused', 'in_break', 'finished']),
  day: z.string(),
  nextDueAt: time.nullable(),
  pausedUntil: time.nullable(),
  remainingMs: z.number().min(0).max(5400000),
  reminderId: z.string().nullable(),
  reminderAttempt: z.number().int().nonnegative(),
  notifiedKey: z.string().nullable(),
  activeBreak: breakSchema.nullable(),
  lastObservedAt: time,
})
export const sessionSchema = baseSessionSchema.superRefine((s, ctx) => {
  if (
    (['working', 'snoozed'].includes(s.status) && s.nextDueAt === null) ||
    (s.status === 'in_break' && !s.activeBreak) ||
    (s.status !== 'in_break' && s.activeBreak) ||
    (['snoozed', 'break_due'].includes(s.status) && !s.reminderId)
  ) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Geçersiz oturum' })
  }
})
export const stateSchema = z.object({
  version: z.literal(1),
  settings: settingsSchema,
  session: sessionSchema,
  history: z.array(recordSchema).max(3000),
  rotation: z.number().int().nonnegative(),
})
export type Settings = z.infer<typeof settingsSchema>
export type Step = z.infer<typeof stepSchema>
export type BreakRecord = z.infer<typeof recordSchema>
export type State = z.infer<typeof stateSchema>
export type Session = State['session']
export const dayKey = (now: number) => {
  const d = new Date(now)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export const emptySession = (now: number): Session => ({
  status: 'idle',
  day: dayKey(now),
  nextDueAt: null,
  pausedUntil: null,
  remainingMs: 0,
  reminderId: null,
  reminderAttempt: 0,
  notifiedKey: null,
  activeBreak: null,
  lastObservedAt: now,
})
export const initialState = (now: number): State => ({
  version: 1,
  settings: settingsSchema.parse({}),
  session: emptySession(now),
  history: [],
  rotation: 0,
})
