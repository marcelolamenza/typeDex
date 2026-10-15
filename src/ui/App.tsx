import { useState } from 'react'
import { getMultiplier, getOffensiveTargets } from '../domain/effectiveness'
import { POKEMON_TYPES, type Multiplier, type PokemonType } from '../domain/types'

const MULTIPLIER_LABEL: Record<Multiplier, string> = {
  0: '0×', 0.25: '¼×', 0.5: '½×', 1: '1×', 2: '2×', 4: '4×',
}

function multiplierClass(multiplier: Multiplier) {
  return `multiplier-${String(multiplier).replace('.', '-')}`
}

const MULTIPLIER_ORDER: readonly Multiplier[] = [4, 2, 0.5, 0.25, 0]

function TypeIcon({ type, size = 'normal' }: { type: PokemonType; size?: 'normal' | 'large' }) {
  return <span className={`type-icon ${size}`} aria-hidden="true">
    <img src={`${import.meta.env.BASE_URL}type-icons/${type.toLowerCase()}.svg`} alt="" />
  </span>
}

function TypeMedallion({ type, size = 'normal' }: { type: PokemonType; size?: 'normal' | 'large' }) {
  return <span className={`type-medallion ${size}`} aria-hidden="true">
    <TypeIcon type={type} size={size} />
  </span>
}

function TypeTile({ type, onClick, selected = false }: {
  type: PokemonType
  onClick: () => void
  selected?: boolean
}) {
  return <button type="button" className={`type-tile ${selected ? 'selected' : ''}`} aria-pressed={selected}
    aria-label={`${type} type`} onClick={onClick}>
    <TypeIcon type={type} />
    <span>{type}</span>
  </button>
}

function TypeResult({ type, multiplier }: { type: PokemonType; multiplier: Multiplier }) {
  return <span className={`type-result ${multiplier === 2 ? 'type-result-2x' : ''}`}>
    <span className="type-result-label"><TypeIcon type={type} /><span className="type-result-name">{type}</span></span>
    <strong className={multiplierClass(multiplier)}>{MULTIPLIER_LABEL[multiplier]}</strong>
  </span>
}

function MultiplierRows({ matchups, label }: {
  matchups: readonly { type: PokemonType; multiplier: Multiplier }[]
  label: string
}) {
  return <div className="multiplier-rows" role="group" aria-label={label}>
    {MULTIPLIER_ORDER.map((multiplier) => {
      const types = matchups.filter((matchup) => matchup.multiplier === multiplier)
      if (types.length === 0) return null
      return <div className="multiplier-row" role="group" aria-label={`${MULTIPLIER_LABEL[multiplier]} damage`} key={multiplier}>
        <div className="row-types">{types.map(({ type }) => <TypeResult key={type} type={type} multiplier={multiplier} />)}</div>
      </div>
    })}
  </div>
}

function App() {
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null)
  const [partnerType, setPartnerType] = useState<PokemonType | null>(null)

  function openType(type: PokemonType) {
    setSelectedType(type)
    setPartnerType(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function returnToTypes() {
    setSelectedType(null)
    setPartnerType(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const offense = selectedType ? getOffensiveTargets(selectedType) : []
  const singleDefense = selectedType
    ? POKEMON_TYPES.map((attackingType) => ({
      type: attackingType,
      multiplier: getMultiplier(attackingType, [selectedType]),
    })).filter(({ multiplier }) => multiplier !== 1)
    : []
  const dualDefense = selectedType && partnerType
    ? POKEMON_TYPES.map((attackingType) => ({
      type: attackingType,
      multiplier: getMultiplier(attackingType, [selectedType, partnerType]),
    })).filter(({ multiplier }) => multiplier !== 1)
    : []

  return <main className="page-shell">
    <header className="topbar">
      <button type="button" className="brand" onClick={returnToTypes} aria-label="TypeDex, show all types">
        <span className="brand-mark" aria-hidden="true" /><span>TypeDex</span>
      </button>
    </header>

    {!selectedType ? <section className="type-index" aria-labelledby="index-title">
      <div className="intro">
        <p className="eyebrow"><span className="eyebrow-ball" aria-hidden="true" /> THE BATTLE REFERENCE</p>
        <h1 id="index-title">Choose your <span>type.</span></h1>
      </div>
      <div className="type-grid" aria-label="All Pokémon types">
        {POKEMON_TYPES.map((type) => <TypeTile key={type} type={type} onClick={() => openType(type)} />)}
      </div>
    </section> : <section className="type-detail" aria-labelledby="detail-title">
      <button type="button" className="back-button" onClick={returnToTypes}><span aria-hidden="true">←</span> All types</button>
      <div className="detail-hero">
        <TypeMedallion type={selectedType} size="large" />
        <div><p className="section-kicker">TYPE MATCHUPS</p><h1 id="detail-title">{selectedType}</h1></div>
      </div>

      <div className="matchup-columns">
        <section className="result-card offense-card" aria-labelledby="offense-title" aria-live="polite">
          <div className="result-card-title">
            <div className="heading-with-orb">
              <span className="energy-orb"><TypeIcon type={selectedType} /></span>
              <div><p className="section-kicker">YOUR MOVES</p><h2 id="offense-title">Strong against</h2></div>
            </div>
          </div>
          {offense.length > 0
            ? <div className="type-results">{offense.map((type) => <TypeResult key={type} type={type} multiplier={2} />)}</div>
            : <p className="empty-state">No single type takes double damage from {selectedType}.</p>}
        </section>

        <section className="result-card defense-card" aria-labelledby="defense-title" aria-live="polite">
          <div className="result-card-title">
            <div className="heading-with-orb">
              <span className="energy-orb"><TypeIcon type={selectedType} /></span>
              <div><p className="section-kicker">INCOMING MOVES</p><h2 id="defense-title">Defending as {selectedType}</h2></div>
            </div>
          </div>
          <MultiplierRows matchups={singleDefense} label={`${selectedType} defensive matchups`} />
        </section>
      </div>

      <section className="dual-card" aria-labelledby="dual-title" aria-live="polite">
        <div className="result-card-title">
          <div className="heading-with-orb">
            <span className="energy-orb"><TypeIcon type={partnerType ?? selectedType} /></span>
            <div><p className="section-kicker">TEAM-UP</p><h2 id="dual-title">Add a second type</h2></div>
          </div>
          {partnerType && <button type="button" className="clear-partner" onClick={() => setPartnerType(null)}>Clear</button>}
        </div>
        <div className="partner-grid" aria-label="Choose a second defending type">
          {POKEMON_TYPES.filter((type) => type !== selectedType).map((type) => <TypeTile key={type} type={type}
            selected={partnerType === type} onClick={() => setPartnerType(type)} />)}
        </div>
        {partnerType && <div className="dual-results">
          <div className="dual-summary">
            <span><TypeIcon type={selectedType} /> {selectedType}</span>
            <span className="type-separator" aria-hidden="true">+</span>
            <span><TypeIcon type={partnerType} /> {partnerType}</span>
            <span className="dual-summary-label">Combined incoming damage</span>
          </div>
          <MultiplierRows matchups={dualDefense} label={`${selectedType} and ${partnerType} combined defensive matchups`} />
        </div>}
      </section>
    </section>}
  </main>
}

export default App
