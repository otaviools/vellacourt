import { cars } from '~/data/cars'
import type { Car, CarCategory } from '~/types/car'

export type SortKey = 'destaque' | 'preco-desc' | 'preco-asc' | 'potencia' | 'aceleracao' | 'ano'

export const categories: CarCategory[] = [
  'Hipercarro',
  'Superesportivo',
  'Grand Tourer',
  'Sedã de luxo',
  'SUV',
]

const sorters: Record<SortKey, (a: Car, b: Car) => number> = {
  destaque: () => 0,
  'preco-desc': (a, b) => b.priceBRL - a.priceBRL,
  'preco-asc': (a, b) => a.priceBRL - b.priceBRL,
  potencia: (a, b) => b.specs.powerHp - a.specs.powerHp,
  aceleracao: (a, b) => a.specs.acceleration - b.specs.acceleration,
  ano: (a, b) => b.year - a.year,
}

export function useCars() {
  const all = cars

  const bySlug = (slug: string): Car | undefined => all.find((c) => c.slug === slug)

  const filter = (opts: { query?: string; category?: CarCategory | null; sort?: SortKey }): Car[] => {
    const q = (opts.query ?? '').trim().toLowerCase()
    return all
      .filter((c) => !opts.category || c.category === opts.category)
      .filter((c) => !q || `${c.brand} ${c.model} ${c.country}`.toLowerCase().includes(q))
      .slice()
      .sort(sorters[opts.sort ?? 'destaque'])
  }

  const related = (car: Car, limit = 3): Car[] =>
    all
      .filter((c) => c.slug !== car.slug)
      .sort((a, b) => Number(b.category === car.category) - Number(a.category === car.category))
      .slice(0, limit)

  const neighbours = (car: Car) => {
    const i = all.findIndex((c) => c.slug === car.slug)
    return {
      prev: all[(i - 1 + all.length) % all.length]!,
      next: all[(i + 1) % all.length]!,
    }
  }

  /** Valores máximos do catálogo, usados para normalizar barras de comparação */
  const max = {
    powerHp: Math.max(...all.map((c) => c.specs.powerHp)),
    torqueNm: Math.max(...all.map((c) => c.specs.torqueNm)),
    topSpeed: Math.max(...all.map((c) => c.specs.topSpeed)),
    weightKg: Math.max(...all.map((c) => c.specs.weightKg)),
    acceleration: Math.max(...all.map((c) => c.specs.acceleration)),
  }

  return { all, bySlug, filter, related, neighbours, max }
}

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})
const num = new Intl.NumberFormat('pt-BR')

export const formatPrice = (v: number) => brl.format(v)
export const formatNumber = (v: number) => num.format(v)
export const formatPriceShort = (v: number) =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
    : formatPrice(v)
