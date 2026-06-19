import { isTruthy } from './stationSelector'

export function getClassRoundCount(stationCount) {
  return Number(stationCount) <= 11 ? 4 : 3
}

export function buildRoundCountMap(stationRounds = []) {
  const map = new Map()

  for (const row of stationRounds) {
    const templateId = row.station_template_id
    if (!templateId) continue
    map.set(templateId, (map.get(templateId) ?? 0) + 1)
  }

  return map
}

export function getTemplateRoundCount(template, roundCountMap, classRoundCount) {
  const roundsFromDb = roundCountMap.get(template?.id)
  if (roundsFromDb != null && roundsFromDb > 0) {
    return roundsFromDb
  }

  if (isTruthy(template?.requires_4_rounds)) {
    return 4
  }

  return classRoundCount
}
