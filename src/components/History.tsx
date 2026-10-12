import { Check, Clock3, Minus, ArrowRight } from 'lucide-react'
import { dayKey, type BreakRecord } from '../lib/model'
import { totalMs } from '../lib/reminderMachine'
import { clockTime, formatDuration } from '../lib/format'
import { exerciseById } from '../data/exercises'

export function HistoryList({
  records,
  detailed = false,
}: {
  records: BreakRecord[]
  detailed?: boolean
}) {
  if (!records.length)
    return (
      <div className="empty-state">
        <Clock3 size={24} />
        <h3>Henüz bir mola kaydı yok</h3>
        <p>İlk molanın ardından yaptığın hareketler burada görünecek.</p>
      </div>
    )
  return (
    <ul className="history-list">
      {[...records].reverse().map((record) => (
        <li key={record.id}>
          <span className={`history-icon ${record.outcome}`}>
            {record.outcome === 'completed' ? (
              <Check size={18} />
            ) : record.outcome === 'skipped' ? (
              <Minus size={18} />
            ) : (
              <Clock3 size={18} />
            )}
          </span>
          <div>
            <strong>
              {record.outcome === 'completed'
                ? 'Mola tamamlandı'
                : record.outcome === 'partial'
                  ? 'Kısmen tamamlandı'
                  : 'Mola atlandı'}
            </strong>
            <p>
              {detailed
                ? `${new Date(record.startedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} · `
                : ''}
              {clockTime(record.startedAt)}
              {record.steps.length > 0
                ? ` · ${record.steps.filter((s) => s.elapsedMs > 0).length} hareket`
                : ''}
            </p>
            {detailed && record.steps.some((s) => s.elapsedMs > 0) && (
              <p className="record-exercises">
                {record.steps
                  .filter((s) => s.elapsedMs > 0)
                  .map(
                    (s) => `${exerciseById(s.exerciseId).titleTr} (${formatDuration(s.elapsedMs)})`,
                  )
                  .join(' · ')}
              </p>
            )}
          </div>
          <span className="history-duration">
            {record.outcome === 'skipped' ? '—' : formatDuration(totalMs(record.steps))}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function HistoryPage({ records, now }: { records: BreakRecord[]; now: number }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const recent = records.filter((r) => r.day >= dayKey(days[0].getTime()))
  const max = Math.max(
    60000,
    ...days.map((d) =>
      records
        .filter((r) => r.day === dayKey(d.getTime()))
        .reduce((sum, r) => sum + totalMs(r.steps), 0),
    ),
  )
  return (
    <section>
      <div className="page-heading">
        <div>
          <h1>Mola geçmişin</h1>
          <p className="muted">Küçük molaların, olduğu gibi.</p>
        </div>
      </div>
      <div className="week-summary">
        <div>
          <h2>Son 7 gün</h2>
          <p>
            <strong>{recent.filter((r) => r.outcome === 'completed').length}</strong> tamamlanan
            mola <ArrowRight size={15} />
            <strong>
              {formatDuration(recent.reduce((sum, r) => sum + totalMs(r.steps), 0))}
            </strong>{' '}
            hareket
          </p>
        </div>
        <div className="week-chart" aria-label="Son yedi günün hareket süreleri">
          {days.map((d) => {
            const ms = records
              .filter((r) => r.day === dayKey(d.getTime()))
              .reduce((sum, r) => sum + totalMs(r.steps), 0)
            return (
              <div key={d.toISOString()} className="day-bar">
                <span>{formatDuration(ms)}</span>
                <div className="bar-track">
                  <div style={{ height: `${(ms / max) * 100}%` }} />
                </div>
                <span>{d.toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
              </div>
            )
          })}
        </div>
      </div>
      <h2 className="section-title">Tüm molalar</h2>
      <HistoryList records={records} detailed />
    </section>
  )
}
