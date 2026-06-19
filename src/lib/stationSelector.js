import {
  EQUIPMENT_CAPACITY,
  classifyEquipment,
  getEquipmentTypeLabel,
} from './locationAssignment'
import { filterActiveTemplates } from './templateFilters'

export const PLANNER_CATEGORIES = [
  'Lower Body',
  'Upper Push',
  'Upper Pull',
  'Core',
  'Cardio / Conditioning',
  'Mobility / Balance',
  'Power',
  'Full Body',
]

const HEAVY_LIMIT = 2

export function isTruthy(value) {
  return value === true || value === 'true' || value === 1
}

export function getAvailableCategories(stationTemplates) {
  const categories = new Set()

  for (const template of filterActiveTemplates(stationTemplates)) {
    if (
      template.planner_category &&
      PLANNER_CATEGORIES.includes(template.planner_category)
    ) {
      categories.add(template.planner_category)
    }
  }

  return PLANNER_CATEGORIES.filter((category) => categories.has(category))
}

export function getUnavailableCategories(stationTemplates) {
  const available = new Set(getAvailableCategories(stationTemplates))
  return PLANNER_CATEGORIES.filter((category) => !available.has(category))
}

export function calculateCategoryTargets(stationCount, availableCategories = PLANNER_CATEGORIES) {
  if (availableCategories.length === 0) {
    return Object.fromEntries(PLANNER_CATEGORIES.map((category) => [category, 0]))
  }

  const base = Math.floor(stationCount / availableCategories.length)
  const extra = stationCount % availableCategories.length

  const targets = Object.fromEntries(PLANNER_CATEGORIES.map((category) => [category, 0]))
  availableCategories.forEach((category, index) => {
    targets[category] = base + (index < extra ? 1 : 0)
  })

  return targets
}

export function getCategoryCountsFromCircuit(circuit) {
  const counts = Object.fromEntries(PLANNER_CATEGORIES.map((category) => [category, 0]))

  for (const row of circuit) {
    if (!row.templateId) continue
    if (counts[row.plannerCategory] !== undefined) {
      counts[row.plannerCategory] += 1
    }
  }

  return counts
}

export function buildCategoryBalance(stationCount, circuit, stationTemplates = []) {
  const availableCategories = getAvailableCategories(stationTemplates)
  const unavailableCategories = getUnavailableCategories(stationTemplates)

  return {
    targets: calculateCategoryTargets(stationCount, availableCategories),
    counts: getCategoryCountsFromCircuit(circuit),
    availableCategories,
    unavailableCategories,
  }
}

function createEmptyEquipmentCounts() {
  return Object.fromEntries(Object.keys(EQUIPMENT_CAPACITY).map((type) => [type, 0]))
}

function createSelectionState(selectedTemplates = []) {
  const state = {
    selected: [],
    categoryCounts: Object.fromEntries(PLANNER_CATEGORIES.map((c) => [c, 0])),
    familyCounts: {},
    heavyLowBack: 0,
    heavyShoulder: 0,
    twistingLoaded: 0,
    equipmentCounts: createEmptyEquipmentCounts(),
  }

  for (const template of selectedTemplates) {
    applyTemplateToState(state, template)
  }

  return state
}

function applyTemplateToState(state, template) {
  state.selected.push(template)

  const category = template.planner_category
  if (category && state.categoryCounts[category] !== undefined) {
    state.categoryCounts[category] += 1
  }

  const family = template.station_family
  if (family) {
    state.familyCounts[family] = (state.familyCounts[family] ?? 0) + 1
  }

  if (isTruthy(template.heavy_low_back)) state.heavyLowBack += 1
  if (isTruthy(template.heavy_shoulder)) state.heavyShoulder += 1
  if (isTruthy(template.twisting_loaded)) state.twistingLoaded += 1

  const equipmentType = classifyEquipment(template)
  if (EQUIPMENT_CAPACITY[equipmentType] !== undefined) {
    state.equipmentCounts[equipmentType] += 1
  }
}

function wouldExceedEquipmentCapacity(template, state) {
  const equipmentType = classifyEquipment(template)
  const limit = EQUIPMENT_CAPACITY[equipmentType]
  if (limit === undefined) return false
  return state.equipmentCounts[equipmentType] >= limit
}

function wouldViolateHeavyLimits(template, state) {
  if (isTruthy(template.heavy_low_back) && state.heavyLowBack >= HEAVY_LIMIT) return true
  if (isTruthy(template.heavy_shoulder) && state.heavyShoulder >= HEAVY_LIMIT) return true
  if (isTruthy(template.twisting_loaded) && state.twistingLoaded >= HEAVY_LIMIT) return true
  return false
}

function wouldDuplicateFamily(template, state) {
  const family = template.station_family
  if (!family) return false
  return (state.familyCounts[family] ?? 0) > 0
}

function wouldIncludeFourRoundStation(template, classRoundCount) {
  return classRoundCount === 3 && isTruthy(template.requires_4_rounds)
}

function passesEquipmentAndHeavyConstraints(template, state) {
  return !wouldExceedEquipmentCapacity(template, state) && !wouldViolateHeavyLimits(template, state)
}

function passesPreferredConstraints(template, state, classRoundCount) {
  return (
    passesEquipmentAndHeavyConstraints(template, state) &&
    !wouldDuplicateFamily(template, state) &&
    !wouldIncludeFourRoundStation(template, classRoundCount)
  )
}

function recordForcedConstraintWarnings(template, state, classRoundCount, warnings) {
  const name = template.station_name ?? 'Station'

  if (wouldExceedEquipmentCapacity(template, state)) {
    warnings.push(
      `Included "${name}" despite exceeding ${getEquipmentTypeLabel(classifyEquipment(template))} capacity — no valid alternative remained.`,
    )
  }

  if (isTruthy(template.heavy_low_back) && state.heavyLowBack >= HEAVY_LIMIT) {
    warnings.push(
      `Included "${name}" despite exceeding heavy_low_back limit — no valid alternative remained.`,
    )
  }

  if (isTruthy(template.heavy_shoulder) && state.heavyShoulder >= HEAVY_LIMIT) {
    warnings.push(
      `Included "${name}" despite exceeding heavy_shoulder limit — no valid alternative remained.`,
    )
  }

  if (isTruthy(template.twisting_loaded) && state.twistingLoaded >= HEAVY_LIMIT) {
    warnings.push(
      `Included "${name}" despite exceeding twisting_loaded limit — no valid alternative remained.`,
    )
  }

  if (wouldDuplicateFamily(template, state)) {
    warnings.push(
      `Included "${name}" despite duplicating station family "${template.station_family}" — no valid alternative remained.`,
    )
  }

  if (wouldIncludeFourRoundStation(template, classRoundCount)) {
    warnings.push(
      `3-round class includes a 4-round station: "${name}" requires 4 rounds.`,
    )
  }
}

function pickFromPool(pool, predicate) {
  const matches = pool.filter(predicate)
  if (matches.length === 0) return null
  return matches[Math.floor(Math.random() * matches.length)]
}

function pickForCategory(pool, category, state, classRoundCount, strictness) {
  const inCategory = (template) => template.planner_category === category

  if (strictness === 'preferred') {
    return pickFromPool(pool, (template) => inCategory(template) && passesPreferredConstraints(template, state, classRoundCount))
  }

  if (strictness === 'equipment-heavy') {
    return pickFromPool(pool, (template) => inCategory(template) && passesEquipmentAndHeavyConstraints(template, state))
  }

  return pickFromPool(pool, inCategory)
}

function getCategoriesNeedingStations(targets, state, availableCategories) {
  return availableCategories
    .map((category) => ({
      category,
      deficit: targets[category] - (state.categoryCounts[category] ?? 0),
    }))
    .filter((entry) => entry.deficit > 0)
    .sort((a, b) => b.deficit - a.deficit)
}

function fillCategoryTargets({
  pool,
  state,
  stationCount,
  targets,
  availableCategories,
  classRoundCount,
  warnings,
  warnedCategories,
}) {
  const strictnessLevels = ['preferred', 'equipment-heavy', 'any']

  while (state.selected.length < stationCount && pool.length > 0) {
    const needing = getCategoriesNeedingStations(targets, state, availableCategories)
    if (needing.length === 0) break

    let picked = null

    for (const { category } of needing) {
      for (const strictness of strictnessLevels) {
        picked = pickForCategory(pool, category, state, classRoundCount, strictness)
        if (picked) break
      }

      if (picked) break

      if (!warnedCategories.has(category)) {
        warnings.push(
          `No eligible stations remaining for "${category}" (selected ${state.categoryCounts[category]}, target ${targets[category]}).`,
        )
        warnedCategories.add(category)
      }
    }

    if (!picked) break

    if (!passesPreferredConstraints(picked, state, classRoundCount)) {
      recordForcedConstraintWarnings(picked, state, classRoundCount, warnings)
    }

    applyTemplateToState(state, picked)
    pool.splice(pool.indexOf(picked), 1)
  }
}

function pickRemainingCandidate(pool, state, classRoundCount, strictness) {
  if (strictness === 'preferred') {
    return pickFromPool(pool, (template) => passesPreferredConstraints(template, state, classRoundCount))
  }

  if (strictness === 'equipment-heavy') {
    return pickFromPool(pool, (template) => passesEquipmentAndHeavyConstraints(template, state))
  }

  return pickFromPool(pool, () => true)
}

function fillRemainingSlots({
  pool,
  state,
  stationCount,
  classRoundCount,
  warnings,
}) {
  const strictnessLevels = ['preferred', 'equipment-heavy', 'any']

  while (state.selected.length < stationCount && pool.length > 0) {
    let picked = null

    for (const strictness of strictnessLevels) {
      picked = pickRemainingCandidate(pool, state, classRoundCount, strictness)
      if (picked) break
    }

    if (!picked) break

    if (!passesPreferredConstraints(picked, state, classRoundCount)) {
      recordForcedConstraintWarnings(picked, state, classRoundCount, warnings)
    }

    applyTemplateToState(state, picked)
    pool.splice(pool.indexOf(picked), 1)
  }
}

export function selectStations({
  stationCount,
  classRoundCount,
  stationTemplates,
  lockedTemplates = [],
}) {
  const activeTemplates = filterActiveTemplates(stationTemplates)
  const availableCategories = getAvailableCategories(stationTemplates)
  const unavailableCategories = getUnavailableCategories(stationTemplates)
  const categoryTargets = calculateCategoryTargets(stationCount, availableCategories)
  const lockedIds = new Set(lockedTemplates.map((template) => template.id))
  const pool = activeTemplates.filter((template) => !lockedIds.has(template.id))
  const warnings = []

  if (activeTemplates.length === 0) {
    return {
      selected: [],
      warnings: ['No active station templates found in the database.'],
      categoryTargets,
      availableCategories,
      unavailableCategories,
    }
  }

  if (availableCategories.length === 0) {
    warnings.push('No station templates are available for any planner category.')
  }

  if (unavailableCategories.length > 0) {
    warnings.push(
      `Categories unavailable (no active templates): ${unavailableCategories.join(', ')}.`,
    )
  }

  if (activeTemplates.length < stationCount) {
    warnings.push(
      `Only ${activeTemplates.length} active station template(s) exist in the database, but ${stationCount} were requested.`,
    )
  }

  if (lockedTemplates.length > stationCount) {
    return {
      selected: lockedTemplates.slice(0, stationCount),
      warnings: [
        ...warnings,
        'More locked stations than the requested station count. Only the first locked stations were kept.',
      ],
      categoryTargets,
      availableCategories,
      unavailableCategories,
    }
  }

  const state = createSelectionState(lockedTemplates)
  const warnedCategories = new Set()

  fillCategoryTargets({
    pool,
    state,
    stationCount,
    targets: categoryTargets,
    availableCategories,
    classRoundCount,
    warnings,
    warnedCategories,
  })

  fillRemainingSlots({
    pool,
    state,
    stationCount,
    classRoundCount,
    warnings,
  })

  if (state.selected.length < stationCount) {
    warnings.push(
      `Could only select ${state.selected.length} of ${stationCount} requested stations due to limited active templates.`,
    )
  }

  return {
    selected: state.selected,
    warnings,
    categoryTargets,
    availableCategories,
    unavailableCategories,
  }
}

export const selectStationTemplates = selectStations
