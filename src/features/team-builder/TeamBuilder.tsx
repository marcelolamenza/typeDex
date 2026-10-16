import { useEffect, useMemo, useState } from 'react'
import { POKEMON_TYPES, type Generation, type Multiplier, type PokemonType } from '../../domain/types'
import { analyzePokemon, analyzeTeam } from './analysis/analysis'
import { CATALOG_PAGE_SIZE, filterPokemon, POKEMON_CATALOG, type Pokemon } from './catalog'
import { addPokemon, createEmptyTeam, removePokemon, selectedPokemon, TEAM_SIZE, type Team } from './selection'
import { loadBrowserTeam, saveBrowserTeam } from './storage'

const MULTIPLIERS: readonly Multiplier[] = [0, 0.25, 0.5, 2, 4]
const MULTIPLIER_TEXT: Record<Multiplier, string> = { 0: '0×', 0.25: '¼×', 0.5: '½×', 1: '1×', 2: '2×', 4: '4×' }
const GENERATION_LABEL: Record<Generation, string> = {
  1: 'Generation I · Kanto', 2: 'Generation II · Johto', 3: 'Generation III · Hoenn',
  4: 'Generation IV · Sinnoh', 5: 'Generation V · Unova', 6: 'Generation VI · Kalos',
  7: 'Generation VII · Alola', 8: 'Generation VIII · Galar', 9: 'Generation IX · Paldea',
}

function typeIcon(type: PokemonType) {
  return `${import.meta.env.BASE_URL}type-icons/${type.toLowerCase()}.svg`
}

function TypeBadge({ type }: { type: PokemonType }) {
  return <span className={`team-type-badge type-${type.toLowerCase()}`}><img src={typeIcon(type)} alt="" />{type}</span>
}

function PokemonImage({ pokemon, compact = false }: { pokemon: Pokemon; compact?: boolean }) {
  const [failed, setFailed] = useState(false)
  return <span className={`pokemon-art ${compact ? 'compact' : ''}`}>
    {!failed
      ? <img src={pokemon.imageUrl} alt={pokemon.name} loading={compact ? 'eager' : 'lazy'} decoding="async" width="96" height="96" onError={() => setFailed(true)} />
      : <span className="pokemon-art-fallback" aria-label={`${pokemon.name} sprite unavailable`}>{pokemon.name.slice(0, 1)}</span>}
  </span>
}

function PokemonCard({ pokemon, selected, full, onAdd }: {
  pokemon: Pokemon; selected: boolean; full: boolean; onAdd: () => void
}) {
  return <article className={`catalog-pokemon-card ${selected ? 'is-selected' : ''}`}>
    <div className="catalog-card-heading"><span>#{String(pokemon.dexNumber).padStart(4, '0')}</span><span>Gen {pokemon.generation}</span></div>
    <PokemonImage pokemon={pokemon} />
    <h3>{pokemon.name}</h3>
    <div className="team-type-list">{pokemon.types.map((type) => <TypeBadge key={type} type={type} />)}</div>
    <button className="catalog-add-button" type="button" onClick={onAdd} disabled={selected || (full && !selected)}>
      {selected ? 'On team' : full ? 'Team full' : 'Add to team'}
    </button>
  </article>
}

function EffectivenessGroup({ label, multiplier, types }: { label: string; multiplier: Multiplier; types: PokemonType[] }) {
  if (!types.length) return null
  return <div className={`effectiveness-group multiplier-${String(multiplier).replace('.', '-')}`}>
    <div><strong>{label}</strong><b>{MULTIPLIER_TEXT[multiplier]}</b></div>
    <div className="effectiveness-types">{types.map((type) => <TypeBadge key={type} type={type} />)}</div>
  </div>
}

export default function TeamBuilder() {
  const [team, setTeam] = useState<Team>(loadBrowserTeam)
  const [query, setQuery] = useState('')
  const [generation, setGeneration] = useState<Generation | 'all'>('all')
  const [typeFilters, setTypeFilters] = useState<[PokemonType | 'all', PokemonType | 'all']>(['all', 'all'])
  const [page, setPage] = useState(1)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)
  const [catalogCollapsed, setCatalogCollapsed] = useState(false)
  const [notice, setNotice] = useState('')
  const selection = useMemo(() => selectedPokemon(team, POKEMON_CATALOG), [team])
  const roster = selection.filter((pokemon): pokemon is Pokemon => pokemon !== null)
  const selectedIds = new Set(team.filter((id): id is number => id !== null))
  const activeTypes = useMemo(() => typeFilters.filter((type): type is PokemonType => type !== 'all'), [typeFilters])
  const filtered = useMemo(() => filterPokemon(POKEMON_CATALOG, query, generation, activeTypes), [query, generation, activeTypes])
  const visible = filtered.slice(0, page * CATALOG_PAGE_SIZE)
  const report = useMemo(() => analyzeTeam(roster), [roster])
  const totalSelected = roster.length

  useEffect(() => saveBrowserTeam(team), [team])

  function updateFilters(
    nextQuery: string,
    nextGeneration: Generation | 'all',
    nextTypeFilters: [PokemonType | 'all', PokemonType | 'all'] = typeFilters,
  ) {
    setQuery(nextQuery)
    setGeneration(nextGeneration)
    setTypeFilters(nextTypeFilters)
    setPage(1)
  }

  function toggleTypeFilter(type: PokemonType) {
    const current = typeFilters.filter((value): value is PokemonType => value !== 'all')
    const nextTypes = current.includes(type) ? current.filter((value) => value !== type) : [...current, type]
    updateFilters(query, generation, [nextTypes[0] ?? 'all', nextTypes[1] ?? 'all'])
  }

  function choosePokemon(pokemon: Pokemon) {
    if (selectedIds.has(pokemon.id)) return
    if (replaceIndex === null && totalSelected >= TEAM_SIZE) {
      setNotice('Your team has six Pokémon. Choose a slot to replace one.')
      return
    }
    const next = addPokemon(team, pokemon.id, replaceIndex)
    if (next === team) return
    setTeam(next)
    setReplaceIndex(null)
    setNotice(`${pokemon.name} added to your team.`)
  }

  function clearTeam() {
    if (window.confirm('Clear all Pokémon from your team?')) {
      setTeam(createEmptyTeam())
      setReplaceIndex(null)
      setNotice('Team cleared.')
    }
  }

  return <main className="page-shell team-builder-page">
    <header className="topbar">
      <a className="brand" href="#/" aria-label="TypeDex home"><span className="brand-mark" aria-hidden="true" /><span>TypeDex</span></a>
      <nav className="primary-nav" aria-label="Main navigation"><a href="#/">Type Checker</a><a className="active" href="#/team-builder" aria-current="page">Team Builder</a></nav>
    </header>
    <section className="team-builder-intro">
      <p className="eyebrow"><span className="eyebrow-ball" aria-hidden="true" /> BUILD A BALANCED SQUAD</p>
      <h1>Team <span>Builder.</span></h1>
      <p>Choose up to six Pokémon, then review type based defensive coverage and theoretical STAB coverage.</p>
    </section>

    <section className="team-panel" aria-labelledby="team-title">
      <div className="team-panel-title"><div><p className="section-kicker">YOUR SQUAD</p><h2 id="team-title">Team <span>{totalSelected}/{TEAM_SIZE}</span></h2></div>
        <div className="team-panel-actions">{replaceIndex !== null && <button className="secondary-action" onClick={() => setReplaceIndex(null)}>Cancel replacement</button>}
          <button className="secondary-action" onClick={clearTeam} disabled={!totalSelected}>Clear team</button></div></div>
      {replaceIndex !== null && <p className="replace-prompt" role="status">Choose a Pokémon below to replace slot {replaceIndex + 1}.</p>}
      <div className="team-slots">
        {selection.map((pokemon, index) => <article key={index} className={`team-slot ${pokemon ? 'filled' : ''} ${replaceIndex === index ? 'replacement-target' : ''}`}>
          <span className="slot-number">{String(index + 1).padStart(2, '0')}</span>
          {pokemon ? <><PokemonImage pokemon={pokemon} compact /><div className="slot-info"><strong>{pokemon.name}</strong><span>#{String(pokemon.dexNumber).padStart(4, '0')}</span><div className="team-type-list">{pokemon.types.map((type) => <TypeBadge key={type} type={type} />)}</div></div>
            <div className="slot-actions"><button aria-label={`Replace ${pokemon.name}`} onClick={() => setReplaceIndex(index)}>Replace</button><button aria-label={`Remove ${pokemon.name}`} onClick={() => { setTeam(removePokemon(team, index)); if (replaceIndex === index) setReplaceIndex(null); setNotice(`${pokemon.name} removed from your team.`) }}>Remove</button></div></>
            : <div className="empty-slot-copy"><span aria-hidden="true">＋</span><strong>Open slot</strong><span>Add from catalog</span></div>}
        </article>)}
      </div>
      {!totalSelected && <p className="team-empty-state">Your team is empty. Add Pokémon from the catalog to see their type analysis here.</p>}
      {totalSelected === TEAM_SIZE && <p className="team-full-state" role="status">Your team is full. Replace a slot to try another Pokémon.</p>}
    </section>

    <section className="catalog-panel" aria-labelledby="catalog-title">
      <div className="catalog-heading"><div><p className="section-kicker">1,025 STANDARD SPECIES</p><h2 id="catalog-title">Pokémon catalog</h2></div><div className="catalog-heading-actions"><span className="catalog-count">{filtered.length.toLocaleString()} results</span><button className="catalog-toggle" type="button" aria-expanded={!catalogCollapsed} aria-controls="catalog-content" onClick={() => setCatalogCollapsed((collapsed) => !collapsed)}>{catalogCollapsed ? 'Expand catalog' : 'Minimize catalog'}</button></div></div>
      {!catalogCollapsed && <div id="catalog-content">
        <div className="catalog-filters">
          <label className="search-control"><span className="visually-hidden">Search Pokémon by name or Pokédex number</span><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => updateFilters(event.target.value, generation)} placeholder="Search name or Pokédex number" /></label>
          <label className="generation-control"><span className="visually-hidden">Filter by generation</span><select value={generation} onChange={(event) => updateFilters(query, event.target.value === 'all' ? 'all' : Number(event.target.value) as Generation)}><option value="all">All generations</option>{Object.entries(GENERATION_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <fieldset className="type-filter-control">
            <legend>Filter by type <span>Choose up to two</span></legend>
            <div className="type-filter-options" role="group" aria-label="Filter catalog by Pokémon type">
              <button className="type-filter-any" type="button" aria-pressed={activeTypes.length === 0} onClick={() => updateFilters(query, generation, ['all', 'all'])}>Any type</button>
              {POKEMON_TYPES.map((type) => <button key={type} className={`type-filter-option type-${type.toLowerCase()} ${activeTypes.includes(type) ? 'is-active' : ''}`} type="button" aria-label={`Filter by ${type} type`} aria-pressed={activeTypes.includes(type)} disabled={activeTypes.length === 2 && !activeTypes.includes(type)} onClick={() => toggleTypeFilter(type)}><img src={typeIcon(type)} alt="" />{type}</button>)}
            </div>
          </fieldset>
          {(query || generation !== 'all' || activeTypes.length > 0) && <button className="clear-filters" onClick={() => updateFilters('', 'all', ['all', 'all'])}>Clear filters</button>}
        </div>
        <p className="catalog-help" aria-live="polite">{replaceIndex !== null ? `Choose a Pokémon to replace slot ${replaceIndex + 1}.` : totalSelected === TEAM_SIZE ? 'Choose Replace on a team slot to swap a Pokémon.' : 'Select a Pokémon to add it to the next open slot.'}</p>
        {notice && <p className="team-notice" role="status">{notice}</p>}
        {filtered.length ? <><div className="pokemon-catalog-grid">{visible.map((pokemon) => <PokemonCard key={pokemon.id} pokemon={pokemon} selected={selectedIds.has(pokemon.id)} full={totalSelected === TEAM_SIZE && replaceIndex === null} onAdd={() => choosePokemon(pokemon)} />)}</div>
          {visible.length < filtered.length && <button className="load-more-button" onClick={() => setPage((current) => current + 1)}>Show more Pokémon <span>({filtered.length - visible.length} remaining)</span></button>}</>
          : <p className="catalog-no-results">No Pokémon found. Try another name, number, or generation.</p>}
      </div>}
    </section>

    <section className="analysis-panel" aria-labelledby="analysis-title">
      <div className="analysis-heading"><p className="section-kicker">LIVE TEAM REPORT</p><h2 id="analysis-title">Defensive profile</h2><p>Type based coverage for the selected team. This does not account for abilities, held items, moves, or battle conditions.</p></div>
      {!totalSelected ? <div className="analysis-empty"><span aria-hidden="true">◉</span><strong>Your report is ready when your team is.</strong><p>Add a Pokémon to see shared weaknesses, resistances, immunities, and offensive coverage.</p></div> : <>
        <div className="report-highlights">
          <article className="report-card report-danger"><h3>Shared weaknesses</h3>{report.sharedWeaknesses.length ? <ul>{report.sharedWeaknesses.map(({ type, affected }) => <li key={type}><TypeBadge type={type} /><strong>{affected.length} members</strong><span>{affected.map(({ pokemon, multiplier }) => `${pokemon.name} (${MULTIPLIER_TEXT[multiplier]})`).join(', ')}</span></li>)}</ul> : <p>No shared weaknesses at the moment.</p>}</article>
          <article className="report-card report-strong"><h3>Strong defensive coverage</h3>{report.strongCoverage.length ? <ul>{report.strongCoverage.slice(0, 6).map(({ type, counts }) => <li key={type}><TypeBadge type={type} /><span>{counts[0]} immune · {counts[0.25]} quarter · {counts[0.5]} half</span></li>)}</ul> : <p>No resistances or immunities on this team.</p>}</article>
          <article className="report-card report-gap"><h3>Defensive gaps</h3>{report.defensiveGaps.length ? <ul>{report.defensiveGaps.map(({ type, affected }) => <li key={type}><TypeBadge type={type} /><span>{affected.map(({ pokemon, multiplier }) => `${pokemon.name} ${MULTIPLIER_TEXT[multiplier]}`).join(', ')}</span></li>)}</ul> : <p>No type currently threatens several members without a resistance or immunity elsewhere.</p>}</article>
        </div>
        {report.defensive.flatMap(({ affected, type }) => affected.filter(({ multiplier }) => multiplier === 4).map(({ pokemon }) => ({ type, pokemon }))).length > 0 && <p className="double-weakness-note"><strong>Double weaknesses:</strong> {report.defensive.flatMap(({ affected, type }) => affected.filter(({ multiplier }) => multiplier === 4).map(({ pokemon }) => `${pokemon.name} is 4× weak to ${type}`)).join('; ')}.</p>}
        <div className="coverage-table-wrap"><table className="coverage-table"><caption>Defensive coverage by attacking type. Neutral 1× matches are omitted and zero counts are blank. Other counts show team members receiving that multiplier.</caption><thead><tr><th scope="col">Incoming type</th>{MULTIPLIERS.map((multiplier) => <th scope="col" key={multiplier}>{MULTIPLIER_TEXT[multiplier]}</th>)}</tr></thead><tbody>{report.defensive.map(({ type, counts }) => <tr key={type}><th scope="row"><TypeBadge type={type} /></th>{MULTIPLIERS.map((multiplier) => <td key={multiplier} className={`multiplier-${String(multiplier).replace('.', '-')}`}>{counts[multiplier] === 0 ? <span className="visually-hidden">0</span> : counts[multiplier]}</td>)}</tr>)}</tbody></table></div>
        <section className="offensive-coverage" aria-labelledby="offensive-coverage-title"><div><p className="section-kicker">THEORETICAL TYPE BASED COVERAGE</p><h3 id="offensive-coverage-title">Potential STAB targets</h3><p>Based only on the selected Pokémon's types, assuming same type attacks. This does not confirm a Pokémon knows a move.</p></div>
          <div className="offensive-coverage-list">{report.offensive.map(({ type, suppliedBy, targets }) => <div key={type} className="offensive-type-row"><div><TypeBadge type={type} /><span>{suppliedBy.map((pokemon) => pokemon.name).join(', ')}</span></div><div className="effectiveness-types">{targets.length ? targets.map((target) => <TypeBadge key={target} type={target} />) : <span className="neutral-note">No super-effective single type targets</span>}</div></div>)}</div></section>
        <section className="individual-analysis" aria-labelledby="individual-analysis-title"><div className="section-divider"><h3 id="individual-analysis-title">Individual matchups</h3><p>Expand a team member for its full defensive type chart.</p></div>
          {roster.map((pokemon) => { const effectiveness = analyzePokemon(pokemon); return <details className="individual-pokemon-analysis" key={pokemon.id}><summary><PokemonImage pokemon={pokemon} compact /><span className="individual-summary-name">{pokemon.name}<small>#{String(pokemon.dexNumber).padStart(4, '0')}</small></span><span className="team-type-list">{pokemon.types.map((type) => <TypeBadge key={type} type={type} />)}</span><span className="summary-toggle">View matchups⌄</span></summary><div className="individual-matchups">
            <EffectivenessGroup label="Double weaknesses" multiplier={4} types={effectiveness[4]} /><EffectivenessGroup label="Weaknesses" multiplier={2} types={effectiveness[2]} /><EffectivenessGroup label="Resistances" multiplier={0.5} types={effectiveness[0.5]} /><EffectivenessGroup label="Double resistances" multiplier={0.25} types={effectiveness[0.25]} /><EffectivenessGroup label="Immunities" multiplier={0} types={effectiveness[0]} />
          </div></details>})}
        </section>
      </>}
    </section>
    <footer className="team-builder-footnote">Matchups use the TypeDex Generation IX type chart. Results describe type effectiveness only.</footer>
  </main>
}
