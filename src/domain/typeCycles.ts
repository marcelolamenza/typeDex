import { getMultiplier } from './effectiveness'
import { getTypesForGeneration } from '../data/typeCharts'
import type { Generation, PokemonType } from './types'

const EXCLUDED_TYPES = new Set<PokemonType>(['Fire', 'Grass', 'Water'])

/**
 * Finds directed 3- and 4-type super-effective cycles containing `selectedType`.
 * Fire, Grass, and Water are excluded to match the cycle set requested in TypeDex.
 */
export function getTypeCycles(selectedType: PokemonType, generation: Generation = 9): PokemonType[][] {
  const generationTypes = getTypesForGeneration(generation)
  if (!generationTypes.includes(selectedType) || EXCLUDED_TYPES.has(selectedType)) return []

  const candidates = generationTypes.filter((type) => !EXCLUDED_TYPES.has(type))
  const cycles: PokemonType[][] = []

  function extend(path: PokemonType[]) {
    const lastType = path[path.length - 1]
    if (path.length >= 3 && getMultiplier(lastType, [selectedType], generation) === 2) {
      cycles.push(path)
    }
    if (path.length === 4) return

    for (const nextType of candidates) {
      if (path.includes(nextType)) continue
      if (getMultiplier(lastType, [nextType], generation) === 2) {
        extend([...path, nextType])
      }
    }
  }

  extend([selectedType])
  return cycles.sort((a, b) => a.length - b.length)
}
