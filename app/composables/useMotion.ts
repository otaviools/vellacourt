/**
 * Utilitários de movimento e cor compartilhados entre páginas.
 */

/** Nome da view transition usado pelo carro do palco da ficha técnica. */
export const CAR_STAGE_VT = 'car-stage'

let marked: HTMLElement | null = null
let flight = false

/** Registra que a próxima ficha vai receber o carro por view transition. */
export function noteCarFlight() {
  flight = true
}

/** Lê e zera o registro: a ficha usa isso para não animar o carro por cima do voo. */
export function consumeCarFlight(): boolean {
  const f = flight
  flight = false
  return f
}

/**
 * Marca o elemento clicado como origem da transição para a ficha do carro.
 * Só um elemento pode ter o nome por vez; por isso o anterior é limpo e o
 * palco da página atual (se houver) é desligado.
 */
export function markCarTransition(el: Element | null | undefined) {
  if (!(el instanceof HTMLElement)) return
  if (marked && marked !== el) marked.style.viewTransitionName = ''
  document.querySelectorAll<HTMLElement>('[data-vt-stage]').forEach((s) => {
    if (s !== el) s.style.viewTransitionName = 'none'
  })
  el.style.viewTransitionName = CAR_STAGE_VT
  marked = el
  noteCarFlight()
}

export const prefersReducedMotion = () =>
  import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const hasFinePointer = () =>
  import.meta.client && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/** Cor de texto legível sobre um fundo hexadecimal (luminância relativa WCAG). */
export function inkFor(hex: string): string {
  const n = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.36 ? '#0c0b0a' : '#f4efe6'
}
