import { describe, expect, it } from 'vitest'
import { POKEMON_CATALOG } from './catalog'
import { addPokemon, createEmptyTeam, removePokemon, selectedPokemon, TEAM_SIZE } from './selection'

describe('team selection', () => {
  it('fills six fixed slots, blocks a seventh, and prevents duplicate species', () => {
    let team = createEmptyTeam()
    for (let id = 1; id <= TEAM_SIZE; id += 1) team = addPokemon(team, id)
    expect(team).toHaveLength(6)
    expect(addPokemon(team, 7)).toBe(team)
    expect(addPokemon(team, 1)).toBe(team)
  })

  it('removes or replaces a slot without changing other choices', () => {
    let team = createEmptyTeam()
    team = addPokemon(team, 1)
    team = addPokemon(team, 2)
    expect(addPokemon(team, 3, 0)).toEqual([3, 2, null, null, null, null])
    expect(removePokemon(team, 1)).toEqual([1, null, null, null, null, null])
  })

  it('keeps empty slots and resolves selected ids independently of images', () => {
    const team = addPokemon(createEmptyTeam(), 1)
    expect(team).toEqual([1, null, null, null, null, null])
    expect(selectedPokemon(team, POKEMON_CATALOG).map((pokemon) => pokemon?.name ?? null)).toEqual(['Bulbasaur', null, null, null, null, null])
  })
})
