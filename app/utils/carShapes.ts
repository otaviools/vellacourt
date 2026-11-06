import type { CarShape } from '~/types/car'

/**
 * Geometria das silhuetas em vista lateral (viewBox 0 0 400 140).
 * O centro das rodas fica sempre em y = WHEEL_Y.
 */
export interface ShapeDef {
  body: string
  window: string
  wheels: [number, number]
  r: number
  head: [number, number]
  tail: [number, number]
  /** Ponto mais alto do teto (y) */
  top: number
  /** Extremidades traseira e dianteira (x) */
  x0: number
  x1: number
}

export const WHEEL_Y = 110

export const carShapes: Record<CarShape, ShapeDef> = {
  coupe: {
    body: 'M18 106 C18 94 24 88 40 84 L112 72 C130 60 152 46 178 40 C205 34 245 34 268 42 C290 50 306 62 318 72 L362 78 C380 81 388 90 388 102 L388 110 L18 110 Z',
    window: 'M132 72 C148 58 166 48 186 44 C208 40 236 40 256 46 C272 52 282 62 290 72 Z',
    wheels: [92, 312],
    r: 21,
    head: [374, 84],
    tail: [20, 92],
    top: 37,
    x0: 18,
    x1: 388,
  },
  sedan: {
    body: 'M14 104 C14 92 20 86 36 82 L98 72 C118 56 140 40 166 34 C196 28 252 28 278 36 C298 44 312 58 322 70 L366 76 C384 79 390 88 390 100 L390 110 L14 110 Z',
    window: 'M116 72 C134 56 152 44 174 40 C200 35 248 35 272 42 C288 50 298 60 306 72 Z',
    wheels: [84, 318],
    r: 21,
    head: [376, 82],
    tail: [16, 90],
    top: 31,
    x0: 14,
    x1: 390,
  },
  suv: {
    body: 'M14 108 L14 82 C14 72 22 66 38 64 L94 58 C112 40 130 26 150 22 C190 16 262 16 292 22 C312 28 326 42 336 56 L370 62 C384 65 390 74 390 88 L390 110 L14 110 Z',
    window: 'M112 58 C128 42 144 30 160 27 C196 22 258 22 284 28 C300 34 312 46 320 58 Z',
    wheels: [86, 318],
    r: 25,
    head: [376, 70],
    tail: [16, 72],
    top: 18,
    x0: 14,
    x1: 390,
  },
  hyper: {
    body: 'M12 104 C12 96 18 90 32 88 L130 74 C152 60 176 50 204 46 C232 42 262 46 286 56 C312 66 334 76 352 80 L378 84 C390 87 394 94 394 102 L394 110 L12 110 Z',
    window: 'M152 72 C170 60 190 52 212 50 C236 48 256 52 272 60 L252 72 Z',
    wheels: [88, 322],
    r: 20,
    head: [380, 88],
    tail: [14, 94],
    top: 46,
    x0: 12,
    x1: 394,
  },
}
