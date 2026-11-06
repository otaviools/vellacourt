<script setup lang="ts">
import { gsap } from 'gsap'
import type { Car } from '~/types/car'

const props = defineProps<{ car: Car }>()

const def = computed(() => carShapes[props.car.shape])
const ground = computed(() => WHEEL_Y + def.value.r)
/** Linhas de cota */
const yB = computed(() => ground.value + 12)
const yA = computed(() => ground.value + 30)
const xC = computed(() => def.value.x1 + 16)

const mm = (v: number) => `${formatNumber(v)} mm`
const legend = computed(() => [
  { k: 'A', label: 'Comprimento', value: mm(props.car.dimensions.lengthMm) },
  { k: 'B', label: 'Entre-eixos', value: mm(props.car.dimensions.wheelbaseMm) },
  { k: 'C', label: 'Altura', value: mm(props.car.dimensions.heightMm) },
  { k: 'D', label: 'Largura', value: mm(props.car.dimensions.widthMm) },
])

const root = ref<HTMLElement>()
let ctx: gsap.Context | undefined

onMounted(() => {
  if (prefersReducedMotion()) return
  ctx = gsap.context(() => {
    gsap.set('.draw', { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set('.dim', { opacity: 0 })
    gsap
      .timeline({
        scrollTrigger: { trigger: root.value, start: 'top 80%', end: 'center 45%', scrub: 0.8 },
      })
      .to('.draw--body', { strokeDashoffset: 0, duration: 1, ease: 'none' })
      .to('.draw--detail', { strokeDashoffset: 0, duration: 0.6, stagger: 0.1, ease: 'none' }, 0.5)
      .to('.dim', { opacity: 1, duration: 0.4, stagger: 0.12 }, 1)
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <figure ref="root" class="bp">
    <div class="bp__sheet">
      <p class="bp__fig">FIG. 01 — Vista lateral · escala ilustrativa</p>
      <svg viewBox="-10 0 440 180" class="bp__svg" role="img" :aria-label="`Planta lateral do ${car.brand} ${car.model}`">
        <!-- Carro em traço -->
        <path :d="def.body" pathLength="1" class="draw draw--body line" />
        <path :d="def.window" pathLength="1" class="draw draw--detail line line--thin" />
        <g v-for="x in def.wheels" :key="x">
          <circle :cx="x" :cy="WHEEL_Y" :r="def.r" pathLength="1" class="draw draw--detail line" />
          <circle :cx="x" :cy="WHEEL_Y" :r="def.r * 0.62" pathLength="1" class="draw draw--detail line line--thin" />
          <line :x1="x - 3" :y1="WHEEL_Y" :x2="x + 3" :y2="WHEEL_Y" class="dim cross" />
          <line :x1="x" :y1="WHEEL_Y - 3" :x2="x" :y2="WHEEL_Y + 3" class="dim cross" />
        </g>
        <line :x1="def.x0 - 8" :y1="ground" :x2="def.x1 + 8" :y2="ground" pathLength="1" class="draw draw--detail line line--thin" />

        <!-- A: comprimento -->
        <g class="dim">
          <line :x1="def.x0" :y1="ground - 6" :x2="def.x0" :y2="yA + 4" class="ext" />
          <line :x1="def.x1" :y1="ground - 6" :x2="def.x1" :y2="yA + 4" class="ext" />
          <line :x1="def.x0" :y1="yA" :x2="def.x1" :y2="yA" class="dimline" />
          <circle :cx="(def.x0 + def.x1) / 2" :cy="yA" r="5" class="tag" />
          <text :x="(def.x0 + def.x1) / 2" :y="yA + 2.2" class="tag__t">A</text>
        </g>
        <!-- B: entre-eixos -->
        <g class="dim">
          <line :x1="def.wheels[0]" :y1="WHEEL_Y" :x2="def.wheels[0]" :y2="yB + 4" class="ext" />
          <line :x1="def.wheels[1]" :y1="WHEEL_Y" :x2="def.wheels[1]" :y2="yB + 4" class="ext" />
          <line :x1="def.wheels[0]" :y1="yB" :x2="def.wheels[1]" :y2="yB" class="dimline" />
          <circle :cx="(def.wheels[0] + def.wheels[1]) / 2" :cy="yB" r="5" class="tag" />
          <text :x="(def.wheels[0] + def.wheels[1]) / 2" :y="yB + 2.2" class="tag__t">B</text>
        </g>
        <!-- C: altura -->
        <g class="dim">
          <line :x1="(def.x0 + def.x1) / 2" :y1="def.top" :x2="xC + 4" :y2="def.top" class="ext" />
          <line :x1="xC" :y1="def.top" :x2="xC" :y2="ground" class="dimline" />
          <circle :cx="xC" :cy="(def.top + ground) / 2" r="5" class="tag" />
          <text :x="xC" :y="(def.top + ground) / 2 + 2.2" class="tag__t">C</text>
        </g>
      </svg>
    </div>

    <figcaption>
      <dl class="bp__legend">
        <div v-for="l in legend" :key="l.k">
          <dt><span class="bp__k">{{ l.k }}</span>{{ l.label }}</dt>
          <dd>{{ l.value }}</dd>
        </div>
      </dl>
    </figcaption>
  </figure>
</template>

<style scoped>
.bp {
  margin: 0;
}
.bp__sheet {
  position: relative;
  border: 1px solid var(--line-strong);
  padding: clamp(20px, 4vw, 48px) clamp(12px, 3vw, 36px) clamp(12px, 2vw, 24px);
  background-color: color-mix(in srgb, var(--paint) 10%, #0b0a09);
  /* Papel milimetrado */
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: -1px -1px;
}
.bp__fig {
  position: absolute;
  top: 14px;
  left: 18px;
  margin: 0;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.bp__svg {
  width: 100%;
  height: auto;
  overflow: visible;
}
.line {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.1;
  stroke-linejoin: round;
}
.line--thin {
  stroke-width: 0.6;
  opacity: 0.8;
}
.ext {
  stroke: var(--text-faint);
  stroke-width: 0.4;
  stroke-dasharray: 2 2;
}
.dimline {
  stroke: var(--text-muted);
  stroke-width: 0.6;
}
.cross {
  stroke: var(--text-muted);
  stroke-width: 0.5;
}
.tag {
  fill: var(--page-bg, var(--bg));
  stroke: var(--accent);
  stroke-width: 0.6;
}
.tag__t {
  fill: var(--text);
  font-family: var(--mono);
  font-size: 6px;
  font-weight: 600;
  text-anchor: middle;
}

.bp__legend {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  border-bottom: 1px solid var(--line);
}
.bp__legend div {
  padding: 18px 16px 18px 0;
}
.bp__legend div + div {
  padding-left: 16px;
  border-left: 1px solid var(--line);
}
.bp__legend dt {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.bp__k {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: 1px solid var(--accent);
  border-radius: 50%;
  font-size: 10px;
  letter-spacing: 0;
  color: var(--text);
}
.bp__legend dd {
  margin: 6px 0 0;
  font-family: var(--serif);
  font-size: clamp(22px, 2.2vw, 30px);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 720px) {
  .bp__legend {
    grid-template-columns: 1fr 1fr;
  }
  .bp__legend div:nth-child(3) {
    border-left: 0;
    padding-left: 0;
  }
  .bp__legend div:nth-child(n + 3) {
    border-top: 1px solid var(--line);
  }
}
</style>
