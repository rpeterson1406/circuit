import { getAllowedLocationsForTemplate, expandLocationCodes } from './locationAssignment'
import { getTemplateRoundCount } from './rounds'
import { filterActiveTemplates } from './templateFilters'

export function buildCircuitRowFromTemplate(
  template,
  row,
  { locked = row.locked, roundCountMap, classRoundCount } = {},
) {
  return {
    ...row,
    templateId: template.id,
    stationName: template.station_name ?? 'Unnamed station',
    plannerCategory: template.planner_category ?? '—',
    equipmentRequired: template.equipment_required ?? '—',
    roundCount: getTemplateRoundCount(template, roundCountMap, classRoundCount),
    locked,
    manuallyEdited: true,
  }
}

export function getEligibleSwapTemplates({
  row,
  circuit,
  stationTemplates,
  equipmentAllowedLocations,
}) {
  if (!row.locationCode || row.locationCode === '—') {
    return []
  }

  const requiredCodes = expandLocationCodes(row.locationCode)
  if (requiredCodes.length === 0) {
    return []
  }

  const usedTemplateIds = new Set(
    circuit
      .filter((entry) => entry.id !== row.id && entry.templateId)
      .map((entry) => entry.templateId),
  )

  const eligible = filterActiveTemplates(stationTemplates)
    .filter((template) => template.id !== row.templateId)
    .filter((template) => !usedTemplateIds.has(template.id))
    .filter((template) => {
      const allowed = getAllowedLocationsForTemplate(
        template,
        equipmentAllowedLocations,
        requiredCodes,
      )
      return requiredCodes.every((code) => allowed.includes(code))
    })

  const sameCategory = eligible.filter(
    (template) =>
      row.plannerCategory &&
      row.plannerCategory !== '—' &&
      template.planner_category === row.plannerCategory,
  )

  return (sameCategory.length > 0 ? sameCategory : eligible).sort((a, b) =>
    (a.station_name ?? '').localeCompare(b.station_name ?? ''),
  )
}

export function applySwapTemplate(row, template, options = {}) {
  return buildCircuitRowFromTemplate(template, row, options)
}

export function clearCircuitRow(row) {
  return {
    ...row,
    templateId: null,
    locationCode: '—',
    stationName: '—',
    plannerCategory: '—',
    equipmentRequired: '—',
    roundCount: '—',
    locked: false,
    manuallyEdited: true,
  }
}

export function toggleRowLock(row) {
  return { ...row, locked: !row.locked, manuallyEdited: true }
}
