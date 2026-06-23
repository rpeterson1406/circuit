export default function DeleteClassModal({
  classPlan,
  deleting,
  onConfirm,
  onCancel,
}) {
  if (!classPlan) return null

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={deleting ? undefined : onCancel}
    >
      <div
        className="modal panel"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="delete-class-modal-title"
      >
        <h2 id="delete-class-modal-title">Delete Saved Class</h2>
        <p className="panel-description">
          Delete &quot;{classPlan.class_name}&quot; from {classPlan.class_date}? This will
          permanently remove the class plan and its saved stations.
        </p>

        <div className="modal-actions modal-actions-split">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
