import { describe, expect, it } from 'vitest'
import { getTypesForGeneration, TYPE_CHARTS } from '../data/typeCharts'
import { GENERATIONS, POKEMON_TYPES } from './types'
import { getDefensiveMatchups, getDefensiveMatchupsForTypes, getMultiplier, getOffensiveTargets } from './effectiveness'

describe('explicit generation type charts', () => {
  it('has a complete square chart for every generation and valid multipliers in every cell', () => {
    for (const generation of GENERATIONS) {
      const types = getTypesForGeneration(generation)
      const chart = TYPE_CHARTS[generation]
      expect(Object.keys(chart)).toEqual(types)
      expect(types.length).toBe(generation === 1 ? 15 : generation < 6 ? 17 : 18)
      for (const attackingType of types) {
        expect(Object.keys(chart[attackingType] ?? {})).toEqual(types)
        for (const defendingType of types) {
          expect([0, 0.5, 1, 2].includes(chart[attackingType]?.[defendingType] ?? -1),
            `Gen ${generation}: ${attackingType} → ${defendingType}`).toBe(true)
        }
      }
    }
    expect(getTypesForGeneration(1)).not.toContain('Dark')
    expect(getTypesForGeneration(1)).not.toContain('Steel')
    expect(getTypesForGeneration(5)).not.toContain('Fairy')
    expect(getTypesForGeneration(6)).toEqual(POKEMON_TYPES)
  })

  it('preserves the complete shared Generation II–V matrix', () => {
    const expected: Record<string, number[]> = {
      Normal: [1,1,1,1,1,1,1,1,1,1,1,1,.5,0,1,1,.5],
      Fire: [1,.5,.5,1,2,2,1,1,1,1,1,2,.5,1,.5,1,2],
      Water: [1,2,.5,1,.5,1,1,1,2,1,1,1,2,1,.5,1,1],
      Electric: [1,1,2,.5,.5,1,1,1,0,2,1,1,1,1,.5,1,1],
      Grass: [1,.5,2,1,.5,1,1,.5,2,.5,1,.5,2,1,.5,1,.5],
      Ice: [1,.5,.5,1,2,.5,1,1,2,2,1,1,1,1,2,1,.5],
      Fighting: [2,1,1,1,1,2,1,.5,1,.5,.5,.5,2,0,1,2,2],
      Poison: [1,1,1,1,2,1,1,.5,.5,1,1,1,.5,.5,1,1,0],
      Ground: [1,2,1,2,.5,1,1,2,1,0,1,.5,2,1,1,1,2],
      Flying: [1,1,1,.5,2,1,2,1,1,1,1,2,.5,1,1,1,.5],
      Psychic: [1,1,1,1,1,1,2,2,1,1,.5,1,1,1,1,0,.5],
      Bug: [1,.5,1,1,2,1,.5,.5,1,.5,2,1,1,.5,1,2,.5],
      Rock: [1,2,1,1,1,2,.5,1,.5,2,1,2,1,1,1,1,.5],
      Ghost: [0,1,1,1,1,1,1,1,1,1,2,1,1,2,1,.5,.5],
      Dragon: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,.5],
      Dark: [1,1,1,1,1,1,.5,1,1,1,2,1,1,2,1,.5,.5],
      Steel: [1,.5,.5,.5,1,2,1,1,1,1,1,1,2,1,1,1,.5],
    }
    const types = getTypesForGeneration(2)
    for (const generation of [2, 3, 4, 5] as const) {
      for (const attackingType of types) {
        types.forEach((defendingType, index) => {
          expect(TYPE_CHARTS[generation][attackingType]?.[defendingType], `${generation}: ${attackingType} → ${defendingType}`)
            .toBe(expected[attackingType][index])
        })
      }
    }
  })

  it('checks generation-specific chart differences and Fairy interactions', () => {
    expect(getMultiplier('Ghost', ['Psychic'], 1)).toBe(0)
    expect(getMultiplier('Ghost', ['Psychic'], 2)).toBe(2)
    expect(getMultiplier('Poison', ['Bug'], 1)).toBe(2)
    expect(getMultiplier('Poison', ['Bug'], 2)).toBe(1)
    expect(getMultiplier('Dark', ['Steel'], 5)).toBe(0.5)
    expect(getMultiplier('Dark', ['Steel'], 6)).toBe(1)
    expect(getMultiplier('Fairy', ['Dragon'], 6)).toBe(2)
    expect(getMultiplier('Dragon', ['Fairy'], 6)).toBe(0)
    expect(getMultiplier('Steel', ['Fairy'], 6)).toBe(2)
  })
})

describe('effectiveness calculations', () => {
  it('multiplies dual-type matchups, including immunity, double weakness, and double resistance', () => {
    expect(getMultiplier('Ground', ['Flying', 'Steel'])).toBe(0)
    expect(getMultiplier('Ice', ['Dragon', 'Flying'])).toBe(4)
    expect(getMultiplier('Fire', ['Water', 'Dragon'])).toBe(0.25)
    expect(getMultiplier('Fire', ['Grass', 'Steel'])).toBe(4)
  })

  it('lists only super-effective single defending types for offense', () => {
    expect(getOffensiveTargets('Electric')).toEqual(['Water', 'Flying'])
    expect(getOffensiveTargets('Fairy', 6)).toEqual(['Fighting', 'Dragon', 'Dark'])
  })

  it('groups defensive matchups for single and dual types', () => {
    const normal = getDefensiveMatchups('Normal')
    expect(normal[0]).toEqual(['Ghost'])
    expect(normal[0.5]).toEqual([])
    expect(normal[2]).toEqual(['Fighting'])
    expect(getDefensiveMatchupsForTypes(['Ground', 'Rock'])[4]).toContain('Water')
    expect(getDefensiveMatchupsForTypes(['Fire', 'Water'])[0.25]).toContain('Ice')
  })

  it('rejects types unavailable in the selected generation', () => {
    expect(() => getMultiplier('Fairy', ['Dragon'], 5)).toThrow(RangeError)
  })
})
