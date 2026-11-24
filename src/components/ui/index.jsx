import { useEffect, useId } from 'react'
import { motion } from 'motion/react'

export const ease = [0.22, 1, 0.36, 1]

// Обёртка страницы: плавный вход/выход при смене маршрута
export function Page({ children, className = '' }) {
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <motion.main
      className={`page ${className}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.55, ease } }}
      exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
    >
      {children}
    </motion.main>
  )
}

// Появление при прокрутке
export function Reveal({ children, delay = 0, y = 40, className = '', as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </M>
  )
}

// Бегущая строка
export function Marquee({ items, className = '', speed = 30, reverse = false }) {
  const row = [...items, ...items]
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track" style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
        {[0, 1].map((k) => (
          <div className="marquee-group" key={k} aria-hidden={k === 1}>
            {row.map((t, i) => (
              <span key={i}>{t}<i>✦</i></span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function EyeMark({ size = 28, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M6 32 Q32 8 58 32 Q32 56 6 32 Z" fill="none" stroke={color} strokeWidth="5" />
      <motion.circle
        cx="32" cy="32" r="9" fill={color}
        animate={{ cx: [32, 38, 26, 32] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  )
}

// Вращающийся круглый стикер
export function Sticker({ text = 'NEW IN • MONCLER • NIKE • BISHKEK • ', size = 130, className = '' }) {
  const id = useId().replace(/:/g, '')
  return (
    <motion.div
      className={`sticker ${className}`}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
    >
      <svg viewBox="0 0 100 100">
        <defs>
          <path id={`circ${id}`} d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        </defs>
        <circle cx="50" cy="50" r="49" fill="#ececec" />
        <text fontFamily="JetBrains Mono, monospace" fontSize="9.4" fontWeight="600" fill="#0c0c0c" letterSpacing="1">
          <textPath href={`#circ${id}`}>{text}</textPath>
        </text>
        <g transform="translate(50 50)">
          <path d="M-14 0 Q0 -11 14 0 Q0 11 -14 0 Z" fill="none" stroke="#0c0c0c" strokeWidth="3" />
          <circle r="4.5" fill="#0c0c0c" />
        </g>
      </svg>
    </motion.div>
  )
}

export function QtyStepper({ value, max, onChange, small = false }) {
  return (
    <div className={`qty ${small ? 'qty-sm' : ''}`}>
      <button type="button" aria-label="Меньше" onClick={() => onChange(value - 1)} disabled={value <= 1 && !small}>−</button>
      <motion.span key={value} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{value}</motion.span>
      <button type="button" aria-label="Больше" onClick={() => onChange(value + 1)} disabled={value >= max}>+</button>
    </div>
  )
}

export function Spinner() {
  return <span className="spinner" aria-label="Загрузка" />
}
