import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CartCtx = createContext(null)
const KEY = 'ov_cart_v1'

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(read)
  const [open, setOpen] = useState(false)
  const [bump, setBump] = useState(0) // для анимации значка корзины

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* ignore */ }
  }, [items])

  // Добавить в корзину. Нельзя положить больше, чем есть на складе.
  const add = useCallback((product, variant, qty = 1) => {
    const inCart = items.find((i) => i.variantId === variant.id)?.qty ?? 0
    const free = variant.stock - inCart
    if (variant.stock <= 0) return { ok: false, message: 'Нет в наличии' }
    if (free <= 0) return { ok: false, message: `В корзине уже всё, что есть: ${variant.stock} шт.` }
    const n = Math.min(qty, free)
    setItems((prev) => {
      const ex = prev.find((i) => i.variantId === variant.id)
      if (ex) return prev.map((i) => (i.variantId === variant.id ? { ...i, qty: i.qty + n, stock: variant.stock } : i))
      return [...prev, {
        variantId: variant.id, productId: product.id, name: product.name, size: variant.size,
        price: product.price, qty: n, stock: variant.stock,
        art: product.art, color: product.color, bg: product.bg, image_url: product.image_url,
      }]
    })
    setBump((b) => b + 1)
    return { ok: true, added: n, message: n < qty ? `Добавили только ${n} шт., больше нет на складе` : null }
  }, [items])

  const setQty = useCallback((variantId, qty) => {
    setItems((prev) => prev
      .map((i) => (i.variantId === variantId ? { ...i, qty: Math.max(0, Math.min(qty, i.stock)) } : i))
      .filter((i) => i.qty > 0))
  }, [])

  const remove = useCallback((variantId) => setItems((prev) => prev.filter((i) => i.variantId !== variantId)), [])
  const clear = useCallback(() => setItems([]), [])

  // Сверяем корзину со свежими остатками: уменьшаем количество, если товар успели раскупить.
  const syncStock = useCallback((products) => {
    const stockOf = new Map()
    const priceOf = new Map()
    for (const p of products) for (const v of p.variants) { stockOf.set(v.id, v.stock); priceOf.set(v.id, p.price) }
    const changes = []
    const next = items.map((i) => {
      const stock = stockOf.has(i.variantId) ? stockOf.get(i.variantId) : 0
      const price = priceOf.get(i.variantId) ?? i.price
      const qty = Math.min(i.qty, stock)
      if (qty !== i.qty) changes.push({ name: i.name, size: i.size, was: i.qty, now: qty })
      return { ...i, stock, price, qty }
    }).filter((i) => i.qty > 0)
    setItems(next)
    return changes
  }, [items])

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0)
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
    return { items, count, subtotal, add, setQty, remove, clear, syncStock, open, setOpen, bump }
  }, [items, add, setQty, remove, clear, syncStock, open, bump])

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export const useCart = () => useContext(CartCtx)
