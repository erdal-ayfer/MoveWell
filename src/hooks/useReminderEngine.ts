import { useCallback, useEffect, useRef, useState } from 'react'
import { transition, type Action } from '../lib/reminderMachine'
import { readState, saveState, STORAGE_KEY } from '../lib/storage'
import { closeNotification, enableSound, notify, reminderKey } from '../lib/notifications'
import type { State } from '../lib/model'

export function useReminderEngine() {
  const [loaded] = useState(() => readState())
  const [state, setState] = useState(loaded.state)
  const current = useRef(state)
  const [leader, setLeader] = useState(false)
  const isLeader = useRef(false)
  const [storageError, setStorageError] = useState(loaded.unavailable)
  const [lockError, setLockError] = useState(false)
  const channel = useRef<BroadcastChannel | null>(null)
  const lastMono = useRef(performance.now())
  const supported = typeof navigator.locks?.request === 'function'

  const publish = useCallback((next: State) => {
    current.current = next
    setState(next)
    setStorageError(!saveState(next))
    channel.current?.postMessage('updated')
  }, [])

  const apply = useCallback(
    (action: Action) => {
      if (!isLeader.current) return
      const next = transition(current.current, action, Date.now())
      const key = reminderKey(next)
      const shouldNotify = key && key !== next.session.notifiedKey
      if (shouldNotify) next.session.notifiedKey = key
      // Persist the claim before the side effect, under the exclusive tab lock.
      publish(next)
      if (shouldNotify) notify(next.settings.sound)
      else if (!key) closeNotification()
    },
    [publish],
  )

  const dispatch = useCallback(
    (action: Action) => {
      if (current.current.settings.sound) enableSound()
      lastMono.current = performance.now()
      apply(action)
    },
    [apply],
  )

  useEffect(() => {
    let disposed = false
    let acquiring = false
    let release: (() => void) | undefined
    const sync = () => {
      if (isLeader.current) return
      const next = readState().state
      current.current = next
      setState(next)
    }
    try {
      channel.current = new BroadcastChannel('movewell-sync-v1')
      channel.current.onmessage = sync
    } catch {
      /* Storage event remains the synchronization fallback. */
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) sync()
    }
    const acquire = () => {
      if (disposed || acquiring || isLeader.current || !supported) return
      acquiring = true
      void navigator.locks
        .request('movewell-active-tab-v1', { ifAvailable: true }, async (lock) => {
          if (!lock || disposed) return
          const restored = readState().state
          // A refreshed or transferred break never assumes unattended exercise.
          if (restored.session.activeBreak) restored.session.activeBreak.playing = false
          current.current = restored
          isLeader.current = true
          setLeader(true)
          setLockError(false)
          lastMono.current = performance.now()
          apply({ type: 'tick' })
          await new Promise<void>((resolve) => {
            release = resolve
          })
        })
        .catch(() => {
          if (!disposed) setLockError(true)
        })
        .finally(() => {
          acquiring = false
        })
    }
    const hide = () => {
      if (isLeader.current && current.current.session.activeBreak?.playing)
        apply({ type: 'toggle_break' })
      lastMono.current = performance.now()
      if (isLeader.current) apply({ type: 'tick' })
      else sync()
    }
    const onFocus = () => {
      lastMono.current = performance.now()
      acquire()
      if (isLeader.current) apply({ type: 'tick' })
    }
    const onPageHide = () => {
      hide()
      isLeader.current = false
      setLeader(false)
      release?.()
      closeNotification()
    }
    acquire()
    const claimTimer = window.setInterval(acquire, 2000)
    const tickTimer = window.setInterval(() => {
      const mono = performance.now()
      const elapsed = mono - lastMono.current
      lastMono.current = mono
      if (isLeader.current)
        apply({
          type: 'tick',
          activeElapsedMs: document.visibilityState === 'visible' ? elapsed : 0,
        })
    }, 1000)
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('focus', onFocus)
    window.addEventListener('pageshow', onFocus)
    window.addEventListener('pagehide', onPageHide)
    window.addEventListener('storage', onStorage)
    return () => {
      disposed = true
      isLeader.current = false
      clearInterval(claimTimer)
      clearInterval(tickTimer)
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('pageshow', onFocus)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('storage', onStorage)
      channel.current?.close()
      channel.current = null
      release?.()
      closeNotification()
    }
  }, [apply, supported])

  return {
    state,
    dispatch,
    leader,
    supported: supported && !lockError,
    storageError,
    recovered: loaded.recovered,
  }
}
