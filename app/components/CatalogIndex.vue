<script setup lang="ts">
import { gsap } from 'gsap'
import type { Car } from '~/types/car'

const props = defineProps<{ cars: Car[] }>()

const active = ref<string | null>(null)
const activeCar = computed(() => props.cars.find((c) => c.slug === active.value))

const root = ref<HTMLElement>()
const follower = ref<HTMLElement>()
const fine = ref(false)
let xTo: ((v: number) => void) | undefined
let yTo: ((v: number) => void) | undefined
let ctx: gsap.Context | undefined

onMounted(() => {
  fine.value = hasFinePointer()
  ctx = gsap.context(() => {
    if (fine.value && follower.value) {
      // Prévia à direita do cursor, para não cobrir o nome em foco
      gsap.set(follower.value, { xPercent: 0, yPercent: -50 })
      xTo = gsap.quickTo(follower.value, 'x', { duration: 0.7, ease: 'power3' })
      yTo = gsap.quickTo(follower.value, 'y', { duration: 0.7, ease: 'power3' })
    }
    if (!prefersReducedMotion()) {
      gsap.fromTo(
        '.row',
        { yPercent: 60, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1,
          stagger: 0.05,
          ease: 'expo.out',
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: root.value, start: 'top 85%', once: true },
        },
      )
    }
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())

function onMove(e: MouseEvent) {
  xTo?.(e.clientX)
  yTo?.(e.clientY)
}

function onEnterRow(car: Car, e: MouseEvent) {
  // Na primeira entrada, posiciona a prévia direto no cursor (sem "voar" do canto)
  if (!active.value && follower.value && fine.value) {
    gsap.set(follower.value, { x: e.clientX, y: e.clientY })
  }
  active.value = car.slug
}

function onClick(slug: string) {
  // A prévia flutuante some em telas estreitas; nesse caso a origem é a miniatura da linha
  const followerVisible = !!follower.value && getComputedStyle(follower.value).display !== 'none'
  const sel = followerVisible
    ? `.follower__item[data-slug="${slug}"] .follower__car`
    : `.row[data-slug="${slug}"] .row__thumb`
  markCarTransition(root.value?.querySelector(sel))
}

const pad = (n: number) => String(n).padStart(3, '0')
</script>

<template>
  <div
    ref="root"
    class="index"
    :class="{ 'index--hovering': !!activeCar && fine }"
    :style="{ '--hover-paint': activeCar?.paint.hex ?? '#0c0b0a' }"
    @mousemove="onMove"
    @mouseleave="active = null"
  >
    <div class="index__wash" aria-hidden="true" />

    <div class="index__head" aria-hidden="true">
      <span>Nº</span>
      <span>Modelo</span>
      <span class="num">Potência</span>
      <span class="num">0–100</span>
      <span class="num">Preço</span>
    </div>

    <NuxtLink
      v-for="(car, i) in cars"
      :key="car.slug"
      :to="`/carros/${car.slug}`"
      class="row"
      :class="{ 'row--on': active === car.slug }"
      :data-slug="car.slug"
      @mouseenter="onEnterRow(car, $event)"
      @focus="active = car.slug"
      @click="onClick(car.slug)"
    >
      <span class="row__no">Nº {{ pad(i + 1) }}</span>
      <span class="row__name">
        <span class="row__brand">
          {{ car.brand }} · {{ car.category }} · {{ car.year }}
          <span v-if="car.limited" class="ltd">Edição limitada · {{ car.limited }} un.</span>
        </span>
        <span class="row__model display">{{ car.model }}</span>
      </span>
      <span class="row__thumb" aria-hidden="true">
        <CarPhoto :car="car" sizes="(max-width: 960px) 100vw, 1px" />
      </span>
      <span class="row__num">{{ formatNumber(car.specs.powerHp) }}<small>cv</small></span>
      <span class="row__num">{{ car.specs.acceleration.toLocaleString('pt-BR') }}<small>s</small></span>
      <span class="row__num row__price">{{ formatPriceShort(car.priceBRL) }}</span>
    </NuxtLink>

    <!-- Prévia que segue o cursor (só em telas com mouse) -->
    <div ref="follower" class="follower" :class="{ 'follower--on': !!activeCar && fine }" aria-hidden="true">
      <div
        v-for="car in cars"
        :key="car.slug"
        class="follower__item"
        :class="{ on: active === car.slug }"
        :data-slug="car.slug"
      >
        <div class="follower__car">
          <CarPhoto :car="car" sizes="520px" />
        </div>
        <p class="follower__paint">
          <span :style="{ background: car.paint.hex }" />{{ car.paint.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.index {
  position: relative;
  border-top: 1px solid var(--line-strong);
}

/* Lavagem de cor de tela inteira com a pintura do carro em foco */
.index__wash {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0;
  background:
    radial-gradient(60% 60% at 50% 50%, color-mix(in srgb, var(--hover-paint) 42%, transparent), transparent 75%),
    color-mix(in srgb, var(--hover-paint) 16%, var(--bg));
  transition: opacity 0.6s var(--ease), background 0.6s var(--ease);
}
.index--hovering .index__wash {
  opacity: 1;
}

.index__head,
.row {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr) 110px 80px 120px;
  gap: 20px;
  align-items: center;
}
.index__head {
  padding: 14px 0;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-faint);
  border-bottom: 1px solid var(--line);
}
.num {
  text-align: right;
}

.row {
  position: relative;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}
/* O esmaecimento fica nos filhos para não brigar com a animação de entrada da linha */
.row > * {
  transition: opacity 0.4s var(--ease);
}
.index--hovering .row:not(.row--on) > * {
  opacity: 0.22;
}
.row__no {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}
.row__name {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.row__brand {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.row__model {
  /* escala contida para nomes longos caberem numa linha */
  font-size: clamp(32px, 4.3vw, 76px);
  line-height: 0.95;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: transform 0.6s var(--ease), color 0.4s var(--ease);
}
.row--on .row__model {
  transform: translateX(28px);
  font-style: italic;
}
.row__thumb {
  display: none;
}
.row__num {
  text-align: right;
  font-size: 17px;
  font-variant-numeric: tabular-nums;
}
.row__num small {
  font-size: 11px;
  color: var(--text-muted);
  margin-left: 3px;
}
.row__price {
  font-family: var(--serif);
  font-size: 22px;
}

/* Prévia flutuante */
.follower {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
  width: clamp(300px, 30vw, 480px);
  /* começa 56px à direita do cursor */
  margin-left: 56px;
  pointer-events: none;
  opacity: 0;
  scale: 0.85;
  transition: opacity 0.35s var(--ease), scale 0.5s var(--ease);
}
.follower--on {
  opacity: 1;
  scale: 1;
}
.follower__item {
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  opacity: 0;
  transition: opacity 0.35s var(--ease);
}
.follower__item.on {
  position: relative;
  opacity: 1;
}
/* A foto se revela de baixo para cima, como uma persiana */
.follower__car {
  aspect-ratio: 3 / 2;
  overflow: hidden;
  clip-path: inset(100% 0 0 0);
  transition: clip-path 0.7s var(--ease);
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6);
}
.follower__item.on .follower__car {
  clip-path: inset(0 0 0 0);
}
.follower__car :deep(img) {
  scale: 1.15;
  transition: scale 1.2s var(--ease);
}
.follower__item.on .follower__car :deep(img) {
  scale: 1;
}
.follower__paint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 10px 0 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text);
}
.follower__paint span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
}

@media (max-width: 960px) {
  .index__head {
    display: none;
  }
  .row {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'no no'
      'name name'
      'thumb thumb'
      'price price';
    gap: 6px 16px;
    padding: 22px 0;
  }
  .row__no { grid-area: no; }
  .row__name { grid-area: name; }
  .row__thumb {
    grid-area: thumb;
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    margin: 10px 0;
  }
  .row__price { grid-area: price; text-align: left; }
  .row__num:not(.row__price) {
    display: none;
  }
  .row__model {
    white-space: normal;
  }
  .follower {
    display: none;
  }
}
</style>
