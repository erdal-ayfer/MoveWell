# MoveWell

Türkçe, tek kişilik bir masa başı mola uygulaması. İş gününü başlat, sekmeyi açık bırak; zamanı geldiğinde kısa bir hareket molası yap veya hatırlatmayı ertele.

React + TypeScript + Vite + Tailwind. Sunucu, hesap, veritabanı, API anahtarı ve takip yazılımı yok. Ayarlar, oturum ve kayıtlar yalnızca bu tarayıcının `localStorage` alanında saklanır.

## Çalıştırma

Node.js 24 LTS önerilir (en az 22.13), npm kullanılır.

```sh
npm ci
npm run dev
```

Terminalde gösterilen localhost adresini Chrome'da aç. Diğer cihazlarda güvenilir sekme koordinasyonu için HTTPS gerekir; uygulamayı `file://` üzerinden açma.

```sh
npm test        # durum makinesi, veri kurtarma, medya ve bildirim testleri
npm run lint   # TypeScript / React hook kontrolleri
npm run build  # TypeScript kontrolü + dist üretimi
npm run preview
```

Tekrarlanabilir Chrome uçtan uca kontrolü (önce `npm run build`, ardından `npm run preview -- --port 4173` çalışır durumda olmalı):

```sh
npx --yes --package @playwright/cli playwright-cli -s=movewell-qa open http://127.0.0.1:4173 --browser chrome
npx --yes --package @playwright/cli playwright-cli -s=movewell-qa run-code --filename scripts/browser-check.js
npx --yes --package @playwright/cli playwright-cli -s=movewell-qa close
```

Bu komutlar ayrı bir test tarayıcı oturumu kullanır ve o oturumun MoveWell verilerini sıfırlar. Tarayıcı saati hızlandırılır; yerel bildirim arayüzü test taklidiyle değiştirilir. Gerçek işletim sistemi bildirim teslimi otomatik test tarafından doğrulanmaz. Test, hatırlatma/erteleme, kısmi/tam mola, yenileme, 12 gösterimin gerçek kare/uzuv değişimi, azaltılmış hareket ve mobil taşma kontrolünü kapsar. Çoklu sekmede tek bildirim ve lider devri ayrıca Chrome'da doğrulanmıştır.

## Kullanım

- **Bugün:** iş gününü başlat/bitir, geri sayımı gör, hemen mola ver, odaklan veya duraklat.
- **Mola ekranı:** hareket gösterimi, kısa Türkçe yönergeler, süre seçimi, oynat/duraklat, önceki/sonraki, hareket değiştirme ve erken bitirme.
- **Hareketler:** 12 hafif hareket. Gösterimi açabilir ve istemediğin hareketleri mola listelerinden çıkarabilirsin. En az bir hareket açık kalır.
- **Geçmiş:** tamamlanan, kısmi ve atlanan molalar ayrı gösterilir. Son yedi günün toplam hareket süresi gerçek kayıtlardan hesaplanır.
- **Ayarlar:** 30/45/60/90 dakika çalışma aralığı, 2/3/5 dakika mola, tema, isteğe bağlı ses/bildirim, ertesi gün otomatik başlatma ve JSON veri indirme.

## Zamanlama kuralları

`src/lib/reminderMachine.ts` saf, test edilebilir bir durum makinesidir: `idle`, `working`, `break_due`, `snoozed`, `paused`, `in_break`, `finished`.

Hatırlatma zamanı `Date.now()` tabanlı zaman damgalarından hesaplanır. Bir saniyelik aralık yalnızca saati kontrol eder; biriken sayaç artışları hatırlatma zamanının kaynağı değildir.

| Olay | Sonuç |
| --- | --- |
| İş gününü başlat | Şimdiki zaman + seçili çalışma aralığı |
| Hatırlatma zamanı geçmiş | Tek bekleyen hatırlatma; kaçırılan aralıklar yığılmaz |
| 5/10/15/30 dakika ertele | Aynı hatırlatma, tıklama zamanından itibaren ertelenir; kayıt sayısı değişmez |
| Molayı atla | Atlandı kaydı; şimdiki zamandan yeni çalışma aralığı |
| Mola tamamla | Gerçek hareket süreleri kaydedilir; bitiş zamanından yeni çalışma aralığı |
| Erken bitir / hareket atla | Kısmi kayıt; tam mola sayısı artmaz |
| Odaklan / duraklat | Kalan çalışma süresi korunur; devam edince bu süre işler |
| Odak süresi bittikten geç uyan | Korunan çalışma süresi uyanışta başlar |
| Günü bitir | Bekleyen hatırlatma temizlenir |
| Yeni yerel takvim günü | Önceki günün oturumu sona erer, manuel başlangıç beklenir |

Otomatik yeni gün seçeneği açık olduğunda, açık veya geri yüklenen eski oturum yeni gün fark edilince yeni bir aralık başlatır. Kapalı tarayıcıyı başlatmaz. Saat geri alındığında kalan hatırlatma süresi korunur; ileri sıçramada en fazla bir gecikmiş hatırlatma çıkar. Gün değişimi yerel tarayıcı saat dilimini kullanır.

**Gerçek hareket süresi:** mola sayacı yalnızca görünür sekmede, oynatma açıkken ilerler. `performance.now()` ile ölçülen 2,5 saniyeden uzun zamanlama boşlukları hareket sayılmaz ve oynatmayı duraklatır. Sekmeden ayrılma, yenileme ve başka sekmeye oturum devri de molayı duraklatır. Geri dönünce **Devam et** kullanılır. Bu ölçüm bir hareket sensörü değildir; kullanıcının gerçekten hareket edip etmediğini tespit etmez.

Hareket değiştirilirse önceki harekette yapılmış süre silinmez. Yeni süre ayarı geçmişte gerçekleşen süreyi azaltmaz. Yeni çalışma aralığı ayarı mevcut son tarihi değiştirmez; sonraki aralıkta uygulanır. Normal iş günü dışında başlatılan tek mola kendiliğinden iş günü başlatmaz. Odaklanma sırasında alınan manuel mola mevcut odak durumuna geri döner.

## Chrome, bildirimler ve çoklu sekme

Bildirim izni yalnızca **Bildirimlere izin ver** veya başlangıç rehberindeki düğmeye basıldığında istenir. İzin reddedilirse Chrome adres çubuğundaki site ayarlarından değiştirilebilir. Uygulama içi hatırlatma bu izne bağlı değildir. Ses varsayılan olarak kapalıdır; tarayıcı yeniden açıldıktan sonra bir kullanıcı etkileşimi gerekebilir.

**Sekme kapalıyken veya bilgisayar uykudayken güvenilir hatırlatma yoktur.** Chrome bellek tasarrufu, işletim sistemi bildirim ayarları ve arka plan kısıtlamaları bildirimleri geciktirebilir. Uyanışta veya sekmeye dönüşte tek gecikmiş hatırlatma gösterilir. Uygulama arka planda çalışan bir masaüstü hizmeti veya service worker kullanmaz.

Chrome'da Web Locks API ile aynı kökendeki sekmelerden yalnızca biri oturumu yönetir ve yerel bildirim gönderebilir. Kilit açık sekmede tutulur; diğer sekmeler salt okunurdur. Sekme kapanınca başka bir sekme, zamanlayıcılar çalışabiliyorsa yaklaşık iki saniye içinde devralır. BroadcastChannel değişiklikleri duyurur; desteklenmediğinde `storage` olayı kullanılır. Salt okunur sekmede ayarlar ve mola kontrolleri kapalıdır. Web Locks yoksa güvenli olmayan bir tahmini lider seçmek yerine oturum başlatma kapatılır ve açıklama gösterilir. Askıya alınmış lider sekmenin kontrolünü almak için o sekmeyi kapatmak gerekebilir.

## Veri saklama ve sınırlar

Veri anahtarı `movewell:v1`; şema sürümü `1`. Zod şemaları ayarları, egzersiz kimliklerini, zamanları ve kayıt yapısını doğrular. Eksik ayar alanları varsayılanlarla doldurulur. Bozuk veride geçerli ayarlar/oturum/kayıtlar kurtarılır; bilinmeyen ana sürümler güvenli başlangıç durumuna döner. Kayıt yapılamazsa kullanıcıya görünür uyarı verilir.

Son 3.000 mola kaydı tutulur. Tarayıcı verilerini temizlemek, gizli pencereyi kapatmak veya başka tarayıcı/cihaz kullanmak geçmişi kaybettirebilir. Ayarlardaki **Kayıtları indir** ile JSON dışa aktarılabilir; içe aktarma ve cihazlar arası eşitleme bu sürümde yoktur. localStorage erişimi engelliyse mevcut sekme bellekte çalışabilir; kalıcılık sağlanamaz.

Varsayılan medyalar, ikonlar ve yazı tipleri yereldir; çalışma sırasında harici medya isteği yapılmaz. İlk sayfa yüklemesi ve yenileme site sunucusuna erişim gerektirir; tam çevrimdışı kurulum/PWA bu sürümün kapsamı dışındadır. Kaynak bağlantılarına tıklamak ilgili harici siteyi açar.

## Hareket görselleri ve erişilebilirlik

Parmak ve bakış hareketlerinde Workrave'in GPL v3 lisanslı gerçek poz kareleri sırayla oynatılır; akıcı video olarak tanıtılmaz. Kalan 10 hareket için eklem/uzuv hareketini gösteren özgün SVG/CSS animasyonları vardır. Animasyonların tamamı uygulama paketinde bulunur. Kaynak ve lisans ayrıntıları [MEDIA_SOURCES.md](MEDIA_SOURCES.md) dosyasındadır.

Her hareketin yazılı yönergesi ve gerektiğinde kısa dikkat notu bulunur. Sistem azaltılmış hareket tercihi, sabit gösterim ve yazılı yönergeye geçer. Gösterimi ayrıca duraklatabilir veya başa alabilirsin. Klavye odağı, ekran okuyucu adları, yerel modal odak yönetimi, açık/koyu tema ve dar ekran düzeni desteklenir.

MoveWell tıbbi bir ürün değildir. Hareketler isteğe bağlıdır; ağrı veya rahatsızlık varsa dur. Yoğun egzersiz, zorlayıcı boyun döndürme ve nefes tutma yönergesi içermez.

## GitHub Pages yayını

Site adresi: **https://erdal-ayfer.github.io/MoveWell/**

`.github/workflows/pages.yml`, `main` dalına yapılan her push için Node.js 24 ile bağımlılıkları kurar, lint/test kontrollerini çalıştırır, uygulamayı derler ve GitHub Pages'e dağıtır. GitHub deposunda **Settings → Pages → Source: GitHub Actions** kullanılır. Ana kullanıcı sitesinin dosyaları değiştirilmez.

Yayın derlemesinde `DEPLOY_BASE_PATH=/MoveWell/` ayarlanır. JavaScript, CSS, hareket görselleri ve bildirim ikonu bu taban yolu altında yüklenir. Yerel geliştirme ve normal `npm run build` için varsayılan yol `/` kalır.

Alt dizin derlemesini PowerShell'de yerel olarak denemek için:

```powershell
$env:DEPLOY_BASE_PATH = '/MoveWell/'
npm run build
npm run preview -- --port 4173
# http://127.0.0.1:4173/MoveWell/
```

Normal kök dizin derlemesine dönmek için `Remove-Item Env:DEPLOY_BASE_PATH` kullan. Canlı sitenin tarayıcı kayıtları localhost kayıtlarından ayrıdır; bildirim izni canlı alan adında yeniden verilir.

## Kaynak depo ve alternatif Vercel kurulumu

Depo: https://github.com/erdal-ayfer/MoveWell

```sh
git clone https://github.com/erdal-ayfer/MoveWell.git
cd MoveWell
npm ci
npm run build
```

Vercel kullanmak istersen **Add New → Project** üzerinden GitHub deposunu seç:

- Framework: **Vite**
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: **24.x**
- Environment variables: gerekmez

Uygulama tek giriş sayfası ve istemci içi görünümler kullandığından özel rewrite veya `vercel.json` gerekmez. HTTPS dağıtımında bildirim iznini yeniden ver; localhost verileri üretim alan adına taşınmaz.

## Kaynak düzeni

```text
src/lib/             durum makinesi, veri şemaları, depolama, bildirim, liste seçimi
src/hooks/           sekme liderliği ve zamanlama bağlantısı
src/components/      mola oynatıcısı, gösterimler, geçmiş, ayarlar, modal
src/data/            Türkçe hareket kataloğu
src/tests/           otomatik davranış ve medya testleri
public/exercises/    açık lisanslı medya ve kaynak belgeleri
```

Uygulama GNU GPL v3 ile sunulur; [LICENSE](LICENSE). Workrave katkıcılarının kaynak ve lisans bildirimleri korunmuştur. DM Sans: SIL Open Font License; Lucide: ISC.
