import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useCart } from '../store/cart'
import { CATEGORIES, DELIVERY, SHOP, formatPrice } from '../lib/config'
import { EyeMark, ease } from './ui'

export function Header() {
  const { count, setOpen, bump } = useCart()
  const [menu, setMenu] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const { scrollY } = useScroll()
  const loc = useLocation()

  useEffect(() => setMenu(false), [loc.pathname, loc.search])

  // Шапка прячется при прокрутке вниз и возвращается при прокрутке вверх
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 160 && !menu)
    setSolid(y > 20)
  })

  return (
    <>
      <motion.header
        className={`header ${solid ? 'header-solid' : ''}`}
        animate={{ y: hidden ? '-110%' : '0%' }}
        transition={{ duration: 0.35, ease }}
      >
        <Link to="/" className="logo" aria-label="only.vision — на главную">
          <EyeMark size={26} color="#c8ff00" />
          <span>only.vision</span>
        </Link>
        <nav className="nav">
          {[['/catalog', 'Каталог'], ['/catalog?cat=outerwear', 'Куртки'], ['/catalog?cat=fleece', 'Tech Fleece'], ['/track', 'Где мой заказ?']].map(([to, label]) => (
            <Link key={to} to={to} className={loc.pathname + loc.search === to ? 'is-active' : ''}>{label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="cart-btn" onClick={() => setOpen(true)} aria-label={`Корзина, товаров: ${count}`}>
            <span>Корзина</span>
            <motion.b key={bump} initial={{ scale: 1.8, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
              {count}
            </motion.b>
          </button>
          <button className={`burger ${menu ? 'is-open' : ''}`} onClick={() => setMenu((m) => !m)} aria-label="Меню" aria-expanded={menu}>
            <i /><i />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="mobile-menu"
            data-lenis-prevent
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.5, ease }}
          >
            {[['/catalog', 'Весь каталог'], ...CATEGORIES.map((c) => [`/catalog?cat=${c.slug}`, c.name]), ['/track', 'Где мой заказ?']].map(([to, label], i) => (
              <motion.div key={to} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, ease }}>
                <Link to={to}>{label}</Link>
              </motion.div>
            ))}
            <p className="mobile-menu-foot">{SHOP.city} · {SHOP.phone}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-big">only.vision</div>
      <div className="footer-grid">
        <div>
          <h4>Магазин</h4>
          <Link to="/catalog">Каталог</Link>
          <Link to="/track">Отследить заказ</Link>
          <Link to="/admin">Вход для персонала</Link>
        </div>
        <div>
          <h4>Доставка</h4>
          <p>По Бишкеку — {formatPrice(DELIVERY.price)}, {DELIVERY.time}.</p>
          <p>Бесплатно от {formatPrice(DELIVERY.freeFrom)}.</p>
          <p>Минимальный заказ — {formatPrice(DELIVERY.minOrder)}.</p>
        </div>
        <div>
          <h4>Связь</h4>
          <a href={`tel:+${SHOP.phoneRaw}`}>{SHOP.phone}</a>
          <a href={`https://wa.me/${SHOP.phoneRaw}`} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={`https://instagram.com/${SHOP.instagram}`} target="_blank" rel="noreferrer">@{SHOP.instagram}</a>
          <p>{SHOP.hours}</p>
        </div>
      </div>
      <p className="footer-copy">© 2026 only.vision · {SHOP.city}. Привозим небольшими партиями, поэтому размеры заканчиваются быстро.</p>
    </footer>
  )
}
