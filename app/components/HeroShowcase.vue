<script setup lang="ts">
import { gsap } from 'gsap'
import type { Car } from '~/types/car'

const FEATURED = ['bugatti-chiron-super-sport', 'ferrari-sf90-stradale', 'rolls-royce-phantom', 'bentley-continental-gt']
/** Duração de cada destaque, em segundos (também usada pela barra de progresso). */
const SLIDE_SECONDS = 7

const { all, bySlug } = useCars()
const featured = FEATURED.map((s) => bySlug(s)).filter((c): c is Car => !!c)

const current = ref(0)
const paused = ref(false)
const autoplay = ref(true)
const car = computed(() => featured[current.value]!)
const word = computed(() => car.value.model.split(' ')[0]!)

const go = (i: number) => (current.value = (i + featured.length) % featured.length)
const next = () => go(current.value + 1)

const root = ref<HTMLElement>()
const photoLayer = ref<HTMLElement>()
const nameLayer = ref<HTMLElement>()
const photoLink = ref<HTMLElement>()
let ctx: gsap.Context | undefined

onMounted(() => {
  if (prefersReducedMotion()) {
    autoplay.value = false
    return
  }
  ctx = gsap.context(() => {
    const st = { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true }
    gsap.to(photoLayer.value!, { yPercent: 18, ease: 'none', scrollTrigger: st })
    gsap.to(nameLayer.value!, { yPercent: -35, ease: 'none', scrollTrigger: st })
    gsap.to('.hero__fade', { opacity: 0, y: -30, ease: 'none', scrollTrigger: { ...st, end: '55% top' } })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())

/* ---------- Troca de foto: cortina da direita + zoom lento ---------- */
function enterPhoto(el: Element, done: () => void) {
  const e = el as HTMLElement
  e.style.zIndex = '2'
  if (prefersReducedMotion()) return gsap.fromTo(e, { opacity: 0 }, { opacity: 1, duration: 0.5, onComplete: done })
  const img = e.querySelector('img')
  gsap.fromTo(e, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', onComplete: done })
  if (img) gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: SLIDE_SECONDS + 1.5, ease: 'power1.out' })
}
function leavePhoto(el: Element, done: () => void) {
  const e = el as HTMLElement
  e.style.zIndex = '1'
  // continua visível por baixo até a nova cortina terminar
  gsap.to(e.querySelector('img'), { scale: 1.06, xPercent: -4, duration: 1.5, ease: 'expo.inOut', onComplete: done })
}

/* ---------- Troca do nome: letras sobem ---------- */
const chars = (el: Element) => el.querySelectorAll('.hero__char')
function enterName(el: Element, done: () => void) {
  if (prefersReducedMotion()) return gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, onComplete: done })
  gsap.fromTo(chars(el), { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.05, ease: 'expo.out', delay: 0.35, onComplete: done })
}
function leaveName(el: Element, done: () => void) {
  if (prefersReducedMotion()) return gsap.to(el, { opacity: 0, duration: 0.2, onComplete: done })
  gsap.to(chars(el), { yPercent: -110, duration: 0.5, stagger: 0.03, ease: 'power3.in', onComplete: done })
}
</script>

<template>
  <section
    ref="root"
    class="hero"
    :style="{ '--paint': car.paint.hex }"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <!-- Fotos -->
    <div ref="photoLayer" class="hero__photos">
      <Transition :css="false" appear @enter="enterPhoto" @leave="leavePhoto">
        <NuxtLink
          :key="car.slug"
          :to="`/carros/${car.slug}`"
          class="hero__photo"
          :aria-label="`Ver ficha do ${car.brand} ${car.model}`"
          @click="markCarTransition(photoLink)"
        >
          <div ref="photoLink" class="hero__photoInner">
            <CarPhoto :car="car" sizes="100vw" eager />
          </div>
        </NuxtLink>
      </Transition>
    </div>
    <div class="hero__scrim" aria-hidden="true" />

    <div class="container hero__top hero__fade">
      <h1 class="hero__title display">Máquinas que contam <em>histórias.</em></h1>
      <p class="mono hero__meta">Catálogo · {{ all.length }} modelos · {{ new Date().getFullYear() }}</p>
    </div>

    <div class="hero__bottom">
      <div class="container hero__info hero__fade">
        <Transition name="swap" mode="out-in">
          <div :key="car.slug" class="hero__model">
            <p class="mono">{{ car.brand }} · {{ car.category }}</p>
            <p class="hero__tagline">{{ car.tagline }}</p>
          </div>
        </Transition>

        <Transition name="swap" mode="out-in">
          <dl :key="car.slug" class="hero__specs">
            <div><dt>Potência</dt><dd>{{ formatNumber(car.specs.powerHp) }}<small>cv</small></dd></div>
            <div><dt>0–100</dt><dd>{{ car.specs.acceleration.toLocaleString('pt-BR') }}<small>s</small></dd></div>
            <div><dt>Máxima</dt><dd>{{ car.specs.topSpeed }}<small>km/h</small></dd></div>
          </dl>
        </Transition>

        <nav class="hero__tabs" aria-label="Modelos em destaque">
          <button
            v-for="(f, i) in featured"
            :key="f.slug"
            type="button"
            class="tab"
            :class="{ 'tab--on': i === current, 'tab--paused': paused }"
            :aria-current="i === current"
            :aria-label="`Mostrar ${f.brand} ${f.model}`"
            @click="go(i)"
          >
            <span class="tab__no">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="tab__track">
              <span
                v-if="i === current"
                class="tab__fill"
                :class="{ 'tab__fill--static': !autoplay }"
                :style="{ animationDuration: `${SLIDE_SECONDS}s` }"
                @animationend="next"
              />
            </span>
          </button>
        </nav>
      </div>

      <!-- Nome gigante (decorativo) -->
      <div ref="nameLayer" class="hero__name" aria-hidden="true">
        <Transition :css="false" mode="out-in" appear @enter="enterName" @leave="leaveName">
          <p :key="car.slug" class="hero__word display" :style="{ '--chars': word.length }">
            <span v-for="(ch, i) in word" :key="i" class="hero__char">{{ ch }}</span>
          </p>
        </Transition>
      </div>

      <a :href="car.photo.source" target="_blank" rel="noopener" class="hero__credit mono">
        Foto · {{ car.photo.author }} · {{ car.photo.license }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: max(680px, calc(100svh - 72px));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  isolation: isolate;
  background: var(--noir);
}

/* Fotos */
.hero__photos {
  position: absolute;
  inset: -6% 0 0;
  z-index: -2;
}
.hero__photo {
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
}
.hero__photoInner {
  width: 100%;
  height: 100%;
}
.hero__photo :deep(img) {
  transform-origin: 60% 60%;
  will-change: transform;
}
.hero__scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(14, 12, 10, 0.72) 0%, rgba(14, 12, 10, 0) 26%),
    linear-gradient(0deg, rgba(14, 12, 10, 0.94) 0%, rgba(14, 12, 10, 0.55) 32%, rgba(14, 12, 10, 0) 58%);
}

.hero__top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
  flex-wrap: wrap;
  padding-top: 28px;
  pointer-events: none;
}
.hero__title {
  font-size: clamp(22px, 2.2vw, 32px);
  line-height: 1.1;
}
.hero__meta {
  margin: 0;
  color: var(--text-muted);
}

.hero__bottom {
  position: relative;
  pointer-events: none;
}
.hero__info {
  display: grid;
  grid-template-columns: 1.2fr 1fr auto;
  align-items: end;
  gap: 32px;
  padding-bottom: 18px;
}
.hero__info > * {
  pointer-events: auto;
}
.hero__model .mono {
  margin: 0;
  color: var(--champagne);
}
.hero__tagline {
  margin: 6px 0 0;
  font-size: 15px;
  color: var(--text);
  max-width: 380px;
}
.hero__specs {
  display: flex;
  gap: 28px;
  margin: 0;
}
.hero__specs dt {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.hero__specs dd {
  margin: 4px 0 0;
  font-family: var(--serif);
  font-size: clamp(24px, 2.4vw, 34px);
  line-height: 1;
}
.hero__specs small {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--text-muted);
  margin-left: 4px;
}

/* Nome gigante na base */
.hero__name {
  display: flex;
  justify-content: center;
  padding: 0 var(--gutter);
}
.hero__word {
  display: flex;
  overflow: hidden;
  margin: 0;
  padding: 0.02em 0.02em 0.06em;
  font-size: min(23vw, calc(152vw / var(--chars)), 32vh);
  line-height: 0.86;
  letter-spacing: -0.035em;
  white-space: nowrap;
  color: var(--ivory);
}
.hero__char {
  display: inline-block;
  will-change: transform;
}
.hero__credit {
  position: absolute;
  right: var(--gutter);
  bottom: 10px;
  font-size: 9px;
  color: var(--text-faint);
  pointer-events: auto;
  transition: color 0.3s var(--ease);
}
.hero__credit:hover {
  color: var(--text);
}

/* Abas */
.hero__tabs {
  display: flex;
  gap: 14px;
}
.tab {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 60px;
  padding: 0;
  background: none;
  border: 0;
  cursor: pointer;
  text-align: left;
  color: var(--text-faint);
  transition: color 0.3s var(--ease);
}
.tab:hover,
.tab--on {
  color: var(--text);
}
.tab__no {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.1em;
}
.tab__track {
  position: relative;
  height: 1px;
  background: var(--line-strong);
  overflow: hidden;
}
.tab__fill {
  position: absolute;
  inset: 0;
  background: var(--champagne);
  transform-origin: left;
  animation: progress linear forwards;
}
.tab--paused .tab__fill {
  animation-play-state: paused;
}
.tab__fill--static {
  animation: none;
}
@keyframes progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.4s var(--ease), transform 0.4s var(--ease);
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 960px) {
  .hero__info {
    grid-template-columns: 1fr auto;
  }
  .hero__specs {
    grid-column: 1 / -1;
    grid-row: 1;
  }
}
@media (max-width: 620px) {
  .hero {
    min-height: max(620px, calc(100svh - 72px));
  }
  /* Foto 2:1 numa tela vertical: vira uma faixa onde o carro inteiro aparece */
  .hero__photos {
    inset: 128px 0 auto;
    height: 46svh;
  }
  .hero__scrim {
    background:
      linear-gradient(180deg, var(--noir) 0, var(--noir) 128px, rgba(14, 12, 10, 0) 200px),
      linear-gradient(0deg, var(--noir) 0%, var(--noir) 38%, rgba(14, 12, 10, 0) 52%);
  }
  .hero__credit {
    position: static;
    display: block;
    text-align: right;
    padding: 0 var(--gutter) 8px;
  }
  .hero__info {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .hero__specs {
    gap: 20px;
  }
}
</style>
