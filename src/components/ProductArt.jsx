// Графическая «фотография» товара: силуэт вещи на цветном фоне.
// Если у товара есть image_url (загрузили фото в админке), показываем фото.

export function isLight(hex = '#000') {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}

// Небольшая нашивка/лейбл без чужих логотипов
const Patch = ({ x, y, w = 14, h = 8, ink, r = 1.5 }) => <rect x={x} y={y} width={w} height={h} rx={r} fill={ink} opacity=".85" />

const SHAPES = {
  hoodie: (c, ink, sh) => (
    <>
      <path d="M56 46 L80 32 L120 32 L144 46 L166 66 L184 160 L164 165 L148 96 L148 184 L52 184 L52 96 L36 165 L16 160 L34 66 Z" fill={c} stroke={sh} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M78 34 Q76 8 100 6 Q124 8 122 34 Q112 48 100 48 Q88 48 78 34 Z" fill={c} stroke={sh} strokeWidth="1.5" />
      <path d="M86 34 Q88 18 100 17 Q112 18 114 34 Q106 42 100 42 Q94 42 86 34 Z" fill="rgba(0,0,0,.35)" />
      <path d="M100 46 L100 184" stroke={ink} strokeWidth="1.6" />
      <path d="M118 60 L136 112 M82 60 L64 112" stroke={sh} strokeWidth="1.5" />
      <path d="M52 176 L148 176 M164 156 L183 152 M36 156 L17 152" stroke={sh} strokeWidth="1.5" />
      <Patch x={66} y={70} w={10} h={6} ink={ink} />
    </>
  ),
  crewneck: (c, ink, sh) => (
    <>
      <path d="M62 36 L86 26 Q100 38 114 26 L138 36 L160 56 L182 166 L162 170 L142 84 L142 184 L58 184 L58 84 L38 170 L18 166 L40 56 Z" fill={c} stroke={sh} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M86 26 Q100 42 114 26" fill="none" stroke={sh} strokeWidth="5" />
      <path d="M58 174 L142 174 M162 160 L181 156 M38 160 L19 156" stroke={sh} strokeWidth="3" />
      <circle cx="168" cy="92" r="7" fill="#e8c547" stroke={sh} />
      <path d="M163 92 L173 92" stroke="#1f2a40" strokeWidth="1.5" />
    </>
  ),
  polo: (c, ink, sh) => (
    <>
      <path d="M62 36 L86 26 L114 26 L138 36 L176 66 L156 92 L140 80 L140 182 L60 182 L60 80 L44 92 L24 66 Z" fill={c} stroke={sh} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M86 26 L100 46 L114 26 L120 40 L100 52 L80 40 Z" fill={c} stroke={sh} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M100 46 L100 78" stroke={sh} strokeWidth="1.5" />
      <circle cx="100" cy="58" r="1.8" fill={sh} /><circle cx="100" cy="70" r="1.8" fill={sh} />
      <circle cx="122" cy="70" r="4" fill={ink} opacity=".8" />
      <path d="M140 80 L156 92 M60 80 L44 92" stroke={sh} strokeWidth="2.5" />
    </>
  ),
  tee: (c, ink, sh) => (
    <>
      <path d="M62 36 L86 26 Q100 40 114 26 L138 36 L176 66 L156 92 L140 80 L140 182 L60 182 L60 80 L44 92 L24 66 Z" fill={c} stroke={sh} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M86 26 Q100 42 114 26" fill="none" stroke={sh} strokeWidth="3" />
      <path d="M140 80 L156 92 M60 80 L44 92" stroke={sh} strokeWidth="1.2" />
    </>
  ),
  joggers: (c, ink, sh) => (
    <>
      <path d="M62 14 L138 14 L142 60 L136 176 L140 190 L110 190 L112 176 L100 80 L88 176 L90 190 L60 190 L64 176 L58 60 Z" fill={c} stroke={sh} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M62 28 L138 28" stroke={sh} strokeWidth="5" />
      <path d="M96 30 L94 46 M104 30 L106 46" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M128 70 L131 104" stroke={ink} strokeWidth="1.5" />
      <path d="M64 176 L88 176 M112 176 L136 176" stroke={sh} strokeWidth="3" />
    </>
  ),
  jeans: (c, ink, sh) => (
    <>
      <path d="M60 14 L140 14 L160 188 L112 188 L100 80 L88 188 L40 188 Z" fill={c} stroke={sh} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M60 26 L140 26 M100 26 L100 70" stroke={sh} strokeWidth="2" />
      <path d="M64 30 Q76 52 90 32 M136 30 Q124 52 110 32" fill="none" stroke="#e7b04a" strokeWidth="1.3" />
      <path d="M70 90 Q66 130 62 170 M130 90 Q134 130 138 170" stroke="rgba(255,255,255,.16)" strokeWidth="8" strokeLinecap="round" />
    </>
  ),
  puffer: (c, ink, sh) => (
    <>
      <path d="M58 42 L80 32 L120 32 L142 42 L166 64 L186 160 L162 168 L148 98 L150 180 L50 180 L52 98 L38 168 L14 160 L34 64 Z" fill={c} stroke={sh} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M78 34 L78 14 Q100 8 122 14 L122 34 Z" fill={c} stroke={sh} strokeWidth="1.5" />
      <path d="M54 66 L146 66 M52 92 L148 92 M51 118 L149 118 M50 144 L150 144 M40 100 L28 98 M160 100 L172 98 M44 130 L22 126 M156 130 L178 126" stroke={sh} strokeWidth="2" />
      <path d="M100 14 L100 180" stroke={ink} strokeWidth="1.5" />
      <path d="M60 50 Q100 40 140 50" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="6" strokeLinecap="round" />
      <Patch x={156} y={74} w={8} h={8} r={4} ink={ink} />
    </>
  ),
  beanie: (c, ink, sh) => (
    <>
      <path d="M54 150 Q52 56 100 52 Q148 56 146 150 Z" fill={c} stroke={sh} strokeWidth="1.5" />
      <rect x="46" y="124" width="108" height="38" rx="9" fill={c} stroke={sh} strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${56 + i * 8} 128 L${56 + i * 8} 158`} stroke={sh} strokeWidth="1.3" />
      ))}
      <rect x="88" y="132" width="24" height="16" rx="2" fill={ink} opacity=".9" />
    </>
  ),
  cap: (c, ink, sh) => (
    <>
      <path d="M46 128 Q46 62 100 60 Q154 62 154 128 Z" fill={c} stroke={sh} strokeWidth="1.5" />
      <path d="M100 60 L100 128 M74 66 Q64 94 66 128 M126 66 Q136 94 134 128" fill="none" stroke={sh} strokeWidth="1.3" />
      <circle cx="100" cy="61" r="4" fill={c} stroke={sh} />
      <path d="M40 126 Q100 114 162 126 L188 148 Q120 132 46 146 Q30 138 40 126 Z" fill={c} stroke={sh} strokeWidth="1.5" />
      <path d="M86 100 Q100 92 116 96" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  bag: (c, ink, sh) => (
    <>
      <path d="M58 96 Q58 22 100 18 Q142 22 142 96" fill="none" stroke={ink} strokeWidth="9" />
      <rect x="40" y="88" width="120" height="92" rx="16" fill={c} stroke={sh} strokeWidth="1.5" />
      <path d="M40 104 Q40 88 56 88 L144 88 Q160 88 160 104 L160 128 L40 128 Z" fill="rgba(255,255,255,.08)" stroke={sh} strokeWidth="1.5" />
      <rect x="90" y="120" width="20" height="16" rx="3" fill={ink} />
    </>
  ),
}

export const ART_TYPES = [
  ['puffer', 'Пуховик'], ['hoodie', 'Худи на молнии'], ['crewneck', 'Свитшот'], ['polo', 'Поло'], ['tee', 'Футболка'],
  ['jeans', 'Широкие джинсы'], ['joggers', 'Джоггеры'], ['beanie', 'Шапка'], ['cap', 'Кепка'], ['bag', 'Сумка'],
]

export default function ProductArt({ product, className = '' }) {
  const { art = 'tee', color = '#151515', bg = '#2a2a2a', name = '', image_url } = product
  if (image_url) {
    return (
      <div className={`art ${className}`} style={{ background: bg }}>
        <img className="art-img" src={image_url} alt={name} loading="lazy" />
      </div>
    )
  }
  const ink = isLight(color) ? '#111111' : '#f2f0eb'
  const sh = isLight(color) ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.2)'
  const word = name.split(' ')[0]
  const draw = SHAPES[art] ?? SHAPES.tee
  return (
    <div className={`art ${className}`} style={{ background: bg }} role="img" aria-label={name}>
      <span className="art-word" style={{ color: isLight(bg) ? 'rgba(0,0,0,.09)' : 'rgba(255,255,255,.07)' }}>{word}</span>
      <svg className="art-svg" viewBox="0 0 200 200" aria-hidden="true">{draw(color, ink, sh)}</svg>
    </div>
  )
}
