export const MOVABLE_ALLOWED = [
  'S4', 'S5', 'S7', 'S8', 'S9',
  'G1', 'G2', 'G3', 'G5', 'G6', 'G7',
  'O2', 'O3', 'O4',
]

export const MOVABLE_FORBIDDEN = ['S1', 'S2', 'S3', 'S6', 'G4', 'O1']

export function isCategoryBalanceWarning(message) {
  const text = (message ?? '').toLowerCase()
  return text.includes('no eligible stations remaining for')
}

export function isOtherRuleWarning(message) {
  const text = (message ?? '').toLowerCase()
  return (
    text.includes('categories unavailable') ||
    text.includes('despite exceeding') ||
    text.includes('despite duplicating') ||
    text.includes('could only select') ||
    text.includes('only ') && text.includes('active station template') ||
    text.includes('no active station templates') ||
    text.includes('no station templates are available')
  )
}

export function isLocationRuleWarning(message) {
  const text = (message ?? '').toLowerCase()
  if (isCategoryBalanceWarning(message)) return false

  return (
    text.includes('no valid location found') ||
    text.includes('location assignment') ||
    text.includes('location conflict') ||
    text.includes('adjacent weight bench') ||
    text.includes('weight bench station') ||
    text.includes('leg sled') ||
    text.includes('bench placement') ||
    text.includes('bench limit') ||
    text.includes('not allowed for its equipment') ||
    text.includes('classified as') && text.includes('not allowed at that location') ||
    text.includes('has no assigned location') ||
    text.includes('placement rules were relaxed')
  )
}

export function categorizeWarnings(warnings) {
  const locationWarnings = []
  const categoryWarnings = []
  const otherWarnings = []

  for (const message of warnings) {
    if (isCategoryBalanceWarning(message)) {
      categoryWarnings.push(message)
    } else if (isOtherRuleWarning(message)) {
      otherWarnings.push(message)
    } else if (isLocationRuleWarning(message)) {
      locationWarnings.push(message)
    } else {
      otherWarnings.push(message)
    }
  }

  return {
    locationWarnings: [...new Set(locationWarnings)],
    categoryWarnings: [...new Set(categoryWarnings)],
    otherWarnings: [...new Set(otherWarnings)],
  }
}

export function mergeCategorizedWarnings(...groups) {
  const merged = {
    locationWarnings: [],
    categoryWarnings: [],
    otherWarnings: [],
  }

  for (const group of groups) {
    if (!group) continue
    if (Array.isArray(group)) {
      const categorized = categorizeWarnings(group)
      merged.locationWarnings.push(...categorized.locationWarnings)
      merged.categoryWarnings.push(...categorized.categoryWarnings)
      merged.otherWarnings.push(...categorized.otherWarnings)
    } else {
      merged.locationWarnings.push(...(group.locationWarnings ?? []))
      merged.categoryWarnings.push(...(group.categoryWarnings ?? []))
      merged.otherWarnings.push(...(group.otherWarnings ?? []))
    }
  }

  merged.locationWarnings = [...new Set(merged.locationWarnings)]
  merged.categoryWarnings = [...new Set(merged.categoryWarnings)]
  merged.otherWarnings = [...new Set(merged.otherWarnings)]

  return merged
}
