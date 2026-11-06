<script setup lang="ts">
import { gsap } from 'gsap'

const props = withDefaults(
  defineProps<{
    value: number
    decimals?: number
    /** Valor de partida da contagem (ex.: 10 s para o 0–100 contar para baixo) */
    from?: number
    /** Dispara a contagem quando vira true */
    play?: boolean
    duration?: number
  }>(),
  { decimals: 0, from: 0, play: false, duration: 2 },
)

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: props.decimals, maximumFractionDigits: props.decimals })

// No servidor e sem JS, mostra o valor final
const shown = ref(fmt(props.value))
const state = { v: props.value }
let tween: gsap.core.Tween | undefined

function run(start: number) {
  tween?.kill()
  state.v = start
  tween = gsap.to(state, {
    v: props.value,
    duration: props.duration,
    ease: 'expo.out',
    onUpdate: () => (shown.value = fmt(state.v)),
  })
}

onMounted(() => {
  if (prefersReducedMotion()) return
  if (props.play) return run(props.from)
  state.v = props.from
  shown.value = fmt(props.from)
})
watch(
  () => props.play,
  (p) => p && !prefersReducedMotion() && run(props.from),
)
watch(
  () => props.value,
  () => (prefersReducedMotion() ? (shown.value = fmt(props.value)) : run(state.v)),
)
onBeforeUnmount(() => tween?.kill())
</script>

<template>
  <span class="count">{{ shown }}</span>
</template>

<style scoped>
.count {
  font-variant-numeric: tabular-nums;
}
</style>
