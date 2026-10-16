import pokemonData from './data/pokemon.json'
import { GENERATIONS, POKEMON_TYPES, type Generation, type PokemonType } from '../../domain/types'

export type Pokemon = {
  id: number
  dexNumber: number
  name: string
  types: readonly PokemonType[]
  generation: Generation
  imageUrl: string
}

export const POKEMON_CATALOG = pokemonData as Pokemon[]
export const CATALOG_PAGE_SIZE = 48

export function filterPokemon(catalog: readonly Pokemon[], query: string, generation: Generation | 'all'): Pokemon[] {
  const normalized = query.trim().toLocaleLowerCase()
  const dexNumberQuery = normalized.replace(/^#/, '')
  const isDexNumber = /^\d+$/.test(dexNumberQuery)
  return catalog.filter((pokemon) => {
    if (generation !== 'all' && pokemon.generation !== generation) return false
    if (!normalized) return true
    return isDexNumber
      ? pokemon.dexNumber === Number(dexNumberQuery)
      : pokemon.name.toLocaleLowerCase().includes(normalized)
  })
}

export function validateCatalog(catalog: readonly Pokemon[]): string[] {
  const errors: string[] = []
  const ids = new Set<number>()
  const dexNumbers = new Set<number>()
  for (const pokemon of catalog) {
    if (!Number.isInteger(pokemon.id) || pokemon.id < 1 || ids.has(pokemon.id)) errors.push(`Invalid or duplicate id: ${pokemon.id}`)
    if (!Number.isInteger(pokemon.dexNumber) || pokemon.dexNumber < 1 || pokemon.dexNumber > 1025 || dexNumbers.has(pokemon.dexNumber)) errors.push(`Invalid or duplicate Pokédex number: ${pokemon.dexNumber}`)
    if (!pokemon.name.trim()) errors.push(`Missing name for id ${pokemon.id}`)
    if (pokemon.types.length < 1 || pokemon.types.length > 2 || pokemon.types.some((type) => !POKEMON_TYPES.includes(type))) errors.push(`Invalid types for ${pokemon.name}`)
    if (!GENERATIONS.includes(pokemon.generation)) errors.push(`Invalid generation for ${pokemon.name}`)
    if (!/^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/master\/sprites\/pokemon\/\d+\.png$/.test(pokemon.imageUrl)) errors.push(`Invalid image reference for ${pokemon.name}`)
    ids.add(pokemon.id)
    dexNumbers.add(pokemon.dexNumber)
  }
  return errors
}
