import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import FlashlightTextReveal from '@/components/ui/flashlight-text-reveal'
import { ParallaxComponent } from '@/components/ui/parallax-scrolling'
import ClothingRailHero from '@/components/ui/product-rail-gallery'
import { api } from '../lib/api'
import { CATEGORIES, DELIVERY, formatPrice, sortVariants } from '../lib/config'
import ProductCard from '../components/ProductCard'
import { Marquee, Page, Reveal, Sticker, ease } from '../components/ui'

// Первый экран: тёмная зернистая стена, курсор — фонарик, надпись видна только в луче.
// На телефоне свет бродит сам.
function Hero() {
  return (
    <FlashlightTextReveal
      text={'ONLY\n.VISION'}
      height="100svh"
      className="hero"
      fontFamily='"Anton", "Oswald", Impact, sans-serif'
      fontSize="clamp(5.5rem, 25vw, 19rem)"
      colors={['#101010', '#3A3A3A']}
      radius={0.36}
      ghost={0.035}
    >
      <div className="hero-overlay">
        <h1 className="sr-only">only.vision — мультибрендовый магазин одежды в Бишкеке</h1>
        <motion.p className="eyebrow" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease }}>
          <span className="dot" /> Новый завоз: Moncler · Nike Tech Fleece
        </motion.p>
        <div className="hero-bottom">
          <motion.p className="hero-sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8, ease }}>
            Moncler, Nike, Ralph Lauren, Stone Island и широкий деним в одном месте. Доставка по Бишкеку за <span className="nowrap">1–2 дня</span>.
          </motion.p>
          <motion.div className="hero-cta" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8, ease }}>
            <Link to="/catalog" className="btn btn-light">Смотреть каталог →</Link>
            <a href="#drop" className="btn btn-ghost">Новинки</a>
          </motion.div>
        </div>
        <Sticker className="hero-sticker" size={112} />
        <motion.span className="hero-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
          <span className="only-desktop">Посвети курсором</span><span className="only-mobile">Смотри, куда падает свет</span>
        </motion.span>
      </div>
    </FlashlightTextReveal>
  )
}

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.12, 1])
  return <motion.span style={{ opacity }}>{children} </motion.span>
}

function Manifest() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const text = 'Мы не продаём всё подряд. Только вещи, которые носим сами. Каждую позицию привозим по несколько штук на размер. Закончилось — значит закончилось.'
  const words = text.split(' ')
  return (
    <section className="manifest" ref={ref}>
      <p>
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>
        ))}
      </p>
    </section>
  )
}

// Вешалка (компонент с 21st.dev): верх и куртки из каталога в виде вещей на вешалках.
// Наши силуэты → типы вешалки; штаны и аксессуары на вешалку не вешаем.
const RAIL_KIND = { puffer: 'jacket', bomber: 'jacket', hoodie: 'hoodie', crewneck: 'knit', polo: 'tee', tee: 'tee', longsleeve: 'knit' }
const RAIL_LABELS = { front: 'Спереди', back: 'Сзади', close: 'Закрыть', show: 'Показать' }

function Rail({ products }) {
  const items = products
    .filter((p) => RAIL_KIND[p.art])
    .slice(0, 8)
    .map((p) => {
      const inStock = sortVariants(p.variants).filter((v) => v.stock > 0).map((v) => v.size)
      return {
        id: p.id,
        name: p.name,
        kind: RAIL_KIND[p.art],
        color: p.color,
        tag: formatPrice(p.price),
        description: p.description,
        details: inStock.length ? [`В наличии: ${inStock.join(', ')}`] : ['Нет в наличии'],
      }
    })
  if (items.length < 2) return null
  return (
    <section className="rail-section">
      <div className="section-head">
        <Reveal as="h2" className="h2">Вешалка</Reveal>
        <span className="eyebrow">Наведи · потяни · нажми, чтобы снять</span>
      </div>
      <ClothingRailHero
        items={items}
        hanger="wood"
        labels={RAIL_LABELS}
        caption="Наведи на вещь, чтобы повернуть её лицом. Нажми, чтобы снять с вешалки и посмотреть со спины."
        action={<Link to="/catalog" className="btn btn-light">Весь каталог →</Link>}
      />
    </section>
  )
}

export default function Home() {
  const [products, setProducts] = useState(null)
  useEffect(() => { api.listProducts().then(setProducts).catch(() => setProducts([])) }, [])

  const fresh = (products ?? []).filter((p) => p.is_new).slice(0, 4)
  const drop = fresh.length >= 4 ? fresh : (products ?? []).slice(0, 4)
  const countBy = (slug) => (products ?? []).filter((p) => p.category === slug).length

  return (
    <Page className="home">
      <Hero />

      <Marquee
        className="marquee-acid tilt"
        items={['Доставка по Бишкеку', `Бесплатно от ${formatPrice(DELIVERY.freeFrom)}`, 'Moncler', 'Nike Tech Fleece', 'Ralph Lauren', 'Оплата при получении']}
      />

      <section className="section" id="drop">
        <div className="section-head">
          <Reveal as="h2" className="h2">Новинки</Reveal>
          <Link to="/catalog" className="link-arrow">Весь каталог →</Link>
        </div>
        <div className="product-grid">
          {products === null
            ? Array.from({ length: 4 }, (_, i) => <div key={i} className="card skeleton" />)
            : drop.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      <Manifest />

      {products && <Rail products={products} />}

      <ParallaxComponent title="ALA-TOO" eyebrow="Бишкек · 42.87°N 74.59°E">
        <Reveal className="parallax__copy">
          <p className="eyebrow">Город у подножия гор</p>
          <h3 className="h2">Зимой здесь −25°.<br />Мы одеваем под это.</h3>
          <p className="lead">Moncler Maya и Nuptse держат бишкекский мороз, а Tech Fleece спасает в межсезонье.</p>
          <Link to="/catalog?cat=outerwear" className="btn btn-light">Куртки →</Link>
        </Reveal>
      </ParallaxComponent>

      <section className="section">
        <Reveal as="h2" className="h2">Категории</Reveal>
        <div className="cat-list">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.05} y={30}>
              <Link to={`/catalog?cat=${c.slug}`} className="cat-row">
                <span className="cat-num">0{i + 1}</span>
                <span className="cat-name">{c.name}</span>
                <span className="cat-count">{products ? `${countBy(c.slug)} шт.` : ''}</span>
                <span className="cat-arrow">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Marquee className="marquee-outline" speed={40} reverse items={['ONLY.VISION', 'MONCLER', 'NIKE TECH FLEECE', 'RALPH LAUREN', 'STONE ISLAND', 'BISHKEK 312']} />

      <section className="section info">
        {[
          ['01', 'Доставка', `По Бишкеку ${formatPrice(DELIVERY.price)}, ${DELIVERY.time}. От ${formatPrice(DELIVERY.freeFrom)} — бесплатно. Минимальный заказ ${formatPrice(DELIVERY.minOrder)}.`],
          ['02', 'Оплата', 'При получении: наличными или переводом курьеру. Сначала примерьте, потом платите.'],
          ['03', 'Статус заказа', 'После оформления вы получите номер заказа. По нему и телефону видно, на каком он этапе: новый, собран, доставлен.'],
          ['04', 'Раскупили размер?', 'Нажмите «Сообщить о поступлении» на странице товара. Напишем в WhatsApp, как только размер вернётся.'],
        ].map(([n, t, d], i) => (
          <Reveal key={n} delay={i * 0.08} className="info-card">
            <span className="info-num">{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </Reveal>
        ))}
      </section>

      <section className="cta-block">
        <Reveal>
          <h2 className="h1">Видишь больше?</h2>
          <Link to="/catalog" className="btn btn-acid btn-lg">Собрать образ →</Link>
        </Reveal>
      </section>
    </Page>
  )
}
