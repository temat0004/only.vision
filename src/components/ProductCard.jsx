import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import ProductArt from './ProductArt'
import { formatPrice, sortVariants, totalStock } from '../lib/config'
import { ease } from './ui'

export function stockBadge(p) {
  const total = totalStock(p)
  if (total === 0) return { text: 'Нет в наличии', cls: 'badge-out' }
  if (total === 1) return { text: 'Последний', cls: 'badge-hot' }
  if (p.is_new) return { text: 'New', cls: 'badge-new' }
  return null
}

export default function ProductCard({ product, index = 0 }) {
  const badge = stockBadge(product)
  const sizes = sortVariants(product.variants)
  const out = totalStock(product) === 0
  return (
    <motion.article
      layout
      className={`card ${out ? 'card-out' : ''}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ duration: 0.55, delay: Math.min(index, 8) * 0.06, ease }}
    >
      <Link to={`/product/${product.id}`} className="card-link">
        <div className="card-media">
          <motion.div className="card-art" whileHover={{ scale: 1.06, rotate: -1.5 }} transition={{ duration: 0.5, ease }}>
            <ProductArt product={product} />
          </motion.div>
          {badge && <span className={`badge ${badge.cls}`}>{badge.text}</span>}
        </div>
        <div className="card-body">
          <h3>{product.name}</h3>
          <div className="card-row">
            <span className="price">{formatPrice(product.price)}</span>
            <span className="card-sizes">
              {sizes.map((v) => (
                <i key={v.id} className={v.stock > 0 ? '' : 'na'}>{v.size === 'ONE SIZE' ? 'OS' : v.size}</i>
              ))}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
