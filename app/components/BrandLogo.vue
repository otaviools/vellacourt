<script setup lang="ts">
/**
 * Marca Vellacourt: monograma "V" em traço fino dentro de um aro duplo com
 * marcações de luneta (relojoaria / painel), ao lado do nome em versalete espaçado.
 */
withDefaults(defineProps<{ variant?: 'full' | 'mark'; tagline?: boolean }>(), {
  variant: 'full',
  tagline: false,
})

const ticks = Array.from({ length: 12 }, (_, i) => i * 30)
</script>

<template>
  <span class="brand" :class="`brand--${variant}`">
    <svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" stroke-width="0.8" />
      <circle cx="20" cy="20" r="15.5" fill="none" stroke="currentColor" stroke-width="0.5" />
      <line
        v-for="a in ticks"
        :key="a"
        x1="20"
        y1="1.6"
        x2="20"
        :y2="a % 90 === 0 ? 4.6 : 3.4"
        stroke="currentColor"
        stroke-width="0.6"
        :transform="`rotate(${a} 20 20)`"
      />
      <!-- V: duas hastes de espessuras diferentes, como num Didone -->
      <path d="M12.2 12.5 L20 28.6 L27.8 12.5" fill="none" stroke="currentColor" stroke-width="0.7" />
      <path d="M12.2 12.5 L20 28.6" fill="none" stroke="currentColor" stroke-width="2.1" />
      <path d="M10.6 12.5 H14.2 M25.8 12.5 H29.4" stroke="currentColor" stroke-width="0.7" />
      <path d="M20 8.2 L21.1 9.6 L20 11 L18.9 9.6 Z" fill="var(--champagne)" />
    </svg>
    <span v-if="variant === 'full'" class="brand__text">
      <span class="brand__name">Vellacourt</span>
      <span v-if="tagline" class="brand__tagline">Maison de Collection Automobile</span>
    </span>
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--ivory);
}
.brand__mark {
  width: 34px;
  height: 34px;
  flex: none;
}
.brand__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}
.brand__name {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 500;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  /* compensa o espaçamento da última letra */
  margin-right: -0.34em;
  line-height: 1;
}
.brand__tagline {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}
</style>
