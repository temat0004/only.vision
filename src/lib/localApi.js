// Демо-база в localStorage. Нужна, пока не подключён Supabase.
// Интерфейс тот же, что у supabaseApi, поэтому переключение — это только переменные окружения.
import { SEED_PRODUCTS } from '../data/seed'
import { DELIVERY, calcTotals, normalizePhone } from './config'
import { resizeImage, blobToDataUrl } from './image'

const KEY = 'ov_db_v2'
const ADMIN_KEY = 'ov_admin'
const ADMIN_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'onlyvision'

const clone = (x) => JSON.parse(JSON.stringify(x))
const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms))

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* приватный режим и т.п. */ }
  const db = { products: clone(SEED_PRODUCTS), orders: [], waitlist: [], nextOrder: 1001 }
  save(db)
  return db
}
function save(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* ignore */ }
}
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))

function requireAdmin() {
  if (sessionStorage.getItem(ADMIN_KEY) !== '1') throw new Error('Нужен вход в админку')
}

export const localApi = {
  mode: 'local',

  async listProducts({ includeInactive = false } = {}) {
    await delay()
    const db = load()
    return db.products.filter((p) => includeInactive || p.active)
  },

  async getProduct(id) {
    await delay()
    return load().products.find((p) => p.id === id && p.active) ?? null
  },

  // СЛОЖНОЕ МЕСТО. Проверка остатков и списание делаются одним шагом.
  // В Supabase то же самое делает функция place_order с блокировкой строк (FOR UPDATE).
  async placeOrder({ name, phone, address, comment, items }) {
    await delay(400)
    const db = load()
    const normPhone = normalizePhone(phone)
    if (!normPhone) return { ok: false, error: 'BAD_PHONE' }

    // Складываем количество, если один и тот же вариант пришёл дважды
    const wanted = new Map()
    for (const it of items) wanted.set(it.variant_id, (wanted.get(it.variant_id) || 0) + Number(it.qty))

    const problems = []
    const lines = []
    for (const [variantId, qty] of wanted) {
      const product = db.products.find((p) => p.variants.some((x) => x.id === variantId))
      const variant = product?.variants.find((x) => x.id === variantId)
      if (!product || !variant || !product.active) {
        problems.push({ variant_id: variantId, available: 0 })
        continue
      }
      if (qty < 1 || qty > variant.stock) problems.push({ variant_id: variantId, available: variant.stock })
      lines.push({ product, variant, qty })
    }
    if (problems.length) return { ok: false, error: 'OUT_OF_STOCK', problems }

    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0)
    if (subtotal < DELIVERY.minOrder) return { ok: false, error: 'MIN_ORDER' }

    for (const l of lines) l.variant.stock -= l.qty
    const { delivery, total } = calcTotals(subtotal)
    const order = {
      id: uid(),
      number: db.nextOrder++,
      customer_name: name.trim(),
      phone: normPhone,
      address: address.trim(),
      comment: (comment || '').trim(),
      status: 'new',
      subtotal, delivery, total,
      created_at: new Date().toISOString(),
      items: lines.map((l) => ({
        product_id: l.product.id, variant_id: l.variant.id, name: l.product.name,
        size: l.variant.size, price: l.product.price, qty: l.qty,
      })),
    }
    db.orders.unshift(order)
    save(db)
    return { ok: true, number: order.number, total }
  },

  async trackOrder(number, phone) {
    await delay()
    const p = normalizePhone(phone)
    const o = load().orders.find((x) => x.number === Number(number) && x.phone === p)
    return o ? clone(o) : null
  },

  async addWaitlist({ product_id, variant_id, size, name, phone }) {
    await delay()
    const p = normalizePhone(phone)
    if (!p) throw new Error('Проверьте номер телефона')
    const db = load()
    db.waitlist.unshift({
      id: uid(), product_id, variant_id, size, name: (name || '').trim(), phone: p,
      notified: false, created_at: new Date().toISOString(),
    })
    save(db)
  },

  // ---------- админка ----------
  adminNeedsEmail: false,
  async login(password) {
    await delay()
    if (password !== ADMIN_PASSWORD) throw new Error('Неверный пароль')
    sessionStorage.setItem(ADMIN_KEY, '1')
  },
  async logout() { sessionStorage.removeItem(ADMIN_KEY) },
  async isAdmin() { return sessionStorage.getItem(ADMIN_KEY) === '1' },

  async listOrders() {
    requireAdmin(); await delay()
    return load().orders
  },

  async setOrderStatus(id, status) {
    requireAdmin(); await delay(150)
    const db = load()
    const o = db.orders.find((x) => x.id === id)
    if (o) o.status = status
    save(db)
  },

  async saveProduct(product) {
    requireAdmin(); await delay()
    const db = load()
    const data = clone(product)
    data.price = Number(data.price)
    data.variants = data.variants.map((x) => ({ ...x, id: x.id || uid(), stock: Math.max(0, Number(x.stock) || 0) }))
    if (data.id) {
      const i = db.products.findIndex((p) => p.id === data.id)
      db.products[i] = { ...db.products[i], ...data }
    } else {
      data.id = uid()
      data.created_at = new Date().toISOString()
      db.products.unshift(data)
    }
    save(db)
    return data
  },

  // В демо-режиме фото хранится прямо в localStorage, поэтому сжимаем сильнее
  async uploadImage(file) {
    requireAdmin()
    return blobToDataUrl(await resizeImage(file, 700, 0.75))
  },

  async listWaitlist() {
    requireAdmin(); await delay()
    const db = load()
    return db.waitlist.map((w) => {
      const product = db.products.find((p) => p.id === w.product_id)
      const variant = product?.variants.find((x) => x.id === w.variant_id)
      return { ...w, product_name: product?.name ?? 'Товар удалён', stock: variant?.stock ?? 0 }
    })
  },

  async setWaitlistNotified(id, notified) {
    requireAdmin(); await delay(120)
    const db = load()
    const w = db.waitlist.find((x) => x.id === id)
    if (w) w.notified = notified
    save(db)
  },
}
