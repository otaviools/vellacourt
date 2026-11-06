import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)

  // Sem rolagem suave para quem pede menos movimento
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 } })

  // Um único relógio: o ticker da GSAP move o Lenis, e o Lenis avisa o ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // Ao trocar de página, recalcula alturas e posições
  nuxtApp.hook('page:finish', () => {
    lenis.resize()
    ScrollTrigger.refresh()
  })

  return { provide: { lenis } }
})
