import { describe, expect, it } from 'vitest'
import { getMultiplier } from './effectiveness'
import { POKEMON_TYPES } from './types'
import { getAllTypeCycles, getTypeCycles } from './typeCycles'

describe('type advantage cycles', () => {
  it('returns every qualifying Ice triangle, including the basic type cycle', () => {
    expect(getTypeCycles('Ice')).toEqual([
      ['Ice', 'Grass', 'Rock'],
      ['Ice', 'Ground', 'Fire'],
      ['Ice', 'Ground', 'Rock'],
      ['Ice', 'Ground', 'Steel'],
      ['Ice', 'Flying', 'Fighting'],
    ])
    expect(getTypeCycles('Fire')).toContainEqual(['Fire', 'Grass', 'Water'])
  })

  it('returns only simple 3-type cycles with super-effective matchups at every edge', () => {
    for (const selectedType of POKEMON_TYPES) {
      for (const cycle of getTypeCycles(selectedType)) {
        expect(cycle).toHaveLength(3)
        expect(cycle[0]).toBe(selectedType)
        expect(new Set(cycle).size).toBe(cycle.length)
        cycle.forEach((type, index) => {
          expect(getMultiplier(type, [cycle[(index + 1) % cycle.length]])).toBe(2)
        })
      }
    }
  })

  it('includes each basic type and returns empty when no qualifying triangle exists', () => {
    expect(getTypeCycles('Fire').length).toBeGreaterThan(0)
    expect(getTypeCycles('Grass').length).toBeGreaterThan(0)
    expect(getTypeCycles('Water').length).toBeGreaterThan(0)
    expect(getTypeCycles('Normal')).toEqual([])
  })

  it('returns every directed three-type cycle once for the all-cycles page', () => {
    const cycles = getAllTypeCycles()
    const cycleKeys = cycles.map((cycle) => cycle.join('-'))
    expect(new Set(cycleKeys).size).toBe(cycles.length)
    expect(cycles.length).toBeGreaterThan(0)
    for (const cycle of cycles) {
      expect(cycle).toHaveLength(3)
      expect(new Set(cycle).size).toBe(3)
      cycle.forEach((type, index) => {
        expect(getMultiplier(type, [cycle[(index + 1) % cycle.length]])).toBe(2)
      })
    }
    expect(cycles).toContainEqual(['Fire', 'Grass', 'Water'])
  })
})
