// Настройки магазина — ответы из брифа живут здесь.
export const SHOP = {
  name: 'only.vision',
  city: 'Бишкек',
  phone: '+996 555 312 312',
  phoneRaw: '996555312312',
  instagram: 'only.vision',
  hours: 'ежедневно 11:00–21:00',
}

// Доставка: по Бишкеку 200 сом, бесплатно от 5 000 сом. Минимальный заказ — 1 000 сом.
export const DELIVERY = {
  price: 200,
  freeFrom: 5000,
  minOrder: 1000,
  time: '1–2 дня по Бишкеку',
}

export const STATUSES = [
  { key: 'new', label: 'Новый', hint: 'Заказ принят, менеджер проверяет наличие' },
  { key: 'assembled', label: 'Собран', hint: 'Заказ упакован и передан курьеру' },
  { key: 'delivered', label: 'Доставлен', hint: 'Заказ у вас. Носите с удовольствием' },
]

export const statusLabel = (key) => STATUSES.find((s) => s.key === key)?.label ?? key

export const CATEGORIES = [
  { slug: 'outerwear', name: 'Куртки' },
  { slug: 'fleece', name: 'Tech Fleece и худи' },
  { slug: 'tops', name: 'Поло и свитшоты' },
  { slug: 'pants', name: 'Джинсы и штаны' },
  { slug: 'accessories', name: 'Шапки и аксессуары' },
]

export const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug

export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE']
export const sortVariants = (vs = []) =>
  [...vs].sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size))

export function calcTotals(subtotal) {
  const delivery = subtotal === 0 || subtotal >= DELIVERY.freeFrom ? 0 : DELIVERY.price
  return { subtotal, delivery, total: subtotal + delivery }
}

export const formatPrice = (n) => `${Number(n || 0).toLocaleString('ru-RU').replace(/,/g, ' ')} сом`

// Приводим телефон к виду +996XXXXXXXXX. Возвращает null, если номер не похож на кыргызский.
export function normalizePhone(raw = '') {
  let d = String(raw).replace(/\D/g, '')
  if (d.length === 10 && d.startsWith('0')) d = '996' + d.slice(1)
  if (d.length === 9) d = '996' + d
  if (d.length === 12 && d.startsWith('996')) return '+' + d
  return null
}

export const formatPhone = (p = '') => {
  const d = String(p).replace(/\D/g, '')
  if (d.length !== 12) return p
  return `+${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`
}

export const totalStock = (p) => (p?.variants ?? []).reduce((s, v) => s + Number(v.stock || 0), 0)

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
