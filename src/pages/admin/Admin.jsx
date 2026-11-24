import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { api } from '../../lib/api'
import { CATEGORIES, STATUSES, categoryName, formatDate, formatPhone, formatPrice, sortVariants, statusLabel, totalStock } from '../../lib/config'
import ProductArt, { ART_TYPES } from '../../components/ProductArt'
import { EyeMark, Spinner, ease } from '../../components/ui'

function Login({ onDone }) {
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    try { await api.login(password); onDone() } catch (ex) { setErr(ex.message) }
    setBusy(false)
  }
  return (
    <div className="admin-login">
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ease }}>
        <EyeMark size={44} color="#c8ff00" />
        <h1 className="h2">Админка</h1>
        <p className="muted">only.vision · вход для персонала</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" autoFocus aria-label="Пароль" />
        {err && <p className="error">{err}</p>}
        <button className="btn btn-acid btn-block" disabled={busy || !password}>{busy ? <Spinner /> : 'Войти'}</button>
        <Link to="/" className="muted small">← на сайт</Link>
      </motion.form>
    </div>
  )
}

// Ссылка в WhatsApp с готовым текстом для клиента: так клиент узнаёт, что заказ собран
function waLink(order, status) {
  const tpl = {
    new: `Здравствуйте, ${order.customer_name}! Это only.vision. Заказ №${order.number} получили, сейчас собираем.`,
    assembled: `Здравствуйте, ${order.customer_name}! Заказ №${order.number} собран и передан курьеру. Сумма к оплате: ${formatPrice(order.total)}.`,
    delivered: `${order.customer_name}, спасибо за покупку в only.vision! Будем рады отзыву 🖤`,
  }
  return `https://wa.me/${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(tpl[status] || tpl.new)}`
}

function Orders({ orders, reload }) {
  const [filter, setFilter] = useState('all')
  const [busy, setBusy] = useState(null)
  const list = orders.filter((o) => filter === 'all' || o.status === filter)

  const change = async (o, status) => {
    setBusy(o.id)
    await api.setOrderStatus(o.id, status)
    await reload()
    setBusy(null)
  }

  return (
    <>
      <div className="chips">
        {[{ key: 'all', label: 'Все' }, ...STATUSES].map((s) => (
          <button key={s.key} className={`chip ${filter === s.key ? 'active' : ''}`} onClick={() => setFilter(s.key)}>
            {filter === s.key && <motion.span layoutId="ord-chip" className="chip-bg" />}
            <span>{s.label} {s.key !== 'all' && `(${orders.filter((o) => o.status === s.key).length})`}</span>
          </button>
        ))}
      </div>
      {list.length === 0 && <p className="empty">Заказов пока нет. Оформите тестовый заказ на сайте и обновите страницу.</p>}
      <div className="orders">
        <AnimatePresence initial={false}>
          {list.map((o) => (
            <motion.article key={o.id} layout className={`order order-${o.status}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <header>
                <b>№{o.number}</b>
                <span className="muted">{formatDate(o.created_at)}</span>
                <span className={`pill pill-${o.status}`}>{statusLabel(o.status)}</span>
              </header>
              <div className="order-client">
                <div><b>{o.customer_name}</b> · <a href={`tel:${o.phone}`}>{formatPhone(o.phone)}</a></div>
                <div className="muted">{o.address}</div>
                {o.comment && <div className="muted">💬 {o.comment}</div>}
              </div>
              <ul className="order-items">
                {o.items.map((i, k) => <li key={k}><span>{i.name} · {i.size} × {i.qty}</span><span>{formatPrice(i.price * i.qty)}</span></li>)}
                <li className="muted"><span>Доставка</span><span>{o.delivery ? formatPrice(o.delivery) : 'бесплатно'}</span></li>
                <li><b>Итого</b><b>{formatPrice(o.total)}</b></li>
              </ul>
              <div className="order-actions">
                <LayoutGroup id={o.id}>
                  <div className="seg">
                    {STATUSES.map((s) => (
                      <button key={s.key} className={o.status === s.key ? 'active' : ''} disabled={busy === o.id} onClick={() => change(o, s.key)}>
                        {o.status === s.key && <motion.span layoutId={`seg-${o.id}`} className="seg-bg" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </LayoutGroup>
                <a className="btn btn-sm btn-ghost" href={waLink(o, o.status)} target="_blank" rel="noreferrer">Написать в WhatsApp</a>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

const EMPTY = {
  name: '', category: 'tops', price: '', description: '', details: '', art: 'tee', color: '#151515', bg: '#2a2a2a',
  image_url: '', is_new: true, active: true, variants: [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }],
}

function ProductForm({ initial, onClose, onSaved }) {
  const [p, setP] = useState(() => ({ ...EMPTY, ...initial, variants: sortVariants(initial?.variants ?? EMPTY.variants).map((v) => ({ ...v })) }))
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setP((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const setV = (i, k, val) => setP((x) => ({ ...x, variants: x.variants.map((v, j) => (j === i ? { ...v, [k]: val } : v)) }))

  const save = async (e) => {
    e.preventDefault()
    if (!p.name.trim()) return setErr('Укажите название')
    if (!(Number(p.price) > 0)) return setErr('Цена должна быть больше нуля')
    if (p.variants.length === 0) return setErr('Добавьте хотя бы один размер')
    if (p.variants.some((v) => !v.size.trim())) return setErr('У каждого размера должно быть название')
    const sizes = p.variants.map((v) => v.size.trim().toUpperCase())
    if (new Set(sizes).size !== sizes.length) return setErr('Размеры повторяются')
    setBusy(true); setErr('')
    try {
      await api.saveProduct({ ...p, name: p.name.trim(), variants: p.variants.map((v) => ({ ...v, size: v.size.trim().toUpperCase(), stock: Number(v.stock) || 0 })) })
      onSaved()
    } catch (ex) { setErr(ex.message) }
    setBusy(false)
  }

  return (
    <motion.div className="modal-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form className="modal" onSubmit={save} onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ ease, duration: 0.4 }}>
        <div className="modal-head">
          <h2 className="h3">{p.id ? 'Редактировать товар' : 'Новый товар'}</h2>
          <button type="button" className="close" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>
        <div className="modal-body">
          <div className="pf-preview"><ProductArt product={p} /></div>
          <div className="pf-fields">
            <label className="field"><span>Название</span><input value={p.name} onChange={set('name')} placeholder="VOID HOODIE" /></label>
            <div className="field-row">
              <label className="field"><span>Категория</span>
                <select value={p.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
              </label>
              <label className="field"><span>Цена, сом</span><input type="number" min="1" value={p.price} onChange={set('price')} inputMode="numeric" /></label>
            </div>
            <label className="field"><span>Описание</span><textarea rows={3} value={p.description} onChange={set('description')} /></label>
            <label className="field"><span>Состав и уход</span><input value={p.details || ''} onChange={set('details')} /></label>

            <div className="variants">
              <span className="field-label">Размеры и остаток на складе</span>
              {p.variants.map((v, i) => (
                <div className="variant-row" key={v.id || i}>
                  <input className="v-size" value={v.size} onChange={(e) => setV(i, 'size', e.target.value)} placeholder="M" aria-label="Размер" />
                  <div className="qty qty-sm">
                    <button type="button" onClick={() => setV(i, 'stock', Math.max(0, Number(v.stock) - 1))}>−</button>
                    <input type="number" min="0" value={v.stock} onChange={(e) => setV(i, 'stock', e.target.value)} aria-label="Остаток" />
                    <button type="button" onClick={() => setV(i, 'stock', Number(v.stock) + 1)}>+</button>
                  </div>
                  <span className={`v-state ${Number(v.stock) === 0 ? 'out' : ''}`}>{Number(v.stock) === 0 ? 'нет' : 'есть'}</span>
                  <button type="button" className="link-btn" onClick={() => setP((x) => ({ ...x, variants: x.variants.filter((_, j) => j !== i) }))}>убрать</button>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setP((x) => ({ ...x, variants: [...x.variants, { size: '', stock: 0 }] }))}>+ размер</button>
            </div>

            <div className="field-row">
              <label className="field"><span>Силуэт</span>
                <select value={p.art} onChange={set('art')}>{ART_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
              </label>
              <label className="field"><span>Цвет вещи</span><input type="color" value={p.color} onChange={set('color')} /></label>
              <label className="field"><span>Фон</span><input type="color" value={p.bg} onChange={set('bg')} /></label>
            </div>
            <label className="field"><span>Фото (ссылка, необязательно)</span><input value={p.image_url || ''} onChange={set('image_url')} placeholder="https://…" /></label>
            <div className="field-row checks">
              <label className="toggle"><input type="checkbox" checked={p.is_new} onChange={set('is_new')} /><span>Новинка</span></label>
              <label className="toggle"><input type="checkbox" checked={p.active} onChange={set('active')} /><span>Показывать на сайте</span></label>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          {err && <p className="error">{err}</p>}
          <button className="btn btn-acid" disabled={busy}>{busy ? <Spinner /> : 'Сохранить'}</button>
        </div>
      </motion.form>
    </motion.div>
  )
}

function Products({ products, reload }) {
  const [edit, setEdit] = useState(null)
  const [q, setQ] = useState('')
  const list = products.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <>
      <div className="admin-tools">
        <input className="admin-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти товар" />
        <button className="btn btn-acid btn-sm" onClick={() => setEdit({})}>+ Добавить товар</button>
      </div>
      <div className="aprods">
        {list.map((p) => {
          const total = totalStock(p)
          return (
            <motion.div layout key={p.id} className={`aprod ${!p.active ? 'inactive' : ''}`}>
              <div className="aprod-thumb"><ProductArt product={p} /></div>
              <div className="aprod-info">
                <b>{p.name}</b>
                <span className="muted small">{categoryName(p.category)} · {formatPrice(p.price)}{!p.active && ' · скрыт'}</span>
                <div className="stock-chips">
                  {sortVariants(p.variants).map((v) => (
                    <span key={v.id} className={v.stock === 0 ? 'out' : v.stock <= 2 ? 'low' : ''}>{v.size}: {v.stock}</span>
                  ))}
                </div>
              </div>
              <div className="aprod-side">
                <span className={`pill ${total === 0 ? 'pill-out' : ''}`}>{total === 0 ? 'Нет в наличии' : `${total} шт.`}</span>
                <button className="btn btn-sm btn-ghost" onClick={() => setEdit(p)}>Изменить</button>
              </div>
            </motion.div>
          )
        })}
      </div>
      <AnimatePresence>
        {edit && <ProductForm key="form" initial={edit} onClose={() => setEdit(null)} onSaved={async () => { setEdit(null); await reload() }} />}
      </AnimatePresence>
    </>
  )
}

function Waitlist({ rows, reload }) {
  const toggle = async (w) => { await api.setWaitlistNotified(w.id, !w.notified); reload() }
  if (rows.length === 0) return <p className="empty">Пока никто не ждёт. Заявки появляются, когда клиент нажимает «Сообщить о поступлении» на раскупленном размере.</p>
  return (
    <div className="waitrows">
      {rows.map((w) => {
        const msg = `Здравствуйте${w.name ? ', ' + w.name : ''}! Это only.vision. ${w.product_name} в размере ${w.size} снова в наличии. Оформить можно на сайте.`
        return (
          <motion.div layout key={w.id} className={`waitrow ${w.notified ? 'done' : ''} ${w.stock > 0 && !w.notified ? 'ready' : ''}`}>
            <div>
              <b>{w.product_name} · {w.size}</b>
              <div className="muted small">{w.name || 'Без имени'} · <a href={`tel:${w.phone}`}>{formatPhone(w.phone)}</a> · {formatDate(w.created_at)}</div>
            </div>
            <div className="waitrow-side">
              {w.stock > 0 && !w.notified && <span className="pill pill-ready">Уже в наличии ({w.stock})</span>}
              {w.stock > 0 && !w.notified && (
                <a className="btn btn-sm btn-acid" href={`https://wa.me/${w.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">Написать</a>
              )}
              <button className="btn btn-sm btn-ghost" onClick={() => toggle(w)}>{w.notified ? 'Вернуть' : 'Сообщили ✓'}</button>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(null)
  const [tab, setTab] = useState('orders')
  const [data, setData] = useState({ orders: [], products: [], waitlist: [] })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => { api.isAdmin().then(setAuthed) }, [])

  const reload = useCallback(async () => {
    setLoading(true); setErr('')
    try {
      const [orders, products, waitlist] = await Promise.all([api.listOrders(), api.listProducts({ includeInactive: true }), api.listWaitlist()])
      setData({ orders, products, waitlist })
    } catch (ex) { setErr(ex.message) }
    setLoading(false)
  }, [])

  useEffect(() => { if (authed) reload() }, [authed, reload])

  if (authed === null) return <div className="admin-login"><Spinner /></div>
  if (!authed) return <Login onDone={() => setAuthed(true)} />

  const newCount = data.orders.filter((o) => o.status === 'new').length
  const lowCount = data.products.filter((p) => p.active && p.variants.some((v) => v.stock <= 1)).length
  const waitCount = data.waitlist.filter((w) => !w.notified).length
  const revenue = data.orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0)

  const tabs = [
    ['orders', `Заказы`, newCount],
    ['products', 'Товары и склад', null],
    ['waitlist', 'Ждут поступления', waitCount],
  ]

  return (
    <div className="admin">
      <header className="admin-head">
        <Link to="/" className="logo"><EyeMark size={24} color="#c8ff00" /><span>only.vision</span><em>admin</em></Link>
        <div className="admin-head-actions">
          <span className="mode-pill" title="Источник данных">{api.mode === 'supabase' ? '● Supabase' : '○ демо-база'}</span>
          <button className="btn btn-sm btn-ghost" onClick={reload} disabled={loading}>{loading ? <Spinner /> : 'Обновить'}</button>
          <button className="btn btn-sm btn-ghost" onClick={async () => { await api.logout(); setAuthed(false) }}>Выйти</button>
        </div>
      </header>

      <div className="stats">
        {[['Новых заказов', newCount], ['Заканчиваются (≤1 шт.)', lowCount], ['Ждут поступления', waitCount], ['Выручка (доставлено)', formatPrice(revenue)]].map(([l, v], i) => (
          <motion.div key={l} className="stat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, ease }}>
            <span>{l}</span><b>{v}</b>
          </motion.div>
        ))}
      </div>

      <nav className="admin-tabs">
        {tabs.map(([k, l, n]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>
            {l}{n ? <i>{n}</i> : null}
            {tab === k && <motion.span layoutId="admin-tab" className="tab-line" />}
          </button>
        ))}
      </nav>

      {err && <div className="alert">{err}</div>}

      <AnimatePresence mode="wait">
        <motion.section key={tab} className="admin-body" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {tab === 'orders' && <Orders orders={data.orders} reload={reload} />}
          {tab === 'products' && <Products products={data.products} reload={reload} />}
          {tab === 'waitlist' && <Waitlist rows={data.waitlist} reload={reload} />}
        </motion.section>
      </AnimatePresence>
    </div>
  )
}
