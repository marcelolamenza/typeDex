import { createEmptyTeam, TEAM_SIZE, type Team } from './selection'

export const TEAM_STORAGE_KEY = 'typedex:team-builder:v1'

export type TeamStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function loadSavedTeam(storage: TeamStorage): Team {
  try {
    const saved = storage.getItem(TEAM_STORAGE_KEY)
    if (saved === null) return createEmptyTeam()

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed) || parsed.length !== TEAM_SIZE) return createEmptyTeam()
    if (!parsed.every((id) => id === null || (Number.isInteger(id) && id >= 1 && id <= 1025))) return createEmptyTeam()
    const ids = parsed.filter((id): id is number => id !== null)
    if (new Set(ids).size !== ids.length) return createEmptyTeam()
    return parsed as Team
  } catch {
    return createEmptyTeam()
  }
}

export function saveTeam(storage: TeamStorage, team: Team): void {
  try {
    if (team.every((id) => id === null)) {
      storage.removeItem(TEAM_STORAGE_KEY)
      return
    }
    storage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team))
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

export function loadBrowserTeam(): Team {
  try {
    return loadSavedTeam(window.localStorage)
  } catch {
    return createEmptyTeam()
  }
}

export function saveBrowserTeam(team: Team): void {
  try {
    saveTeam(window.localStorage, team)
  } catch {
    // Keep team editing usable when browser storage is unavailable.
  }
}
