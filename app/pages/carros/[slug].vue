<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const route = useRoute()
const { bySlug, related, neighbours } = useCars()

const car = computed(() => bySlug(String(route.params.slug)))

if (!car.value) {
  throw createError({ statusCode: 404, statusMessage: 'Modelo não encontrado', fatal: true })
}

const c = computed(() => car.value!)
const nav = computed(() => neighbours(c.value))
const others = computed(() => related(c.value))

useSeoMeta({
  title: () => `${c.value.brand} ${c.value.model} — Vellacourt`,
  description: () => c.value.summary,
})

/* ---------- Pintura: comanda a paleta da página inteira ---------- */
const palette = computed(() => [c.value.paint, ...c.value.paints])
const paintIdx = ref(0)
watch(() => c.value.slug, () => (paintIdx.value = 0))
const paint = computed(() => palette.value[paintIdx.value] ?? c.value.paint)

const theme = computed(() => {
  const hex = paint.value.hex
  return {
    '--paint': hex,
    '--ink': inkFor(hex),
    '--accent': `color-mix(in srgb, ${hex} 55%, #f3ece0)`,
    '--stage-bg': `color-mix(in srgb, ${hex} 34%, #0b0a09)`,
  }
})
useHead({
  bodyAttrs: { style: () => `--page-bg: color-mix(in srgb, ${paint.value.hex} 15%, #0b0a09)` },
})

/* ---------- Números do palco ---------- */
const stats = computed(() => [
  { label: 'Potência', value: c.value.specs.powerHp, unit: 'cv', decimals: 0, from: 0 },
  { label: 'Torque', value: c.value.specs.torqueNm, unit: 'Nm', decimals: 0, from: 0 },
  { label: '0–100 km/h', value: c.value.specs.acceleration, unit: 's', decimals: 1, from: 10 },
  { label: 'Velocidade máxima', value: c.value.specs.topSpeed, unit: 'km/h', decimals: 0, from: 0 },
])
const counting = ref(false)

/* ---------- Capítulos ---------- */
const chapters = [
  { id: 'historia', label: 'História' },
  { id: 'linha-do-tempo', label: 'Linha do tempo' },
  { id: 'planta', label: 'Planta técnica' },
  { id: 'ficha', label: 'Ficha técnica' },
]
const activeChapter = ref(chapters[0]!.id)
const activeYear = ref(0)
const currentYear = computed(() => c.value.timeline[activeYear.value]?.year ?? c.value.year)

const sheet = computed(() => [
  ['Motor', c.value.specs.engine],
  ['Transmissão', c.value.specs.transmission],
  ['Tração', c.value.specs.drivetrain],
  ['Peso', `${formatNumber(c.value.specs.weightKg)} kg`],
  ['Relação peso/potência', `${(c.value.specs.weightKg / c.value.specs.powerHp).toFixed(2).replace('.', ',')} kg/cv`],
  ['Origem', c.value.country],
  ['Produção', c.value.production],
  ['Ano-modelo', String(c.value.year)],
])

/* ---------- Animações ---------- */
const root = ref<HTMLElement>()
// true quando o carro chegou "voando" (view transition): não animamos o carro por cima
const arrivedByFlight = consumeCarFlight()
let ctx: gsap.Context | undefined

const barOn = ref(false)

onMounted(() => {
  const reduce = prefersReducedMotion()
  if (reduce) counting.value = true

  ctx = gsap.context(() => {
    // Barra fixa: aparece depois do palco e some antes da navegação (referência: Rivian Dune)
    ScrollTrigger.create({
      trigger: '.stage',
      start: 'bottom 15%',
      endTrigger: '.pager',
      end: 'top bottom',
      onToggle: (s) => (barOn.value = s.isActive),
    })

    // Capítulo ativo no índice lateral (referência: Joby Aviation)
    chapters.forEach((ch) =>
      ScrollTrigger.create({
        trigger: `#${ch.id}`,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: (s) => s.isActive && (activeChapter.value = ch.id),
      }),
    )

    // Odômetro da linha do tempo (referência: Mews)
    gsap.utils.toArray<HTMLElement>('.timeline__item').forEach((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (s) => s.isActive && (activeYear.value = i),
      }),
    )

    if (reduce) return

    // Revelação por feixe de luz (referência: Zoox)
    const tl = gsap.timeline()
    tl.fromTo('.stage__beam', { scaleX: 0.03, opacity: 1 }, { scaleX: 1, duration: 1.3, ease: 'expo.inOut' })
      .to('.stage__shade', { opacity: 0, duration: 1.1, ease: 'power2.out' }, 0.75)
      .to('.stage__beam', { opacity: 0, duration: 1.1, ease: 'power2.out' }, 0.75)
      .fromTo('.stat', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'expo.out' }, 0.8)
      .call(() => (counting.value = true), [], 0.8)
    if (!arrivedByFlight) {
      tl.fromTo('.stage__car', { scale: 1.14 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0.2)
    }
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <article ref="root" :style="theme">
    <!-- FITA DE EDIÇÃO LIMITADA -->
    <div v-if="c.limited" class="ribbon" :aria-label="`Edição limitada a ${c.limited} unidades`">
      <div class="ribbon__track" aria-hidden="true">
        <span v-for="n in 8" :key="n">
          Edição limitada ◆ {{ c.limited }} unidades no mundo ◆ Série {{ String(c.limited).padStart(3, '0') }} ◆
        </span>
      </div>
    </div>

    <!-- FAIXA NA COR DA PINTURA -->
    <section class="band" :class="{ 'band--ltd': c.limited }">
      <div class="container">
        <NuxtLink to="/#catalogo" class="back">← Catálogo</NuxtLink>

        <div class="band__head">
          <div>
            <p class="eyebrow">{{ c.brand }} · {{ c.category }} · {{ c.year }}</p>
            <h1 class="display band__title">{{ c.model }}</h1>
            <p class="band__tagline">{{ c.tagline }}</p>
          </div>
          <div class="band__price">
            <span v-if="c.limited" class="ltd band__ltd">Série de {{ c.limited }} unidades</span>
            <p class="eyebrow">Preço estimado</p>
            <p class="display">{{ formatPrice(c.priceBRL) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PALCO: feixe de luz, números e pintura -->
    <section class="stage" :class="{ 'stage--flight': arrivedByFlight }" aria-label="Desempenho e pintura">
      <div class="stage__shade" aria-hidden="true" />
      <div class="stage__beam" aria-hidden="true" />

      <dl class="container stats">
        <div v-for="s in stats" :key="s.label" class="stat">
          <dt>{{ s.label }}</dt>
          <dd>
            <CountUp :value="s.value" :decimals="s.decimals" :from="s.from" :play="counting" />
            <small>{{ s.unit }}</small>
          </dd>
        </div>
      </dl>

      <div class="stage__car" data-vt-stage>
        <CarPhoto :car="c" sizes="100vw" eager />
      </div>
      <div class="stage__scrim" aria-hidden="true" />

      <a :href="c.photo.source" target="_blank" rel="noopener" class="stage__credit mono">
        Foto · {{ c.photo.author }} · {{ c.photo.license }} · Wikimedia Commons
      </a>
    </section>

    <!-- PINTURA: recolore o ambiente da página; a prévia mostra a cor na silhueta -->
    <section class="container paints" aria-label="Pintura">
      <div class="paints__preview" aria-hidden="true">
        <CarSilhouette :shape="c.shape" :color="paint.hex" />
      </div>
      <p class="paints__name">
        Pintura <strong>{{ paint.name }}</strong>
        <span v-if="paintIdx === 0" class="paints__tag">a da foto</span>
      </p>
        <div class="paints__list" role="radiogroup" aria-label="Escolher pintura">
          <button
            v-for="(p, i) in palette"
            :key="p.name"
            type="button"
            role="radio"
            class="swatch"
            :class="{ 'swatch--on': i === paintIdx }"
            :aria-checked="i === paintIdx"
            :aria-label="p.name"
            :title="p.name"
            :style="{ '--sw': p.hex }"
            @click="paintIdx = i"
          />
        </div>
    </section>

    <!-- DOSSIÊ -->
    <div class="container dossier">
      <nav class="dossier__nav" aria-label="Capítulos">
        <ol>
          <li v-for="(ch, i) in chapters" :key="ch.id">
            <a :href="`#${ch.id}`" :class="{ on: activeChapter === ch.id }">
              <span class="dossier__no">{{ String(i + 1).padStart(2, '0') }}</span>{{ ch.label }}
            </a>
          </li>
        </ol>
      </nav>

      <div class="dossier__body">
        <section id="historia" class="chapter">
          <p class="eyebrow chapter__eyebrow">01 — História</p>
          <p class="history__lead display">{{ c.summary }}</p>
          <p v-for="(p, i) in c.history" :key="i" class="history__p">{{ p }}</p>
        </section>

        <section id="linha-do-tempo" class="chapter">
          <p class="eyebrow chapter__eyebrow">02 — Linha do tempo</p>
          <div class="tl">
            <div class="tl__year" aria-hidden="true">
              <YearOdometer :year="currentYear" />
            </div>
            <ol class="timeline">
              <li
                v-for="(t, i) in c.timeline"
                :key="t.year"
                class="timeline__item"
                :class="{ 'timeline__item--on': i === activeYear }"
              >
                <span class="timeline__year">{{ t.year }}</span>
                <span class="timeline__event">{{ t.event }}</span>
              </li>
            </ol>
          </div>
        </section>

        <section id="planta" class="chapter">
          <p class="eyebrow chapter__eyebrow">03 — Planta técnica</p>
          <CarBlueprint :car="c" />
        </section>

        <section id="ficha" class="chapter">
          <p class="eyebrow chapter__eyebrow">04 — Ficha técnica</p>
          <div class="specs">
            <dl class="sheet">
              <div v-for="[k, v] in sheet" :key="k" class="sheet__row">
                <dt>{{ k }}</dt>
                <dd>{{ v }}</dd>
              </div>
            </dl>
            <div>
              <p class="eyebrow features__title">Características</p>
              <ul class="features">
                <li v-for="f in c.features" :key="f">{{ f }}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- NAVEGAÇÃO -->
    <nav class="container pager" aria-label="Navegar entre modelos">
      <NuxtLink :to="`/carros/${nav.prev.slug}`" class="pager__link" @click="noteCarFlight()">
        <span class="eyebrow">← Anterior</span>
        <span class="display">{{ nav.prev.brand }} {{ nav.prev.model }}</span>
      </NuxtLink>
      <NuxtLink :to="`/carros/${nav.next.slug}`" class="pager__link pager__link--next" @click="noteCarFlight()">
        <span class="eyebrow">Próximo →</span>
        <span class="display">{{ nav.next.brand }} {{ nav.next.model }}</span>
      </NuxtLink>
    </nav>

    <section class="container related">
      <div class="related__head">
        <h2 class="display">Você também pode gostar</h2>
        <NuxtLink :to="`/comparar?a=${c.slug}`" class="btn">Comparar este modelo</NuxtLink>
      </div>
      <div class="related__grid">
        <CarCard v-for="r in others" :key="r.slug" :car="r" />
      </div>
    </section>

    <!-- BARRA FIXA -->
    <div class="buybar" :class="{ 'buybar--on': barOn }" :inert="!barOn">
      <div class="container buybar__inner">
        <span class="buybar__swatch" :style="{ background: paint.hex }" />
        <div class="buybar__name">
          <span class="display">{{ c.model }}</span>
          <span class="mono">{{ c.brand }} · {{ paint.name }}</span>
        </div>
        <span v-if="c.limited" class="ltd buybar__ltd">{{ c.limited }} un.</span>
        <div class="buybar__price">
          <span class="mono">Preço estimado</span>
          <span class="display">{{ formatPriceShort(c.priceBRL) }}</span>
        </div>
        <NuxtLink :to="`/comparar?a=${c.slug}`" class="btn buybar__cta">Comparar</NuxtLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ---------- Fita de edição limitada ---------- */
.ribbon {
  overflow: hidden;
  background: var(--bordeaux);
  color: var(--champagne);
  padding: 7px 0;
}
.ribbon__track {
  display: flex;
  width: max-content;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  animation: ribbon 40s linear infinite;
}
.ribbon__track span {
  padding-right: 0.6em;
}
@keyframes ribbon {
  to { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .ribbon__track {
    animation: none;
  }
}

/* ---------- Faixa ---------- */
.band {
  background: var(--paint);
  color: var(--ink);
  padding-bottom: clamp(32px, 5vw, 64px);
  transition: background-color 0.8s var(--ease), color 0.8s var(--ease);
}
.band .eyebrow,
.band__tagline {
  color: inherit;
  opacity: 0.72;
}
/* Guilloché: padrão de linhas concêntricas de cédulas e certificados */
.band--ltd {
  background-image:
    repeating-radial-gradient(circle at 100% 0%, transparent 0 13px, color-mix(in srgb, var(--ink) 9%, transparent) 13px 14px),
    repeating-radial-gradient(circle at 0% 100%, transparent 0 13px, color-mix(in srgb, var(--ink) 6%, transparent) 13px 14px);
}
.band .ltd {
  color: inherit;
  border-color: currentColor;
}
.band__ltd {
  margin-bottom: 14px;
}
.back {
  display: inline-block;
  font-size: 13px;
  color: inherit;
  opacity: 0.72;
  margin: 32px 0 40px;
  transition: opacity 0.25s var(--ease);
}
.back:hover {
  opacity: 1;
}
.band__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
  flex-wrap: wrap;
}
.band__title {
  font-size: clamp(64px, 13vw, 210px);
  line-height: 0.86;
  letter-spacing: -0.02em;
  margin: 14px 0 18px;
}
.band__tagline {
  font-size: 18px;
  margin: 0;
}
.band__price {
  text-align: right;
}
.band__price .display {
  font-size: clamp(28px, 3vw, 40px);
  margin: 6px 0 0;
}

/* ---------- Palco ---------- */
.stage {
  position: relative;
  isolation: isolate;
  height: clamp(460px, 58vw, 88vh);
  background: var(--stage-bg);
  overflow: hidden;
}
.stage__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(14, 12, 10, 0.82) 0%, rgba(14, 12, 10, 0.25) 34%, transparent 55%),
    linear-gradient(0deg, color-mix(in srgb, var(--page-bg, var(--bg)) 92%, transparent) 0%, transparent 28%);
}
.stage__credit {
  position: absolute;
  right: var(--gutter);
  bottom: 14px;
  z-index: 2;
  font-size: 9px;
  color: var(--text-muted);
  transition: color 0.3s var(--ease);
}
.stage__credit:hover {
  color: var(--text);
}
/* Escuridão inicial: a GSAP abre o feixe e tira a sombra.
   A animação CSS é só uma rede de segurança caso o JS não rode. */
.stage__shade {
  position: absolute;
  inset: 0;
  z-index: 3;
  background: #050505;
  pointer-events: none;
  animation: shade-out 0.8s ease 2.8s forwards;
}
.stage__beam {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 56%;
  translate: -50% 0;
  z-index: 4;
  opacity: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--paint) 25%, #e9efef) 0%,
    color-mix(in srgb, var(--paint) 20%, rgba(233, 239, 239, 0.35)) 55%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
  mix-blend-mode: screen;
}
@keyframes shade-out {
  to { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .stage__shade,
  .stage__beam {
    display: none;
  }
}

.stats {
  position: absolute;
  top: clamp(24px, 4vw, 48px);
  left: 0;
  right: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0 auto;
}
.stat {
  padding-right: 16px;
}
.stat dt {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.stat dd {
  margin: 6px 0 0;
  font-family: var(--serif);
  font-size: clamp(40px, 6vw, 92px);
  line-height: 0.95;
  letter-spacing: -0.01em;
}
.stat small {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--text-muted);
  margin-left: 6px;
  letter-spacing: 0;
}

.stage__car {
  position: absolute;
  inset: 0;
  z-index: 0;
  view-transition-name: car-stage;
}
/* Se o carro chegou voando, a foto já aparece: a escuridão só cobre o resto */
.stage--flight .stage__shade {
  display: none;
}

.paints {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 22px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line);
}
.paints__preview {
  width: 120px;
  flex: none;
}
.paints .paints__list {
  margin-left: auto;
}
.paints__name {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.paints__name strong {
  color: var(--text);
  font-weight: 500;
  margin-left: 8px;
}
.paints__tag {
  margin-left: 10px;
  padding: 3px 8px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  font-size: 9px;
}
.paints__list {
  display: flex;
  gap: 10px;
}
.swatch {
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--sw) 60%, #fff), var(--sw) 55%, color-mix(in srgb, var(--sw) 60%, #000));
  cursor: pointer;
  outline-offset: 4px;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
}
.swatch:hover {
  transform: scale(1.12);
}
.swatch--on {
  box-shadow: 0 0 0 3px var(--page-bg, var(--bg)), 0 0 0 4px var(--text);
}

/* ---------- Dossiê ---------- */
.dossier {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 48px;
  padding-top: clamp(72px, 9vw, 120px);
}
.dossier__nav ol {
  position: sticky;
  top: 110px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.dossier__nav a {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-family: var(--serif);
  font-size: 28px;
  line-height: 1.25;
  color: var(--text-faint);
  opacity: 0.55;
  transition: color 0.4s var(--ease), opacity 0.4s var(--ease), transform 0.4s var(--ease);
}
.dossier__nav a.on {
  color: var(--text);
  opacity: 1;
  transform: translateX(6px);
}
.dossier__nav a:hover {
  opacity: 1;
}
.dossier__no {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--accent);
}
.chapter {
  scroll-margin-top: 100px;
}
.chapter + .chapter {
  padding-top: clamp(72px, 9vw, 120px);
}
.chapter__eyebrow {
  display: none;
  color: var(--accent);
  margin-bottom: 20px;
}

.history__lead {
  font-size: clamp(26px, 2.8vw, 38px);
  line-height: 1.18;
  margin: 0 0 32px;
  max-width: 820px;
}
.history__p {
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.75;
  margin: 0 0 18px;
  max-width: 760px;
}

/* Linha do tempo com odômetro */
.tl {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 40px;
  align-items: start;
}
.tl__year {
  position: sticky;
  top: 140px;
  font-size: clamp(80px, 11vw, 168px);
  color: var(--accent);
  letter-spacing: -0.02em;
}
.timeline {
  list-style: none;
  margin: 0;
  padding: 18vh 0;
}
.timeline__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 26px 0;
  border-top: 1px solid var(--line);
  opacity: 0.3;
  transition: opacity 0.5s var(--ease);
}
.timeline__item--on {
  opacity: 1;
}
.timeline__year {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--accent);
}
.timeline__event {
  font-family: var(--serif);
  font-size: clamp(22px, 2.2vw, 30px);
  line-height: 1.2;
}

/* Ficha técnica */
.specs {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 48px;
}
.sheet {
  margin: 0;
  border-top: 1px solid var(--line);
}
.sheet__row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line);
}
.sheet dt {
  color: var(--text-faint);
  font-size: 13px;
}
.sheet dd {
  margin: 0;
  font-size: 14px;
}
.features__title {
  margin: 0 0 14px;
}
.features {
  list-style: none;
  margin: 0;
  padding: 0;
}
.features li {
  position: relative;
  padding: 12px 0 12px 22px;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
  color: var(--text-muted);
}
.features li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 21px;
  width: 8px;
  height: 1px;
  background: var(--accent);
}

/* ---------- Navegação ---------- */
.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: clamp(80px, 10vw, 140px);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.pager__link {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 32px 0;
}
.pager__link--next {
  text-align: right;
  align-items: flex-end;
  border-left: 1px solid var(--line);
}
.pager__link .display {
  font-size: clamp(22px, 2.6vw, 34px);
  transition: color 0.3s var(--ease);
}
.pager__link:hover .display {
  color: var(--accent);
}

.related {
  padding-top: 96px;
}
.related__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.related__head h2 {
  font-size: clamp(30px, 3.4vw, 46px);
}
.related__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* ---------- Barra fixa ---------- */
.buybar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 45;
  background: var(--paint);
  color: var(--ink);
  border-top: 1px solid color-mix(in srgb, var(--ink) 18%, transparent);
  transform: translateY(105%);
  transition: transform 0.6s var(--ease), background-color 0.8s var(--ease), color 0.8s var(--ease);
}
.buybar--on {
  transform: none;
}
.buybar__inner {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 72px;
}
.buybar__swatch {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--ink) 40%, transparent);
  box-shadow: inset 0 0 0 2px var(--paint);
}
.buybar__name {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-right: auto;
}
.buybar__name .display {
  font-size: 26px;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.buybar__name .mono,
.buybar__price .mono {
  opacity: 0.7;
  font-size: 10px;
}
.buybar .ltd {
  color: inherit;
  border-color: currentColor;
}
.buybar__price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.buybar__price .display {
  font-size: 24px;
  line-height: 1;
}
.buybar__cta {
  border-color: var(--ink);
  color: var(--ink);
}
.buybar__cta:hover {
  background: var(--ink);
  color: var(--paint);
  border-color: var(--ink);
}

@media (max-width: 960px) {
  .dossier {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .dossier__nav {
    display: none;
  }
  .chapter__eyebrow {
    display: block;
  }
  .tl {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .tl__year {
    display: none;
  }
  .timeline {
    padding: 0;
  }
  .timeline__item {
    opacity: 1;
  }
  .specs {
    grid-template-columns: 1fr;
  }
  .stats {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 20px;
  }
  .related__grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 620px) {
  .band__price {
    text-align: left;
  }
  .buybar__inner {
    gap: 12px;
    height: 64px;
  }
  .buybar__price,
  .buybar__ltd,
  .buybar__name .mono {
    display: none;
  }
  .buybar__name .display {
    font-size: 22px;
  }
  .sheet__row {
    grid-template-columns: 1fr;
    gap: 2px;
  }
  .related__grid {
    grid-template-columns: 1fr;
  }
  .pager__link {
    padding: 24px 0;
  }
  .pager__link--next {
    padding-left: 12px;
  }
}
</style>
