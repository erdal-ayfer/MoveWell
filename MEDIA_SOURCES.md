# Hareket görselleri ve lisansları

MoveWell, uygun hareketlerde Workrave'in açık kaynaklı egzersiz görsellerini yerel dosyalar olarak kullanır. Harici video veya görsel sunucusuna çalışma sırasında istek yapılmaz.

## Workrave

- Proje: https://github.com/rcaelers/workrave
- Sabit kaynak sürümü: `73a2c966f9ed564aab81e76937a1b7d08b4e0e35`
- Kaynak dizin: https://github.com/rcaelers/workrave/tree/73a2c966f9ed564aab81e76937a1b7d08b4e0e35/ui/data/exercises
- Lisans bildirimi: https://github.com/rcaelers/workrave/blob/73a2c966f9ed564aab81e76937a1b7d08b4e0e35/LICENSES.md
- Lisans: **GNU General Public License v3.0 (GPL-3.0)**. Kaynak projenin `LICENSES.md` dosyası bu lisansı bildirir; egzersiz dosyaları için ayrı bir istisna listelenmez.
- Atıf: **Workrave katkıcıları**. Proje geliştiricileri Rob Caelers, Raymond Penners ve Ray Satiro'dur. İncelenen kaynak, bu PNG dosyaları için tek tek sanatçı adı belirtmez; bu nedenle ayrı bir görsel sanatçısı atfedilmemiştir.
- İndirilen tarih: 12 Ekim 2026.
- Yerel lisans metni: `public/exercises/workrave/COPYING`.
- Kaynak lisans dökümü: `public/exercises/workrave/LICENSES.md`.
- Kaynak hareket tanımları: `public/exercises/workrave/exercises.xml.in` (değiştirilmemiştir).
- İndirilen PNG dosyaları değiştirilmemiştir. Türkçe yönergeler ve oynatma zamanlamaları MoveWell için hazırlanmıştır; Workrave'in tıbbi yarar iddiaları aktarılmamıştır.

| MoveWell hareketi | Kaynak dosyalar | Gösterimin niteliği |
| --- | --- | --- |
| Parmaklarını aç ve gevşet | `finger-stretch-1.png`, `finger-stretch-2.png` | İki farklı hareket aşaması sırayla gösterilir. |
| Bakışını uzağa taşı | `depth-focus-1.png`, `depth-focus-2.png` | Yakın ve uzak odak örnekleri sırayla gösterilir. |

Bu medya paketi akıcı video veya eklem animasyonu içermez. Workrave'in kendi egzersiz oynatıcısında olduğu gibi poz kareleri zaman içinde değiştirilir; tek resme sallanma, yakınlaşma veya benzeri dekoratif hareket uygulanarak egzersiz animasyonu izlenimi verilmez. Hareket kısıtlamasını tercih eden kullanıcılara ilk kare ve yazılı yönerge gösterilebilir.

## Seçilmeyen kaynak içerikleri

Sandalye üzerinde kollarla yükselme, büyük kol çevirme, boyun hareketleri ve gözlerle ekran kenarını takip etme bu pakete alınmamıştır. Tek pozdan oluşan omuz esnetme görseli de kullanılmaz. `fist-roll` hareketi kaynak XML'de yanlış görseller nedeniyle devre dışı olarak işaretlenmiştir ve kullanılmaz.

## Özgün MoveWell gösterimleri

Kısa yürüyüş, omuz yuvarlama, bilek hareketi, topuk kaldırma, kürek kemiklerini yaklaştırma, otur-kalk, göğüs açma, ağırlık aktarma, ayak bileği hareketi ve omuz esnetme için `src/components/ExerciseDemo.tsx` ile `src/styles.css` içinde özgün SVG/CSS gösterimleri hazırlanmıştır. Eklem grupları döndürülür, hareket yolları değiştirilir; yalnızca sabit resme dekoratif hareket verilmez. Bunlar da uygulamanın GPL v3 lisansıyla dağıtılır. Hareket aralığı ve tempo temsili gösterimlerdir.

13 Ekim 2026'da `src/components/AdditionalMotion.tsx` ve `src/styles.css` ile 12 özgün gösterim daha eklenmiştir: omuz kaldırma, kolları öne uzatma, dirsek bükme, avuç çevirme, parmak uçlarına dokunma, bileği iki yana hareket ettirme, oturarak diz uzatma, oturarak diz kaldırma, oturarak topuk kaldırma, yana adım, topuğu geriye kaldırma ve yumuşak göz kırpma. Böylece katalog 22 özgün SVG/CSS gösterimi ve Workrave'den iki kareli gösterim içerir. Yeni çizimler dışarıdan alınmış medya içermez ve GPL v3 ile dağıtılır.

Oturarak diz kaldırma/uzatma ve yana adım yönergeleri hazırlanırken [UHCW sandalye egzersizleri](https://www.uhcw.nhs.uk/download/clientfiles/files/Patient%20Information%20Leaflets/Clinical%20Support%20Services/Therapies/Physiotherapy/Chair%20exercises.pdf) ve [NHS denge hareketleri](https://www.nhs.uk/live-well/exercise/balance-exercises/) kaynakları incelenmiştir. Kaynakların görselleri kopyalanmamıştır; çizimler MoveWell'e aittir.

Yazı tipi DM Sans, `@fontsource/dm-sans` paketinden yerel olarak yüklenir; SIL Open Font License metni `public/FONT-LICENSE.txt` içindedir. Lucide ikonları ISC lisanslıdır; metin `public/ICON-LICENSE.txt` içindedir.

## Yeniden dağıtım

Bu görselleri yeniden dağıtırken GPL v3 lisansı, kaynak adresi ve atıf dosyalarını koruyun. Kaynak dosyalar ve değişiklik bilgileri bu depoyla birlikte dağıtılır. Workrave'in görselleri uygulamanın başka bir lisansı altında yeniden etiketlenmez. Özgün MoveWell çizimleri ayrı olarak belirtilmelidir.
