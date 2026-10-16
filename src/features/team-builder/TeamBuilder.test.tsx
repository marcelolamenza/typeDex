import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../ui/App'
import '../../ui/styles.css'
import { TEAM_STORAGE_KEY } from './storage'

describe('Team Builder page', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.history.replaceState(null, '', `${window.location.pathname}#/team-builder`)
  })

  it('filters by generation and name together, then analyzes a selected Pokémon', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Pokémon catalog' }, { timeout: 5000 })).toBeInTheDocument()
    const search = screen.getByRole('textbox', { name: 'Search Pokémon by name or Pokédex number' })
    const generation = screen.getByRole('combobox', { name: 'Filter by generation' })
    await user.type(search, 'char')
    await user.selectOptions(generation, '1')
    expect(screen.getByText('Charmander')).toBeInTheDocument()
    expect(screen.queryByText('Pikachu')).not.toBeInTheDocument()
    await user.selectOptions(generation, '2')
    expect(screen.getByText('No Pokémon found. Try another name, number, or generation.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    await user.clear(search)
    await user.type(search, '#130')
    const card = screen.getByRole('heading', { name: 'Gyarados' }).closest('.catalog-pokemon-card') as HTMLElement
    await user.click(within(card).getByRole('button', { name: 'Add to team' }))
    expect(screen.getByText('Gyarados', { selector: '.slot-info strong' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Defensive profile' })).toBeInTheDocument()
    expect(screen.getByText(/Gyarados is 4× weak to Electric\./)).toBeInTheDocument()
    const analysis = document.querySelector('.individual-pokemon-analysis') as HTMLDetailsElement
    await user.click(within(analysis).getByText('Gyarados'))
    expect(within(analysis).getByText('Double weaknesses')).toBeInTheDocument()
  })

  it('prevents a seventh member, supports replacing and removing, and survives a broken image', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Pokémon catalog' }, { timeout: 5000 })
    for (let dex = 1; dex <= 6; dex += 1) {
      const search = screen.getByRole('textbox', { name: 'Search Pokémon by name or Pokédex number' })
      await user.clear(search)
      await user.type(search, String(dex))
      const card = document.querySelector('.catalog-pokemon-card') as HTMLElement
      await user.click(within(card).getByRole('button', { name: 'Add to team' }))
    }
    expect(screen.getByText('Your team is full. Replace a slot to try another Pokémon.')).toBeInTheDocument()
    const search = screen.getByRole('textbox', { name: 'Search Pokémon by name or Pokédex number' })
    await user.clear(search)
    await user.type(search, '7')
    expect(screen.getAllByRole('button', { name: 'Team full' })[0]).toBeDisabled()
    await user.clear(search)
    await user.type(search, '7')
    await user.click(screen.getByRole('button', { name: 'Replace Bulbasaur' }))
    const replacement = document.querySelector('.catalog-pokemon-card') as HTMLElement
    await user.click(within(replacement).getByRole('button', { name: 'Add to team' }))
    expect(screen.getByText('Squirtle', { selector: '.slot-info strong' })).toBeInTheDocument()
    const firstTeamImage = document.querySelector('.team-slot .pokemon-art img') as HTMLImageElement
    fireEvent.error(firstTeamImage)
    expect(screen.getByLabelText('Squirtle sprite unavailable')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Squirtle' })).toBeInTheDocument()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Clear team' }))
    expect(screen.getByText('Your team is empty. Add Pokémon from the catalog to see their type analysis here.')).toBeInTheDocument()
  })

  it('supports direct hash navigation and preserves navigation to the TypeDex checker', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByRole('link', { name: 'Team Builder' }, { timeout: 5000 })).toHaveAttribute('aria-current', 'page')
    await user.click(screen.getByRole('link', { name: 'Type Checker' }))
    expect(await screen.findByRole('heading', { name: 'Choose your type.' })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Team Builder' }))
    expect(await screen.findByRole('heading', { name: 'Team Builder.' })).toBeInTheDocument()
  })

  it('minimizes the catalog and presents a quieter defensive table without neutral or zero counts', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByRole('heading', { name: 'Pokémon catalog' }, { timeout: 5000 })
    const minimize = screen.getByRole('button', { name: 'Minimize catalog' })
    expect(minimize).toHaveAttribute('aria-expanded', 'true')
    await user.click(minimize)
    expect(screen.getByRole('button', { name: 'Expand catalog' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('textbox', { name: 'Search Pokémon by name or Pokédex number' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Expand catalog' }))
    expect(screen.getByRole('textbox', { name: 'Search Pokémon by name or Pokédex number' })).toBeInTheDocument()

    const search = screen.getByRole('textbox', { name: 'Search Pokémon by name or Pokédex number' })
    await user.type(search, '#130')
    const card = screen.getByRole('heading', { name: 'Gyarados' }).closest('.catalog-pokemon-card') as HTMLElement
    await user.click(within(card).getByRole('button', { name: 'Add to team' }))
    const table = document.querySelector('.coverage-table') as HTMLTableElement
    expect(table.querySelectorAll('thead th')).toHaveLength(6)
    expect(within(table).queryByRole('columnheader', { name: '1×' })).not.toBeInTheDocument()
    const fireRow = Array.from(table.querySelectorAll('tbody tr')).find((row) => row.querySelector('th')?.textContent?.includes('Fire')) as HTMLTableRowElement
    expect(Array.from(fireRow.querySelectorAll('td')).map((cell) => cell.querySelector('.visually-hidden') ? '' : cell.textContent)).toEqual(['', '', '1', '', ''])
  })

  it('restores the team after remounting the page', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)
    await screen.findByRole('heading', { name: 'Pokémon catalog' }, { timeout: 5000 })
    const search = screen.getByRole('textbox', { name: 'Search Pokémon by name or Pokédex number' })
    await user.type(search, '#25')
    const card = screen.getByRole('heading', { name: 'Pikachu' }).closest('.catalog-pokemon-card') as HTMLElement
    await user.click(within(card).getByRole('button', { name: 'Add to team' }))
    expect(localStorage.getItem(TEAM_STORAGE_KEY)).toBe('[25,null,null,null,null,null]')

    firstRender.unmount()
    render(<App />)
    expect(await screen.findByText('Pikachu', { selector: '.slot-info strong' }, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Pikachu' })).toBeInTheDocument()
  })
})
