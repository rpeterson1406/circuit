import { ALL_LOCATION_CODES, isKnownLocation } from './locations'
import { assignLocations } from './locationAssignment'
import { buildRoundCountMap, getTemplateRoundCount } from './rounds'
import { selectStations } from './stationSelector'

function getAvailableLocations(stationLocations) {
  const fromDb = stationLocations
    .map((row) => row.location_code)
    .filter((code) => isKnownLocation(code))

  if (fromDb.length > 0) {
    return ALL_LOCATION_CODES.filter((code) => fromDb.includes(code))
  }

  return [...ALL_LOCATION_CODES]
}

function createStationRow(stationNumber, template, locationCode, roundCount, locked = false) {
  return {
    id: `${template.id}-${stationNumber}`,
    stationNumber,
    locationCode: locationCode ?? '—',
    templateId: template.id,
    stationName: template.station_name ?? 'Unnamed station',
    plannerCategory: template.planner_category ?? '—',
    equipmentRequired: template.equipment_required ?? '—',
    roundCount,
    locked,
    manuallyEdited: false,
  }
}

function buildEmptyRow(stationNumber, existingRow) {
  return {
    id: existingRow?.id ?? `empty-${stationNumber}`,
    stationNumber,
    locationCode: '—',
    templateId: null,
    stationName: '—',
    plannerCategory: '—',
    equipmentRequired: '—',
    roundCount: '—',
    locked: false,
    manuallyEdited: existingRow?.manuallyEdited ?? false,
  }
}

export function generateCircuit({
  stationCount,
  classRoundCount,
  stationTemplates,
  stationRounds = [],
  stationLocations,
  locationConflicts,
  equipmentAllowedLocations,
  existingCircuit = [],
}) {
  const warnings = []
  const templateById = new Map(stationTemplates.map((template) => [template.id, template]))
  const roundCountMap = buildRoundCountMap(stationRounds)
  const lockedRows = existingCircuit.filter((row) => row.locked && row.templateId)
  const clearedSlotCount = existingCircuit.filter((row) => !row.templateId).length
  const lockedTemplates = lockedRows
    .map((row) => templateById.get(row.templateId))
    .filter(Boolean)

  const slotsToGenerate = Math.max(0, stationCount - lockedRows.length - clearedSlotCount)

  const {
    selected,
    warnings: selectionWarnings,
    categoryTargets,
    availableCategories,
    unavailableCategories,
  } = selectStations({
    stationCount,
    classRoundCount: Number(classRoundCount),
    stationTemplates,
    lockedTemplates,
  })

  warnings.push(...selectionWarnings)

  const activeLocationCodes = getAvailableLocations(stationLocations)
  const existingAssignments = lockedRows
    .filter((row) => row.locationCode && row.locationCode !== '—')
    .map((row) => ({
      template: templateById.get(row.templateId),
      locationCode: row.locationCode,
    }))
    .filter((assignment) => assignment.template)

  const unlockedSelected = selected.filter(
    (template) => !lockedTemplates.some((locked) => locked.id === template.id),
  )

  const templatesForAssignment = unlockedSelected.slice(0, slotsToGenerate)

  const { assignments, warnings: locationWarnings } = assignLocations({
    templates: templatesForAssignment,
    activeLocationCodes,
    equipmentAllowedLocations,
    locationConflicts,
    existingAssignments,
  })

  warnings.push(...locationWarnings)

  const assignmentQueue = [...templatesForAssignment]
  const circuit = []
  const existingRows = existingCircuit.slice(0, stationCount)

  for (let index = 0; index < stationCount; index += 1) {
    const existingRow = existingRows[index]

    if (existingRow?.locked && existingRow.templateId) {
      const template = templateById.get(existingRow.templateId)
      circuit.push({
        ...existingRow,
        roundCount: template
          ? getTemplateRoundCount(template, roundCountMap, classRoundCount)
          : existingRow.roundCount,
        locked: true,
      })
      continue
    }

    if (existingRow && !existingRow.templateId) {
      circuit.push(buildEmptyRow(index + 1, existingRow))
      continue
    }

    const template = assignmentQueue.shift()
    if (!template) {
      circuit.push(buildEmptyRow(index + 1, existingRow))
      continue
    }

    circuit.push(
      createStationRow(
        index + 1,
        template,
        assignments.get(template.id) ?? null,
        getTemplateRoundCount(template, roundCountMap, classRoundCount),
        false,
      ),
    )
  }

  while (circuit.length < stationCount) {
    const template = assignmentQueue.shift()
    if (!template) {
      circuit.push(buildEmptyRow(circuit.length + 1))
      continue
    }

    circuit.push(
      createStationRow(
        circuit.length + 1,
        template,
        assignments.get(template.id) ?? null,
        getTemplateRoundCount(template, roundCountMap, classRoundCount),
        false,
      ),
    )
  }

  return {
    circuit: circuit.slice(0, stationCount).map((row, index) => ({
      ...row,
      stationNumber: index + 1,
      id: row.templateId ? `${row.templateId}-${index + 1}` : row.id ?? `empty-${index + 1}`,
    })),
    warnings: [...new Set(warnings)],
    categoryTargets,
    availableCategories,
    unavailableCategories,
  }
}
