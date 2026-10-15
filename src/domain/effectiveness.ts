import { getTypesForGeneration, TYPE_CHARTS } from '../data/typeCharts'
import type { Generation, Multiplier, PokemonType } from './types'

export function getMultiplier(
  attackingType: PokemonType,
  defendingTypes: readonly PokemonType[],
  generation: Generation = 9,
): Multiplier {
  const chart = TYPE_CHARTS[generation]
  const result = defendingTypes.reduce<number>((total, defendingType) => {
    const multiplier = chart[attackingType]?.[defendingType]
    if (multiplier === undefined) {
      throw new RangeError(`${attackingType} or ${defendingType} is not available in generation ${generation}`)
    }
    return total * multiplier
  }, 1)
  return result as Multiplier
}

export function getOffensiveTargets(
  attackingType: PokemonType,
  generation: Generation = 9,
): PokemonType[] {
  return getOffensiveMatchups(attackingType, generation)
    .filter(({ multiplier }) => multiplier === 2)
    .map(({ type }) => type)
}

export function getOffensiveMatchups(
  attackingType: PokemonType,
  generation: Generation = 9,
): { type: PokemonType; multiplier: Multiplier }[] {
  return getTypesForGeneration(generation)
    .map((defendingType) => ({
      type: defendingType,
      multiplier: getMultiplier(attackingType, [defendingType], generation),
    }))
    .filter(({ multiplier }) => multiplier !== 1)
}

export function getDefensiveMatchups(
  defendingType: PokemonType,
  generation: Generation = 9,
): Record<Multiplier, PokemonType[]> {
  return getDefensiveMatchupsForTypes([defendingType], generation)
}

export function getDefensiveMatchupsForTypes(
  defendingTypes: readonly PokemonType[],
  generation: Generation = 9,
): Record<Multiplier, PokemonType[]> {
  const result: Record<Multiplier, PokemonType[]> = { 0: [], 0.25: [], 0.5: [], 1: [], 2: [], 4: [] }
  for (const attackingType of getTypesForGeneration(generation)) {
    result[getMultiplier(attackingType, defendingTypes, generation)].push(attackingType)
  }
  return result
}
