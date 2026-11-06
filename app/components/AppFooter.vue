<script setup lang="ts">
import { gsap } from 'gsap'

// "Vella" reto + "court" em itálico champagne, colados: um único nome com dois registros
const words = [
  { text: 'Vella', italic: false },
  { text: 'court', italic: true },
]
const links = [
  { to: '/#catalogo', label: 'Catálogo' },
  { to: '/comparar', label: 'Comparar' },
  { to: '/#manifesto', label: 'Manifesto' },
  { to: '/creditos', label: 'Créditos das fotos' },
]

const root = ref<HTMLElement>()
let ctx: gsap.Context | undefined

onMounted(() => {
  if (prefersReducedMotion()) return
  ctx = gsap.context(() => {
    gsap.fromTo(
      '.mark__char',
      { yPercent: 105 },
      {
        yPercent: 0,
        duration: 1.3,
        stagger: 0.06,
        ease: 'expo.out',
        scrollTrigger: { trigger: '.mark', start: 'top 92%', once: true },
      },
    )
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <footer ref="root" class="footer">
    <div class="container footer__top">
      <div class="footer__brand">
        <BrandLogo tagline />
        <p class="footer__note">
          Projeto de demonstração com marca fictícia. Dados, preços e especificações são mockados e
          aproximados. Fotos reais do Wikimedia Commons, sob licenças Creative Commons.
        </p>
      </div>
      <nav class="footer__links" aria-label="Rodapé">
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
      </nav>
      <p class="footer__copy mono">© {{ new Date().getFullYear() }} Vellacourt · Nuxt + TypeScript</p>
    </div>

    <!-- Marca em tamanho máximo (referências: Structured, BAGGU) -->
    <p class="mark display" aria-label="Vellacourt">
      <span v-for="w in words" :key="w.text" class="mark__word" :class="{ 'mark__word--italic': w.italic }" aria-hidden="true">
        <span v-for="(ch, i) in w.text" :key="i" class="mark__char">{{ ch }}</span>
      </span>
    </p>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  margin-top: 140px;
  padding-top: 40px;
  overflow: hidden;
}
.footer__top {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto auto;
  gap: 32px 56px;
  align-items: start;
}
.footer__brand {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.footer__note {
  max-width: 460px;
  color: var(--text-faint);
  font-size: 13px;
  margin: 0;
}
.footer__links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.footer__links a {
  font-family: var(--serif);
  font-size: 24px;
  line-height: 1.2;
  color: var(--text-muted);
  transition: color 0.3s var(--ease);
}
.footer__links a:hover {
  color: var(--text);
}
.footer__copy {
  color: var(--text-faint);
  margin: 0;
}

.mark {
  display: flex;
  justify-content: center;
  gap: 0;
  margin: clamp(32px, 6vw, 72px) 0 0;
  /* Calibrado no navegador: "Vellacourt" mede ≈ 4,02em em Newsreader → ~92% da largura */
  font-size: 22.8vw;
  line-height: 0.78;
  letter-spacing: -0.035em;
  white-space: nowrap;
  user-select: none;
}
.mark__word {
  display: inline-flex;
  overflow: hidden;
  padding: 0.02em 0 0.12em;
}
.mark__word--italic {
  font-style: italic;
  color: var(--gold);
}
.mark__char {
  display: inline-block;
  will-change: transform;
}

@media (max-width: 720px) {
  .footer__top {
    grid-template-columns: 1fr;
  }
}
</style>
