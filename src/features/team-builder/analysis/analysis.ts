import { getMultiplier } from '../../../domain/effectiveness'
import { getTypesForGeneration } from '../../../data/typeCharts'
import type { Generation, Multiplier, PokemonType } from '../../../domain/types'
import type { Pokemon } from '../catalog'

export type IndividualAnalysis = Record<Multiplier, PokemonType[]>
export type TeamTypeCoverage = {
  type: PokemonType
  counts: Record<Multiplier, number>
  affected: { pokemon: Pokemon; multiplier: 2 | 4 }[]
}

export function analyzePokemon(pokemon: Pokemon, generation: Generation = 9): IndividualAnalysis {
  const result: IndividualAnalysis = { 0: [], 0.25: [], 0.5: [], 1: [], 2: [], 4: [] }
  for (const attackingType of getTypesForGeneration(generation)) {
    result[getMultiplier(attackingType, pokemon.types, generation)].push(attackingType)
  }
  return result
}

export function analyzeTeam(team: readonly Pokemon[], generation: Generation = 9) {
  const attackingTypes = getTypesForGeneration(generation)
  const defensive: TeamTypeCoverage[] = attackingTypes.map((type) => {
    const counts: Record<Multiplier, number> = { 0: 0, 0.25: 0, 0.5: 0, 1: 0, 2: 0, 4: 0 }
    const affected: TeamTypeCoverage['affected'] = []
    for (const pokemon of team) {
      const multiplier = getMultiplier(type, pokemon.types, generation)
      counts[multiplier] += 1
      if (multiplier === 2 || multiplier === 4) affected.push({ pokemon, multiplier })
    }
    return { type, counts, affected }
  })
  const offensive = attackingTypes.map((type) => ({
    type,
    targets: attackingTypes.filter((defendingType) => getMultiplier(type, [defendingType], generation) === 2),
    suppliedBy: team.filter((pokemon) => pokemon.types.includes(type)),
  })).filter((entry) => entry.suppliedBy.length > 0)
  const sharedWeaknesses = defensive.filter(({ affected }) => affected.length > 1)
    .sort((a, b) => b.affected.length - a.affected.length || a.type.localeCompare(b.type))
  const strongCoverage = defensive.filter(({ counts }) => counts[0] + counts[0.25] + counts[0.5] > 0)
    .sort((a, b) => (b.counts[0] + b.counts[0.25] + b.counts[0.5]) - (a.counts[0] + a.counts[0.25] + a.counts[0.5]))
  const defensiveGaps = defensive.filter(({ counts }) => counts[2] + counts[4] >= 2 && counts[0] + counts[0.25] + counts[0.5] === 0)
    .sort((a, b) => (b.counts[2] + b.counts[4]) - (a.counts[2] + a.counts[4]))
  return { defensive, offensive, sharedWeaknesses, strongCoverage, defensiveGaps }
}
