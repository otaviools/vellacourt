<script setup lang="ts">
useSeoMeta({
  title: 'Créditos das fotos — Vellacourt',
  description: 'Autores e licenças das fotografias usadas no catálogo Vellacourt.',
})

const { all } = useCars()
</script>

<template>
  <div class="container page">
    <p class="mono eyebrow-mono">Créditos</p>
    <h1 class="display title">Fotografias</h1>
    <p class="lead">
      Todas as fotos dos carros vêm do Wikimedia Commons e são usadas sob licenças Creative Commons, que
      permitem o uso com atribuição ao autor. As imagens foram redimensionadas e convertidas para WebP.
      Vellacourt é uma marca fictícia, sem relação com os fabricantes.
    </p>

    <ol class="list">
      <li v-for="car in all" :key="car.slug" class="item">
        <NuxtLink :to="`/carros/${car.slug}`" class="item__thumb" :aria-label="`${car.brand} ${car.model}`">
          <CarPhoto :car="car" sizes="160px" />
        </NuxtLink>
        <div class="item__body">
          <p class="item__car display">{{ car.brand }} {{ car.model }}</p>
          <p class="mono item__meta">
            Foto: {{ car.photo.author }} ·
            <a :href="car.photo.licenseUrl" target="_blank" rel="noopener">{{ car.photo.license }}</a> ·
            <a :href="car.photo.source" target="_blank" rel="noopener">arquivo original</a>
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.page {
  padding-top: clamp(48px, 7vw, 96px);
}
.eyebrow-mono {
  margin: 0;
  color: var(--champagne);
}
.title {
  font-size: clamp(54px, 8vw, 110px);
  margin: 14px 0 24px;
}
.lead {
  max-width: 640px;
  color: var(--text-muted);
  margin: 0 0 48px;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--line);
}
.item {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}
.item__thumb {
  flex: none;
  width: 160px;
  aspect-ratio: 3 / 2;
  overflow: hidden;
}
.item__car {
  font-size: clamp(22px, 2.4vw, 32px);
  margin: 0 0 6px;
}
.item__meta {
  margin: 0;
  color: var(--text-muted);
  text-transform: none;
}
.item__meta a {
  color: var(--champagne);
  text-decoration: underline;
  text-underline-offset: 3px;
}
@media (max-width: 620px) {
  .item__thumb {
    width: 104px;
  }
}
</style>
