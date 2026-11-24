import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { api } from '../lib/api'
import { STATUSES, formatDate, formatPrice } from '../lib/config'
import { Page, Spinner, ease } from '../components/ui'

export function StatusTimeline({ status }) {
  const idx = STATUSES.findIndex((s) => s.key === status)
  return (
    <div className="timeline">
      <div className="timeline-track">
        <motion.div className="timeline-fill" initial={{ width: 0 }} animate={{ width: `${(idx / (STATUSES.length - 1)) * 100}%` }} transition={{ duration: 1, ease, delay: 0.2 }} />
      </div>
      <div className="timeline-steps">
        {STATUSES.map((s, i) => (
          <motion.div key={s.key} className={`step ${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }}>
            <i />
            <b>{s.label}</b>
            <span>{s.hint}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Страница «Спасибо за заказ»
export function OrderDone() {
  const { number } = useParams()
  let last = null
  try { last = JSON.parse(sessionStorage.getItem('ov_last_order')) } catch { /* ignore */ }
  const phone = last && String(last.number) === number ? last.phone : ''
  return (
    <Page className="done">
      <div className="center">
        <motion.svg viewBox="0 0 100 100" width="120" height="120" initial="h" animate="v">
          <motion.circle cx="50" cy="50" r="44" fill="none" stroke="#ececec" strokeWidth="6"
            variants={{ h: { pathLength: 0 }, v: { pathLength: 1, transition: { duration: 0.8, ease } } }} />
          <motion.path d="M30 52 L45 66 L72 36" fill="none" stroke="#ececec" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
            variants={{ h: { pathLength: 0 }, v: { pathLength: 1, transition: { duration: 0.5, delay: 0.7, ease } } }} />
        </motion.svg>
        <h1 className="h1">Заказ №{number} принят</h1>
        <p className="lead">Менеджер проверит заказ и напишет в WhatsApp. Сохраните номер: по нему и телефону видно статус заказа.</p>
        {last?.total ? <p className="muted">Сумма к оплате при получении: <b>{formatPrice(last.total)}</b></p> : null}
        <div className="row-gap">
          <Link className="btn btn-acid" to={`/track?n=${number}${phone ? `&p=${encodeURIComponent(phone)}` : ''}`}>Отследить заказ</Link>
          <Link className="btn btn-ghost" to="/catalog">Продолжить покупки</Link>
        </div>
      </div>
    </Page>
  )
}

export default function Track() {
  const [params] = useSearchParams()
  const [number, setNumber] = useState(params.get('n') || '')
  const [phone, setPhone] = useState(params.get('p') || '')
  const [order, setOrder] = useState(undefined)
  const [loading, setLoading] = useState(false)

  const find = async (e) => {
    e?.preventDefault()
    setLoading(true)
    try { setOrder(await api.trackOrder(number.replace(/\D/g, ''), phone)) } catch { setOrder(null) }
    setLoading(false)
  }

  useEffect(() => { if (params.get('n') && params.get('p')) find() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [])

  return (
    <Page className="track">
      <h1 className="h1">Где мой заказ?</h1>
      <p className="lead">Введите номер заказа и телефон, который указывали при оформлении.</p>
      <form className="track-form" onSubmit={find}>
        <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Номер, например 1001" inputMode="numeric" aria-label="Номер заказа" required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+996 555 123 456" inputMode="tel" aria-label="Телефон" required />
        <button className="btn btn-acid" disabled={loading}>{loading ? <Spinner /> : 'Найти'}</button>
      </form>

      {order === null && <div className="alert">Заказ не найден. Проверьте номер и телефон.</div>}
      {order && (
        <motion.div className="track-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
          <div className="track-head">
            <b>Заказ №{order.number}</b>
            <span className="muted">от {formatDate(order.created_at)}</span>
          </div>
          <StatusTimeline status={order.status} />
          <ul className="track-items">
            {order.items.map((i) => (
              <li key={i.variant_id + i.size}><span>{i.name} · {i.size} × {i.qty}</span><span>{formatPrice(i.price * i.qty)}</span></li>
            ))}
            <li className="big"><span>Итого{order.delivery ? ' с доставкой' : ''}</span><b>{formatPrice(order.total)}</b></li>
          </ul>
        </motion.div>
      )}
    </Page>
  )
}
