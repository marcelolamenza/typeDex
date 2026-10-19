import { getMultiplier } from './effectiveness'
import { getTypesForGeneration } from '../data/typeCharts'
import type { Generation, PokemonType } from './types'

/**
 * Finds directed 3-type super-effective cycles containing `selectedType`.
 * Results start with the selected type and use the requested generation's TypeDex chart.
 */
export function getTypeCycles(selectedType: PokemonType, generation: Generation = 9): PokemonType[][] {
  const generationTypes = getTypesForGeneration(generation)
  if (!generationTypes.includes(selectedType)) return []

  const candidates = generationTypes
  const cycles: PokemonType[][] = []

  function extend(path: PokemonType[]) {
    const lastType = path[path.length - 1]
    if (path.length === 3 && getMultiplier(lastType, [selectedType], generation) === 2) {
      cycles.push(path)
    }
    if (path.length === 3) return

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
