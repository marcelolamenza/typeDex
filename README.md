# TypeDex

A responsive Pokémon type effectiveness checker built with React, TypeScript, Vite, Vitest, and React Testing Library. Select any available type to see offensive and defensive matchups, or add a second defender to calculate combined multipliers.

## Development

```sh
npm install
npm run dev
```

## Verification

```sh
npm test
npm run typecheck
npm run build
```

## Type chart data

The chart is a complete explicit dataset in `src/data/typeCharts.ts`. Every attacking row contains a value for every defending type in that generation. The data is grouped only where chart rules are identical: Generation I; Generations II–V; and Generations VI–IX. `src/domain/effectiveness.ts` contains pure calculations and has no UI dependencies. Dual-type multipliers are the product of both defending type modifiers.

The chart was checked against [Bulbapedia's type chart](https://bulbapedia.bulbagarden.net/wiki/Type_chart) and [Pokémon Database's historical charts](https://pokemondb.net/type/old). Generation I has 15 types. Dark and Steel are present from Generation II, which also changed several existing matchups. Fairy is present from Generation VI, when Steel stopped resisting Ghost and Dark. The selector uses each generation's available types and correct chart version. Abilities and other battle modifiers are outside the scope of this chart.

## Type icons

The SVG icons are saved locally in `public/type-icons/` and served by the app without runtime network requests. They are from the [official Pokémon type chart portal](https://sg.portal-pokemon.com/game/type-chart/). The filenames map to the type names. Pokémon and its marks are the property of their respective owners.
