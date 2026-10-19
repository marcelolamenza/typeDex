import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { POKEMON_TYPES } from '../domain/types'
import App from './App'
import './styles.css'

describe('visual type lookup', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', window.location.href)
  })

  it('shows all current types as accessible icon buttons with local official artwork', () => {
    render(<App />)
    const index = screen.getByRole('region', { name: 'Choose your type.' })
    for (const type of POKEMON_TYPES) {
      const button = within(index).getByRole('button', { name: `${type} type` })
      expect(button.querySelector('img')).toHaveAttribute(
        'src',
        `${import.meta.env.BASE_URL}type-icons/${type.toLowerCase()}.svg`,
      )
    }
    expect(screen.queryByLabelText('Ruleset')).not.toBeInTheDocument()
  })

  it('separates offense and defense and groups only changed defensive multipliers into rows', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Fire type' }))

    const offense = screen.getByRole('region', { name: 'Attacking' })
    expect(offense).toHaveClass('offense-card')
    expect(within(offense).getByText('Grass', { selector: '.type-result-name' })).toBeInTheDocument()
    expect(offense.querySelector('.count-badge')).toBeNull()
    const matchupSections = Array.from(document.querySelectorAll('.matchup-columns > section'))
    expect(matchupSections.map((section) => section.querySelector('h2')?.textContent))
      .toEqual(['Defending', 'Attacking'])
    expect(within(offense).getByRole('group', { name: '½× damage' })).toBeInTheDocument()
    expect(within(offense).getByText('Water', { selector: '.type-result-name' })).toBeInTheDocument()
    expect(within(offense).getAllByText('2×', { selector: '.type-result strong' })[0]).toHaveClass('multiplier-2')
    expect(within(offense).getByText('Grass', { selector: '.type-result-name' }).closest('.type-result'))
      .toHaveClass('type-result-2x')

    const defense = screen.getByRole('region', { name: 'Defending' })
    expect(defense).toHaveClass('defense-card')
    const offenseHeader = offense.querySelector('.result-card-title') as HTMLElement
    const defenseHeader = defense.querySelector('.result-card-title') as HTMLElement
    expect(getComputedStyle(offenseHeader).height).toBe(getComputedStyle(defenseHeader).height)
    expect(getComputedStyle(offense.querySelector('.multiplier-row') as HTMLElement).paddingTop).toBe('0px')
    expect(getComputedStyle(defense.querySelector('.multiplier-row') as HTMLElement).paddingTop).toBe('0px')
    const defensiveTypes = within(defense).getAllByText(/.+/, { selector: '.type-result-name' })
    expect(defensiveTypes).toHaveLength(9)
    expect(within(defense).queryByText('Normal', { selector: '.type-result-name' })).not.toBeInTheDocument()
    expect(within(defense).getByRole('group', { name: '2× damage' })).toBeInTheDocument()
    expect(within(defense).getByRole('group', { name: '½× damage' })).toBeInTheDocument()
    expect(defense.querySelectorAll('.multiplier-row')).toHaveLength(2)
    expect(Array.from(defense.querySelectorAll('.multiplier-row')).map((item) => item.getAttribute('aria-label')))
      .toEqual(['2× damage', '½× damage'])
    const waterResult = within(defense).getByText('Water', { selector: '.type-result-name' }).closest('.type-result')
    expect(waterResult).not.toBeNull()
    expect(within(waterResult as HTMLElement).getByText('2×')).toHaveClass('multiplier-2')
    expect(waterResult).toHaveClass('type-result-2x')
    const grassResult = within(defense).getByText('Grass', { selector: '.type-result-name' }).closest('.type-result')
    expect(within(grassResult as HTMLElement).getByText('½×')).toHaveClass('multiplier-0-5')
    expect(grassResult).not.toHaveClass('type-result-2x')
    expect(screen.queryByText(/weakness|resistance|immunity/i)).not.toBeInTheDocument()
  })

  it('shows changed combined multipliers in rows without neutral damage', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Ground type' }))
    const emptyPair = screen.getByRole('img', { name: 'Ground; second type not selected' })
    expect(emptyPair.querySelectorAll('.energy-orb')).toHaveLength(2)
    expect(emptyPair.querySelector('.partner-type-orb')).toHaveClass('empty')
    expect(emptyPair.querySelector('.partner-type-orb img')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Rock type' }))
    const selectedPair = screen.getByRole('img', { name: 'Ground and Rock' })
    expect(selectedPair.querySelectorAll('.energy-orb')).toHaveLength(2)
    expect(selectedPair.querySelector('.partner-type-orb')).toHaveClass('filled')
    expect(selectedPair.querySelector('.partner-type-orb img')).toHaveAttribute(
      'src',
      `${import.meta.env.BASE_URL}type-icons/rock.svg`,
    )
    const combined = screen.getByRole('group', { name: 'Ground and Rock combined defensive matchups' })
    expect(within(combined).queryByText('Psychic', { selector: '.type-result-name' })).not.toBeInTheDocument()
    expect(within(combined).getByRole('group', { name: '4× damage' })).toBeInTheDocument()
    expect(within(combined).getByRole('group', { name: '0× damage' })).toBeInTheDocument()
    const waterResult = within(combined).getByText('Water', { selector: '.type-result-name' }).closest('.type-result')
    expect(within(waterResult as HTMLElement).getByText('4×')).toHaveClass('multiplier-4')
    const electricResult = within(combined).getByText('Electric', { selector: '.type-result-name' }).closest('.type-result')
    expect(within(electricResult as HTMLElement).getByText('0×')).toHaveClass('multiplier-0')
    expect(screen.queryByText(/weakness|resistance|immunity/i)).not.toBeInTheDocument()
  })

  it('shows selected-type cycles as icon triangles and squares below team-up', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Ice type' }))

    const cycleSection = screen.getByRole('region', { name: 'Cycles for Ice' })
    expect(within(cycleSection).getByText('17 cycles')).toBeInTheDocument()
    expect(within(cycleSection).getByRole('img', { name: 'Ice beats Ground beats Rock beats Ice' })).toBeInTheDocument()
    expect(within(cycleSection).getByRole('img', { name: 'Ice beats Flying beats Fighting beats Steel beats Ice' })).toBeInTheDocument()
    expect(cycleSection.querySelectorAll('.cycle-triangle')).toHaveLength(5)
    expect(cycleSection.querySelectorAll('.cycle-square')).toHaveLength(12)
    expect(within(cycleSection).getByRole('img', { name: 'Ice beats Grass beats Water beats Fire beats Ice' })).toBeInTheDocument()
    expect(document.querySelector('.type-cycle-section')?.previousElementSibling).toHaveClass('dual-card')
    expect(within(cycleSection).getByRole('img', { name: 'Ice beats Ground beats Rock beats Ice' }).querySelectorAll('.cycle-node img')).toHaveLength(3)
  })

  it('returns to the icon index with the back control', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Ghost type' }))
    await user.click(screen.getByRole('button', { name: /All types/ }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Choose your type.' })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Ghost type' })).toBeInTheDocument()
  })

  it('returns to all types when browser back is used from a detail screen', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Fire type' }))
    expect(screen.getByRole('heading', { name: 'Fire' })).toBeInTheDocument()

    window.history.back()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Choose your type.' })).toBeInTheDocument()
    })
  })
})
