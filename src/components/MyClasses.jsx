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

export default function MyClasses({
  plans,
  loading,
  message,
  onSelectClass,
  onEditClass,
}) {
  return (
    <section className="my-classes-page">
      <header className="my-classes-header">
        <div>
          <h1>My Classes</h1>
          <p className="hero-tagline">Review, edit, and manage saved circuit plans.</p>
        </div>
      </header>

      {message && (
        <p className={`save-message ${message.type}`} role="status">
          {message.text}
        </p>
      )}

      <div className="my-classes-card">
        {loading ? (
          <p className="empty-state">Loading saved classes…</p>
        ) : plans.length === 0 ? (
          <p className="empty-state">No saved classes yet. Create and save a class to see it here.</p>
        ) : (
          <div className="table-wrap">
            <table className="circuit-table my-classes-table">
              <thead>
                <tr>
                  <th>Class Date</th>
                  <th>Class Name</th>
                  <th>Stations</th>
                  <th aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>{formatDisplayDate(plan.class_date)}</td>
                    <td>
                      <button
                        type="button"
                        className="my-classes-link"
                        onClick={() => onSelectClass(plan.id)}
                      >
                        {plan.class_name}
                      </button>
                    </td>
                    <td>{plan.requested_station_count}</td>
                    <td>
                      <div className="my-classes-row-actions">
                        <span className="status-pill status-pill-saved">
                          {plan.status ?? 'saved'}
                        </span>
                        <button
                          type="button"
                          className="status-pill status-pill-edit"
                          onClick={() => onEditClass(plan.id)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <section className="my-classes-upload-card">
        <h2>Upload Older Classes</h2>
        <p className="panel-description">Upload older classes coming soon.</p>
        <button type="button" className="btn-secondary" disabled>
          Upload Older Classes
        </button>
      </section>
    </section>
  )
}
