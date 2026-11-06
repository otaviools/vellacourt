<script setup lang="ts">
const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => (open.value = false))

const links = [
  { to: '/#catalogo', label: 'Catálogo' },
  { to: '/#manifesto', label: 'Manifesto' },
  { to: '/comparar', label: 'Comparar' },
]
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <nav class="nav" :class="{ 'nav--open': open }" aria-label="Navegação principal">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="nav__link"
          active-class=""
          exact-active-class=""
          :class="{ 'is-active': route.path === l.to }"
        >
          {{ l.label }}
        </NuxtLink>
      </nav>

      <NuxtLink to="/" class="logo" aria-label="Vellacourt, página inicial">
        <BrandLogo />
      </NuxtLink>

      <p class="header__meta mono">Coleção {{ new Date().getFullYear() }} · Nº 12</p>

      <button class="burger" type="button" :aria-expanded="open" aria-label="Abrir menu" @click="open = !open">
        <span /><span />
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--page-bg, var(--bg)) 82%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
  transition: background-color 0.8s var(--ease);
}
.header__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 72px;
}
.logo {
  grid-column: 2;
  grid-row: 1;
}
.nav {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  gap: 32px;
}
.nav__link {
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
  transition: color 0.25s var(--ease);
}
.nav__link:hover,
.nav__link.is-active {
  color: var(--text);
}
.header__meta {
  grid-column: 3;
  grid-row: 1;
  justify-self: end;
  margin: 0;
  color: var(--text-faint);
}
.burger {
  display: none;
  width: 40px;
  height: 40px;
  background: none;
  border: 0;
  cursor: pointer;
  position: relative;
  grid-column: 3;
  grid-row: 1;
  justify-self: end;
}
.burger span {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 1px;
  background: var(--text);
  transition: transform 0.3s var(--ease);
}
.burger span:first-child {
  top: 16px;
}
.burger span:last-child {
  top: 23px;
}
.burger[aria-expanded='true'] span:first-child {
  transform: translateY(3.5px) rotate(45deg);
}
.burger[aria-expanded='true'] span:last-child {
  transform: translateY(-3.5px) rotate(-45deg);
}

@media (max-width: 860px) {
  .header__inner {
    grid-template-columns: auto 1fr;
  }
  .logo {
    grid-column: 1;
  }
  .header__meta {
    display: none;
  }
  .burger {
    display: block;
    grid-column: 2;
  }
  .nav {
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    background: var(--page-bg, var(--bg));
    border-bottom: 1px solid var(--line);
    padding: 8px var(--gutter) 20px;
    display: none;
  }
  .nav--open {
    display: flex;
  }
  .nav__link {
    padding: 14px 0;
    font-size: 14px;
    border-bottom: 1px solid var(--line);
  }
}
</style>
