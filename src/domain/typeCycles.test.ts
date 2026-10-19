import { describe, expect, it } from 'vitest'
import { getMultiplier } from './effectiveness'
import { getTypeCycles } from './typeCycles'

describe('type advantage cycles', () => {
  it('returns all qualifying Ice cycles, including Fire, Grass, and Water', () => {
    expect(getTypeCycles('Ice')).toEqual([
      ['Ice', 'Grass', 'Rock'],
      ['Ice', 'Ground', 'Fire'],
      ['Ice', 'Ground', 'Rock'],
      ['Ice', 'Ground', 'Steel'],
      ['Ice', 'Flying', 'Fighting'],
      ['Ice', 'Grass', 'Water', 'Fire'],
      ['Ice', 'Grass', 'Water', 'Rock'],
      ['Ice', 'Grass', 'Ground', 'Fire'],
      ['Ice', 'Grass', 'Ground', 'Rock'],
      ['Ice', 'Grass', 'Ground', 'Steel'],
      ['Ice', 'Grass', 'Rock', 'Fire'],
      ['Ice', 'Ground', 'Fire', 'Steel'],
      ['Ice', 'Ground', 'Rock', 'Fire'],
      ['Ice', 'Ground', 'Steel', 'Rock'],
      ['Ice', 'Flying', 'Grass', 'Rock'],
      ['Ice', 'Flying', 'Fighting', 'Rock'],
      ['Ice', 'Flying', 'Fighting', 'Steel'],
    ])
  })

  it('returns simple 3- or 4-type cycles whose every edge is super effective', () => {
    for (const selectedType of ['Ice', 'Electric', 'Fighting', 'Steel', 'Fire', 'Grass', 'Water'] as const) {
      for (const cycle of getTypeCycles(selectedType)) {
        expect([3, 4]).toContain(cycle.length)
        expect(cycle[0]).toBe(selectedType)
        expect(new Set(cycle).size).toBe(cycle.length)
        cycle.forEach((type, index) => {
          expect(getMultiplier(type, [cycle[(index + 1) % cycle.length]])).toBe(2)
        })
      }
    }
  })

  it('includes each basic type and returns empty when no qualifying loop exists', () => {
    expect(getTypeCycles('Fire').length).toBeGreaterThan(0)
    expect(getTypeCycles('Grass').length).toBeGreaterThan(0)
    expect(getTypeCycles('Water').length).toBeGreaterThan(0)
    expect(getTypeCycles('Normal')).toEqual([])
  })
})
