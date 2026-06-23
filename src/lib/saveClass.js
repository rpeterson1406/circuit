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

function buildExerciseById(exercises = []) {
  return new Map(exercises.filter((exercise) => exercise.id).map((exercise) => [exercise.id, exercise]))
}

function buildRoundsByTemplateId(stationRounds = []) {
  const map = new Map()

  for (const round of stationRounds) {
    const templateId = round.station_template_id
    if (!templateId) continue

    if (!map.has(templateId)) {
      map.set(templateId, [])
    }

    map.get(templateId).push(round)
  }

  for (const rounds of map.values()) {
    rounds.sort((left, right) => left.round_number - right.round_number)
  }

  return map
}

function buildStationExerciseRows({
  classStationId,
  circuitRow,
  template,
  templateRounds,
  exerciseById,
}) {
  const roundCount = Number(circuitRow.roundCount)
  const maxRound =
    Number.isFinite(roundCount) && roundCount > 0
      ? roundCount
      : templateRounds.length

  const applicableRounds = templateRounds.filter((round) => round.round_number <= maxRound)

  return applicableRounds.map((round, index) => {
    const exercise = round.exercise_id ? exerciseById.get(round.exercise_id) : null
    const roundDescription = round.round_description?.trim() || null

    if (exercise) {
      return {
        class_station_id: classStationId,
        exercise_id: round.exercise_id,
        round_number: round.round_number,
        round_start: round.round_number,
        round_end: round.round_number,
        sequence_order: index + 1,
        exercise_name_snapshot: exercise.exercise_name ?? null,
        exercise_family_snapshot: exercise.exercise_family ?? null,
        round_instructions_snapshot: roundDescription ?? exercise.directions?.trim() ?? null,
        notes: exercise.notes?.trim() || null,
      }
    }

    return {
      class_station_id: classStationId,
      exercise_id: null,
      round_number: round.round_number,
      round_start: round.round_number,
      round_end: round.round_number,
      sequence_order: index + 1,
      exercise_name_snapshot: template?.station_name ?? null,
      exercise_family_snapshot: template?.station_family ?? null,
      round_instructions_snapshot: roundDescription,
      notes: null,
    }
  })
}

function resolveUsedOn(classDate) {
  const trimmed = classDate?.trim()
  if (trimmed) return trimmed

  return new Date().toISOString().slice(0, 10)
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
  stationRounds = [],
  exercises = [],
}) {
  const locationByCode = buildLocationIdMap(stationLocations)
  const templateById = buildTemplateMap(stationTemplates)
  const roundsByTemplateId = buildRoundsByTemplateId(stationRounds)
  const exerciseById = buildExerciseById(exercises)

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

  const { data: insertedStations, error: classStationsError } = await supabase
    .from('class_stations')
    .insert(classStationRows)
    .select('id, station_number, station_template_id')

  if (classStationsError) {
    throw new Error(classStationsError.message)
  }

  const classStationIdByNumber = new Map(
    (insertedStations ?? []).map((station) => [station.station_number, station.id]),
  )

  const stationExerciseRows = stationsToSave.flatMap((row) => {
    const classStationId = classStationIdByNumber.get(row.stationNumber)
    if (!classStationId) return []

    const template = templateById.get(row.templateId)
    const templateRounds = roundsByTemplateId.get(row.templateId) ?? []

    return buildStationExerciseRows({
      classStationId,
      circuitRow: row,
      template,
      templateRounds,
      exerciseById,
    })
  })

  if (stationExerciseRows.length > 0) {
    const { error: stationExercisesError } = await supabase
      .from('class_station_exercises')
      .insert(stationExerciseRows)

    if (stationExercisesError) {
      throw new Error(stationExercisesError.message)
    }
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

  const usedOn = resolveUsedOn(classDate)

  const usageRows = stationsToSave
    .map((row) => {
      const template = templateById.get(row.templateId)
      const exerciseFamily = template?.station_family
      if (!exerciseFamily) return null

      return {
        class_plan_id: classPlanId,
        station_template_id: row.templateId,
        exercise_family: exerciseFamily,
        used_on: usedOn,
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
