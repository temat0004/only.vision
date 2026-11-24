import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { api } from '../lib/api'
import { DELIVERY, calcTotals, formatPrice, normalizePhone } from '../lib/config'
import { useCart } from '../store/cart'
import { CartLines, FreeDeliveryBar } from '../components/CartDrawer'
import { Page, Spinner } from '../components/ui'

export default function Checkout() {
  const { items, subtotal, syncStock, clear } = useCart()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', address: '', comment: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [alert, setAlert] = useState(null)

  // Перед оформлением подтягиваем свежие остатки
  useEffect(() => {
    api.listProducts().then((ps) => {
      const ch = syncStock(ps)
      if (ch.length) setAlert({ title: 'Пока вы выбирали, часть товаров раскупили. Мы обновили корзину:', lines: ch })
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { delivery, total } = calcTotals(subtotal)
  const belowMin = subtotal < DELIVERY.minOrder
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Как к вам обращаться?'
    if (!normalizePhone(form.phone)) e.phone = 'Номер в формате +996 XXX XXX XXX'
    if (form.address.trim().length < 6) e.address = 'Улица, дом, квартира — чтобы курьер нашёл'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    setAlert(null)
    if (!validate() || belowMin) return
    setSending(true)
    try {
      const res = await api.placeOrder({
        ...form,
        items: items.map((i) => ({ variant_id: i.variantId, qty: i.qty })),
      })
      if (res.ok) {
        sessionStorage.setItem('ov_last_order', JSON.stringify({ number: res.number, phone: normalizePhone(form.phone), total: res.total }))
        clear()
        nav(`/order/${res.number}`)
        return
      }
      if (res.error === 'OUT_OF_STOCK') {
        // Кто-то успел купить раньше. Обновляем корзину по реальным остаткам.
        const ps = await api.listProducts()
        const ch = syncStock(ps)
        setAlert({
          title: 'Не успели: часть товаров только что раскупили. Корзину обновили, проверьте и оформите ещё раз.',
          lines: ch,
        })
      } else if (res.error === 'MIN_ORDER') {
        setAlert({ title: `Минимальная сумма заказа — ${formatPrice(DELIVERY.minOrder)}.` })
      } else if (res.error === 'BAD_PHONE') {
        setErrors((x) => ({ ...x, phone: 'Проверьте номер телефона' }))
      } else {
        setAlert({ title: 'Не получилось оформить заказ. Попробуйте ещё раз.' })
      }
    } catch (ex) {
      setAlert({ title: `Ошибка соединения: ${ex.message}` })
    } finally {
      setSending(false)
    }
  }

  if (items.length === 0 && !alert) {
    return (
      <Page><div className="center">
        <h1 className="h2">Корзина пустая</h1>
        <Link to="/catalog" className="btn btn-acid">В каталог →</Link>
      </div></Page>
    )
  }

  return (
    <Page className="checkout">
      <h1 className="h1">Оформление</h1>
      {alert && (
        <motion.div className="alert" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <b>{alert.title}</b>
          {alert.lines?.map((l) => (
            <div key={l.name + l.size}>{l.name} ({l.size}): {l.now === 0 ? 'закончился, убрали из корзины' : `осталось ${l.now} шт.`}</div>
          ))}
        </motion.div>
      )}
      <div className="checkout-grid">
        <form className="form" onSubmit={submit} noValidate>
          <h2 className="h3">Куда везти</h2>
          <Field label="Имя" error={errors.name}>
            <input value={form.name} onChange={set('name')} autoComplete="name" placeholder="Айбек" />
          </Field>
          <Field label="Телефон" error={errors.phone}>
            <input value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="+996 555 123 456" />
          </Field>
          <Field label="Адрес доставки (Бишкек)" error={errors.address}>
            <input value={form.address} onChange={set('address')} autoComplete="street-address" placeholder="ул. Токтогула 125, кв. 14" />
          </Field>
          <Field label="Комментарий курьеру (необязательно)">
            <textarea value={form.comment} onChange={set('comment')} rows={2} placeholder="Домофон не работает, позвоните" />
          </Field>
          <p className="muted small">Оплата при получении: наличными или переводом. Номер заказа покажем сразу после оформления. По нему можно следить за статусом.</p>
          <button className="btn btn-acid btn-block btn-lg" disabled={sending || items.length === 0 || belowMin}>
            {sending ? <Spinner /> : `Подтвердить заказ · ${formatPrice(total)}`}
          </button>
          {belowMin && items.length > 0 && <p className="error">Минимальный заказ — {formatPrice(DELIVERY.minOrder)}. Добавьте ещё {formatPrice(DELIVERY.minOrder - subtotal)}.</p>}
        </form>

        <aside className="summary">
          <h2 className="h3">Ваш заказ</h2>
          <CartLines compact />
          <FreeDeliveryBar subtotal={subtotal} />
          <div className="total-row"><span>Товары</span><span>{formatPrice(subtotal)}</span></div>
          <div className="total-row"><span>Доставка</span><span>{delivery === 0 ? 'бесплатно' : formatPrice(delivery)}</span></div>
          <div className="total-row big"><span>Итого</span><b>{formatPrice(total)}</b></div>
        </aside>
      </div>
    </Page>
  )
}

function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <motion.em initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>{error}</motion.em>}
    </label>
  )
}
