import { useMemo } from 'react'
import { sortCircuitRowsByLocation } from '../lib/locations'

export default function CircuitTable({
  circuit,
  generated,
  readOnly = false,
  onLock,
  onSwap,
  onRemove,
}) {
  const displayRows = useMemo(() => {
    let stationCount = 0

    return sortCircuitRowsByLocation(circuit).map((row) => ({
      row,
      stationLabel: row.templateId ? ++stationCount : '—',
    }))
  }, [circuit])

  return (
    <section className="proposed-circuit-card">
      <h2>Proposed Circuit</h2>
      <p className="panel-description">
        Lock keeps a station in its current location when regenerating. Change replaces it with
        another eligible station at the same location.
      </p>

      {!generated ? (
        <p className="empty-state">Generate a circuit to see proposed stations.</p>
      ) : circuit.length === 0 ? (
        <p className="empty-state">No stations were assigned. Check warnings for details.</p>
      ) : (
        <div className="table-wrap">
          <table className="circuit-table">
            <thead>
              <tr>
                <th>Station #</th>
                <th>Location</th>
                <th>Station Name</th>
                <th>Planner Category</th>
                <th>Equipment Required</th>
                <th>Round Count</th>
                {!readOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayRows.map(({ row, stationLabel }) => {
                const isEmpty = !row.templateId

                return (
                  <tr
                    key={row.id}
                    className={[
                      row.locked ? 'row-locked' : '',
                      isEmpty ? 'row-cleared' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <td>{stationLabel}</td>
                    <td>{row.locationCode}</td>
                    <td>{row.stationName}</td>
                    <td>{row.plannerCategory}</td>
                    <td>{row.equipmentRequired}</td>
                    <td>{row.roundCount}</td>
                    {!readOnly && (
                      <td className="actions-cell">
                        <button
                          type="button"
                          className={`btn-table btn-lock${row.locked ? ' is-active' : ''}`}
                          onClick={() => onLock(row.id)}
                          disabled={isEmpty}
                          title={row.locked ? 'Unlock station' : 'Lock station in place'}
                        >
                          {row.locked ? 'Unlock' : 'Lock'}
                        </button>
                        <button
                          type="button"
                          className="btn-table btn-swap"
                          onClick={() => onSwap(row.id)}
                          disabled={isEmpty}
                          title="Replace with another eligible station"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          className="btn-table btn-remove"
                          onClick={() => onRemove(row.id)}
                          title="Clear this row"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
