// Параллакс-секция (основа — компонент Osmo с 21st.dev), адаптирована под only.vision.
// Изменения относительно оригинала:
//  - вместо стоковых картинок — SVG-слои гор Ала-Тоо (прозрачные слои нужны, чтобы параллакс читался);
//  - пакет `lenis` вместо устаревшего `@studio-freight/lenis` (тот же API);
//  - в cleanup снимаем функцию с gsap.ticker — в оригинале она оставалась и дёргала уничтоженный Lenis;
//  - убираем только свои ScrollTrigger'ы, а не все на странице;
//  - при prefers-reduced-motion анимация отключается.
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

type Props = {
  title?: string
  eyebrow?: string
  children?: React.ReactNode
}

const W = 1440
const H = 800

function Layer({ layer, children }: { layer: string; children: React.ReactNode }) {
  return (
    <svg data-parallax-layer={layer} className="parallax__layer-img" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {children}
    </svg>
  )
}

export function ParallaxComponent({ title = 'ALA-TOO', eyebrow = 'Бишкек · 42.87°N 74.59°E', children }: Props) {
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]')
    let tl: gsap.core.Timeline | undefined

    if (triggerElement) {
      tl = gsap.timeline({
        scrollTrigger: { trigger: triggerElement, start: '0% 0%', end: '100% 0%', scrub: 0 },
      })
      const layers = [
        { layer: '1', yPercent: 70 },
        { layer: '2', yPercent: 55 },
        { layer: '3', yPercent: 40 },
        { layer: '4', yPercent: 10 },
      ]
      layers.forEach((l, idx) => {
        tl!.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${l.layer}"]`),
          { yPercent: l.yPercent, ease: 'none' },
          idx === 0 ? undefined : '<',
        )
      })
    }

    // Плавный скролл. На телефонах Lenis по умолчанию оставляет нативный touch-скролл.
    const lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      tl?.scrollTrigger?.kill()
      tl?.kill()
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
  }, [])

  return (
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header">
        <div className="parallax__visuals">
          <div className="parallax__black-line-overflow" />
          <div data-parallax-layers className="parallax__layers">
            {/* 1 — дальние снежные пики */}
            <Layer layer="1">
              <path d="M0 520 L120 430 L210 470 L330 330 L420 400 L520 280 L610 360 L700 300 L820 210 L930 320 L1010 270 L1120 360 L1220 290 L1330 380 L1440 330 L1440 800 L0 800 Z" fill="#2b2b29" />
              <g fill="#d9d6cf">
                <path d="M310 355 L330 330 L352 352 L338 347 L329 360 L320 349 Z" />
                <path d="M490 305 L520 280 L548 302 L532 297 L521 312 L507 299 Z" />
                <path d="M785 240 L820 210 L858 245 L838 238 L823 254 L808 236 Z" />
                <path d="M990 287 L1010 270 L1032 290 L1018 286 L1009 297 Z" />
                <path d="M1196 307 L1220 290 L1246 312 L1231 306 L1220 318 Z" />
              </g>
            </Layer>
            {/* 2 — средний хребет */}
            <Layer layer="2">
              <path d="M0 600 L140 520 L260 570 L380 480 L500 560 L640 470 L760 540 L900 450 L1040 540 L1160 490 L1300 560 L1440 500 L1440 800 L0 800 Z" fill="#1a1a19" />
            </Layer>
            {/* 3 — заголовок между хребтами */}
            <div data-parallax-layer="3" className="parallax__layer-title">
              <span className="parallax__eyebrow">{eyebrow}</span>
              <h2 className="parallax__title">{title}</h2>
            </div>
            {/* 4 — ближний склон, перекрывает низ заголовка */}
            <Layer layer="4">
              <path d="M0 640 L180 575 L320 615 L470 548 L620 622 L800 566 L980 630 L1150 556 L1300 612 L1440 580 L1440 800 L0 800 Z" fill="#0c0c0c" />
            </Layer>
          </div>
          <div className="parallax__fade" />
        </div>
      </section>
      {children && <section className="parallax__content">{children}</section>}
    </div>
  )
}

export default ParallaxComponent
