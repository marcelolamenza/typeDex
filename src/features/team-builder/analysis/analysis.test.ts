import { describe, expect, it } from 'vitest'
import { getMultiplier } from '../../../domain/effectiveness'
import { POKEMON_CATALOG } from '../catalog'
import { analyzePokemon, analyzeTeam } from './analysis'

const pokemon = (id: number) => POKEMON_CATALOG[id - 1]

describe('Team Builder type analysis', () => {
  it('uses the existing chart for single and dual type defensive matchups', () => {
    const gyarados = pokemon(130)
    const matchup = analyzePokemon(gyarados)
    expect(gyarados.types).toEqual(['Water', 'Flying'])
    expect(matchup[4]).toContain('Electric')
    expect(matchup[0]).toContain('Ground')
    expect(getMultiplier('Electric', gyarados.types, 9)).toBe(4)
    expect(getMultiplier('Ground', gyarados.types, 9)).toBe(0)
    expect(analyzePokemon(pokemon(25))[2]).toContain('Ground')
  })

  it('reports double resistances and immunities', () => {
    const magnemite = pokemon(81)
    const matchup = analyzePokemon(magnemite)
    expect(magnemite.types).toEqual(['Electric', 'Steel'])
    expect(matchup[0.25]).toContain('Flying')
    expect(matchup[0]).toContain('Poison')
  })

  it('counts shared weaknesses, defensive coverage, gaps, and theoretical STAB targets', () => {
    const team = [pokemon(130), pokemon(6), pokemon(3)]
    const report = analyzeTeam(team)
    expect(report.sharedWeaknesses.find(({ type }) => type === 'Rock')?.affected.map(({ pokemon: item, multiplier }) => [item.name, multiplier]))
      .toEqual([['Gyarados', 2], ['Charizard', 4]])
    expect(report.defensive.find(({ type }) => type === 'Electric')?.counts[4]).toBe(1)
    expect(report.defensive.find(({ type }) => type === 'Electric')?.counts[2]).toBe(1)
    expect(report.defensive.find(({ type }) => type === 'Electric')?.counts[0.5]).toBe(1)
    expect(report.defensive.find(({ type }) => type === 'Ground')?.counts[0]).toBe(2)
    expect(report.defensiveGaps.some(({ type }) => type === 'Rock')).toBe(true)
    expect(report.offensive.find(({ type }) => type === 'Fire')?.targets).toContain('Grass')
    expect(report.offensive.find(({ type }) => type === 'Water')?.suppliedBy.map(({ name }) => name)).toEqual(['Gyarados'])
  })

  it('handles empty and partial teams', () => {
    const empty = analyzeTeam([])
    expect(empty.sharedWeaknesses).toEqual([])
    expect(empty.defensive.every(({ counts }) => Object.values(counts).every((count) => count === 0))).toBe(true)
    const partial = analyzeTeam([pokemon(6)])
    expect(partial.defensive.find(({ type }) => type === 'Rock')?.affected[0]).toMatchObject({ pokemon: pokemon(6), multiplier: 4 })
  })
})
