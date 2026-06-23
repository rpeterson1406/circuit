import { supabase } from './supabaseClient'

function sortStationExercises(exercises = []) {
  return [...exercises].sort((left, right) => {
    if (left.round_number !== right.round_number) {
      return left.round_number - right.round_number
    }

    return left.sequence_order - right.sequence_order
  })
}

function mapSavedStationExercise(row) {
  return {
    round_number: row.round_number,
    sequence_order: row.sequence_order,
    exercise_name_snapshot: row.exercise_name_snapshot ?? null,
    exercise_family_snapshot: row.exercise_family_snapshot ?? null,
    round_instructions_snapshot: row.round_instructions_snapshot ?? null,
    notes: row.notes ?? null,
  }
}

function buildEmptyRow(stationNumber) {
  return {
    id: `empty-${stationNumber}`,
    stationNumber,
    locationCode: '—',
    templateId: null,
    stationName: '—',
    plannerCategory: '—',
    equipmentRequired: '—',
    roundCount: '—',
    locked: false,
    manuallyEdited: false,
    stationExercises: [],
  }
}

function buildCircuitRowFromSavedStation({
  station,
  template,
  locationCode,
  stationExercises,
}) {
  const savedExercises = sortStationExercises(stationExercises).map(mapSavedStationExercise)
  const roundCount =
    savedExercises.length > 0
      ? Math.max(...savedExercises.map((exercise) => exercise.round_number))
      : '—'

  const primaryExercise = savedExercises[0]

  return {
    id: `${station.station_template_id}-${station.station_number}`,
    stationNumber: station.station_number,
    locationCode: locationCode ?? '—',
    templateId: station.station_template_id,
    stationName:
      template?.station_name ??
      primaryExercise?.exercise_name_snapshot ??
      'Unnamed station',
    plannerCategory: template?.planner_category ?? '—',
    equipmentRequired: template?.equipment_required ?? '—',
    roundCount,
    locked: false,
    manuallyEdited: Boolean(station.manually_edited),
    stationExercises: savedExercises,
    classStationId: station.id,
  }
}

function padCircuitToStationCount(circuit, stationCount) {
  const rowsByNumber = new Map(circuit.map((row) => [row.stationNumber, row]))
  const padded = []

  for (let stationNumber = 1; stationNumber <= stationCount; stationNumber += 1) {
    padded.push(rowsByNumber.get(stationNumber) ?? buildEmptyRow(stationNumber))
  }

  return padded
}

export async function fetchSavedClassPlans() {
  const { data, error } = await supabase
    .from('class_plans')
    .select(
      'id, class_date, class_name, requested_station_count, repeat_window_classes, status, notes, created_at',
    )
    .order('class_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function loadClass(classPlanId) {
  const { data: classPlan, error: classPlanError } = await supabase
    .from('class_plans')
    .select('*')
    .eq('id', classPlanId)
    .single()

  if (classPlanError) {
    throw new Error(classPlanError.message)
  }

  const { data: stations, error: stationsError } = await supabase
    .from('class_stations')
    .select('*, class_station_exercises(*)')
    .eq('class_plan_id', classPlanId)
    .order('station_number', { ascending: true })

  if (stationsError) {
    throw new Error(stationsError.message)
  }

  const savedStations = stations ?? []
  const templateIds = [
    ...new Set(savedStations.map((station) => station.station_template_id).filter(Boolean)),
  ]
  const locationIds = [
    ...new Set(savedStations.map((station) => station.location_id).filter(Boolean)),
  ]

  const [templatesResult, locationsResult] = await Promise.all([
    templateIds.length > 0
      ? supabase.from('station_templates').select('*').in('id', templateIds)
      : Promise.resolve({ data: [], error: null }),
    locationIds.length > 0
      ? supabase.from('station_locations').select('*').in('id', locationIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (templatesResult.error) {
    throw new Error(templatesResult.error.message)
  }

  if (locationsResult.error) {
    throw new Error(locationsResult.error.message)
  }

  const templateById = new Map(
    (templatesResult.data ?? []).map((template) => [template.id, template]),
  )
  const locationCodeById = new Map(
    (locationsResult.data ?? [])
      .filter((location) => location.id && location.location_code)
      .map((location) => [location.id, location.location_code]),
  )

  const circuit = savedStations.map((station) =>
    buildCircuitRowFromSavedStation({
      station,
      template: templateById.get(station.station_template_id),
      locationCode: locationCodeById.get(station.location_id),
      stationExercises: station.class_station_exercises ?? [],
    }),
  )

  const stationCount = Number(classPlan.requested_station_count) || circuit.length

  return {
    classPlan,
    stationTemplates: templatesResult.data ?? [],
    stationLocations: locationsResult.data ?? [],
    circuit: padCircuitToStationCount(circuit, stationCount),
  }
}

export async function deleteClassPlan(classPlanId) {
  const { error } = await supabase.from('class_plans').delete().eq('id', classPlanId)

  if (error) {
    throw new Error(error.message)
  }
}
