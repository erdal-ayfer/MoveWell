export type Category = 'Ayakta' | 'Oturarak' | 'Omuz ve sırt' | 'El ve bilek' | 'Göz molası'
export type Exercise = {
  id: string
  titleTr: string
  category: Category
  durationSeconds: number
  instructionsTr: string[]
  cautionTr?: string
  media: { type: 'animated-svg' | 'frames'; src: string; attribution?: string; license?: string }
  tags: string[]
  intensity: 'hafif'
}

const make = (
  id: string,
  titleTr: string,
  category: Category,
  instructionsTr: string[],
  cautionTr?: string,
): Exercise => ({
  id,
  titleTr,
  category,
  durationSeconds: 30,
  instructionsTr,
  cautionTr,
  media: { type: 'animated-svg', src: id },
  tags: ['ekipmansız', 'masa molası'],
  intensity: 'hafif',
})

export const exercises: Exercise[] = [
  make(
    'walk',
    'Kısa bir yürüyüş',
    'Ayakta',
    [
      'Rahatça ayağa kalk; çevrende yürüyebileceğin alan aç.',
      'Oda içinde rahat adımlarla yürü. Kollarını doğal bırak.',
    ],
    'Dengen için gerekirse sabit bir yüzeyden destek al.',
  ),
  make(
    'shoulder-roll',
    'Omuzları yuvarla',
    'Omuz ve sırt',
    [
      'Kollarını serbest bırak; omuzlarını hafifçe yukarı kaldır.',
      'Omuzlarını geriye ve aşağıya doğru küçük dairelerle hareket ettir.',
    ],
    'Boynunu çevirmeden, rahat hareket aralığında kal.',
  ),
  make(
    'wrist',
    'Bilekleri hareket ettir',
    'El ve bilek',
    [
      'Ön kolunu destekle; elini rahat bırak.',
      'Bileğini yavaşça yukarı ve aşağı bük. Sonra diğer elinle tekrarla.',
    ],
    'Elini diğer elinle zorlayarak çekme.',
  ),
  make(
    'heel',
    'Topukları kaldır',
    'Ayakta',
    [
      'Sabit bir masa veya duvardan hafifçe destek al.',
      'İki topuğunu yavaşça kaldır, ardından yere indir.',
    ],
    'Dengeni koru; ağrı varsa hareketi bırak.',
  ),
  make(
    'gaze',
    'Uzağa bak',
    'Göz molası',
    [
      'Ekrandan gözlerini ayır; yakındaki bir nesneye, ardından uzaktaki bir noktaya bak.',
      'Bakışını rahat bir tempoda değiştir ve doğal biçimde göz kırp.',
    ],
    'Odaklanmak için gözlerini zorlama; rahatsızlık hissedersen gözlerini dinlendir.',
  ),
  make(
    'squeeze',
    'Kürek kemiklerini yaklaştır',
    'Omuz ve sırt',
    [
      'Rahatça otur veya ayakta dur. Omuzlarını aşağıda tut.',
      'Dirseklerini hafifçe geriye alarak kürek kemiklerini yaklaştır; sonra bırak.',
    ],
    'Belini çukurlaştırma; küçük bir hareket yeterli.',
  ),
  make('fingers', 'Ellerini aç ve kapat', 'El ve bilek', [
    'Parmaklarını rahatça aç ve birbirinden ayır.',
    'Elini sıkmadan gevşekçe kapat, ardından yeniden aç. İki elinle tekrarla.',
  ]),
  make(
    'sit-stand',
    'Otur ve kalk',
    'Ayakta',
    [
      'Kaymayan, tekerleksiz bir sandalyeye otur. Ayakların yerde olsun.',
      'Gerekirse destek alarak yavaşça ayağa kalk, sonra kontrollü otur.',
    ],
    'Tekerlekli sandalye kullanma. Başın dönerse otur ve hareketi bırak.',
  ),
  make(
    'chest',
    'Göğsünü rahatça aç',
    'Omuz ve sırt',
    [
      'Dirseklerin bükülü, kolların yanlarında olsun.',
      'Ön kollarını iki yana aç; omuzlarını aşağıda tut. Başlangıca dön.',
    ],
    'Kollarını zorlayarak geriye götürme.',
  ),
  make(
    'weight-shift',
    'Ağırlığını iki yana aktar',
    'Ayakta',
    [
      'Ayakların kalça genişliğinde açık olsun; gerekirse masadan destek al.',
      'Ağırlığını yavaşça bir ayağına, ardından diğerine aktar.',
    ],
    'Her iki ayağın yerde kalsın; hareket küçük ve rahat olsun.',
  ),
  make('ankle', 'Ayak bileğini hareket ettir', 'Oturarak', [
    'Oturarak bir topuğunu yere koy.',
    'Ayak ucunu yavaşça kendine çek, sonra ileri uzat. Diğer ayakla tekrarla.',
  ]),
  make(
    'cross-body',
    'Omzunu hafifçe esnet',
    'Omuz ve sırt',
    [
      'Bir kolunu göğsünün önüne getir.',
      'Diğer elinle üst koluna hafifçe destek ol. Rahatça bırakıp taraf değiştir.',
    ],
    'Dirsek eklemine bastırma; ağrılı bir germe yapma.',
  ),
  make(
    'shrug',
    'Omuzlarını kaldır ve bırak',
    'Omuz ve sırt',
    [
      'Rahatça otur veya ayakta dur; kollarını yanlarında serbest bırak.',
      'Omuzlarını hafifçe kulaklarına yaklaştır, ardından yavaşça indir.',
    ],
    'Başını sabit tut; omuzlarını zorlayarak kaldırma.',
  ),
  make(
    'reach-forward',
    'Kollarını öne uzat',
    'Omuz ve sırt',
    [
      'Rahatça otur; ellerini göğüs hizasının biraz altında öne getir.',
      'Kollarını yavaşça ileri uzat, sonra dirseklerini bükerek geri getir.',
    ],
    'Omuzlarını aşağıda tut; sırtını zorlayarak yuvarlama.',
  ),
  make(
    'elbow-bend',
    'Dirseklerini bük ve aç',
    'Omuz ve sırt',
    [
      'Üst kollarını gövdenin yanında tut; ellerini gevşek bırak.',
      'Dirseklerini yavaşça bükerek ellerini yukarı getir, ardından indir.',
    ],
    'Dirseklerini kilitlemeden, rahat hareket aralığında kal.',
  ),
  make(
    'palm-turn',
    'Avuçlarını çevir',
    'El ve bilek',
    [
      'Dirseklerini bük; ön kollarını masa üzerinde destekle ve ellerini kenardan uzat.',
      'Bileklerini düz tutarak avuçlarını yavaşça yukarı, sonra aşağı çevir.',
    ],
    'Ön kolundan döndür; hareketin sonuna ulaşmak için zorlama.',
  ),
  make(
    'thumb-touch',
    'Parmak uçlarına dokun',
    'El ve bilek',
    [
      'Elini rahatça aç; parmaklarını gevşek tut.',
      'Başparmağını sırayla diğer parmaklarının uçlarına hafifçe dokundur. Diğer elinle tekrarla.',
    ],
    'Parmak uçlarını birbirine bastırma.',
  ),
  make(
    'wrist-side',
    'Bileğini iki yana hareket ettir',
    'El ve bilek',
    [
      'Ön kolunu masaya koy; avucun aşağı baksın ve elin masa kenarında serbest olsun.',
      'Elini düz tutarak bileğinden yavaşça sağa ve sola hareket ettir. Taraf değiştir.',
    ],
    'Ön kolunu sabit tut; küçük bir hareket yeterli.',
  ),
  make(
    'knee-extend',
    'Oturarak dizini uzat',
    'Oturarak',
    [
      'Kaymayan, tekerleksiz bir sandalyeye otur; ayaklarını yere koy.',
      'Bir ayağını öne doğru kaldırarak dizini yavaşça uzat, sonra indir. Bacak değiştir.',
    ],
    'Dizini kilitleme; rahatça uzatabildiğin kadar hareket et.',
  ),
  make(
    'seated-march',
    'Oturarak dizlerini kaldır',
    'Oturarak',
    [
      'Kaymayan, tekerleksiz bir sandalyede dik ve rahat otur.',
      'Bir dizini hafifçe kaldırıp ayağını yere koy. Ardından diğer dizinle tekrarla.',
    ],
    'Gövdeni geriye yatırma; gerekirse sandalyenin yanlarından destek al.',
  ),
  make(
    'seated-heel',
    'Oturarak topuklarını kaldır',
    'Oturarak',
    [
      'Sabit bir sandalyede otur; ayakların kalça genişliğinde yerde olsun.',
      'Ayak uçların yerde kalırken topuklarını yavaşça kaldır, sonra indir.',
    ],
    'Ayaklarına elinle bastırma; rahat bir tempoda tekrarla.',
  ),
  make(
    'side-step',
    'Yana adım at',
    'Ayakta',
    [
      'Yanında boş alan bırak; gerekirse sabit bir tezgâhtan destek al.',
      'Bir ayağınla yana küçük bir adım at, diğerini yanına getir. Sonra ters yöne dön.',
    ],
    'Ayaklarını çaprazlama; yavaş hareket et ve dengeni koru.',
  ),
  make(
    'leg-curl',
    'Topuğunu geriye kaldır',
    'Ayakta',
    [
      'Sabit bir masa veya tezgâhtan destek alarak ayakta dur.',
      'Bir dizini büküp topuğunu hafifçe geriye kaldır, sonra indir. Diğer bacağınla tekrarla.',
    ],
    'Dizlerini yan yana tut; belini çukurlaştırma ve topuğunu zorlayarak çekme.',
  ),
  make(
    'blink',
    'Gözlerini yumuşakça kırp',
    'Göz molası',
    [
      'Ekrandan bakışını ayır; yüzünü ve göz çevreni rahat bırak.',
      'Gözlerini sıkmadan yavaşça kapatıp aç. Aralarda doğal biçimde göz kırp.',
    ],
    'Gözlerine bastırma veya gözlerini ovuşturma.',
  ),
]

for (const exercise of exercises) {
  if (exercise.id === 'fingers' || exercise.id === 'gaze') {
    exercise.media = {
      type: 'frames',
      src:
        exercise.id === 'fingers'
          ? '/exercises/workrave/finger-stretch-1.png'
          : '/exercises/workrave/depth-focus-1.png',
      attribution: 'Workrave katkıcıları',
      license: 'GPL-3.0',
    }
  }
}
export const exerciseById = (id: string | undefined) =>
  exercises.find((e) => e.id === id) ?? exercises[0]
export const categories: Category[] = [
  'Ayakta',
  'Oturarak',
  'Omuz ve sırt',
  'El ve bilek',
  'Göz molası',
]
