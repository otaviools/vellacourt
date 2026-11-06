// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
  },
  experimental: {
    // Transição nativa entre páginas: o carro "voa" do catálogo para a ficha.
    // Respeita prefers-reduced-motion por padrão.
    viewTransition: true,
  },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Vellacourt — Maison de Collection Automobile',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Vellacourt: catálogo editorial de automóveis de luxo, com história, ficha técnica e características.',
        },
        { name: 'theme-color', content: '#0e0c0a' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&family=IBM+Plex+Mono:wght@400;500&family=Jost:wght@300;400;500&display=swap',
        },
      ],
    },
    pageTransition: false,
  },
})
