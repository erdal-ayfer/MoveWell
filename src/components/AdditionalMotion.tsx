export const additionalMotionIds = [
  'shrug',
  'reach-forward',
  'elbow-bend',
  'palm-turn',
  'thumb-touch',
  'wrist-side',
  'knee-extend',
  'seated-march',
  'seated-heel',
  'side-step',
  'leg-curl',
  'blink',
]

// Each drawing moves the joint described by its instructions. Coordinates share
// ExerciseDemo's 400 × 320 viewBox; compact and reduced-motion states pause CSS.
export function AdditionalMotion({ id }: { id: string }) {
  if (id === 'blink')
    return (
      <>
        <path d="M90 117Q130 100 170 117M230 117Q270 100 310 117" className="support-stroke" />
        {[130, 270].map((x) => (
          <g key={x} transform={`translate(${x} 158)`}>
            <path d="M-43 0H43" className="eye-outline" />
            <g className="eyelid">
              <path d="M-43 0Q0-39 43 0Q0 39-43 0Z" className="eye-outline eye-fill" />
              <circle r="13" className="head" />
            </g>
          </g>
        ))}
        <text x="200" y="246" textAnchor="middle">
          Sıkmadan kapat, rahatça aç
        </text>
      </>
    )
  if (id === 'palm-turn' || id === 'wrist-side')
    return (
      <>
        <path d="M184 265V211M216 265V211" className="limb-stroke" />
        <path d="M112 223H288" className="support-stroke" />
        <g className={id === 'palm-turn' ? 'turning-palm' : 'sideways-hand'}>
          <path
            d="M183 212L161 164Q151 149 160 145Q168 141 182 158V105Q182 93 191 98V82Q196 72 203 82V94Q212 82 218 94V109Q231 101 233 115L234 168Q234 192 216 212"
            className="hand-outline"
          />
          <path
            d="M190 134V161M204 125V160M218 132V164M187 181Q204 170 219 181"
            className="palm-lines"
          />
        </g>
      </>
    )
  if (id === 'thumb-touch')
    return (
      <>
        <path
          d="M158 265V207Q142 184 151 159L151 103Q151 91 160 103V161M179 154V81Q179 69 188 81V153M208 156V90Q208 78 217 90V161M235 165V115Q235 103 244 115V188Q244 211 221 222V265"
          className="hand-outline"
        />
        <path d="M158 207Q116 177 131 147" className="touching-thumb limb-stroke" />
      </>
    )
  if (id === 'seated-march')
    return (
      <>
        <path d="M144 100V211H257V100M151 211V278M250 211V278" className="support-stroke" />
        <circle cx="200" cy="64" r="22" className="head" />
        <path d="M200 99V182M194 182H206" className="body-stroke" />
        <path d="M190 109L162 153L151 194M210 109L239 153L250 194" className="limb-stroke" />
        <path d="M195 184L175 210L175 273L155 273" className="march-left limb-stroke" />
        <path d="M205 184L225 210L225 273L245 273" className="march-right limb-stroke" />
      </>
    )
  if (id === 'knee-extend' || id === 'seated-heel' || id === 'reach-forward')
    return (
      <>
        <path d="M118 125V203H205M126 203V280M196 203V280" className="support-stroke" />
        <circle cx="155" cy="62" r="22" className="head" />
        <path d="M155 98V185" className="body-stroke" />
        {id === 'reach-forward' ? (
          <path d="M156 109L186 150L227 140" className="reaching-arm limb-stroke" />
        ) : (
          <path d="M156 112L172 155L210 180" className="limb-stroke" />
        )}
        <path d="M155 185H222V272L252 272" className="support-stroke" />
        {id === 'seated-heel' ? (
          <path d="M155 185H230V274L266 274" className="seated-calf limb-stroke" />
        ) : (
          <>
            <path d="M155 185H230" className="limb-stroke" />
            <g className={id === 'knee-extend' ? 'extending-knee' : ''}>
              <path d="M230 185V274L259 274" className="limb-stroke" />
            </g>
          </>
        )}
      </>
    )
  if (id === 'leg-curl')
    return (
      <>
        <path d="M267 151H331M309 151V280" className="support-stroke" />
        <circle cx="201" cy="60" r="22" className="head" />
        <path d="M201 95V187" className="body-stroke" />
        <path d="M202 111L240 145H283M201 188L205 232L205 277H230" className="limb-stroke" />
        <path d="M197 188L189 229" className="limb-stroke" />
        <g className="curling-calf">
          <path d="M189 229V277H213" className="limb-stroke" />
        </g>
      </>
    )
  return (
    <g className={id === 'side-step' ? 'stepping-person' : ''}>
      <circle cx="200" cy="62" r="22" className="head" />
      <path d="M200 97V186" className="body-stroke" />
      {id === 'shrug' ? (
        <g className="shrugging-arms">
          <path d="M174 111H226M174 111L157 157V199M226 111L243 157V199" className="limb-stroke" />
        </g>
      ) : id === 'elbow-bend' ? (
        <>
          <path d="M190 110L159 157M210 110L241 157" className="limb-stroke" />
          <g className="bending-left">
            <path d="M159 157V209" className="limb-stroke" />
          </g>
          <g className="bending-right">
            <path d="M241 157V209" className="limb-stroke" />
          </g>
        </>
      ) : (
        <path d="M191 110L165 153L149 184M209 110L235 153L251 184" className="limb-stroke" />
      )}
      <path d="M195 187L180 231L176 277H159" className="stepping-left limb-stroke" />
      <path d="M205 187L220 231L224 277H241" className="stepping-right limb-stroke" />
    </g>
  )
}
