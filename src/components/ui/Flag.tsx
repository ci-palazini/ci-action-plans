import { COUNTRY_ISO } from '../../lib/constants'

export function Flag({ countryId, className }: { countryId: string; className?: string }) {
  const iso = COUNTRY_ISO[countryId]
  if (!iso) return null
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      width={24}
      height={18}
      alt={countryId}
      className={className}
      style={{ display: 'inline-block', objectFit: 'cover' }}
    />
  )
}
