<script setup lang="ts">
import type { CarShape } from '~/types/car'

const props = defineProps<{
  shape: CarShape
  color: string
}>()

const def = computed(() => carShapes[props.shape])
const spokes = [0, 72, 144, 216, 288]
const uid = useId()
const paintId = `paint-${uid}`
const glossId = `gloss-${uid}`
const shadowId = `shadow-${uid}`
const clipId = `body-${uid}`
</script>

<template>
  <svg viewBox="0 0 400 140" role="img" :aria-label="`Silhueta de ${shape}`" class="silhouette">
    <defs>
      <linearGradient :id="paintId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="color" stop-opacity="0.85" />
        <stop offset="0.55" :stop-color="color" />
        <stop offset="1" stop-color="#000" stop-opacity="0.9" />
      </linearGradient>
      <linearGradient :id="glossId" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0" />
        <stop offset="0.45" stop-color="#fff" stop-opacity="0.22" />
        <stop offset="0.6" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
      <radialGradient :id="shadowId" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#000" stop-opacity="0.75" />
        <stop offset="1" stop-color="#000" stop-opacity="0" />
      </radialGradient>
      <clipPath :id="clipId">
        <path :d="def.body" />
      </clipPath>
    </defs>

    <ellipse cx="200" cy="124" rx="200" ry="12" :fill="`url(#${shadowId})`" />

    <path :d="def.body" :fill="`url(#${paintId})`" stroke="rgba(255,255,255,0.14)" stroke-width="0.8" />
    <path :d="def.body" :fill="`url(#${glossId})`" />
    <path :d="def.window" fill="#0a0a0c" opacity="0.85" />
    <path :d="def.window" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.8" />

    <rect :x="def.head[0]" :y="def.head[1]" width="12" height="3" rx="1.5" fill="#f4ecd8" opacity="0.9" />
    <rect :x="def.tail[0]" :y="def.tail[1]" width="9" height="3" rx="1.5" fill="#d23b2a" opacity="0.9" />

    <!-- Caixas de roda: escurecem só a carroceria, sem pintar o fundo -->
    <g :clip-path="`url(#${clipId})`">
      <circle v-for="x in def.wheels" :key="`well-${x}`" :cx="x" :cy="110" :r="def.r + 4" fill="#050505" />
    </g>

    <g v-for="x in def.wheels" :key="x" class="wheel">
      <circle :cx="x" :cy="110" :r="def.r" fill="#0d0d0e" />
      <circle :cx="x" :cy="110" :r="def.r * 0.66" fill="#1b1a19" stroke="#8a857c" stroke-width="1.2" />
      <line
        v-for="a in spokes"
        :key="a"
        :x1="x"
        :y1="110"
        :x2="x"
        :y2="110 - def.r * 0.6"
        stroke="#6f6a62"
        stroke-width="2.2"
        stroke-linecap="round"
        :transform="`rotate(${a} ${x} 110)`"
      />
      <circle :cx="x" :cy="110" :r="3" fill="#b9b2a5" />
    </g>
  </svg>
</template>

<style scoped>
.silhouette stop {
  transition: stop-color 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.silhouette {
  width: 100%;
  height: auto;
  overflow: visible;
}
</style>
