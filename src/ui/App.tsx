import { lazy, Suspense, useEffect, useState } from 'react'
import { getMultiplier, getOffensiveMatchups } from '../domain/effectiveness'
import { POKEMON_TYPES, type Multiplier, type PokemonType } from '../domain/types'
import { getTypeCycles } from '../domain/typeCycles'

const TeamBuilder = lazy(() => import('../features/team-builder/TeamBuilder'))

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

function typeFromHistoryState(state: unknown): PokemonType | null {
  if (typeof state !== 'object' || state === null || !('typeDex' in state)) return null
  const type = (state as { typeDex?: { type?: unknown } }).typeDex?.type
  return typeof type === 'string' && POKEMON_TYPES.includes(type as PokemonType)
    ? type as PokemonType
    : null
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

function TypeCycleCard({ cycle, index }: { cycle: PokemonType[]; index: number }) {
  const cycleDescription = `${cycle.join(' beats ')} beats ${cycle[0]}`
  const positions = cycle.length === 3 ? 'triangle' : 'square'
  return <li className="type-cycle-list-item">
    <article className={`type-cycle-card cycle-${positions}`} aria-labelledby={`type-cycle-${index}-title`}>
      <h3 id={`type-cycle-${index}-title`} className="type-cycle-number">Cycle {index + 1}</h3>
      <div className={`cycle-visual cycle-visual-${positions}`} role="img" aria-label={cycleDescription}>
        {cycle.map((type, nodeIndex) => <span key={type} className={`cycle-node cycle-node-${nodeIndex}`}>
          <TypeIcon type={type} />
          <span>{type}</span>
        </span>)}
        {cycle.map((_, arrowIndex) => <span key={arrowIndex} className={`cycle-arrow cycle-arrow-${arrowIndex}`} aria-hidden="true">➜</span>)}
      </div>
    </article>
  </li>
}

function TypeDexPage() {
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null)
  const [partnerType, setPartnerType] = useState<PokemonType | null>(null)

  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      setSelectedType(typeFromHistoryState(event.state))
      setPartnerType(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function openType(type: PokemonType) {
    window.history.pushState({ typeDex: { type } }, '')
    setSelectedType(type)
    setPartnerType(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function returnToTypes() {
    if (selectedType && typeFromHistoryState(window.history.state) === selectedType) {
      window.history.back()
      return
    }
    setSelectedType(null)
    setPartnerType(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const offense = selectedType ? getOffensiveMatchups(selectedType) : []
  const typeCycles = selectedType ? getTypeCycles(selectedType) : []
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
      <nav className="primary-nav" aria-label="Main navigation"><a className="active" href="#/" aria-current="page">Type Checker</a><a href="#/team-builder">Team Builder</a></nav>
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
        <section className="result-card defense-card" aria-labelledby="defense-title" aria-live="polite">
          <div className="result-card-title">
            <div className="heading-with-orb">
              <span className="energy-orb"><TypeIcon type={selectedType} /></span>
              <div><p className="section-kicker">INCOMING MOVES</p><h2 id="defense-title">Defending</h2></div>
            </div>
          </div>
          <MultiplierRows matchups={singleDefense} label={`${selectedType} defensive matchups`} />
        </section>

        <section className="result-card offense-card" aria-labelledby="offense-title" aria-live="polite">
          <div className="result-card-title">
            <div className="heading-with-orb">
              <span className="energy-orb"><TypeIcon type={selectedType} /></span>
              <div><p className="section-kicker">YOUR MOVES</p><h2 id="offense-title">Attacking</h2></div>
            </div>
          </div>
          {offense.length > 0
            ? <MultiplierRows matchups={offense} label={`${selectedType} offensive matchups`} />
            : <p className="empty-state">No changed damage multipliers for {selectedType}.</p>}
        </section>
      </div>

      <section className="dual-card" aria-labelledby="dual-title" aria-live="polite">
        <div className="result-card-title">
          <div className="heading-with-orb">
            <span
              className="dual-type-orbs"
              role="img"
              aria-label={partnerType ? `${selectedType} and ${partnerType}` : `${selectedType}; second type not selected`}
            >
              <span className="energy-orb"><TypeIcon type={selectedType} /></span>
              <span className={`energy-orb partner-type-orb ${partnerType ? 'filled' : 'empty'}`}>
                {partnerType && <TypeIcon type={partnerType} />}
              </span>
            </span>
            <div><p className="section-kicker">TEAM-UP</p><h2 id="dual-title">Add a second type</h2></div>
          </div>
          {partnerType && <button type="button" className="clear-partner" onClick={() => setPartnerType(null)}>Clear</button>}
        </div>
        <div className="partner-grid" aria-label="Choose a second defending type">
          {POKEMON_TYPES.filter((type) => type !== selectedType).map((type) => <TypeTile key={type} type={type}
            selected={partnerType === type} onClick={() => setPartnerType(type)} />)}
        </div>
        {partnerType && <div className="dual-results">
          <MultiplierRows matchups={dualDefense} label={`${selectedType} and ${partnerType} combined defensive matchups`} />
        </div>}
      </section>

      <section className="type-cycle-section" aria-labelledby="type-cycle-section-title">
        <div className="type-cycle-section-heading">
          <div><p className="section-kicker">TYPE ADVANTAGE FLOW</p><h2 id="type-cycle-section-title">Cycles for {selectedType}</h2>
            <p>Each arrow points to a type the previous type beats. Cycles use all available types and contain 3 or 4 types.</p>
          </div>
          <span className="type-cycle-count">{typeCycles.length} {typeCycles.length === 1 ? 'cycle' : 'cycles'}</span>
        </div>
        {typeCycles.length > 0
          ? <ol className="type-cycle-list">{typeCycles.map((cycle, index) => <TypeCycleCard key={cycle.join('-')} cycle={cycle} index={index} />)}</ol>
          : <p className="type-cycle-empty">No 3- or 4-type cycles match {selectedType}.</p>}
      </section>
    </section>}
  </main>
}

export default function App() {
  const [teamBuilder, setTeamBuilder] = useState(window.location.hash === '#/team-builder')
  useEffect(() => {
    const onRouteChange = () => setTeamBuilder(window.location.hash === '#/team-builder')
    window.addEventListener('hashchange', onRouteChange)
    return () => window.removeEventListener('hashchange', onRouteChange)
  }, [])
  return teamBuilder
    ? <Suspense fallback={<main className="page-shell"><p className="loading-state" role="status">Loading Team Builder…</p></main>}><TeamBuilder /></Suspense>
    : <TypeDexPage />
}
