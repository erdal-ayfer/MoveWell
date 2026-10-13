import type { State } from './model'
import { assetUrl } from './assets'

let soundContext: AudioContext | null = null
let currentNotification: Notification | null = null
export const notificationPermission = () =>
  typeof Notification === 'undefined' ? 'unsupported' : Notification.permission

export async function requestNotifications() {
  if (typeof Notification === 'undefined') return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'unsupported'
  }
}

export function enableSound() {
  try {
    soundContext ??= new AudioContext()
    void soundContext.resume().catch(() => {})
  } catch {
    /* In-app prompts remain available. */
  }
}

export const reminderKey = (state: State) =>
  state.session.status === 'break_due'
    ? `${state.session.reminderId}:${state.session.reminderAttempt}`
    : null

export function closeNotification() {
  currentNotification?.close()
  currentNotification = null
}

export function notify(sound: boolean) {
  if (notificationPermission() === 'granted') {
    try {
      closeNotification()
      currentNotification = new Notification('MoveWell · Kısa bir mola?', {
        body: 'Hazırsan biraz hareket et. Meşgulsen molanı erteleyebilirsin.',
        tag: 'movewell-break',
        icon: assetUrl('favicon.svg'),
      })
      currentNotification.onclick = () => {
        window.focus()
        closeNotification()
      }
    } catch {
      /* Browser may reject native notifications; dialog is independent. */
    }
  }
  if (sound && soundContext?.state === 'running') {
    try {
      const oscillator = soundContext.createOscillator()
      const gain = soundContext.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = 520
      gain.gain.setValueAtTime(0.07, soundContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, soundContext.currentTime + 0.65)
      oscillator.connect(gain)
      gain.connect(soundContext.destination)
      oscillator.start()
      oscillator.stop(soundContext.currentTime + 0.65)
    } catch {
      /* Audio support is optional. */
    }
  }
}
