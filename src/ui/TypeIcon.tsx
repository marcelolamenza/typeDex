import type { PokemonType } from '../domain/types'

export default function TypeIcon({ type, size = 'normal' }: { type: PokemonType; size?: 'normal' | 'large' }) {
  return <span className={`type-icon ${size}`} aria-hidden="true">
    <img src={`${import.meta.env.BASE_URL}type-icons/${type.toLowerCase()}.svg`} alt="" />
  </span>
}
