import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyTeam } from './selection'
import { loadSavedTeam, saveTeam, TEAM_STORAGE_KEY, type TeamStorage } from './storage'

describe('browser-local team storage', () => {
  beforeEach(() => localStorage.clear())

  it('saves and restores stable Pokémon ids in their team slots', () => {
    const team = [25, null, 130, null, null, 1000]
    saveTeam(localStorage, team)
    expect(localStorage.getItem(TEAM_STORAGE_KEY)).toBe(JSON.stringify(team))
    expect(loadSavedTeam(localStorage)).toEqual(team)
  })

  it('starts empty for missing, invalid, duplicate, or malformed saved data', () => {
    expect(loadSavedTeam(localStorage)).toEqual(createEmptyTeam())
    for (const invalid of ['{', '[]', '[1,2,3,4,5]', '[1,1,null,null,null,null]', '[1026,null,null,null,null,null]']) {
      localStorage.setItem(TEAM_STORAGE_KEY, invalid)
      expect(loadSavedTeam(localStorage)).toEqual(createEmptyTeam())
    }
  })

  it('does not throw if browser storage is unavailable and removes the empty saved team', () => {
    const unavailable = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') }, removeItem: () => { throw new Error('blocked') } } satisfies TeamStorage
    expect(loadSavedTeam(unavailable)).toEqual(createEmptyTeam())
    expect(() => saveTeam(unavailable, [1, null, null, null, null, null])).not.toThrow()
    saveTeam(localStorage, [1, null, null, null, null, null])
    saveTeam(localStorage, createEmptyTeam())
    expect(localStorage.getItem(TEAM_STORAGE_KEY)).toBeNull()
  })
})
