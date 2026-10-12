import { useState } from 'react'
import { Bell, Volume2, Download, ExternalLink } from 'lucide-react'
import type { Settings as Preferences, State } from '../lib/model'
import type { Action } from '../lib/reminderMachine'
import { enableSound, notificationPermission, requestNotifications } from '../lib/notifications'

export function Settings({
  state,
  dispatch,
  leader,
  openLibrary,
}: {
  state: State
  dispatch: (action: Action) => void
  leader: boolean
  openLibrary: () => void
}) {
  const [permission, setPermission] = useState(notificationPermission)
  const patch = (patch: Partial<Preferences>) => dispatch({ type: 'settings', patch })
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'movewell-kayitlar.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <section className="settings">
      <div className="page-heading">
        <div>
          <h1>Kendi ritmin</h1>
          <p className="muted">Molalarını çalışma gününe göre ayarla.</p>
        </div>
      </div>
      <fieldset disabled={!leader}>
        <div className="setting-row">
          <div>
            <h2>Çalışma aralığı</h2>
            <p>Yeni başlayan çalışma aralıklarında kullanılır.</p>
          </div>
          <select
            aria-label="Çalışma aralığı"
            value={state.settings.intervalMinutes}
            onChange={(e) =>
              patch({ intervalMinutes: Number(e.target.value) as Preferences['intervalMinutes'] })
            }
          >
            {[30, 45, 60, 90].map((n) => (
              <option key={n} value={n}>
                {n} dakika
              </option>
            ))}
          </select>
        </div>
        <div className="setting-row">
          <div>
            <h2>Mola uzunluğu</h2>
            <p>Yeni molalar için tercih ettiğin süre.</p>
          </div>
          <select
            aria-label="Mola uzunluğu"
            value={state.settings.breakMinutes}
            onChange={(e) =>
              patch({ breakMinutes: Number(e.target.value) as Preferences['breakMinutes'] })
            }
          >
            {[2, 3, 5].map((n) => (
              <option key={n} value={n}>
                {n} dakika
              </option>
            ))}
          </select>
        </div>
        <div className="setting-row">
          <div>
            <h2>Görünüm</h2>
            <p>Rahat okuduğun temayı seç.</p>
          </div>
          <select
            aria-label="Görünüm"
            value={state.settings.theme}
            onChange={(e) => patch({ theme: e.target.value as Preferences['theme'] })}
          >
            <option value="system">Sistem tercihi</option>
            <option value="light">Açık</option>
            <option value="dark">Koyu</option>
          </select>
        </div>
        <div className="setting-row">
          <div>
            <h2>Hafif bildirim sesi</h2>
            <p>Varsayılan olarak kapalıdır. Tarayıcı sesi engelleyebilir.</p>
          </div>
          <label className="check-label">
            <Volume2 size={18} />
            <input
              type="checkbox"
              checked={state.settings.sound}
              onChange={(e) => {
                if (e.target.checked) enableSound()
                patch({ sound: e.target.checked })
              }}
            />
            Ses açık
          </label>
        </div>
        <div className="setting-row">
          <div>
            <h2>Yeni günü otomatik başlat</h2>
            <p>
              Açık sekme yeni güne geçtiğinde başlatır. Uygulamayı ilk açtığında yine sen
              başlatırsın.
            </p>
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={state.settings.autoStart}
              onChange={(e) => patch({ autoStart: e.target.checked })}
            />
            Etkin
          </label>
        </div>
      </fieldset>
      <div className="setting-row">
        <div>
          <h2>Tarayıcı bildirimleri</h2>
          <p role="status">
            {permission === 'granted'
              ? 'Bildirim izni açık.'
              : permission === 'denied'
                ? 'Bildirimler engelli. Chrome adres çubuğundaki site ayarlarından izin verebilirsin.'
                : permission === 'unsupported'
                  ? 'Bu ortam yerel bildirimleri desteklemiyor.'
                  : 'İzin verirsen başka bir sekmedeyken de bildirim alabilirsin.'}
          </p>
        </div>
        <button
          className="button"
          disabled={permission !== 'default'}
          onClick={async () => setPermission(await requestNotifications())}
        >
          <Bell size={17} />
          Bildirimlere izin ver
        </button>
      </div>
      <div className="setting-row">
        <div>
          <h2>Hareket tercihleri</h2>
          <p>{state.settings.excluded.length} hareket mola listesinin dışında.</p>
        </div>
        <button className="button" onClick={openLibrary}>
          Kütüphaneyi aç
        </button>
      </div>
      <div className="setting-row">
        <div>
          <h2>Verilerin bu tarayıcıda</h2>
          <p>Hesap veya sunucu yok. Tarayıcı verilerini silmek kayıtlarını da siler.</p>
        </div>
        <button className="button" onClick={exportData}>
          <Download size={17} />
          Kayıtları indir
        </button>
      </div>
      <section className="settings-note">
        <h2>Hatırlatmalar hakkında</h2>
        <p>
          Sekmeyi açık bırak. Sekme kapalıyken veya bilgisayar uykudayken hatırlatma gönderilemez.
          Chrome ve işletim sistemi arka plan bildirimlerini geciktirebilir. Uygulama içi
          hatırlatma, bildirim izninden bağımsızdır.
        </p>
        <p>
          Birden fazla sekme açarsan ilk sekme oturumu yönetir. Diğerleri salt okunur kalır;
          yönetici sekme kapanınca başka bir sekme devralır. Hareket molasında başka sekmeye geçmek
          sayacı duraklatır.
        </p>
        <h2>Kendini dinle</h2>
        <p>
          MoveWell tıbbi bir ürün değildir. Hareketler isteğe bağlıdır; ağrı, baş dönmesi veya
          rahatsızlık olursa dur. Ekran başında geçirdiğin süreyi yargılamaz.
        </p>
        <a href="https://github.com/erdal-ayfer/MoveWell" target="_blank" rel="noreferrer">
          Kaynak kodu ve görsel lisansları <ExternalLink size={14} />
        </a>
      </section>
    </section>
  )
}
