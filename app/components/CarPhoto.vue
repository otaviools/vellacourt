<script setup lang="ts">
import type { Car } from '~/types/car'

/**
 * Foto real do carro (Wikimedia Commons), servida de /public/cars em WebP.
 * Preenche o contêiner com object-fit: cover.
 */
const props = withDefaults(
  defineProps<{
    car: Car
    /** atributo sizes do srcset */
    sizes?: string
    /** carrega já (hero, palco) em vez de sob demanda */
    eager?: boolean
  }>(),
  { sizes: '(max-width: 960px) 100vw, 50vw', eager: false },
)

const base = computed(() => `/cars/${props.car.slug}`)
const srcset = computed(() => `${base.value}-960.webp 960w, ${base.value}-1920.webp 1920w`)
const alt = computed(() => `${props.car.brand} ${props.car.model} na cor ${props.car.paint.name}`)
</script>

<template>
  <img
    class="car-photo"
    :src="`${base}-1920.webp`"
    :srcset="srcset"
    :sizes="sizes"
    :alt="alt"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : 'auto'"
    decoding="async"
    width="1920"
    height="1080"
    :style="{ objectPosition: car.photo.focus ?? '50% 58%' }"
  />
</template>

<style scoped>
.car-photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
