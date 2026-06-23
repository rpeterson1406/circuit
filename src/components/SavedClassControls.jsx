export default function SavedClassControls({
  classPlan,
  className,
  notes,
  stationCount,
  classRoundCount,
  editMode,
  dirty,
  saving,
  message,
  onClassNameChange,
  onNotesChange,
  onStationCountChange,
  onClassRoundCountChange,
  onEdit,
  onCancelEdit,
  onSaveAsNew,
  onDelete,
  onBack,
}) {
  return (
    <section className="class-controls-card saved-class-controls">
      <div className="saved-class-toolbar">
        <button type="button" className="btn-text-link" onClick={onBack}>
          ← Back to My Classes
        </button>

        <div className="saved-class-actions">
          {editMode && dirty ? (
            <>
              <button
                type="button"
                className="btn-save-class"
                disabled={saving}
                onClick={onSaveAsNew}
              >
                {saving ? 'Saving…' : 'Save as New'}
              </button>
              <button type="button" className="btn-secondary" onClick={onCancelEdit}>
                Cancel Edit
              </button>
            </>
          ) : editMode ? (
            <button type="button" className="btn-secondary" onClick={onCancelEdit}>
              Cancel Edit
            </button>
          ) : (
            <button type="button" className="status-pill status-pill-edit" onClick={onEdit}>
              Edit
            </button>
          )}
          <button type="button" className="status-pill status-pill-delete" onClick={() => onDelete()}>
            Delete
          </button>
        </div>
      </div>

      <div className="controls-row">
        <label className="form-field">
          <span>Class Date</span>
          <input type="text" value={classPlan?.class_date ?? ''} readOnly disabled />
        </label>

        <label className="form-field">
          <span>Class Name</span>
          <input
            type="text"
            value={className}
            onChange={(event) => onClassNameChange(event.target.value)}
            disabled={!editMode}
          />
        </label>

        <label className="form-field">
          <span># of Stations</span>
          <select
            value={stationCount}
            onChange={(event) => onStationCountChange(Number(event.target.value))}
            disabled={!editMode}
          >
            {Array.from({ length: 8 }, (_, index) => index + 8).map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Rounds</span>
          <select
            value={classRoundCount}
            onChange={(event) => onClassRoundCountChange(Number(event.target.value))}
            disabled={!editMode}
          >
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </label>

        <label className="form-field">
          <span>Status</span>
          <input type="text" value={classPlan?.status ?? 'saved'} readOnly disabled />
        </label>
      </div>

      <label className="form-field form-field-notes">
        <span>Notes</span>
        <textarea
          rows={2}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          disabled={!editMode}
          placeholder="Trainer notes for this class plan"
        />
      </label>

      {message && (
        <p className={`save-message ${message.type}`} role="status">
          {message.text}
        </p>
      )}
    </section>
  )
}
