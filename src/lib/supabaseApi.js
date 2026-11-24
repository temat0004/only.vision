// Реальная база: Supabase (Postgres). Включается, когда заданы VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.
import { createClient } from '@supabase/supabase-js'
import { normalizePhone } from './config'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@only.vision'

export const hasSupabase = Boolean(url && key)
const sb = hasSupabase ? createClient(url, key) : null

const PRODUCT_FIELDS = ['name', 'category', 'price', 'description', 'details', 'art', 'color', 'bg', 'image_url', 'is_new', 'active']

function check({ data, error }) {
  if (error) throw new Error(error.message)
  return data
}

export const supabaseApi = {
  mode: 'supabase',

  async listProducts({ includeInactive = false } = {}) {
    let q = sb.from('products').select('*, variants:product_variants(id, size, stock)').order('created_at', { ascending: false })
    if (!includeInactive) q = q.eq('active', true)
    return check(await q)
  },

  async getProduct(id) {
    const { data, error } = await sb
      .from('products').select('*, variants:product_variants(id, size, stock)')
      .eq('id', id).eq('active', true).maybeSingle()
    if (error) return null // например, невалидный uuid в адресе
    return data
  },

  // Вся проверка остатков — на сервере в одной транзакции (см. supabase/schema.sql → place_order)
  async placeOrder({ name, phone, address, comment, items }) {
    const normPhone = normalizePhone(phone)
    if (!normPhone) return { ok: false, error: 'BAD_PHONE' }
    return check(await sb.rpc('place_order', {
      p_name: name.trim(),
      p_phone: normPhone,
      p_address: address.trim(),
      p_comment: (comment || '').trim(),
      p_items: items.map((i) => ({ variant_id: i.variant_id, qty: Number(i.qty) })),
    }))
  },

  async trackOrder(number, phone) {
    const p = normalizePhone(phone)
    if (!p || !Number(number)) return null
    return check(await sb.rpc('track_order', { p_number: Number(number), p_phone: p }))
  },

  async addWaitlist({ product_id, variant_id, size, name, phone }) {
    const p = normalizePhone(phone)
    if (!p) throw new Error('Проверьте номер телефона')
    check(await sb.from('waitlist').insert({ product_id, variant_id, size, name: (name || '').trim(), phone: p }))
  },

  // ---------- админка ----------
  adminNeedsEmail: false,
  async login(password) {
    const { error } = await sb.auth.signInWithPassword({ email: ADMIN_EMAIL, password })
    if (error) throw new Error('Неверный пароль')
  },
  async logout() { await sb.auth.signOut() },
  async isAdmin() {
    const { data } = await sb.auth.getSession()
    return Boolean(data.session)
  },

  async listOrders() {
    return check(await sb.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false }))
  },

  async setOrderStatus(id, status) {
    check(await sb.from('orders').update({ status }).eq('id', id))
  },

  async saveProduct(product) {
    const row = Object.fromEntries(PRODUCT_FIELDS.map((f) => [f, product[f] ?? null]))
    row.price = Number(row.price)
    let id = product.id
    if (id) {
      check(await sb.from('products').update(row).eq('id', id))
    } else {
      id = check(await sb.from('products').insert(row).select('id').single()).id
    }

    const keep = product.variants.filter((v) => v.id).map((v) => v.id)
    // удаляем размеры, которые убрали в форме
    let del = sb.from('product_variants').delete().eq('product_id', id)
    if (keep.length) del = del.not('id', 'in', `(${keep.join(',')})`)
    check(await del)

    for (const v of product.variants) {
      const r = { product_id: id, size: v.size, stock: Math.max(0, Number(v.stock) || 0) }
      if (v.id) check(await sb.from('product_variants').update(r).eq('id', v.id))
      else check(await sb.from('product_variants').insert(r))
    }
    return { ...product, id }
  },

  async listWaitlist() {
    const rows = check(await sb
      .from('waitlist')
      .select('*, product:products(name), variant:product_variants(stock)')
      .order('created_at', { ascending: false }))
    return rows.map((w) => ({ ...w, product_name: w.product?.name ?? 'Товар удалён', stock: w.variant?.stock ?? 0 }))
  },

  async setWaitlistNotified(id, notified) {
    check(await sb.from('waitlist').update({ notified }).eq('id', id))
  },
}
