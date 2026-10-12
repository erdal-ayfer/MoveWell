import { afterEach, describe, expect, it, vi } from 'vitest'
import { closeNotification, notificationPermission, notify } from '../lib/notifications'

afterEach(() => {
  closeNotification()
  vi.unstubAllGlobals()
})

describe('Optional browser notification delivery', () => {
  it('does nothing when permission is denied', () => {
    const native = vi.fn()
    Object.defineProperty(native, 'permission', { value: 'denied' })
    vi.stubGlobal('Notification', native)
    notify(false)
    expect(native).not.toHaveBeenCalled()
  })
  it('does not throw when native notifications are unsupported', () => {
    vi.stubGlobal('Notification', undefined)
    expect(notificationPermission()).toBe('unsupported')
    expect(() => notify(false)).not.toThrow()
  })
  it('contains constructor failures instead of breaking in-app reminders', () => {
    class FailedNotification {
      static permission = 'granted'
      constructor() {
        throw new Error('OS unavailable')
      }
    }
    vi.stubGlobal('Notification', FailedNotification)
    expect(() => notify(false)).not.toThrow()
  })
})
