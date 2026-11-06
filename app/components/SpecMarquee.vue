<script setup lang="ts">
import { gsap } from 'gsap'

/**
 * Faixa rolante com modelos e números do catálogo.
 * Gira sozinha e reage à rolagem: acelera, inclina e inverte o sentido
 * conforme a velocidade e a direção do Lenis (referência: Shopify Supply).
 */
const { all } = useCars()

type Item = { text: string; kind: 'model' | 'spec' }
const items = computed<Item[]>(() =>
  all.flatMap((c) => [
    { text: c.model.split(' ').slice(0, 2).join(' '), kind: 'model' as const },
    { text: c.specs.engine.split(' ')[0]!, kind: 'spec' as const },
    { text: `${formatNumber(c.specs.powerHp)} cv`, kind: 'spec' as const },
  ]),
)

const track = ref<HTMLElement>()
const BASE_SPEED = 60 // px/s
const { $lenis } = useNuxtApp()

let tick: ((t: number, dt: number) => void) | undefined

onMounted(() => {
  if (prefersReducedMotion() || !track.value) return
  const el = track.value
  const half = () => el.scrollWidth / 2
  const wrap = (v: number) => gsap.utils.wrap(-half(), 0, v)
  const skewTo = gsap.quickTo(el, 'skewX', { duration: 0.6, ease: 'power3' })

  let x = 0
  let dir = 1
  tick = (_t, dt) => {
    const v = $lenis?.velocity ?? 0
    if ($lenis && $lenis.direction !== 0) dir = $lenis.direction
    const speed = BASE_SPEED + Math.min(Math.abs(v) * 40, 1600)
    x = wrap(x - speed * dir * (dt / 1000))
    gsap.set(el, { x })
    skewTo(gsap.utils.clamp(-10, 10, -v * 0.6))
  }
  gsap.ticker.add(tick)
})
onBeforeUnmount(() => tick && gsap.ticker.remove(tick))
</script>

<template>
  <div class="marquee" aria-hidden="true">
    <div ref="track" class="marquee__track">
      <!-- conteúdo duplicado para o laço contínuo -->
      <template v-for="copy in 2" :key="copy">
        <span v-for="(it, i) in items" :key="`${copy}-${i}`" class="marquee__item" :class="`marquee__item--${it.kind}`">
          {{ it.text }}<span class="marquee__sep">✦</span>
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  overflow: hidden;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 18px 0;
  margin-top: clamp(56px, 7vw, 96px);
}
.marquee__track {
  display: flex;
  width: max-content;
  white-space: nowrap;
  will-change: transform;
}
.marquee__item {
  display: inline-flex;
  align-items: center;
}
.marquee__item--model {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(40px, 5.6vw, 84px);
  line-height: 1;
}
.marquee__item--spec {
  font-family: var(--mono);
  font-size: clamp(13px, 1.2vw, 16px);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.marquee__sep {
  display: inline-block;
  margin: 0 clamp(16px, 2vw, 32px);
  font-size: 14px;
  font-style: normal;
  color: var(--gold);
}
@media (prefers-reduced-motion: reduce) {
  .marquee__track {
    flex-wrap: wrap;
    width: auto;
    white-space: normal;
    padding: 0 var(--gutter);
  }
  .marquee__track > :nth-child(n + 37) {
    display: none;
  }
}
</style>
