import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  History,
  LayoutDashboard,
  Moon,
  Pause,
  Play,
  Settings2,
  Square,
  Sun,
  X,
} from 'lucide-react'
import { useReminderEngine } from './hooks/useReminderEngine'
import { categories, exercises, exerciseById, type Exercise } from './data/exercises'
import { dayKey } from './lib/model'
import { formatTime, formatDuration, clockTime } from './lib/format'
import { playlist } from './lib/playlist'
import { totalMs } from './lib/reminderMachine'
import { reminderKey, requestNotifications } from './lib/notifications'
import { BreakPlayer } from './components/BreakPlayer'
import { ExerciseDemo } from './components/ExerciseDemo'
import { HistoryList, HistoryPage } from './components/History'
import { Settings } from './components/Settings'
import { Modal } from './components/Modal'

type View = 'dashboard' | 'library' | 'history' | 'settings'
const views = [
  { id: 'dashboard' as const, label: 'Bugün', icon: LayoutDashboard },
  { id: 'library' as const, label: 'Hareketler', icon: BookOpen },
  { id: 'history' as const, label: 'Geçmiş', icon: History },
  { id: 'settings' as const, label: 'Ayarlar', icon: Settings2 },
]

export default function App() {
  const { state, dispatch, leader, supported, storageError, recovered } = useReminderEngine()
  const [view, setView] = useState<View>('dashboard')
  const [focusOpen, setFocusOpen] = useState(false)
  const [preview, setPreview] = useState<Exercise | null>(null)
  const [filter, setFilter] = useState('Tümü')
  const [dismissed, setDismissed] = useState<string | null>(null)
  const [guide, setGuide] = useState(false)
  const [welcomeClosed, setWelcomeClosed] = useState(false)
  const [notice, setNotice] = useState('')
  const s = state.session
  const now = s.lastObservedAt
  const inBreak = s.status === 'in_break'
  const activeDay = !['idle', 'finished'].includes(s.status)
  const todaysRecords = state.history.filter((r) => r.day === dayKey(now))
  const completed = todaysRecords.filter((r) => r.outcome === 'completed').length
  const minutes = todaysRecords.reduce((sum, r) => sum + totalMs(r.steps), 0)
  const nextPlaylist = playlist(state.settings, state.rotation)
  const key = reminderKey(state)
  const reminderOpen = leader && !!key && dismissed !== key
  const remaining =
    s.status === 'paused'
      ? s.remainingMs
      : Math.max(0, (s.nextDueAt ?? now + state.settings.intervalMinutes * 60000) - now)
  const finishGuide = () => {
    setWelcomeClosed(true)
    setGuide(false)
    if (leader) dispatch({ type: 'settings', patch: { onboardingDone: true } })
  }

  useEffect(() => {
    const query = matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      document.documentElement.dataset.theme =
        state.settings.theme === 'system'
          ? query.matches
            ? 'dark'
            : 'light'
          : state.settings.theme
    }
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [state.settings.theme])
  useEffect(() => {
    document.title =
      s.status === 'break_due'
        ? 'Mola zamanı · MoveWell'
        : s.status === 'working' || s.status === 'snoozed'
          ? `${formatTime(remaining)} · MoveWell`
          : 'MoveWell — Hareket için küçük bir mola'
  }, [s.status, remaining])

  return (
    <>
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>
      <header className="app-header">
        <div className="header-inner">
          <a
            href="#"
            className="brand"
            onClick={(event) => {
              event.preventDefault()
              setView('dashboard')
            }}
            aria-label="MoveWell ana sayfa"
          >
            <Activity size={27} strokeWidth={2.5} />
            <span>
              move<span className="brand-light">well</span>
            </span>
          </a>
          <nav aria-label="Ana gezinme">
            {views.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={view === id && !inBreak ? 'active' : ''}
                aria-current={view === id && !inBreak ? 'page' : undefined}
                onClick={() => setView(id)}
                disabled={inBreak}
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <button
            className="icon-button theme-button"
            aria-label={state.settings.theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
            disabled={!leader}
            onClick={() =>
              dispatch({
                type: 'settings',
                patch: {
                  theme: document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark',
                },
              })
            }
          >
            {state.settings.theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </header>
      <main id="main" className="app-main">
        {!supported ? (
          <div className="notice warning" role="alert">
            Bu ortam güvenli sekme yönetimini desteklemiyor. MoveWell'i güncel Chrome'da HTTPS veya
            localhost üzerinden aç.
          </div>
        ) : (
          !leader && (
            <div className="notice" role="status">
              Bu sekme salt okunur. Başka bir MoveWell sekmesi oturumu yönetiyor; onu kapatırsan bu
              sekme devralır.
            </div>
          )
        )}
        {storageError && (
          <div className="notice warning" role="alert">
            Tarayıcıya kayıt yapılamıyor. Bu oturum çalışır ancak yenileyince veriler kaybolabilir.
            Ayarlardan kayıtlarını indirebilirsin.
          </div>
        )}
        {recovered && (
          <div className="notice" role="status">
            Okunamayan yerel veriler onarıldı. Kurtarılabilen ayarlar ve kayıtlar korundu.
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            {notice}
            <button className="icon-button" aria-label="Mesajı kapat" onClick={() => setNotice('')}>
              <X size={17} />
            </button>
          </div>
        )}
        {s.status === 'break_due' && !reminderOpen && (
          <div className="due-banner">
            <Bell size={20} />
            <span>Mola zamanı. Hazır olduğunda başlayabilirsin.</span>
            <button
              className="button primary"
              disabled={!leader}
              onClick={() => setDismissed(null)}
            >
              Molayı aç
            </button>
          </div>
        )}
        {inBreak ? (
          <BreakPlayer state={state} dispatch={dispatch} leader={leader} />
        ) : view === 'dashboard' ? (
          <>
            <div className="page-heading">
              <div>
                <h1>Bugün, biraz hareket.</h1>
                <p className="muted">İşine odaklan. Molanı biz hatırlatalım.</p>
              </div>
              <div className="date-label">
                <CalendarDays size={17} />
                {new Date(now).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  weekday: 'long',
                })}
              </div>
            </div>
            <div className="dashboard-grid">
              <section className="timer-panel" aria-labelledby="timer-title">
                <div className="timer-heading">
                  <h2 id="timer-title">
                    {s.status === 'paused'
                      ? 'Kısa bir ara'
                      : s.status === 'break_due'
                        ? 'Mola zamanı'
                        : s.status === 'snoozed'
                          ? 'Molan ertelendi'
                          : s.status === 'finished'
                            ? 'Bugünlük bu kadar'
                            : s.status === 'idle'
                              ? 'Güne hazır mısın?'
                              : 'Bir sonraki molana'}
                  </h2>
                  <Clock3 size={19} />
                </div>
                <div className="countdown" aria-label={`Kalan süre ${formatTime(remaining)}`}>
                  {s.status === 'finished' ? (
                    <Check size={76} strokeWidth={1.25} />
                  ) : s.status === 'break_due' ? (
                    '00:00'
                  ) : (
                    formatTime(remaining)
                  )}
                </div>
                <p className="timer-description">
                  {s.status === 'paused'
                    ? s.pausedUntil
                      ? `${clockTime(s.pausedUntil)} itibarıyla sayaç devam edecek.`
                      : 'Hazır olduğunda kaldığın yerden devam et.'
                    : s.status === 'idle'
                      ? `${state.settings.intervalMinutes} dakika çalışma, ardından küçük bir hareket molası.`
                      : s.status === 'finished'
                        ? 'Molaların kaydedildi. Yeni bir gün, yeni bir ritim.'
                        : s.status === 'break_due'
                          ? 'Biraz esne, yerinden kalk veya gözlerini dinlendir.'
                          : `${clockTime(s.nextDueAt!)} · ${state.settings.breakMinutes} dakikalık hareket molası`}
                </p>
                <progress
                  value={
                    activeDay ? Math.max(0, state.settings.intervalMinutes * 60000 - remaining) : 0
                  }
                  max={state.settings.intervalMinutes * 60000}
                  aria-label="Çalışma aralığı ilerlemesi"
                />
                <fieldset disabled={!leader} className="timer-actions">
                  {!activeDay ? (
                    <button className="button primary" onClick={() => dispatch({ type: 'start' })}>
                      <Play size={18} />
                      İş gününü başlat
                    </button>
                  ) : s.status === 'paused' ? (
                    <button className="button primary" onClick={() => dispatch({ type: 'resume' })}>
                      <Play size={18} />
                      Çalışmaya devam et
                    </button>
                  ) : s.status === 'break_due' ? (
                    <button
                      className="button primary"
                      onClick={() => dispatch({ type: 'start_break' })}
                    >
                      <Coffee size={18} />
                      Molaya başla
                    </button>
                  ) : (
                    <button
                      className="button primary"
                      onClick={() => dispatch({ type: 'start_break' })}
                    >
                      <Coffee size={18} />
                      Şimdi mola ver
                    </button>
                  )}
                  {activeDay && s.status !== 'paused' && (
                    <button className="button" onClick={() => setFocusOpen(true)}>
                      Odaklan
                    </button>
                  )}
                </fieldset>
                <fieldset disabled={!leader} className="timer-secondary">
                  {activeDay ? (
                    <>
                      {s.status !== 'paused' && (
                        <button
                          className="text-button"
                          onClick={() => dispatch({ type: 'pause', minutes: null })}
                        >
                          <Pause size={14} />
                          Duraklat
                        </button>
                      )}
                      <button className="text-button" onClick={() => dispatch({ type: 'end' })}>
                        <Square size={13} />
                        Günü bitir
                      </button>
                    </>
                  ) : (
                    <button
                      className="text-button"
                      onClick={() => dispatch({ type: 'start_break' })}
                    >
                      <Coffee size={15} />
                      Sadece bir mola ver
                    </button>
                  )}
                </fieldset>
              </section>
              <section className="next-break">
                <div className="flex items-center justify-between">
                  <h2>Sıradaki molanda</h2>
                  <span className="muted">{state.settings.breakMinutes} dk</span>
                </div>
                <div className="next-illustration">
                  <ExerciseDemo
                    key={nextPlaylist[0]?.exerciseId}
                    exercise={exerciseById(nextPlaylist[0]?.exerciseId)}
                    compact
                  />
                </div>
                <div className="preview-movements">
                  {nextPlaylist.slice(0, 3).map((step, index) => (
                    <div key={`${index}-${step.exerciseId}`}>
                      <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
                      <span>{exerciseById(step.exerciseId).titleTr}</span>
                      <span className="muted">30 sn</span>
                    </div>
                  ))}
                </div>
                <button className="text-button" onClick={() => setView('library')}>
                  Tüm hareketleri keşfet <ArrowRight size={16} />
                </button>
              </section>
            </div>
            <section className="today-summary">
              <div>
                <strong>{completed}</strong>
                <span>tamamlanan mola</span>
              </div>
              <div>
                <strong>{formatDuration(minutes)}</strong>
                <span>kaydedilen hareket</span>
              </div>
              <p>
                Her mola sana ait.
                <br />
                Kendi ritminde devam et.
              </p>
            </section>
            <section>
              <div className="section-heading">
                <h2>Bugünün molaları</h2>
                <button className="text-button" onClick={() => setView('history')}>
                  Geçmişi gör <ChevronRight size={16} />
                </button>
              </div>
              <HistoryList records={todaysRecords} />
            </section>
          </>
        ) : view === 'library' ? (
          <section>
            <div className="page-heading">
              <div>
                <h1>Hareket kütüphanesi</h1>
                <p className="muted">
                  Kısa, ekipmansız ve kendi hızında. İstemediğin hareketleri listenden çıkar.
                </p>
              </div>
              <span className="muted">{exercises.length} hareket</span>
            </div>
            <div className="filters" role="group" aria-label="Hareket kategorileri">
              {['Tümü', ...categories].map((category) => (
                <button
                  key={category}
                  aria-pressed={filter === category}
                  className={filter === category ? 'selected' : ''}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="library-grid">
              {exercises
                .filter((e) => filter === 'Tümü' || e.category === filter)
                .map((exercise) => {
                  const excluded = state.settings.excluded.includes(exercise.id)
                  return (
                    <article
                      key={exercise.id}
                      className={`exercise-card ${excluded ? 'excluded' : ''}`}
                    >
                      <button
                        className="demo-preview"
                        aria-label={`${exercise.titleTr} gösterimini aç`}
                        onClick={() => setPreview(exercise)}
                      >
                        <ExerciseDemo exercise={exercise} compact />
                        <span className="preview-play">
                          <Play size={19} fill="currentColor" />
                        </span>
                      </button>
                      <div className="exercise-card-content">
                        <span className="muted">{exercise.category} · 30 sn</span>
                        <h2>
                          <button onClick={() => setPreview(exercise)}>{exercise.titleTr}</button>
                        </h2>
                        <label className="check-label">
                          <input
                            disabled={
                              !leader ||
                              (!excluded && state.settings.excluded.length >= exercises.length - 1)
                            }
                            type="checkbox"
                            checked={!excluded}
                            onChange={() =>
                              dispatch({
                                type: 'settings',
                                patch: {
                                  excluded: excluded
                                    ? state.settings.excluded.filter((id) => id !== exercise.id)
                                    : [...state.settings.excluded, exercise.id],
                                },
                              })
                            }
                          />
                          Molalarıma dahil et
                        </label>
                      </div>
                    </article>
                  )
                })}
            </div>
            <p className="footnote">
              Mola oluşturabilmek için en az bir hareket açık kalır. Hareketler isteğe bağlı;
              rahatsızlık hissedersen dur.
            </p>
          </section>
        ) : view === 'history' ? (
          <HistoryPage records={state.history} now={now} />
        ) : (
          <Settings
            state={state}
            dispatch={dispatch}
            leader={leader}
            openLibrary={() => setView('library')}
          />
        )}
      </main>
      <footer className="app-footer">
        <span>
          <Activity size={15} /> Küçük molalar. Daha hareketli bir gün.
        </span>
        <button className="text-button" onClick={() => setGuide(true)}>
          Nasıl çalışır?
        </button>
      </footer>
      {reminderOpen && (
        <Modal title="Küçük bir molaya ne dersin?" onClose={() => setDismissed(key)}>
          <p className="modal-description">
            Biraz hareket etmenin zamanı geldi. Meşgulsen molanı erteleyebilirsin.
          </p>
          <button
            className="button primary full"
            onClick={() => {
              dispatch({ type: 'start_break' })
              setView('dashboard')
            }}
          >
            <Play size={18} />
            Molaya başla · {state.settings.breakMinutes} dk
          </button>
          <h3 className="snooze-title">Şimdi uygun değilse</h3>
          <div className="snooze-options">
            {([5, 10, 15, 30] as const).map((minutes) => (
              <button
                className="button"
                key={minutes}
                onClick={() => dispatch({ type: 'snooze', minutes })}
              >
                {minutes} dk ertele
              </button>
            ))}
          </div>
          <button className="text-button full" onClick={() => dispatch({ type: 'skip' })}>
            Bu molayı atla
          </button>
        </Modal>
      )}
      {focusOpen && !reminderOpen && (
        <Modal title="Biraz odaklanma zamanı" onClose={() => setFocusOpen(false)}>
          <p className="modal-description">
            Bu süre boyunca hatırlatma gelmez. Ardından mola sayacı kaldığı yerden devam eder.
          </p>
          <div className="focus-options">
            {([30, 60, 90] as const).map((minutes) => (
              <button
                className="button"
                key={minutes}
                onClick={() => {
                  dispatch({ type: 'pause', minutes })
                  setFocusOpen(false)
                }}
              >
                {minutes} dakika
              </button>
            ))}
          </div>
          <button
            className="text-button full"
            onClick={() => {
              dispatch({ type: 'pause', minutes: null })
              setFocusOpen(false)
            }}
          >
            Ben devam ettirene kadar
          </button>
        </Modal>
      )}
      {preview && !reminderOpen && (
        <Modal title={preview.titleTr} onClose={() => setPreview(null)}>
          <ExerciseDemo key={preview.id} exercise={preview} />
          <ol className="preview-instructions">
            {preview.instructionsTr.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ol>
          {preview.cautionTr && <p className="caution">{preview.cautionTr}</p>}
        </Modal>
      )}
      {(guide || (leader && !state.settings.onboardingDone && !welcomeClosed)) &&
        !reminderOpen &&
        !inBreak && (
          <Modal title="MoveWell'e hoş geldin" onClose={finishGuide}>
            <p className="modal-description">
              Çalışma gününe küçük hareket molaları ekle. Hepsi bu.
            </p>
            <ol className="guide-steps">
              <li>
                <Play size={20} />
                <div>
                  <strong>İş gününü başlat</strong>
                  <p>Sekmeyi açık bırak. Varsayılan olarak 60 dakika sonra hatırlatırız.</p>
                </div>
              </li>
              <li>
                <Coffee size={20} />
                <div>
                  <strong>Hareket et veya ertele</strong>
                  <p>Gösterimleri takip et. Yoğunsan 5–30 dakika ertele.</p>
                </div>
              </li>
              <li>
                <History size={20} />
                <div>
                  <strong>Kendi ritmini bul</strong>
                  <p>Yaptığın hareketler bu tarayıcıya kaydedilir. Hesap gerekmez.</p>
                </div>
              </li>
            </ol>
            <p className="caution">
              Bilgisayar uykudayken veya sekme kapalıyken hatırlatma gönderemeyiz. Hareket sırasında
              rahatsızlık hissedersen dur.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="button primary" onClick={finishGuide}>
                Başlayalım
              </button>
              <button
                className="button"
                onClick={async () => {
                  const permission = await requestNotifications()
                  setNotice(
                    permission === 'granted'
                      ? 'Tarayıcı bildirimleri açıldı.'
                      : 'Uygulama içi hatırlatmalar her durumda kullanılabilir.',
                  )
                  finishGuide()
                }}
              >
                <Bell size={17} />
                Bildirimleri de aç
              </button>
            </div>
          </Modal>
        )}
    </>
  )
}
