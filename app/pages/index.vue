<script setup lang="ts">
import type { CarCategory } from '~/types/car'
import type { SortKey } from '~/composables/useCars'

useSeoMeta({
  title: 'Vellacourt — Maison de Collection Automobile',
  description: 'História, ficha técnica e características dos automóveis mais exclusivos do mundo.',
})

const { all, filter } = useCars()

const query = ref('')
const category = ref<CarCategory | null>(null)
const sort = ref<SortKey>('destaque')
const view = ref<'indice' | 'grade'>('indice')

const results = computed(() =>
  filter({ query: query.value, category: category.value, sort: sort.value }),
)

const countFor = (c: CarCategory) => all.filter((car) => car.category === c).length

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'destaque', label: 'Destaque' },
  { value: 'preco-desc', label: 'Maior preço' },
  { value: 'preco-asc', label: 'Menor preço' },
  { value: 'potencia', label: 'Mais potente' },
  { value: 'aceleracao', label: 'Mais rápido no 0–100' },
  { value: 'ano', label: 'Mais recente' },
]

const brands = computed(() => new Set(all.map((c) => c.brand)).size)
const totalHp = computed(() => all.reduce((s, c) => s + c.specs.powerHp, 0))

const reset = () => {
  query.value = ''
  category.value = null
  sort.value = 'destaque'
}
</script>

<template>
  <div>
    <HeroShowcase />

    <div class="container">
      <dl class="stats">
        <div><dt>Modelos</dt><dd>{{ all.length }}</dd></div>
        <div><dt>Marcas</dt><dd>{{ brands }}</dd></div>
        <div><dt>Cavalos somados</dt><dd>{{ formatNumber(totalHp) }}</dd></div>
        <div><dt>Mais antigo legado</dt><dd>1909</dd></div>
      </dl>
    </div>

    <SpecMarquee />

    <!-- CATÁLOGO -->
    <section id="catalogo" class="catalog">
      <div class="container">
        <header class="catalog__head">
          <div>
            <p class="eyebrow">O catálogo</p>
            <h2 class="display catalog__title">Escolha pela <em>emoção</em>,<br />confirme pelos números.</h2>
          </div>

          <div class="controls">
            <label class="search">
              <span class="sr-only">Buscar</span>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.5" />
                <path d="M20 20l-4-4" stroke="currentColor" stroke-width="1.5" />
              </svg>
              <input v-model="query" type="search" placeholder="Marca, modelo ou país" />
            </label>
            <label class="select">
              <span class="sr-only">Ordenar por</span>
              <select v-model="sort">
                <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
            </label>
          </div>
        </header>

        <div class="toolbar">
          <div class="chips" role="group" aria-label="Filtrar por categoria">
            <button
              type="button"
              class="chip"
              :class="{ 'chip--on': category === null }"
              :aria-pressed="category === null"
              @click="category = null"
            >
              Todos <span>{{ all.length }}</span>
            </button>
            <button
              v-for="c in categories"
              :key="c"
              type="button"
              class="chip"
              :class="{ 'chip--on': category === c }"
              :aria-pressed="category === c"
              @click="category = category === c ? null : c"
            >
              {{ c }} <span>{{ countFor(c) }}</span>
            </button>
          </div>

          <div class="views" role="group" aria-label="Modo de visualização">
            <button type="button" :aria-pressed="view === 'indice'" @click="view = 'indice'">Índice</button>
            <button type="button" :aria-pressed="view === 'grade'" @click="view = 'grade'">Grade</button>
          </div>
        </div>

        <template v-if="results.length">
          <CatalogIndex v-if="view === 'indice'" :cars="results" />
          <TransitionGroup v-else tag="div" name="grid" class="grid">
            <CarCard v-for="(car, i) in results" :key="car.slug" :car="car" :index="i" />
          </TransitionGroup>
        </template>

        <div v-else class="empty">
          <p class="display">Nenhum modelo encontrado.</p>
          <p>Tente outra busca ou limpe os filtros.</p>
          <button type="button" class="btn" @click="reset">Limpar filtros</button>
        </div>
      </div>
    </section>

    <!-- MANIFESTO -->
    <section id="manifesto" class="manifesto">
      <div class="container manifesto__grid">
        <p class="eyebrow">Manifesto</p>
        <blockquote class="display manifesto__quote">
          Um carro de luxo não é medido apenas em cavalos ou segundos. É medido nas horas de trabalho
          manual, nas décadas de linhagem e na <em>teimosia</em> de quem se recusou a fazer igual.
        </blockquote>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  border-bottom: 1px solid var(--line);
}
.stats div {
  padding: 28px 0 28px 24px;
}
.stats div:first-child {
  padding-left: 0;
}
.stats div + div {
  border-left: 1px solid var(--line);
}
.stats dt {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.stats dd {
  margin: 6px 0 0;
  font-family: var(--serif);
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1;
}

/* CATÁLOGO */
.catalog {
  padding: clamp(80px, 10vw, 140px) 0 0;
  scroll-margin-top: 60px;
}
.catalog__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 36px;
}
.catalog__title {
  font-size: clamp(38px, 5vw, 68px);
  margin-top: 14px;
}
.controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.search,
.select {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  color: var(--text-muted);
}
.search:focus-within,
.select:focus-within {
  border-color: var(--gold);
}
.search input,
.select select {
  background: transparent;
  border: 0;
  outline: none;
  color: var(--text);
  font-size: 14px;
}
.search input {
  width: 200px;
}
.select select {
  cursor: pointer;
  appearance: none;
  padding-right: 4px;
}
.select select option {
  background: var(--bg-raised);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 36px;
}
.chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  border: 1px solid var(--line);
  background: transparent;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.25s var(--ease);
}
.chip span {
  color: var(--text-faint);
  margin-left: 4px;
  font-size: 11px;
}
.chip:hover {
  border-color: var(--line-strong);
  color: var(--text);
}
.chip--on {
  background: var(--text);
  border-color: var(--text);
  color: var(--bg);
}
.chip--on span {
  color: var(--bg);
  opacity: 0.6;
}

.views {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
}
.views button {
  border: 0;
  background: transparent;
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.3s var(--ease), color 0.3s var(--ease);
}
.views button[aria-pressed='true'] {
  background: var(--text);
  color: var(--bg);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.grid-move,
.grid-enter-active {
  transition: all 0.45s var(--ease);
}
.grid-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.grid-leave-active {
  display: none;
}

.empty {
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius);
  padding: 64px 24px;
  text-align: center;
  color: var(--text-muted);
}
.empty .display {
  font-size: 36px;
  color: var(--text);
}

/* MANIFESTO */
/* Seção clara em marfim: respiro e contraste (referência: KOBU) */
.manifesto {
  margin-top: clamp(100px, 12vw, 180px);
  padding: clamp(80px, 10vw, 150px) 0;
  background: var(--ivory);
  color: var(--noir);
  scroll-margin-top: 72px;
}
.manifesto .eyebrow {
  color: var(--bordeaux);
}
.manifesto :deep(em),
.manifesto__quote em {
  color: var(--bordeaux);
}
.manifesto__grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
}
.manifesto__quote {
  margin: 0;
  font-size: clamp(30px, 3.6vw, 52px);
  line-height: 1.12;
  max-width: 980px;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 860px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats div:nth-child(3) {
    border-left: 0;
    padding-left: 0;
  }
  .stats div:nth-child(n + 3) {
    border-top: 1px solid var(--line);
  }
  .manifesto__grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 620px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .controls,
  .search {
    width: 100%;
  }
  .search input {
    width: 100%;
  }
}
</style>
