<script setup lang="ts">
import type { Car } from '~/types/car'

useSeoMeta({ title: 'Comparar modelos — Vellacourt' })

const route = useRoute()
const router = useRouter()
const { all, bySlug } = useCars()

const initialA = bySlug(String(route.query.a ?? ''))?.slug ?? all[0]!.slug
const initialB =
  bySlug(String(route.query.b ?? ''))?.slug ?? all.find((c) => c.slug !== initialA)!.slug

const slugA = ref(initialA)
const slugB = ref(initialB)

watch([slugA, slugB], ([a, b]) => router.replace({ query: { a, b } }))

const a = computed(() => bySlug(slugA.value)!)
const b = computed(() => bySlug(slugB.value)!)

interface Row {
  label: string
  get: (c: Car) => number
  fmt: (v: number) => string
  /** true quando valor menor é melhor */
  lowerWins?: boolean
}

const rows: Row[] = [
  { label: 'Potência', get: (c) => c.specs.powerHp, fmt: (v) => `${formatNumber(v)} cv` },
  { label: 'Torque', get: (c) => c.specs.torqueNm, fmt: (v) => `${formatNumber(v)} Nm` },
  { label: '0–100 km/h', get: (c) => c.specs.acceleration, fmt: (v) => `${v.toLocaleString('pt-BR')} s`, lowerWins: true },
  { label: 'Velocidade máxima', get: (c) => c.specs.topSpeed, fmt: (v) => `${v} km/h` },
  { label: 'Peso', get: (c) => c.specs.weightKg, fmt: (v) => `${formatNumber(v)} kg`, lowerWins: true },
  {
    label: 'Peso/potência',
    get: (c) => c.specs.weightKg / c.specs.powerHp,
    fmt: (v) => `${v.toFixed(2).replace('.', ',')} kg/cv`,
    lowerWins: true,
  },
  { label: 'Preço estimado', get: (c) => c.priceBRL, fmt: (v) => formatPriceShort(v), lowerWins: true },
]

const compared = computed(() =>
  rows.map((r) => {
    const va = r.get(a.value)
    const vb = r.get(b.value)
    const top = Math.max(va, vb)
    const winner = va === vb ? null : (va > vb) !== !!r.lowerWins ? 'a' : 'b'
    return { ...r, va, vb, ra: va / top, rb: vb / top, winner }
  }),
)

const swap = () => {
  ;[slugA.value, slugB.value] = [slugB.value, slugA.value]
}
</script>

<template>
  <div class="container page">
    <header class="head">
      <p class="eyebrow">Comparador</p>
      <h1 class="display head__title">Lado a <em>lado.</em></h1>
    </header>

    <div class="pickers">
      <div v-for="side in (['a', 'b'] as const)" :key="side" class="picker" :style="{ '--paint': (side === 'a' ? a : b).paint.hex }">
        <label class="picker__select">
          <span class="eyebrow">Modelo {{ side.toUpperCase() }}</span>
          <select v-if="side === 'a'" v-model="slugA">
            <option v-for="c in all" :key="c.slug" :value="c.slug" :disabled="c.slug === slugB">
              {{ c.brand }} {{ c.model }}
            </option>
          </select>
          <select v-else v-model="slugB">
            <option v-for="c in all" :key="c.slug" :value="c.slug" :disabled="c.slug === slugA">
              {{ c.brand }} {{ c.model }}
            </option>
          </select>
        </label>
        <div class="picker__stage">
          <CarPhoto :car="side === 'a' ? a : b" sizes="(max-width: 720px) 100vw, 50vw" />
        </div>
        <NuxtLink :to="`/carros/${(side === 'a' ? a : b).slug}`" class="picker__link">
          {{ (side === 'a' ? a : b).category }} · ver ficha →
        </NuxtLink>
      </div>
      <button type="button" class="swap" aria-label="Inverter modelos" @click="swap">⇄</button>
    </div>

    <div class="table">
      <div v-for="r in compared" :key="r.label" class="row">
        <div class="cell cell--a" :class="{ win: r.winner === 'a' }">
          <span class="val">{{ r.fmt(r.va) }}</span>
          <span class="bar"><span :style="{ transform: `scaleX(${r.ra})` }" /></span>
        </div>
        <div class="label">{{ r.label }}<small v-if="r.lowerWins">menor é melhor</small></div>
        <div class="cell cell--b" :class="{ win: r.winner === 'b' }">
          <span class="val">{{ r.fmt(r.vb) }}</span>
          <span class="bar"><span :style="{ transform: `scaleX(${r.rb})` }" /></span>
        </div>
      </div>
      <div class="row row--text">
        <div class="cell cell--a">{{ a.specs.engine }}</div>
        <div class="label">Motor</div>
        <div class="cell cell--b">{{ b.specs.engine }}</div>
      </div>
      <div class="row row--text">
        <div class="cell cell--a">{{ a.specs.drivetrain }}</div>
        <div class="label">Tração</div>
        <div class="cell cell--b">{{ b.specs.drivetrain }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: clamp(48px, 7vw, 96px);
}
.head__title {
  font-size: clamp(54px, 8vw, 110px);
  margin: 14px 0 48px;
}

.pickers {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.picker {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background:
    radial-gradient(60% 50% at 50% 75%, color-mix(in srgb, var(--paint) 35%, transparent), transparent 70%),
    var(--bg-raised);
  padding: 22px;
}
.picker__select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.picker__select select {
  appearance: none;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--line-strong);
  padding: 4px 0 10px;
  font-family: var(--serif);
  font-size: clamp(24px, 2.6vw, 34px);
  cursor: pointer;
  outline: none;
  width: 100%;
}
.picker__select select:focus {
  border-color: var(--gold);
}
.picker__select option {
  background: var(--bg-raised);
  font-family: var(--sans);
  font-size: 15px;
}
.picker__stage {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  margin: 20px 0 14px;
}
.picker__link {
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
.picker__link:hover {
  color: var(--gold);
}
.swap {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: var(--bg);
  font-size: 18px;
  cursor: pointer;
  transition: border-color 0.25s var(--ease), color 0.25s var(--ease);
}
.swap:hover {
  border-color: var(--gold);
  color: var(--gold);
}

.table {
  margin-top: 48px;
  border-top: 1px solid var(--line);
}
.row {
  display: grid;
  grid-template-columns: 1fr 200px 1fr;
  gap: 24px;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}
.label {
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.label small {
  display: block;
  letter-spacing: 0.06em;
  text-transform: none;
  font-size: 11px;
  margin-top: 2px;
}
.cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cell--a {
  align-items: flex-end;
  text-align: right;
}
.val {
  font-family: var(--serif);
  font-size: 26px;
  color: var(--text-muted);
  transition: color 0.3s var(--ease);
}
.win .val {
  color: var(--text);
}
.win .val::after {
  content: ' ●';
  font-size: 10px;
  vertical-align: middle;
  color: var(--gold);
}
.cell--a.win .val::after {
  content: '';
}
.cell--a.win .val::before {
  content: '● ';
  font-size: 10px;
  vertical-align: middle;
  color: var(--gold);
}
.bar {
  display: block;
  width: 100%;
  max-width: 360px;
  height: 2px;
  background: var(--line);
  overflow: hidden;
}
.bar span {
  display: block;
  height: 100%;
  background: var(--text-faint);
  transition: transform 0.8s var(--ease);
}
.cell--a .bar span {
  transform-origin: right;
}
.cell--b .bar span {
  transform-origin: left;
}
.win .bar span {
  background: var(--gold);
}
.row--text .cell {
  font-size: 14px;
  color: var(--text-muted);
}

@media (max-width: 720px) {
  .pickers {
    grid-template-columns: 1fr;
  }
  .swap {
    top: 50%;
  }
  .row {
    grid-template-columns: 1fr 1fr;
    gap: 6px 16px;
  }
  .label {
    grid-column: 1 / -1;
    grid-row: 1;
  }
  .val {
    font-size: 20px;
  }
}
</style>
