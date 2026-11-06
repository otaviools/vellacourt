export type CarCategory =
  | 'Grand Tourer'
  | 'Sedã de luxo'
  | 'SUV'
  | 'Superesportivo'
  | 'Hipercarro'

export type CarShape = 'coupe' | 'sedan' | 'suv' | 'hyper'

export interface CarSpecs {
  engine: string
  powerHp: number
  torqueNm: number
  /** 0–100 km/h, em segundos */
  acceleration: number
  /** km/h */
  topSpeed: number
  transmission: string
  drivetrain: string
  weightKg: number
}

export interface TimelineEntry {
  year: number
  event: string
}

export interface CarDimensions {
  lengthMm: number
  widthMm: number
  heightMm: number
  wheelbaseMm: number
}

export interface Paint {
  name: string
  hex: string
}

/** Foto real (Wikimedia Commons). Arquivos em /public/cars/<slug>-{960,1920}.webp */
export interface CarPhoto {
  author: string
  license: string
  licenseUrl: string
  /** Página do arquivo no Wikimedia Commons */
  source: string
  /** object-position para enquadrar o carro em recortes */
  focus?: string
}

export interface Car {
  slug: string
  brand: string
  model: string
  year: number
  country: string
  category: CarCategory
  shape: CarShape
  /** Preço estimado em reais (mock) */
  priceBRL: number
  photo: CarPhoto
  /** Pintura principal (a da foto) */
  paint: Paint
  /** Pinturas alternativas para o seletor da ficha (mock) */
  paints: Paint[]
  dimensions: CarDimensions
  tagline: string
  summary: string
  history: string[]
  timeline: TimelineEntry[]
  specs: CarSpecs
  features: string[]
  production: string
  /** Número de unidades quando a produção é limitada */
  limited?: number
}
