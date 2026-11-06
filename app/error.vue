<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)

const goHome = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="shell">
    <AppHeader />
    <main class="container err">
      <p class="eyebrow">Erro {{ error.statusCode }}</p>
      <h1 class="display err__title">
        {{ is404 ? 'Este modelo saiu' : 'Algo saiu' }} <em>da pista.</em>
      </h1>
      <p class="err__text">
        {{ is404 ? 'A página que você procura não existe ou foi removida do catálogo.' : error.statusMessage }}
      </p>
      <button type="button" class="btn btn--solid" @click="goHome">Voltar ao catálogo</button>
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.err {
  flex: 1;
  padding-top: clamp(80px, 12vw, 160px);
}
.err__title {
  font-size: clamp(48px, 8vw, 110px);
  margin: 16px 0 24px;
}
.err__text {
  color: var(--text-muted);
  max-width: 480px;
  margin: 0 0 32px;
}
</style>
