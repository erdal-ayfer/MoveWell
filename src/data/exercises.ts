export type Category = 'Ayakta' | 'Omuz ve sırt' | 'El ve bilek' | 'Göz molası'
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
  make('ankle', 'Ayak bileğini hareket ettir', 'Ayakta', [
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
export const categories: Category[] = ['Ayakta', 'Omuz ve sırt', 'El ve bilek', 'Göz molası']
