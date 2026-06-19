import {
  ADJACENT_BENCH_PAIRS,
  EQUIPMENT_TYPES,
  expandLocationCodes,
  getEquipmentType,
  noValidLocationWarning,
  validateLocationAssignments,
} from './locationAssignment'
import { isTruthy } from './stationSelector'
import { categorizeWarnings } from './warningCategories'

const MAX_HEAVY = 2
const MAX_WEIGHT_BENCH = 2
const MAX_LEG_SLED = 1

function buildConflictSet(conflicts) {
  const set = new Set()
  for (const row of conflicts) {
    const a = row.location_code
    const b = row.conflict_with_location_code
    if (!a || !b) continue
    set.add(`${a}|${b}`)
    set.add(`${b}|${a}`)
  }
  return set
}

function isThreeRoundClass(classRoundCount) {
  return Number(classRoundCount) === 3
}

function getTemplateMap(stationTemplates) {
  return new Map(stationTemplates.map((template) => [template.id, template]))
}

function getActiveLocations(circuit) {
  return circuit.flatMap((row) => expandLocationCodes(row.locationCode))
}

function checkDuplicateStationFamilies(circuit, stationTemplates) {
  const templateById = getTemplateMap(stationTemplates)
  const familyCounts = {}

  for (const row of circuit) {
    if (!row.templateId) continue
    const family = templateById.get(row.templateId)?.station_family
    if (!family) continue
    familyCounts[family] = (familyCounts[family] ?? 0) + 1
  }

  return Object.entries(familyCounts)
    .filter(([, count]) => count > 1)
    .map(
      ([family, count]) =>
        `Duplicate station family: "${family}" appears ${count} times in this class.`,
    )
}

function checkHeavyLimits(circuit, stationTemplates) {
  const templateById = getTemplateMap(stationTemplates)
  let heavyLowBack = 0
  let heavyShoulder = 0
  let twistingLoaded = 0

  for (const row of circuit) {
    const template = templateById.get(row.templateId)
    if (!template) continue
    if (isTruthy(template.heavy_low_back)) heavyLowBack += 1
    if (isTruthy(template.heavy_shoulder)) heavyShoulder += 1
    if (isTruthy(template.twisting_loaded)) twistingLoaded += 1
  }

  const warnings = []
  if (heavyLowBack > MAX_HEAVY) {
    warnings.push(`More than ${MAX_HEAVY} heavy_low_back stations (${heavyLowBack} selected).`)
  }
  if (heavyShoulder > MAX_HEAVY) {
    warnings.push(`More than ${MAX_HEAVY} heavy_shoulder stations (${heavyShoulder} selected).`)
  }
  if (twistingLoaded > MAX_HEAVY) {
    warnings.push(`More than ${MAX_HEAVY} twisting_loaded stations (${twistingLoaded} selected).`)
  }
  return warnings
}

function checkFourRoundStationsInThreeRoundClass(circuit, stationTemplates, classRoundCount) {
  if (!isThreeRoundClass(classRoundCount)) return []

  const templateById = getTemplateMap(stationTemplates)
  return circuit
    .filter((row) => isTruthy(templateById.get(row.templateId)?.requires_4_rounds))
    .map(
      (row) =>
        `3-round class includes a 4-round station: "${row.stationName}" requires 4 rounds.`,
    )
}

function checkDatabaseLocationConflicts(circuit, conflictSet) {
  const warnings = []
  const locations = getActiveLocations(circuit)

  for (let i = 0; i < locations.length; i += 1) {
    for (let j = i + 1; j < locations.length; j += 1) {
      if (conflictSet.has(`${locations[i]}|${locations[j]}`)) {
        warnings.push(
          `Location conflict: ${locations[i]} and ${locations[j]} cannot be used together.`,
        )
      }
    }
  }

  return warnings
}

function checkBuiltInLocationConflicts(circuit) {
  const used = new Set(getActiveLocations(circuit))
  const warnings = []

  if (used.has('S3') && used.has('S2')) {
    warnings.push('Location conflict: S3 and S2 cannot both be used.')
  }
  if (used.has('S3') && used.has('S1') && used.has('S2')) {
    warnings.push('Location conflict: S3 cannot be used when both S1 and S2 are in use.')
  }
  if (used.has('G4') && used.has('G3')) {
    warnings.push('Location conflict: G4 and G3 cannot both be used.')
  }

  return warnings
}

function checkAdjacentWeightBenches(circuit, stationTemplates, equipmentAllowedLocations) {
  const templateById = getTemplateMap(stationTemplates)
  const benchLocations = new Set()

  for (const row of circuit) {
    const template = templateById.get(row.templateId)
    if (!template || !row.locationCode || row.locationCode === '—') continue
    if (getEquipmentType(template) === EQUIPMENT_TYPES.WEIGHT_BENCH) {
      expandLocationCodes(row.locationCode).forEach((code) => benchLocations.add(code))
    }
  }

  const warnings = []
  for (const [a, b] of ADJACENT_BENCH_PAIRS) {
    if (benchLocations.has(a) && benchLocations.has(b)) {
      warnings.push(`Adjacent weight benches: ${a} and ${b} both have weight bench stations.`)
    }
  }

  return warnings
}

function checkWeightBenchCount(circuit, stationTemplates, equipmentAllowedLocations) {
  const templateById = getTemplateMap(stationTemplates)
  let count = 0

  for (const row of circuit) {
    const template = templateById.get(row.templateId)
    if (!template) continue
    if (getEquipmentType(template) === EQUIPMENT_TYPES.WEIGHT_BENCH) {
      count += 1
    }
  }

  if (count > MAX_WEIGHT_BENCH) {
    return [`More than ${MAX_WEIGHT_BENCH} weight bench stations (${count} selected).`]
  }
  return []
}

function checkLegSledCount(circuit, stationTemplates, equipmentAllowedLocations) {
  const templateById = getTemplateMap(stationTemplates)
  let count = 0

  for (const row of circuit) {
    const template = templateById.get(row.templateId)
    if (!template) continue
    if (getEquipmentType(template) === EQUIPMENT_TYPES.LEG_SLED) {
      count += 1
    }
  }

  if (count > MAX_LEG_SLED) {
    return [`More than ${MAX_LEG_SLED} leg sled station (${count} selected).`]
  }
  return []
}

function checkUnassignedLocations(circuit, stationTemplates) {
  const templateById = getTemplateMap(stationTemplates)
  return circuit
    .filter((row) => row.templateId && (!row.locationCode || row.locationCode === '—'))
    .map((row) => {
      const template = templateById.get(row.templateId)
      return template
        ? noValidLocationWarning(template)
        : `No valid location found for ${row.stationName}.`
    })
}

function countAdjacentBenchViolations(circuit, stationTemplates) {
  const templateById = getTemplateMap(stationTemplates)
  const benchLocations = new Set()

  for (const row of circuit) {
    const template = templateById.get(row.templateId)
    if (!template || !row.locationCode || row.locationCode === '—') continue
    if (getEquipmentType(template) === EQUIPMENT_TYPES.WEIGHT_BENCH) {
      expandLocationCodes(row.locationCode).forEach((code) => benchLocations.add(code))
    }
  }

  let violations = 0
  for (const [a, b] of ADJACENT_BENCH_PAIRS) {
    if (benchLocations.has(a) && benchLocations.has(b)) {
      violations += 1
    }
  }

  return violations
}

function countLocationConflicts(circuit, locationConflicts) {
  const conflictSet = buildConflictSet(locationConflicts ?? [])
  return (
    checkBuiltInLocationConflicts(circuit).length +
    checkDatabaseLocationConflicts(circuit, conflictSet).length
  )
}

export function buildRuleValidationSummary({
  circuit,
  stationTemplates = [],
  locationConflicts = [],
}) {
  const templateById = getTemplateMap(stationTemplates)

  let weightBenches = 0
  let trxStations = 0
  let legSledStations = 0
  let heavyLowBack = 0
  let heavyShoulder = 0
  let twistingLoaded = 0

  for (const row of circuit) {
    if (!row.templateId) continue
    const template = templateById.get(row.templateId)
    if (!template) continue

    const equipmentType = getEquipmentType(template)
    if (equipmentType === EQUIPMENT_TYPES.WEIGHT_BENCH) weightBenches += 1
    if (equipmentType === EQUIPMENT_TYPES.TRX) trxStations += 1
    if (equipmentType === EQUIPMENT_TYPES.LEG_SLED) legSledStations += 1
    if (isTruthy(template.heavy_low_back)) heavyLowBack += 1
    if (isTruthy(template.heavy_shoulder)) heavyShoulder += 1
    if (isTruthy(template.twisting_loaded)) twistingLoaded += 1
  }

  return {
    weightBenches: { count: weightBenches, limit: MAX_WEIGHT_BENCH },
    adjacentBenchViolations: {
      count: countAdjacentBenchViolations(circuit, stationTemplates),
    },
    trxStations: { count: trxStations, limit: 1 },
    legSledStations: { count: legSledStations, limit: MAX_LEG_SLED },
    heavyLowBack: { count: heavyLowBack, limit: MAX_HEAVY },
    heavyShoulder: { count: heavyShoulder, limit: MAX_HEAVY },
    twistingLoaded: { count: twistingLoaded, limit: MAX_HEAVY },
    locationConflicts: {
      count: countLocationConflicts(circuit, locationConflicts),
    },
  }
}

export function validateCircuit({
  circuit,
  classRoundCount,
  stationTemplates,
  locationConflicts,
  equipmentAllowedLocations,
}) {
  const conflictSet = buildConflictSet(locationConflicts ?? [])

  const locationWarnings = [
    ...validateLocationAssignments(
      circuit,
      stationTemplates,
      equipmentAllowedLocations,
      locationConflicts,
    ),
    ...checkBuiltInLocationConflicts(circuit),
    ...checkDatabaseLocationConflicts(circuit, conflictSet),
    ...checkAdjacentWeightBenches(circuit, stationTemplates, equipmentAllowedLocations),
    ...checkWeightBenchCount(circuit, stationTemplates, equipmentAllowedLocations),
    ...checkLegSledCount(circuit, stationTemplates, equipmentAllowedLocations),
    ...checkUnassignedLocations(circuit, stationTemplates),
  ]

  const categoryWarnings = []

  const otherWarnings = [
    ...checkDuplicateStationFamilies(circuit, stationTemplates),
    ...checkHeavyLimits(circuit, stationTemplates),
    ...checkFourRoundStationsInThreeRoundClass(circuit, stationTemplates, classRoundCount),
  ]

  const categorized = {
    locationWarnings: [...new Set(locationWarnings)],
    categoryWarnings: [...new Set(categoryWarnings)],
    otherWarnings: [...new Set(otherWarnings)],
  }

  return {
    ...categorized,
    all: [
      ...categorized.locationWarnings,
      ...categorized.categoryWarnings,
      ...categorized.otherWarnings,
    ],
  }
}

export function validateCircuitFlat(args) {
  return validateCircuit(args).all
}

export { categorizeWarnings }
