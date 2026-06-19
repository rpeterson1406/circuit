import './CircuitMap.css'
import { expandLocationCodes } from '../lib/locationAssignment'

const OUTDOOR_LOCATIONS = ['O1', 'O2', 'O3', 'O4']

const STRENGTH_LAYOUT = [
  { code: 'S2', area: 'top' },
  { code: 'S4', area: 'top' },
  { code: 'S5', area: 'top' },
  { code: 'S6', area: 'top' },
  { code: 'S3', area: 'left' },
  { code: 'S1', area: 'left' },
  { code: 'S9', area: 'bottom' },
  { code: 'S8', area: 'bottom' },
  { code: 'S7', area: 'bottom' },
]

const GYM_LAYOUT = [
  { code: 'G7', area: 'left' },
  { code: 'G6', area: 'left' },
  { code: 'G1', area: 'right' },
  { code: 'G2', area: 'right' },
  { code: 'G3', area: 'right' },
  { code: 'G5', area: 'bottom' },
  { code: 'G4', area: 'bottom' },
]

function buildAssignmentMap(assignments) {
  const map = new Map()

  for (const assignment of assignments) {
    const locationCode = assignment.location_code ?? assignment.location
    if (!locationCode) continue

    for (const code of expandLocationCodes(locationCode)) {
      map.set(code, {
        ...assignment,
        location_code: code,
      })
    }
  }

  return map
}

function getAssignmentForLocation(code, assignmentMap) {
  return assignmentMap.get(code) ?? null
}

function isLocationActive(code, locations) {
  if (!locations || locations.length === 0) return true

  return locations.some(
    (location) =>
      (location.location_code ?? location.code) === code &&
      location.active !== false,
  )
}

function StationSlot({
  code,
  assignment,
  isActive,
  isSelected,
  onStationClick,
}) {
  const isUsed = Boolean(assignment?.station_name)
  const templateId = assignment?.station_template_id ?? assignment?.templateId ?? null

  const handleClick = () => {
    onStationClick({
      locationCode: code,
      stationTemplateId: templateId,
      assignment,
    })
  }

  const cardClass = [
    'station-card',
    isUsed ? 'station-card--used' : 'station-card--available',
    !isActive ? 'station-card--inactive' : '',
    isSelected ? 'station-card--selected' : '',
    assignment?.locked ? 'station-card--locked' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={cardClass}
      onClick={handleClick}
      aria-label={
        isUsed
          ? `${code}: ${assignment.station_name}`
          : `${code}: Available`
      }
    >
      {isUsed && assignment.station_number != null && (
        <span className="station-badge">{assignment.station_number}</span>
      )}

      <div className="station-card-header">
        <span className="station-code">{code}</span>
        {assignment?.locked && (
          <span className="station-lock-badge" aria-label="Locked">
            🔒
          </span>
        )}
      </div>

      {isUsed ? (
        <>
          <p className="station-name">{assignment.station_name}</p>
          {assignment.equipment_required && assignment.equipment_required !== '—' && (
            <p className="station-equipment">{assignment.equipment_required}</p>
          )}
        </>
      ) : (
        <p className="station-available-label">Available</p>
      )}
    </button>
  )
}

function renderZoneSlots(layout, area, assignmentMap, locations, selectedStationId, onStationClick) {
  return layout
    .filter((slot) => slot.area === area)
    .map(({ code }) => {
      const assignment = getAssignmentForLocation(code, assignmentMap)
      const templateId = assignment?.station_template_id ?? assignment?.templateId ?? null

      return (
        <StationSlot
          key={code}
          code={code}
          assignment={assignment}
          isActive={isLocationActive(code, locations)}
          isSelected={selectedStationId != null && templateId === selectedStationId}
          onStationClick={onStationClick}
        />
      )
    })
}

function MapLegend() {
  return (
    <aside className="map-legend" aria-label="Map legend">
      <h3>Legend</h3>
      <ul className="map-legend-list">
        <li>
          <span className="legend-swatch legend-swatch-used" />
          Used station
        </li>
        <li>
          <span className="legend-swatch legend-swatch-available" />
          Available station
        </li>
        <li>
          <span className="legend-swatch legend-swatch-locked" />
          Locked station
        </li>
        <li>
          <span className="legend-swatch legend-swatch-strength" />
          Strength Floor
        </li>
        <li>
          <span className="legend-swatch legend-swatch-gym" />
          Gym Floor
        </li>
        <li>
          <span className="legend-swatch legend-swatch-outdoor" />
          Outdoor Area
        </li>
      </ul>
    </aside>
  )
}

export default function CircuitMap({
  locations = [],
  assignments = [],
  selectedStationId = null,
  onStationClick = () => {},
  generated = true,
}) {
  const assignmentMap = buildAssignmentMap(assignments)

  return (
    <section className="circuit-map-card">
      <div className="circuit-map-header">
        <h2>
          <span aria-hidden="true">🏋️</span> Circuit Station Map
        </h2>
        <p className="circuit-map-tagline">Move with purpose. Lead with strength. ♡</p>
      </div>

      {!generated ? (
        <p className="empty-state">Generate a circuit to see the map layout.</p>
      ) : (
        <div className="circuit-map-layout">
          <div className="circuit-map-zones">
            <div className="zone-panel zone-panel--outdoor">
              <h3 className="zone-panel-title">Outdoor Area</h3>
              <div className="zone-outdoor-row">
                {OUTDOOR_LOCATIONS.map((code) => {
                  const assignment = getAssignmentForLocation(code, assignmentMap)
                  const templateId =
                    assignment?.station_template_id ?? assignment?.templateId ?? null

                  return (
                    <StationSlot
                      key={code}
                      code={code}
                      assignment={assignment}
                      isActive={isLocationActive(code, locations)}
                      isSelected={
                        selectedStationId != null && templateId === selectedStationId
                      }
                      onStationClick={onStationClick}
                    />
                  )
                })}
              </div>
            </div>

            <div className="zone-panel zone-panel--strength">
              <h3 className="zone-panel-title">Strength Floor</h3>
              <div className="zone-strength-grid">
                <div className="strength-top">
                  {renderZoneSlots(
                    STRENGTH_LAYOUT,
                    'top',
                    assignmentMap,
                    locations,
                    selectedStationId,
                    onStationClick,
                  )}
                </div>
                <div className="strength-left">
                  {renderZoneSlots(
                    STRENGTH_LAYOUT,
                    'left',
                    assignmentMap,
                    locations,
                    selectedStationId,
                    onStationClick,
                  )}
                </div>
                <div className="strength-bottom">
                  {renderZoneSlots(
                    STRENGTH_LAYOUT,
                    'bottom',
                    assignmentMap,
                    locations,
                    selectedStationId,
                    onStationClick,
                  )}
                </div>
              </div>
            </div>

            <div className="zone-panel zone-panel--gym">
              <h3 className="zone-panel-title">Gym Floor</h3>
              <div className="zone-gym-grid">
                <div className="gym-left">
                  {renderZoneSlots(
                    GYM_LAYOUT,
                    'left',
                    assignmentMap,
                    locations,
                    selectedStationId,
                    onStationClick,
                  )}
                </div>
                <div className="gym-right">
                  {renderZoneSlots(
                    GYM_LAYOUT,
                    'right',
                    assignmentMap,
                    locations,
                    selectedStationId,
                    onStationClick,
                  )}
                </div>
                <div className="gym-bottom">
                  {renderZoneSlots(
                    GYM_LAYOUT,
                    'bottom',
                    assignmentMap,
                    locations,
                    selectedStationId,
                    onStationClick,
                  )}
                </div>
              </div>
            </div>
          </div>

          <MapLegend />
        </div>
      )}
    </section>
  )
}

export {
  buildAssignmentMap,
  getAssignmentForLocation,
  OUTDOOR_LOCATIONS,
  STRENGTH_LAYOUT,
  GYM_LAYOUT,
}
