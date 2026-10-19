import { useMemo, useState } from 'react'
import { getAllTypeCycles } from '../domain/typeCycles'
import type { PokemonType } from '../domain/types'
import TypeIcon from './TypeIcon'

function TypeCycleCard({ cycle }: { cycle: PokemonType[] }) {
  const markerId = `cycle-arrowhead-${cycle.join('-').toLowerCase()}`
  const description = `${cycle.join(' beats ')} beats ${cycle[0]}`
  return <li className="type-cycle-list-item">
    <article className="type-cycle-card cycle-triangle">
      <div className="cycle-visual cycle-visual-triangle" role="img" aria-label={description}>
        <svg className="cycle-connectors" viewBox="0 0 235 168" aria-hidden="true">
          <defs><marker id={markerId} markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L7,3.5 L0,7 Z" /></marker></defs>
          {['M145 55 L166 103', 'M159 130 L76 130', 'M69 103 L90 55'].map((path, index) =>
            <path key={index} d={path} markerEnd={`url(#${markerId})`} />)}
        </svg>
        {cycle.map((type, index) => <span key={type} className={`cycle-node cycle-node-${index}`}>
          <TypeIcon type={type} />
          <span>{type}</span>
        </span>)}
      </div>
    </article>
  </li>
}

export default function TypeCyclesPage() {
  const [cyclesCollapsed, setCyclesCollapsed] = useState(false)
  const cycles = useMemo(() => getAllTypeCycles(), [])

  return <main className="page-shell">
    <header className="topbar">
      <a className="brand" href="#/" aria-label="TypeDex, Type Checker">
        <span className="brand-mark" aria-hidden="true" /><span>TypeDex</span>
      </a>
      <nav className="primary-nav" aria-label="Main navigation">
        <a href="#/">Type Checker</a><a href="#/team-builder">Team Builder</a>
      </nav>
    </header>

    <section className="cycle-browser" aria-labelledby="cycle-browser-title">
      <a className="back-button" href="#/"><span aria-hidden="true">&larr;</span> Type Checker</a>
      <div className="cycle-browser-heading">
        <p className="section-kicker">TYPE ADVANTAGE CYCLES</p>
        <h1 id="cycle-browser-title">Three-type cycles.</h1>
        <p>Every loop in the type chart, shown once. Each arrow points to a type it beats.</p>
      </div>
      <section className="type-cycle-section" aria-labelledby="type-cycle-section-title">
        <div className="type-cycle-section-heading">
          <div><p className="section-kicker">ALL TYPE ADVANTAGE LOOPS</p><h2 id="type-cycle-section-title">Every three-type cycle</h2></div>
          <button className="analysis-section-toggle" type="button" aria-expanded={!cyclesCollapsed} aria-controls="type-cycle-content"
            onClick={() => setCyclesCollapsed((collapsed) => !collapsed)}>
            {cyclesCollapsed ? 'Expand cycles' : 'Minimize cycles'}
          </button>
        </div>
        <div id="type-cycle-content" hidden={cyclesCollapsed}>
          {cycles.length > 0
            ? <ol className="type-cycle-list">{cycles.map((cycle) => <TypeCycleCard key={cycle.join('-')} cycle={cycle} />)}</ol>
            : <p className="type-cycle-empty">No three-type cycles are available.</p>}
        </div>
      </section>
    </section>
  </main>
}
