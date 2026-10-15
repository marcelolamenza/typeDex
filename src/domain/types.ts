export const POKEMON_TYPES = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison',
  'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
] as const

export type PokemonType = (typeof POKEMON_TYPES)[number]
export const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
export type Generation = (typeof GENERATIONS)[number]
export type Multiplier = 0 | 0.25 | 0.5 | 1 | 2 | 4
export type TypeChart = Readonly<Partial<Record<PokemonType, Readonly<Partial<Record<PokemonType, Multiplier>>>>>>
