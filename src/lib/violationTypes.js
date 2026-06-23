export function inferViolationType(message) {
  const text = (message ?? '').toLowerCase()

  if (text.includes('duplicate station family')) return 'duplicate_station_family'
  if (text.includes('heavy_low_back')) return 'heavy_low_back_limit'
  if (text.includes('heavy_shoulder')) return 'heavy_shoulder_limit'
  if (text.includes('twisting_loaded')) return 'twisting_loaded_limit'
  if (text.includes('3-round class') || text.includes('4-round station')) {
    return 'four_round_in_three_round_class'
  }
  if (text.includes('location conflict')) return 'location_conflict'
  if (text.includes('adjacent weight bench')) return 'adjacent_weight_bench'
  if (text.includes('weight bench stations')) return 'weight_bench_limit'
  if (text.includes('leg sled')) return 'leg_sled_limit'
  if (text.includes('category balance')) return 'category_balance'
  if (text.includes('no valid location found')) return 'no_valid_location'
  if (text.includes('classified as') && text.includes('not allowed at that location')) {
    return 'equipment_location_mismatch'
  }
  if (text.includes('circuit incomplete')) return 'circuit_incomplete'
  if (text.includes('selection rules were relaxed')) return 'selection_relaxed'
  if (text.includes('could only select')) return 'insufficient_templates'
  if (text.includes('without exceeding capacity')) return 'equipment_capacity'
  if (text.includes('without exceeding limits for')) return 'heavy_limit'
  if (text.includes('no eligible stations remaining for')) return 'category_shortfall'
  if (text.includes('despite exceeding') || text.includes('despite duplicating')) {
    return 'forced_constraint'
  }
  if (text.includes('categories unavailable')) return 'unavailable_category'
  if (text.includes('exceeds') && text.includes('capacity')) return 'equipment_capacity'

  return 'other'
}

function flattenWarnings(warnings) {
  if (Array.isArray(warnings)) {
    return warnings
  }

  if (!warnings || typeof warnings !== 'object') {
    return []
  }

  return [
    ...(warnings.locationWarnings ?? []),
    ...(warnings.categoryWarnings ?? []),
    ...(warnings.otherWarnings ?? []),
  ]
}

export function warningsToViolations(warnings) {
  return flattenWarnings(warnings).map((message) => ({
    violation_type: inferViolationType(message),
    message,
  }))
}
