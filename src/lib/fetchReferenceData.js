import { supabase } from './supabaseClient'
import { filterActiveTemplates, isTemplateActive } from './templateFilters'

export async function fetchReferenceData() {
  const [
    templatesResult,
    locationsResult,
    roundsResult,
    conflictsResult,
    equipmentResult,
    rulesResult,
    exercisesResult,
  ] = await Promise.all([
    supabase.from('station_templates').select('*'),
    supabase.from('station_locations').select('*'),
    supabase.from('station_rounds').select('*'),
    supabase.from('location_conflict_xref').select('*'),
    supabase.from('equipment_location_xref').select('*'),
    supabase.from('rule_definition').select('*'),
    supabase.from('exercises').select('*'),
  ])

  const errors = [
    templatesResult.error,
    locationsResult.error,
    roundsResult.error,
    conflictsResult.error,
    equipmentResult.error,
    rulesResult.error,
    exercisesResult.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    throw new Error(errors[0].message)
  }

  const stationTemplates = filterActiveTemplates(templatesResult.data ?? [])
  const stationLocations = (locationsResult.data ?? []).filter(isTemplateActive)

  return {
    stationTemplates,
    stationLocations,
    stationRounds: roundsResult.data ?? [],
    locationConflicts: conflictsResult.data ?? [],
    equipmentAllowedLocations: equipmentResult.data ?? [],
    ruleDefinitions: rulesResult.data ?? [],
    exercises: exercisesResult.data ?? [],
  }
}