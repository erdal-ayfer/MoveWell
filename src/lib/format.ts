export const formatTime = (milliseconds: number) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000))
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}
export const formatDuration = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000)
  return seconds < 60
    ? `${seconds} sn`
    : `${Math.floor(seconds / 60)} dk${seconds % 60 ? ` ${seconds % 60} sn` : ''}`
}
export const clockTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
