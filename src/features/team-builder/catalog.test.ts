import { describe, expect, it } from 'vitest'
import { filterPokemon, POKEMON_CATALOG, validateCatalog } from './catalog'

describe('Pokémon catalog', () => {
  it('contains one valid standard entry for every National Pokédex number through 1025', () => {
    expect(POKEMON_CATALOG).toHaveLength(1025)
    expect(validateCatalog(POKEMON_CATALOG)).toEqual([])
    expect(new Set(POKEMON_CATALOG.map(({ id }) => id)).size).toBe(1025)
    expect(POKEMON_CATALOG.map(({ dexNumber }) => dexNumber)).toEqual(Array.from({ length: 1025 }, (_, index) => index + 1))
  })

  it('searches by name or Pokédex number and combines generation filtering', () => {
    expect(filterPokemon(POKEMON_CATALOG, 'pikachu', 'all').map(({ name }) => name)).toEqual(['Pikachu'])
    expect(filterPokemon(POKEMON_CATALOG, '#25', 'all').map(({ name }) => name)).toEqual(['Pikachu'])
    expect(filterPokemon(POKEMON_CATALOG, 'char', 1).map(({ name }) => name)).toEqual(['Charmander', 'Charmeleon', 'Charizard'])
    expect(filterPokemon(POKEMON_CATALOG, 'char', 2)).toEqual([])
  })
})
