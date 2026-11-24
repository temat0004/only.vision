import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { api } from '../lib/api'
import { CATEGORIES, categoryName, totalStock } from '../lib/config'
import ProductCard from '../components/ProductCard'
import { Page } from '../components/ui'

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat') || 'all'
  const [q, setQ] = useState(params.get('q') || '')
  const [onlyStock, setOnlyStock] = useState(false)
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.listProducts().then(setProducts).catch((e) => setError(e.message))
  }, [])

  const setCat = (slug) => {
    const next = new URLSearchParams(params)
    if (slug === 'all') next.delete('cat'); else next.set('cat', slug)
    setParams(next, { replace: true })
  }

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (products ?? [])
      .filter((p) => cat === 'all' || p.category === cat)
      .filter((p) => !onlyStock || totalStock(p) > 0)
      .filter((p) => !s || `${p.name} ${p.description} ${categoryName(p.category)}`.toLowerCase().includes(s))
  }, [products, cat, q, onlyStock])

  return (
    <Page className="catalog">
      <div className="page-head">
        <h1 className="h1">{cat === 'all' ? 'Каталог' : categoryName(cat)}</h1>
        <span className="count">{products ? `${list.length} шт.` : '…'}</span>
      </div>

      <div className="filters">
        <label className="search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск: Moncler, Tech Fleece, поло…" aria-label="Поиск по каталогу" />
          {q && <button onClick={() => setQ('')} aria-label="Очистить">✕</button>}
        </label>
        <LayoutGroup>
          <div className="chips">
            {[{ slug: 'all', name: 'Все' }, ...CATEGORIES].map((c) => (
              <button key={c.slug} className={`chip ${cat === c.slug ? 'active' : ''}`} onClick={() => setCat(c.slug)}>
                {cat === c.slug && <motion.span layoutId="chip-bg" className="chip-bg" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span>{c.name}</span>
              </button>
            ))}
            <label className="toggle">
              <input type="checkbox" checked={onlyStock} onChange={(e) => setOnlyStock(e.target.checked)} />
              <span>Только в наличии</span>
            </label>
          </div>
        </LayoutGroup>
      </div>

      {error && <div className="alert">Не удалось загрузить каталог: {error}</div>}

      <div className="grid">
        {products === null ? (
          Array.from({ length: 8 }, (_, i) => <div key={i} className="card skeleton" />)
        ) : (
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </AnimatePresence>
        )}
      </div>
      {products && list.length === 0 && (
        <div className="empty">
          <p>Ничего не нашли по запросу «{q}».</p>
          <button className="btn" onClick={() => { setQ(''); setCat('all') }}>Сбросить фильтры</button>
        </div>
      )}
    </Page>
  )
}
