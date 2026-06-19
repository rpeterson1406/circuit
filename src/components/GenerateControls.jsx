export default function GenerateControls({
  classDate,
  className,
  notes,
  stationCount,
  repeatWindowDays,
  classRoundCount,
  loading,
  generating,
  saving,
  canSave,
  saveMessage,
  onClassDateChange,
  onClassNameChange,
  onNotesChange,
  onStationCountChange,
  onRepeatWindowDaysChange,
  onGenerate,
  onSave,
}) {
  return (
    <section className="class-controls-card">
      <form
        className="generate-form"
        onSubmit={(event) => {
          event.preventDefault()
          onGenerate()
        }}
      >
        <div className="controls-row">
          <label className="form-field">
            <span>Class Date</span>
            <input
              type="date"
              value={classDate}
              onChange={(event) => onClassDateChange(event.target.value)}
              required
            />
          </label>

          <label className="form-field">
            <span>Class Name</span>
            <input
              type="text"
              value={className}
              onChange={(event) => onClassNameChange(event.target.value)}
              placeholder="e.g. June 18, 26"
              required
            />
          </label>

          <label className="form-field">
            <span># of Stations</span>
            <select
              value={stationCount}
              onChange={(event) => onStationCountChange(Number(event.target.value))}
            >
              {Array.from({ length: 8 }, (_, index) => index + 8).map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Repeat Window (Classes)</span>
            <input type="text" value={classRoundCount} readOnly aria-readonly="true" />
          </label>

          <label className="form-field">
            <span>Repeat Window (Days)</span>
            <select
              value={repeatWindowDays}
              onChange={(event) => onRepeatWindowDaysChange(Number(event.target.value))}
            >
              {Array.from({ length: 12 }, (_, index) => index + 10).map((days) => (
                <option key={days} value={days}>
                  {days}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="form-field form-field-notes">
          <span>Notes</span>
          <textarea
            rows={2}
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Trainer notes for this class plan"
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn-generate" disabled={loading || generating}>
            {generating ? 'Generating…' : 'Generate Circuit'}
          </button>
          <button
            type="button"
            className="btn-save-class"
            disabled={loading || saving || !canSave}
            onClick={onSave}
          >
            <span aria-hidden="true">♡</span> Save Class
          </button>
        </div>

        {saveMessage && (
          <p className={`save-message ${saveMessage.type}`} role="status">
            {saveMessage.text}
          </p>
        )}
      </form>
    </section>
  )
}
