import { ALL_LOCATION_CODES, isKnownLocation } from './locations'
import { MOVABLE_ALLOWED, MOVABLE_FORBIDDEN } from './warningCategories'

export const EQUIPMENT_TYPES = {
  CABLE: 'cable',
  CABLE_DUAL: 'cable_dual',
  TRX: 'trx',
  SKI_ERG: 'ski_erg',
  REBOUNDER: 'rebounder',
  LEG_SLED: 'leg_sled',
  WEIGHT_BENCH: 'weight_bench',
  MOVABLE: 'movable',
}

export const ALLOWED_LOCATIONS_BY_TYPE = {
  [EQUIPMENT_TYPES.CABLE]: ['S1', 'S2'],
  [EQUIPMENT_TYPES.CABLE_DUAL]: ['S1', 'S2'],
  [EQUIPMENT_TYPES.TRX]: ['S3'],
  [EQUIPMENT_TYPES.SKI_ERG]: ['S6'],
  [EQUIPMENT_TYPES.REBOUNDER]: ['G4'],
  [EQUIPMENT_TYPES.LEG_SLED]: ['O1', 'O2', 'O3'],
  [EQUIPMENT_TYPES.WEIGHT_BENCH]: [
    'S4', 'S5', 'S7', 'S8', 'S9',
    'G1', 'G2', 'G3', 'G5', 'G6', 'G7',
  ],
  [EQUIPMENT_TYPES.MOVABLE]: MOVABLE_ALLOWED,
}

export const ADJACENT_BENCH_PAIRS = [
  ['S4', 'S5'],
  ['S7', 'S8'],
  ['S8', 'S9'],
  ['G1', 'G2'],
  ['G2', 'G3'],
  ['G6', 'G7'],
]

const ASSIGNMENT_PRIORITY = {
  [EQUIPMENT_TYPES.CABLE_DUAL]: 1,
  [EQUIPMENT_TYPES.TRX]: 2,
  [EQUIPMENT_TYPES.SKI_ERG]: 3,
  [EQUIPMENT_TYPES.REBOUNDER]: 4,
  [EQUIPMENT_TYPES.LEG_SLED]: 5,
  [EQUIPMENT_TYPES.CABLE]: 6,
  [EQUIPMENT_TYPES.WEIGHT_BENCH]: 7,
  [EQUIPMENT_TYPES.MOVABLE]: 8,
}

const MAX_WEIGHT_BENCH_STATIONS = 2
const MAX_LEG_SLED_STATIONS = 1

export const EQUIPMENT_CAPACITY = {
  [EQUIPMENT_TYPES.TRX]: 1,
  [EQUIPMENT_TYPES.SKI_ERG]: 1,
  [EQUIPMENT_TYPES.REBOUNDER]: 1,
  [EQUIPMENT_TYPES.LEG_SLED]: MAX_LEG_SLED_STATIONS,
  [EQUIPMENT_TYPES.WEIGHT_BENCH]: MAX_WEIGHT_BENCH_STATIONS,
}

function normalizeText(value) {
  return (value ?? '').toLowerCase().trim()
}

function getEquipmentClassificationText(template) {
  const equipmentRequired = normalizeText(template?.equipment_required)
  if (equipmentRequired) return equipmentRequired
  return normalizeText(template?.station_name)
}

export function getEquipmentTypeLabel(equipmentType) {
  switch (equipmentType) {
    case EQUIPMENT_TYPES.TRX:
      return 'TRX'
    case EQUIPMENT_TYPES.CABLE:
      return 'Cable'
    case EQUIPMENT_TYPES.CABLE_DUAL:
      return 'Cable'
    case EQUIPMENT_TYPES.SKI_ERG:
      return 'Ski Erg'
    case EQUIPMENT_TYPES.REBOUNDER:
      return 'Rebounder'
    case EQUIPMENT_TYPES.LEG_SLED:
      return 'Leg Sled'
    case EQUIPMENT_TYPES.WEIGHT_BENCH:
      return 'Weight Bench'
    default:
      return 'Common Movable'
  }
}

function indicatesBothCables(text) {
  return (
    /\bboth cables?\b/.test(text) ||
    /\bdual cables?\b/.test(text) ||
    /\b2 cables?\b/.test(text) ||
    /\btwo cables?\b/.test(text) ||
    /\b2 handles\b/.test(text)
  )
}

export function requiresBothCables(template) {
  const equipmentRequired = normalizeText(template?.equipment_required)
  const stationName = normalizeText(template?.station_name)

  if (equipmentRequired.includes('cable')) {
    return indicatesBothCables(equipmentRequired)
  }

  if (stationName.includes('cable')) {
    return indicatesBothCables(stationName)
  }

  return false
}

export function classifyEquipment(template) {
  return getEquipmentType(template)
}

export function getEquipmentType(template) {
  const text = getEquipmentClassificationText(template)

  if (/\btrx\b/.test(text)) {
    return EQUIPMENT_TYPES.TRX
  }
  if (text.includes('cable')) {
    return requiresBothCables(template)
      ? EQUIPMENT_TYPES.CABLE_DUAL
      : EQUIPMENT_TYPES.CABLE
  }
  if (text.includes('ski erg')) {
    return EQUIPMENT_TYPES.SKI_ERG
  }
  if (text.includes('rebounder')) {
    return EQUIPMENT_TYPES.REBOUNDER
  }
  if (text.includes('leg sled')) {
    return EQUIPMENT_TYPES.LEG_SLED
  }
  if (text.includes('bench')) {
    return EQUIPMENT_TYPES.WEIGHT_BENCH
  }

  return EQUIPMENT_TYPES.MOVABLE
}

function getAllowedLocationsForEquipmentType(equipmentType, activeLocationCodes = ALL_LOCATION_CODES) {
  const typeLocations = ALLOWED_LOCATIONS_BY_TYPE[equipmentType] ?? MOVABLE_ALLOWED
  const filtered =
    equipmentType === EQUIPMENT_TYPES.MOVABLE
      ? typeLocations.filter((code) => !MOVABLE_FORBIDDEN.includes(code))
      : typeLocations

  return filtered.filter((code) => activeLocationCodes.includes(code))
}

function buildDbEquipmentMap(equipmentAllowedLocations) {
  const map = new Map()
  for (const row of equipmentAllowedLocations) {
    if (!row.equipment_id || !row.location_code) continue
    if (!map.has(row.equipment_id)) {
      map.set(row.equipment_id, new Set())
    }
    map.get(row.equipment_id).add(row.location_code)
  }
  return map
}

function buildDbConflictSet(locationConflicts = []) {
  const set = new Set()
  for (const row of locationConflicts) {
    const a = row.location_code
    const b = row.conflict_with_location_code
    if (!a || !b) continue
    set.add(`${a}|${b}`)
    set.add(`${b}|${a}`)
  }
  return set
}

function intersectLocations(primary, secondary) {
  const secondarySet = new Set(secondary)
  return primary.filter((code) => secondarySet.has(code))
}

export function getAllowedLocationsForTemplate(
  template,
  equipmentAllowedLocations,
  activeLocationCodes = ALL_LOCATION_CODES,
) {
  const equipmentType = getEquipmentType(template)
  let typeLocations = getAllowedLocationsForEquipmentType(equipmentType, activeLocationCodes)

  if (template?.equipment_id) {
    const dbMap = buildDbEquipmentMap(equipmentAllowedLocations)
    const dbLocations = dbMap.get(template.equipment_id)
    if (dbLocations?.size) {
      typeLocations = intersectLocations(
        typeLocations,
        [...dbLocations].filter((code) => isKnownLocation(code)),
      )
    }
  }

  return typeLocations
}

function getAdjacentLocations(locationCode) {
  const adjacent = new Set()
  for (const [a, b] of ADJACENT_BENCH_PAIRS) {
    if (a === locationCode) adjacent.add(b)
    if (b === locationCode) adjacent.add(a)
  }
  return adjacent
}

function hasAdjacentBenchLocation(locationCode, benchLocations) {
  const adjacent = getAdjacentLocations(locationCode)
  return [...adjacent].some((code) => benchLocations.has(code))
}

function createEmptyState() {
  return {
    usedLocations: new Set(),
    benchStationCount: 0,
    legSledCount: 0,
    benchLocations: new Set(),
    dualCableReserved: false,
  }
}

function markLocationUsed(state, locationCode) {
  if (!locationCode || locationCode === '—') return
  if (locationCode === 'S1+S2') {
    state.usedLocations.add('S1')
    state.usedLocations.add('S2')
    state.dualCableReserved = true
    return
  }
  state.usedLocations.add(locationCode)
}

function applyAssignment(state, template, locationCode, equipmentAllowedLocations) {
  if (!locationCode || locationCode === '—') return

  const equipmentType = getEquipmentType(template)
  markLocationUsed(state, locationCode)

  if (equipmentType === EQUIPMENT_TYPES.WEIGHT_BENCH) {
    state.benchStationCount += 1
    if (locationCode !== 'S1+S2') {
      state.benchLocations.add(locationCode)
    }
  }
  if (equipmentType === EQUIPMENT_TYPES.LEG_SLED) {
    state.legSledCount += 1
  }
}

function getPreferredLocations(template, equipmentType, state, equipmentAllowedLocations, activeLocationCodes) {
  if (
    equipmentType === EQUIPMENT_TYPES.WEIGHT_BENCH &&
    state.benchStationCount >= MAX_WEIGHT_BENCH_STATIONS
  ) {
    return getAllowedLocationsForTemplate(
      { ...template, equipment_required: 'Common movable' },
      equipmentAllowedLocations,
      activeLocationCodes,
    )
  }

  return getAllowedLocationsForTemplate(
    template,
    equipmentAllowedLocations,
    activeLocationCodes,
  )
}

function evaluatePlacementViolations(
  locationCode,
  template,
  equipmentType,
  state,
  equipmentAllowedLocations,
  activeLocationCodes,
  dbConflictSet,
) {
  const violations = []
  const classifiedAllowed = getAllowedLocationsForEquipmentType(equipmentType, activeLocationCodes)

  const codesToCheck =
    locationCode === 'S1+S2' ? ['S1', 'S2'] : [locationCode]

  if (locationCode === 'S1+S2') {
    if (!classifiedAllowed.includes('S1') || !classifiedAllowed.includes('S2')) {
      violations.push('equipment-location')
    }
  } else if (!classifiedAllowed.includes(locationCode)) {
    violations.push('equipment-location')
  }

  for (const code of codesToCheck) {
    if (equipmentType === EQUIPMENT_TYPES.MOVABLE && MOVABLE_FORBIDDEN.includes(code)) {
      violations.push('movable-forbidden')
    }
  }

  if (locationCode === 'S2' && state.usedLocations.has('S3')) {
    violations.push('s3-blocks-s2')
  }
  if (locationCode === 'S3' && state.usedLocations.has('S2')) {
    violations.push('s2-blocks-s3')
  }
  if (
    locationCode === 'S3' &&
    (state.dualCableReserved || (state.usedLocations.has('S1') && state.usedLocations.has('S2')))
  ) {
    violations.push('s1-s2-block-s3')
  }
  if (locationCode === 'G3' && state.usedLocations.has('G4')) {
    violations.push('g4-blocks-g3')
  }

  for (const code of codesToCheck) {
    for (const used of state.usedLocations) {
      if (dbConflictSet.has(`${code}|${used}`)) {
        violations.push('db-conflict')
      }
    }
  }

  if (equipmentType === EQUIPMENT_TYPES.WEIGHT_BENCH) {
    if (state.benchStationCount >= MAX_WEIGHT_BENCH_STATIONS) {
      violations.push('max-weight-bench')
    }
    if (hasAdjacentBenchLocation(locationCode, state.benchLocations)) {
      violations.push('adjacent-bench')
    }
  }

  if (equipmentType === EQUIPMENT_TYPES.LEG_SLED && state.legSledCount >= MAX_LEG_SLED_STATIONS) {
    violations.push('max-leg-sled')
  }

  if (locationCode === 'S1+S2') {
    if (state.usedLocations.has('S1') || state.usedLocations.has('S2')) {
      violations.push('dual-cable-unavailable')
    }
  }

  return [...new Set(violations)]
}

export function noValidLocationWarning(template) {
  return `No valid location found for ${template.station_name ?? 'station'}.`
}

function violationMessages(template, locationCode, violations, equipmentType) {
  const name = template.station_name ?? 'Station'
  const label = getEquipmentTypeLabel(equipmentType)

  return violations.map((violation) => {
    switch (violation) {
      case 'equipment-location':
        return `"${name}" is assigned to ${locationCode} but is classified as ${label} equipment, which is not allowed at that location.`
      case 'movable-forbidden':
        return `"${name}" is assigned to ${locationCode} but is classified as ${label} equipment, which is not allowed at that location.`
      case 's3-blocks-s2':
        return `Location conflict: "${name}" at ${locationCode} — S3 is in use, so S2 cannot be used.`
      case 's2-blocks-s3':
        return `Location conflict: "${name}" at ${locationCode} — S2 is in use, so S3 cannot be used.`
      case 's1-s2-block-s3':
        return `Location conflict: "${name}" at ${locationCode} — both cable locations are in use, so S3 cannot be used.`
      case 'g4-blocks-g3':
        return `Location conflict: "${name}" at ${locationCode} — G4 is in use, so G3 cannot be used.`
      case 'adjacent-bench':
        return `Adjacent weight benches: "${name}" at ${locationCode} is next to another weight bench station.`
      case 'max-weight-bench':
        return `Weight bench limit: "${name}" exceeds the maximum of ${MAX_WEIGHT_BENCH_STATIONS} weight bench stations.`
      case 'max-leg-sled':
        return `Leg sled limit: "${name}" exceeds the maximum of ${MAX_LEG_SLED_STATIONS} leg sled station per class.`
      case 'dual-cable-unavailable':
        return `Location assignment: "${name}" requires both cables but S1 and S2 are not both available.`
      case 'db-conflict':
        return `Location conflict: "${name}" at ${locationCode} conflicts with another assigned location (database rule).`
      default:
        return `Location assignment: "${name}" at ${locationCode} violates placement rules.`
    }
  })
}

function rankCandidates(
  template,
  activeLocationCodes,
  state,
  equipmentAllowedLocations,
  locationConflicts,
) {
  const equipmentType = getEquipmentType(template)
  const preferred = new Set(
    equipmentType === EQUIPMENT_TYPES.CABLE_DUAL
      ? ['S1+S2']
      : getPreferredLocations(template, equipmentType, state, equipmentAllowedLocations, activeLocationCodes),
  )
  const dbConflictSet = buildDbConflictSet(locationConflicts)

  const candidateCodes =
    equipmentType === EQUIPMENT_TYPES.CABLE_DUAL
      ? ['S1+S2']
      : activeLocationCodes.filter((code) => !state.usedLocations.has(code))

  return candidateCodes
    .map((code) => {
      const violations = evaluatePlacementViolations(
        code,
        template,
        equipmentType,
        state,
        equipmentAllowedLocations,
        activeLocationCodes,
        dbConflictSet,
      )

      let score = 1000
      if (preferred.has(code)) score += 100
      score -= violations.length * 50

      return { code, score, violations }
    })
    .filter((item) => item.violations.length === 0)
    .sort((a, b) => b.score - a.score)
}

export function pickLocationForTemplate(
  template,
  activeLocationCodes,
  state,
  equipmentAllowedLocations,
  locationConflicts = [],
) {
  const ranked = rankCandidates(
    template,
    activeLocationCodes,
    state,
    equipmentAllowedLocations,
    locationConflicts,
  )

  if (ranked.length > 0) {
    return { locationCode: ranked[0].code, warnings: [] }
  }

  return {
    locationCode: null,
    warnings: [noValidLocationWarning(template)],
  }
}

export function sortTemplatesForAssignment(templates, equipmentAllowedLocations) {
  return [...templates].sort((a, b) => {
    const priorityA = ASSIGNMENT_PRIORITY[getEquipmentType(a)]
    const priorityB = ASSIGNMENT_PRIORITY[getEquipmentType(b)]
    if (priorityA !== priorityB) return priorityA - priorityB
    return (a.station_name ?? '').localeCompare(b.station_name ?? '')
  })
}

export function assignLocations({
  templates,
  activeLocationCodes,
  equipmentAllowedLocations,
  locationConflicts = [],
  existingAssignments = [],
}) {
  const state = createEmptyState()
  const warnings = []
  const results = new Map()

  for (const assignment of existingAssignments) {
    if (!assignment.template || !assignment.locationCode || assignment.locationCode === '—') {
      continue
    }
    applyAssignment(
      state,
      assignment.template,
      assignment.locationCode,
      equipmentAllowedLocations,
    )
    results.set(assignment.template.id, assignment.locationCode)
  }

  const sortedTemplates = sortTemplatesForAssignment(templates, equipmentAllowedLocations)

  for (const template of sortedTemplates) {
    if (results.has(template.id)) continue

    const { locationCode, warnings: placementWarnings } = pickLocationForTemplate(
      template,
      activeLocationCodes,
      state,
      equipmentAllowedLocations,
      locationConflicts,
    )

    warnings.push(...placementWarnings)

    if (locationCode) {
      applyAssignment(state, template, locationCode, equipmentAllowedLocations)
      results.set(template.id, locationCode)
    } else {
      results.set(template.id, null)
    }
  }

  return { assignments: results, warnings: [...new Set(warnings)] }
}

export function validateLocationAssignments(
  circuit,
  stationTemplates,
  equipmentAllowedLocations,
  locationConflicts = [],
) {
  const templateById = new Map(stationTemplates.map((template) => [template.id, template]))
  const warnings = []
  const state = createEmptyState()
  const dbConflictSet = buildDbConflictSet(locationConflicts)

  const ordered = [...circuit].sort((a, b) => a.stationNumber - b.stationNumber)

  for (const row of ordered) {
    const template = templateById.get(row.templateId)
    if (!template) continue

    if (!row.locationCode || row.locationCode === '—') {
      warnings.push(noValidLocationWarning(template))
      continue
    }

    const equipmentType = getEquipmentType(template)
    const violations = evaluatePlacementViolations(
      row.locationCode,
      template,
      equipmentType,
      state,
      equipmentAllowedLocations,
      ALL_LOCATION_CODES,
      dbConflictSet,
    )
    warnings.push(...violationMessages(template, row.locationCode, violations, equipmentType))
    applyAssignment(state, template, row.locationCode, equipmentAllowedLocations)
  }

  return [...new Set(warnings)]
}

export function expandLocationCodes(locationCode) {
  if (locationCode === 'S1+S2') return ['S1', 'S2']
  if (!locationCode || locationCode === '—') return []
  return [locationCode]
}
