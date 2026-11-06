<script setup lang="ts">
const props = defineProps<{ year: number }>()

const digits = computed(() => String(props.year).padStart(4, '0').split('').map(Number))
const strip = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
</script>

<template>
  <span class="odo" role="img" :aria-label="`Ano ${year}`">
    <span v-for="(d, i) in digits" :key="i" class="odo__col" aria-hidden="true">
      <span class="odo__strip" :style="{ transform: `translateY(${-d}em)`, transitionDelay: `${i * 70}ms` }">
        <span v-for="n in strip" :key="n" class="odo__digit">{{ n }}</span>
      </span>
    </span>
  </span>
</template>

<style scoped>
.odo {
  display: inline-flex;
  font-family: var(--serif);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.odo__col {
  display: inline-block;
  height: 1em;
  overflow: hidden;
}
.odo__strip {
  display: flex;
  flex-direction: column;
  transition: transform 0.9s cubic-bezier(0.65, 0, 0.15, 1);
}
.odo__digit {
  display: block;
  height: 1em;
  text-align: center;
}
</style>
