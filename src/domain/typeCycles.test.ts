import { describe, expect, it } from 'vitest'
import { getMultiplier } from './effectiveness'
import { getTypeCycles } from './typeCycles'

describe('type advantage cycles', () => {
  it('returns the six requested Ice cycles in triangle and square sizes', () => {
    expect(getTypeCycles('Ice')).toEqual([
      ['Ice', 'Ground', 'Rock'],
      ['Ice', 'Ground', 'Steel'],
      ['Ice', 'Flying', 'Fighting'],
      ['Ice', 'Ground', 'Steel', 'Rock'],
      ['Ice', 'Flying', 'Fighting', 'Rock'],
      ['Ice', 'Flying', 'Fighting', 'Steel'],
    ])
  })

  it('contains only simple 3- or 4-type cycles without Fire, Grass, or Water', () => {
    for (const selectedType of ['Ice', 'Electric', 'Fighting', 'Steel'] as const) {
      for (const cycle of getTypeCycles(selectedType)) {
        expect([3, 4]).toContain(cycle.length)
        expect(cycle[0]).toBe(selectedType)
        expect(new Set(cycle).size).toBe(cycle.length)
        expect(cycle).not.toContain('Fire')
        expect(cycle).not.toContain('Grass')
        expect(cycle).not.toContain('Water')
        cycle.forEach((type, index) => {
          expect(getMultiplier(type, [cycle[(index + 1) % cycle.length]])).toBe(2)
        })
      }
    }
  })

  it('returns no cycles for excluded types or types without a qualifying loop', () => {
    expect(getTypeCycles('Fire')).toEqual([])
    expect(getTypeCycles('Normal')).toEqual([])
  })
})
