import { supabase } from './supabaseClient'

function isoDateDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

function formatDisplayDate(isoDate) {
  if (!isoDate) return '—'

  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function computeAverageStations(plans = []) {
  if (plans.length === 0) return null

  const total = plans.reduce(
    (sum, plan) => sum + (Number(plan.requested_station_count) || 0),
    0,
  )

  return total / plans.length
}

function computeMostRecentClassDate(plans = []) {
  if (plans.length === 0) return null

  const sorted = [...plans].sort((left, right) => {
    if (left.class_date !== right.class_date) {
      return right.class_date.localeCompare(left.class_date)
    }

    return (right.created_at ?? '').localeCompare(left.created_at ?? '')
  })

  return sorted[0]?.class_date ?? null
}

function aggregateTopExerciseFamilies(usageRows = [], exerciseRows = [], limit = 3) {
  const counts = new Map()

  for (const row of usageRows) {
    const family = row.exercise_family?.trim()
    if (!family) continue
    counts.set(family, (counts.get(family) ?? 0) + 1)
  }

  if (counts.size === 0) {
    for (const row of exerciseRows) {
      const family = row.exercise_family_snapshot?.trim()
      if (!family) continue
      counts.set(family, (counts.get(family) ?? 0) + 1)
    }
  }

  const topFamilies = [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)

  if (topFamilies.length === 0) {
    return []
  }

  return topFamilies.map(([family, count]) => ({ family, count }))
}

export async function fetchMyClassesAnalytics() {
  const thirtyDaysAgo = isoDateDaysAgo(30)

  const [plansResult, usageResult, exercisesResult, violationsResult] = await Promise.all([
    supabase
      .from('class_plans')
      .select('id, class_date, requested_station_count, created_at'),
    supabase.from('class_exercise_usage').select('exercise_family'),
    supabase.from('class_station_exercises').select('exercise_family_snapshot'),
    supabase.from('rule_violations').select('id', { count: 'exact', head: true }),
  ])

  if (plansResult.error) {
    throw new Error(plansResult.error.message)
  }

  const plans = plansResult.data ?? []
  const classesInLast30Days = plans.filter(
    (plan) => plan.class_date && plan.class_date >= thirtyDaysAgo,
  ).length

  const averageStations = computeAverageStations(plans)
  const mostRecentClassDate = computeMostRecentClassDate(plans)
  const topExerciseFamilies = aggregateTopExerciseFamilies(
    usageResult.error ? [] : usageResult.data ?? [],
    exercisesResult.error ? [] : exercisesResult.data ?? [],
  )

  return {
    totalSavedClasses: plans.length,
    classesInLast30Days,
    averageStationsPerClass:
      averageStations == null ? null : Number(averageStations.toFixed(1)),
    topExerciseFamilies,
    mostRecentClassDate: mostRecentClassDate
      ? formatDisplayDate(mostRecentClassDate)
      : '—',
    ruleViolationsCount: violationsResult.error ? null : violationsResult.count ?? 0,
    ruleViolationsAvailable: !violationsResult.error,
  }
}
