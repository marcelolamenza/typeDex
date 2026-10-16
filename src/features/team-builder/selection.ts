import type { Pokemon } from './catalog'

export const TEAM_SIZE = 6
export type Team = (number | null)[]

export function createEmptyTeam(): Team {
  return Array.from({ length: TEAM_SIZE }, () => null)
}

export function addPokemon(team: Team, pokemonId: number, replaceIndex: number | null = null): Team {
  if (team.includes(pokemonId)) return team
  if (replaceIndex !== null) {
    if (replaceIndex < 0 || replaceIndex >= TEAM_SIZE || team[replaceIndex] === null) return team
    const next = [...team]
    next[replaceIndex] = pokemonId
    return next
  }
  const emptyIndex = team.indexOf(null)
  if (emptyIndex === -1) return team
  const next = [...team]
  next[emptyIndex] = pokemonId
  return next
}

export function removePokemon(team: Team, slot: number): Team {
  if (slot < 0 || slot >= TEAM_SIZE || team[slot] === null) return team
  const next = [...team]
  next[slot] = null
  return next
}

export function selectedPokemon(team: Team, catalog: readonly Pokemon[]): (Pokemon | null)[] {
  const byId = new Map(catalog.map((pokemon) => [pokemon.id, pokemon]))
  return team.map((id) => id === null ? null : byId.get(id) ?? null)
}
