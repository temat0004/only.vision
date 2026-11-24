import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useCart } from '../store/cart'
import { api } from '../lib/api'
import { DELIVERY, formatPrice } from '../lib/config'
import ProductArt from './ProductArt'
import { QtyStepper, ease } from './ui'

export function CartLines({ compact = false }) {
  const { items, setQty, remove } = useCart()
  return (
    <ul className={`cart-lines ${compact ? 'compact' : ''}`}>
      <AnimatePresence initial={false}>
        {items.map((i) => (
          <motion.li
            key={i.variantId}
            layout
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0, paddingBottom: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            <Link to={`/product/${i.productId}`} className="cart-thumb"><ProductArt product={i} /></Link>
            <div className="cart-info">
              <b>{i.name}</b>
              <span className="muted">Размер {i.size} · {formatPrice(i.price)}</span>
              <div className="cart-ctrl">
                <QtyStepper small value={i.qty} max={i.stock} onChange={(q) => setQty(i.variantId, q)} />
                <button className="link-btn" onClick={() => remove(i.variantId)}>Удалить</button>
              </div>
              {i.qty >= i.stock && <span className="stock-note">На складе всего {i.stock} шт.</span>}
            </div>
            <b className="cart-sum">{formatPrice(i.qty * i.price)}</b>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

export function FreeDeliveryBar({ subtotal }) {
  const left = DELIVERY.freeFrom - subtotal
  const pct = Math.min(100, (subtotal / DELIVERY.freeFrom) * 100)
  return (
    <div className="free-bar">
      <p>{left > 0 ? <>До бесплатной доставки — <b>{formatPrice(left)}</b></> : <b>Доставка бесплатная 🔥</b>}</p>
      <div className="free-track"><motion.div className="free-fill" animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease }} /></div>
    </div>
  )
}

export default function CartDrawer() {
  const { open, setOpen, items, subtotal, syncStock } = useCart()
  const [notice, setNotice] = useState([])
  const nav = useNavigate()

  // При открытии корзины сверяем остатки с базой
  useEffect(() => {
    if (!open) return
    let alive = true
    api.listProducts().then((ps) => { if (alive) setNotice(syncStock(ps)) }).catch(() => {})
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="backdrop" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="drawer"
            role="dialog"
            aria-label="Корзина"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="drawer-head">
              <h2>Корзина</h2>
              <button className="close" onClick={() => setOpen(false)} aria-label="Закрыть">✕</button>
            </div>
            {notice.length > 0 && (
              <div className="alert">
                Пока вы выбирали, часть товаров раскупили:
                {notice.map((n) => <div key={n.name + n.size}>{n.name} ({n.size}): было {n.was}, осталось {n.now}</div>)}
              </div>
            )}
            {items.length === 0 ? (
              <div className="drawer-empty">
                <p>Корзина пустая.</p>
                <button className="btn" onClick={() => { setOpen(false); nav('/catalog') }}>В каталог</button>
              </div>
            ) : (
              <>
                <div className="drawer-body" data-lenis-prevent><CartLines /></div>
                <div className="drawer-foot">
                  <FreeDeliveryBar subtotal={subtotal} />
                  <div className="total-row"><span>Сумма</span><b>{formatPrice(subtotal)}</b></div>
                  <button className="btn btn-acid btn-block" onClick={() => { setOpen(false); nav('/checkout') }}>
                    Оформить заказ →
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
