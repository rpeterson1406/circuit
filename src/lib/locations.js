export const STRENGTH_LOCATIONS = Array.from({ length: 9 }, (_, i) => `S${i + 1}`)
export const GYM_LOCATIONS = Array.from({ length: 7 }, (_, i) => `G${i + 1}`)
export const OUTDOOR_LOCATIONS = Array.from({ length: 4 }, (_, i) => `O${i + 1}`)

export const ALL_LOCATION_CODES = [
  ...STRENGTH_LOCATIONS,
  ...GYM_LOCATIONS,
  ...OUTDOOR_LOCATIONS,
]

export const LOCATION_ZONES = [
  { id: 'strength', label: 'Strength Floor', codes: STRENGTH_LOCATIONS },
  { id: 'gym', label: 'Gym Floor', codes: GYM_LOCATIONS },
  { id: 'outdoor', label: 'Outdoor', codes: OUTDOOR_LOCATIONS },
]

export function isKnownLocation(code) {
  return ALL_LOCATION_CODES.includes(code)
}

export function getLocationSortIndex(locationCode) {
  if (!locationCode || locationCode === '—') return Infinity
  if (locationCode === 'S1+S2') return ALL_LOCATION_CODES.indexOf('S1')

  const index = ALL_LOCATION_CODES.indexOf(locationCode)
  return index === -1 ? Infinity : index
}

export function sortCircuitRowsByLocation(rows) {
  return [...rows].sort((a, b) => {
    const locationOrder =
      getLocationSortIndex(a.locationCode) - getLocationSortIndex(b.locationCode)
    if (locationOrder !== 0) return locationOrder

    return (a.stationNumber ?? 0) - (b.stationNumber ?? 0)
  })
}
