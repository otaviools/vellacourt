# Vellacourt

Vellacourt, *Maison de Collection Automobile*, é um catálogo de automóveis de luxo feito com Nuxt 4 e TypeScript, só frontend. A marca é fictícia. Os dados são mockados em `app/data/cars.ts`; especificações, medidas, pinturas e preços são aproximados.

## Identidade

- **Logo** (`app/components/BrandLogo.vue`): monograma "V" de traço fino dentro de um aro duplo com marcações de luneta, mais o nome em versalete espaçado. Favicon em `public/favicon.svg`.
- **Tipografia**: Newsreader (títulos), Jost (texto) e IBM Plex Mono (rótulos técnicos), via Google Fonts.
- **Paleta** (tokens em `app/assets/css/main.css`): Noir fumé `#0e0c0a`, Ivoire `#efe6d6`, Champagne `#c3a274`, Bordeaux `#5b1c26`. Na ficha de cada carro, a pintura escolhida recolore o ambiente.
- Referências de marca e cor pesquisadas no Mobbin: KOBU, In Common With, Going, Lightship.

## Fotos

As fotos dos carros são reais, do [Wikimedia Commons](https://commons.wikimedia.org), sob licenças Creative Commons (CC BY e CC BY-SA). Ficam em `public/cars/<slug>-{960,1920}.webp`. Autor, licença e link de origem de cada uma estão no campo `photo` de `app/data/cars.ts`, aparecem na ficha de cada carro e na página `/creditos`. Para trocar uma foto, substitua os dois arquivos WebP e atualize o campo `photo` do carro.

## Como rodar

```bash
npm install
npm run dev
```

O site abre em `http://localhost:3000`.

Outros comandos:

- `npm run typecheck`: checagem de tipos (vue-tsc)
- `npm run generate`: gera o site estático em `.output/public`
- `npm run build`: build para produção

## Dependências de movimento

- **GSAP** (com ScrollTrigger): animações de entrada, rolagem e contadores.
- **Lenis**: rolagem suave, sincronizada com o ticker da GSAP em `app/plugins/gsap.client.ts`.
- **View Transitions** do Nuxt (`experimental.viewTransition`): o carro "voa" do catálogo para a ficha.

Com `prefers-reduced-motion: reduce`, o Lenis não é iniciado e as animações são trocadas por transições simples ou estados finais.

## Páginas

| Rota | Conteúdo |
| --- | --- |
| `/` | Abertura com nome gigante e troca de destaques, faixa rolante, catálogo em índice (com prévia que segue o cursor) ou grade, busca, filtro e ordenação |
| `/carros/[slug]` | Faixa na cor da pintura, palco com feixe de luz, números que contam, seletor de pintura, índice de capítulos, linha do tempo com odômetro, planta técnica, ficha técnica e barra fixa |
| `/comparar?a=&b=` | Comparação lado a lado de dois modelos, com o vencedor de cada métrica |
| `/creditos` | Autores e licenças das fotos |

## Estrutura

```
app/
  app.vue                   layout (header + página + footer)
  error.vue                 página de erro / 404
  assets/css/main.css       tokens de cor e tipografia, selo .ltd, view transitions
  plugins/gsap.client.ts    registro da GSAP e do Lenis
  components/
    AppHeader.vue           cabeçalho com a marca centralizada
    BrandLogo.vue           monograma e nome Vellacourt
    CarPhoto.vue            foto real do carro (srcset WebP)
    AppFooter.vue           rodapé com a marca em largura total
    HeroShowcase.vue        abertura com nome gigante e carro em movimento
    SpecMarquee.vue         faixa rolante que reage à velocidade da rolagem
    CatalogIndex.vue        catálogo em lista com prévia flutuante
    CarCard.vue             card da grade
    CarSilhouette.vue       silhueta SVG (prévia de pintura na ficha)
    CarBlueprint.vue        planta técnica que se desenha na rolagem
    CountUp.vue             número que conta até o valor final
    YearOdometer.vue        ano com dígitos girando
  composables/
    useCars.ts              busca, filtro, ordenação e formatadores
    useMotion.ts            view transitions, preferências de movimento, contraste de cor
  utils/carShapes.ts        geometria das silhuetas (coupe, sedan, suv, hyper)
  data/cars.ts              dados mockados (12 modelos)
  pages/
    index.vue
    comparar.vue
    carros/[slug].vue
    creditos.vue
  types/car.ts              tipos Car, CarSpecs, CarDimensions, Paint
```

## Adicionar um carro

Inclua um objeto no array de `app/data/cars.ts` seguindo o tipo `Car`:

- `slug` vira a URL.
- `shape` (`coupe`, `sedan`, `suv` ou `hyper`) define a silhueta e a planta técnica.
- `paint` é a pintura da foto e `paints` são as alternativas do seletor.
- `photo` traz autor, licença e origem da foto; os arquivos ficam em `public/cars/`.
- `dimensions` alimenta as cotas da planta técnica.
- `limited` (opcional) marca o carro como edição limitada, com o número de unidades.
