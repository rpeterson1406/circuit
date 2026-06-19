export default function SwapModal({
  row,
  candidates,
  onSelect,
  onClose,
}) {
  if (!row) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="swap-modal-title"
      >
        <h2 id="swap-modal-title">Change Station</h2>
        <p className="panel-description">
          Replace &quot;{row.stationName}&quot; at {row.locationCode} with another eligible station.
          The location stays the same.
        </p>

        {candidates.length === 0 ? (
          <p className="empty-state">No eligible replacement stations for this location.</p>
        ) : (
          <ul className="swap-list">
            {candidates.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  className="swap-option"
                  onClick={() => onSelect(template)}
                >
                  <span className="swap-option-name">{template.station_name}</span>
                  <span className="swap-option-meta">
                    {template.planner_category ?? '—'} · {template.equipment_required ?? '—'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
