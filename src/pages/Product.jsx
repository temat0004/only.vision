import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { api } from '../lib/api'
import { DELIVERY, categoryName, formatPrice, sortVariants, totalStock } from '../lib/config'
import { useCart } from '../store/cart'
import ProductArt from '../components/ProductArt'
import ProductCard from '../components/ProductCard'
import { Page, QtyStepper, Spinner, ease } from '../components/ui'

// Наклон картинки за курсором
function TiltArt({ product }) {
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 150, damping: 15 })
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 150, damping: 15 })
  return (
    <motion.div
      className="pdp-art"
      style={{ rotateX: rx, rotateY: ry }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width)
        my.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => { mx.set(0.5); my.set(0.5) }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease }}
    >
      <ProductArt product={product} />
    </motion.div>
  )
}

// Своя функция: «Сообщить о поступлении» для раскупленных размеров
function Waitlist({ product, variant }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState('idle')
  const [err, setErr] = useState('')

  useEffect(() => { setState('idle'); setErr('') }, [variant?.id])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setState('sending')
    try {
      await api.addWaitlist({ product_id: product.id, variant_id: variant?.id ?? null, size: variant?.size ?? '', name, phone })
      setState('done')
    } catch (ex) {
      setErr(ex.message); setState('idle')
    }
  }

  return (
    <motion.div className="waitlist" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      {state === 'done' ? (
        <p className="waitlist-done">✓ Записали. Как только {variant ? `размер ${variant.size}` : 'товар'} вернётся, напишем в WhatsApp.</p>
      ) : (
        <form onSubmit={submit}>
          <b>Сообщить о поступлении{variant ? ` · ${variant.size}` : ''}</b>
          <p className="muted">Привозим новую партию в первую очередь тех размеров, которые ждут больше всего.</p>
          <div className="waitlist-row">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" aria-label="Имя" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+996 555 123 456" inputMode="tel" required aria-label="Телефон" />
          </div>
          {err && <p className="error">{err}</p>}
          <button className="btn btn-block" disabled={state === 'sending'}>{state === 'sending' ? <Spinner /> : 'Жду этот размер'}</button>
        </form>
      )}
    </motion.div>
  )
}

export default function Product() {
  const { id } = useParams()
  const { add, items, setOpen } = useCart()
  const [product, setProduct] = useState(undefined)
  const [related, setRelated] = useState([])
  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState(null)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setProduct(undefined)
    api.getProduct(id).then((p) => {
      setProduct(p)
      if (p) {
        const first = sortVariants(p.variants).find((v) => v.stock > 0) ?? sortVariants(p.variants)[0]
        setSize(first?.id ?? null)
        setQty(1)
      }
    })
    api.listProducts().then((ps) => setRelated(ps))
  }, [id])

  if (product === undefined) return <Page><div className="center"><Spinner /></div></Page>
  if (product === null) return (
    <Page><div className="center"><h1 className="h2">Товар не найден</h1><Link className="btn" to="/catalog">В каталог</Link></div></Page>
  )

  const variants = sortVariants(product.variants)
  const variant = variants.find((v) => v.id === size)
  const inCart = items.find((i) => i.variantId === size)?.qty ?? 0
  const free = Math.max(0, (variant?.stock ?? 0) - inCart)
  const soldOut = totalStock(product) === 0
  const others = related.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)
  const more = others.length ? others : related.filter((p) => p.id !== product.id).slice(0, 4)

  const onAdd = () => {
    const r = add(product, variant, qty)
    setMsg(r.message)
    if (r.ok) {
      setAdded(true)
      setQty(1)
      setTimeout(() => setAdded(false), 1600)
    }
  }

  let stockText = ''
  if (variant) {
    if (variant.stock === 0) stockText = 'Этого размера нет в наличии'
    else if (variant.stock === 1) stockText = 'Осталась последняя штука'
    else if (variant.stock <= 3) stockText = `Осталось ${variant.stock} шт.`
    else stockText = `В наличии: ${variant.stock} шт.`
  }

  return (
    <Page className="pdp">
      <div className="pdp-grid">
        <div className="pdp-media">
          <TiltArt product={product} />
          {soldOut && <motion.span className="soldout-stamp" initial={{ scale: 2, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: -12 }} transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 14 }}>Нет в наличии</motion.span>}
        </div>

        <div className="pdp-info">
          <Link to={`/catalog?cat=${product.category}`} className="eyebrow">← {categoryName(product.category)}</Link>
          <h1 className="pdp-title">{product.name}</h1>
          <div className="pdp-price">{formatPrice(product.price)}</div>
          <p className="pdp-desc">{product.description}</p>

          <div className="sizes" role="radiogroup" aria-label="Размер">
            {variants.map((v) => (
              <button
                key={v.id}
                role="radio"
                aria-checked={size === v.id}
                className={`size ${size === v.id ? 'active' : ''} ${v.stock === 0 ? 'na' : ''}`}
                onClick={() => { setSize(v.id); setQty(1); setMsg(null) }}
              >
                {v.size}
              </button>
            ))}
          </div>
          <p className={`stock-line ${variant?.stock === 0 ? 'out' : variant?.stock <= 3 ? 'low' : ''}`}>{stockText}</p>

          {variant && variant.stock > 0 ? (
            <div className="buy-row">
              <QtyStepper value={Math.min(qty, Math.max(free, 1))} max={Math.max(free, 1)} onChange={(n) => setQty(Math.max(1, Math.min(n, free)))} />
              <motion.button
                className={`btn btn-acid btn-grow ${added ? 'is-added' : ''}`}
                onClick={onAdd}
                disabled={free === 0}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={added ? 'ok' : free === 0 ? 'full' : 'add'} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>
                    {added ? 'Добавлено ✓' : free === 0 ? 'Всё уже в корзине' : `В корзину · ${formatPrice(product.price * Math.min(qty, free))}`}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          ) : (
            <button className="btn btn-block btn-disabled" disabled>Нет в наличии</button>
          )}
          {inCart > 0 && (
            <p className="muted small">
              В корзине: {inCart} шт. <button className="link-btn" onClick={() => setOpen(true)}>Открыть корзину</button>
            </p>
          )}
          {msg && <p className="error">{msg}</p>}

          <AnimatePresence>{variant && variant.stock === 0 && <Waitlist key="wl" product={product} variant={variant} />}</AnimatePresence>

          <details className="acc">
            <summary>Состав и уход</summary>
            <p>{product.details || 'Информация уточняется.'}</p>
          </details>
          <details className="acc">
            <summary>Доставка и оплата</summary>
            <p>По Бишкеку — {formatPrice(DELIVERY.price)}, {DELIVERY.time}. Бесплатно от {formatPrice(DELIVERY.freeFrom)}. Оплата при получении, можно примерить при курьере.</p>
          </details>
        </div>
      </div>

      {more.length > 0 && (
        <section className="section">
          <h2 className="h2">С этим носят</h2>
          <div className="product-grid">{more.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
        </section>
      )}
    </Page>
  )
}
