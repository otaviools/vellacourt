<script setup lang="ts">
import type { Car } from '~/types/car'

defineProps<{ car: Car; index?: number }>()
const carEl = ref<HTMLElement>()
</script>

<template>
  <NuxtLink
    :to="`/carros/${car.slug}`"
    class="card"
    :style="{ '--paint': car.paint.hex }"
    @click="markCarTransition(carEl)"
  >
    <div class="card__stage">
      <span v-if="index !== undefined" class="card__index">{{ String(index + 1).padStart(2, '0') }}</span>
      <span class="card__cat">{{ car.category }}</span>
      <span v-if="car.limited" class="ltd card__ltd">{{ car.limited }} unidades</span>
      <div ref="carEl" class="card__car">
        <CarPhoto :car="car" sizes="(max-width: 620px) 100vw, (max-width: 1024px) 50vw, 33vw" />
      </div>
    </div>

    <div class="card__body">
      <p class="eyebrow">{{ car.brand }} · {{ car.year }}</p>
      <h3 class="card__title display">{{ car.model }}</h3>
      <p class="card__tagline">{{ car.tagline }}</p>

      <dl class="card__stats">
        <div>
          <dt>Potência</dt>
          <dd>{{ formatNumber(car.specs.powerHp) }} <small>cv</small></dd>
        </div>
        <div>
          <dt>0–100</dt>
          <dd>{{ car.specs.acceleration.toLocaleString('pt-BR') }} <small>s</small></dd>
        </div>
        <div>
          <dt>Máx.</dt>
          <dd>{{ car.specs.topSpeed }} <small>km/h</small></dd>
        </div>
      </dl>

      <div class="card__foot">
        <span class="card__price">{{ formatPriceShort(car.priceBRL) }}</span>
        <span class="card__more">Ver ficha <span aria-hidden="true">→</span></span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  background: var(--bg-raised);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.4s var(--ease), transform 0.4s var(--ease);
}
.card:hover {
  border-color: var(--line-strong);
  transform: translateY(-3px);
}
.card__stage {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--line);
}
.card__stage::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(14, 12, 10, 0.55), transparent 30%, transparent 70%, rgba(14, 12, 10, 0.5));
  pointer-events: none;
}
.card__car {
  width: 100%;
  height: 100%;
  transition: transform 1.1s var(--ease);
}
.card:hover .card__car {
  transform: scale(1.06);
}
.card__index,
.card__cat,
.card__ltd {
  position: absolute;
  z-index: 1;
}
.card__index {
  top: 16px;
  left: 18px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ivory);
}
.card__cat {
  top: 14px;
  right: 16px;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ivory);
  border: 1px solid rgba(239, 230, 214, 0.4);
  border-radius: 999px;
  padding: 4px 10px;
  backdrop-filter: blur(6px);
}
.card__ltd {
  left: 18px;
  bottom: 16px;
  background: rgba(14, 12, 10, 0.55);
  backdrop-filter: blur(6px);
}
.card__body {
  padding: 24px 22px 22px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.card__title {
  font-size: 34px;
  margin: 6px 0 8px;
}
.card__tagline {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 22px;
}
.card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0 0 22px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.card__stats div {
  padding: 12px 0;
}
.card__stats div + div {
  padding-left: 14px;
  border-left: 1px solid var(--line);
}
.card__stats dt {
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.card__stats dd {
  margin: 2px 0 0;
  font-size: 17px;
  font-weight: 500;
}
.card__stats small {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
}
.card__foot {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card__price {
  font-family: var(--serif);
  font-size: 22px;
}
.card__more {
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  transition: color 0.3s var(--ease);
}
.card:hover .card__more {
  color: var(--gold);
}
</style>
