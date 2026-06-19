export default function MoveConfirmModal({
  move,
  onConfirm,
  onCancel,
}) {
  if (!move) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="move-modal-title"
      >
        <h2 id="move-modal-title">Confirm Station Move</h2>
        <p className="panel-description">
          Move &quot;{move.stationName}&quot; from{' '}
          <strong>{move.fromLocationCode}</strong> to{' '}
          <strong>{move.toLocationCode}</strong>?
        </p>

        <div className="modal-actions modal-actions-split">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-generate btn-generate-sm" onClick={onConfirm}>
            Move
          </button>
        </div>
      </div>
    </div>
  )
}
