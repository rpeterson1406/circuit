import { supabase } from './supabaseClient'
import { warningsToViolations } from './violationTypes'

function buildLocationIdMap(stationLocations) {
  return new Map(
    stationLocations
      .filter((location) => location.location_code && location.id)
      .map((location) => [location.location_code, location.id]),
  )
}

function buildTemplateMap(stationTemplates) {
  return new Map(stationTemplates.map((template) => [template.id, template]))
}

export async function saveClass({
  classDate,
  className,
  notes,
  stationCount,
  repeatWindowClasses,
  circuit,
  warnings,
  stationTemplates,
  stationLocations,
}) {
  const locationByCode = buildLocationIdMap(stationLocations)
  const templateById = buildTemplateMap(stationTemplates)

  const stationsToSave = circuit.filter(
    (row) => row.templateId && row.locationCode && row.locationCode !== '—',
  )

  if (stationsToSave.length === 0) {
    throw new Error('No assigned stations to save. Generate a circuit first.')
  }

  const missingLocations = stationsToSave
    .filter((row) => !locationByCode.get(row.locationCode))
    .map((row) => row.locationCode)

  if (missingLocations.length > 0) {
    throw new Error(
      `Unknown location codes: ${[...new Set(missingLocations)].join(', ')}. Add them to station_locations first.`,
    )
  }

  const { data: classPlan, error: classPlanError } = await supabase
    .from('class_plans')
    .insert({
      class_date: classDate,
      class_name: className,
      requested_station_count: stationCount,
      repeat_window_classes: Number(repeatWindowClasses),
      status: 'saved',
      notes: notes?.trim() ? notes.trim() : null,
    })
    .select('id')
    .single()

  if (classPlanError) {
    throw new Error(classPlanError.message)
  }

  const classPlanId = classPlan.id

  const classStationRows = stationsToSave.map((row) => ({
    class_plan_id: classPlanId,
    station_number: row.stationNumber,
    station_template_id: row.templateId,
    location_id: locationByCode.get(row.locationCode),
    manually_edited: Boolean(row.manuallyEdited),
  }))

  const { error: classStationsError } = await supabase
    .from('class_stations')
    .insert(classStationRows)

  if (classStationsError) {
    throw new Error(classStationsError.message)
  }

  const violationRows = warningsToViolations(warnings).map((violation) => ({
    class_plan_id: classPlanId,
    violation_type: violation.violation_type,
    message: violation.message,
  }))

  if (violationRows.length > 0) {
    const { error: violationsError } = await supabase
      .from('rule_violations')
      .insert(violationRows)

    if (violationsError) {
      throw new Error(violationsError.message)
    }
  }

  const usageRows = stationsToSave
    .map((row) => {
      const template = templateById.get(row.templateId)
      const exerciseFamily = template?.station_family
      if (!exerciseFamily) return null

      return {
        class_plan_id: classPlanId,
        station_template_id: row.templateId,
        exercise_family: exerciseFamily,
      }
    })
    .filter(Boolean)

  if (usageRows.length > 0) {
    const { error: usageError } = await supabase
      .from('class_exercise_usage')
      .insert(usageRows)

    if (usageError) {
      throw new Error(usageError.message)
    }
  }

  return { classPlanId }
}
