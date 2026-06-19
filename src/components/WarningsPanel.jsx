import { buildCategoryBalance } from '../lib/stationSelector'
import { buildRuleValidationSummary } from '../lib/ruleValidator'

function RuleCheckRow({ label, value, isViolation = false }) {
  return (
    <div className={`rule-check-row${isViolation ? ' rule-check-row--warn' : ''}`}>
      <span className="rule-check-icon" aria-hidden="true">
        {isViolation ? '!' : '✓'}
      </span>
      <span className="rule-check-label">{label}</span>
      <span className="rule-check-value">{value}</span>
    </div>
  )
}

function isOverLimit({ count, limit }) {
  return count > limit
}

export default function WarningsPanel({
  warnings,
  generated,
  circuit = [],
  stationCount = 0,
  stationTemplates = [],
  locationConflicts = [],
}) {
  const locationWarnings = warnings?.locationWarnings ?? []
  const categoryWarnings = warnings?.categoryWarnings ?? []
  const otherWarnings = warnings?.otherWarnings ?? []
  const totalCount = locationWarnings.length + categoryWarnings.length + otherWarnings.length

  const selectedStations = circuit.filter((row) => row.templateId).length
  const placedSuccessfully = circuit.filter(
    (row) => row.templateId && row.locationCode && row.locationCode !== '—',
  ).length

  const { targets, counts, availableCategories, unavailableCategories } = buildCategoryBalance(
    stationCount,
    circuit,
    stationTemplates,
  )

  const ruleValidation = buildRuleValidationSummary({
    circuit,
    stationTemplates,
    locationConflicts,
  })

  return (
    <section className="insights-panel">
      <h2>Rules Engine Insights</h2>

      {!generated ? (
        <p className="insights-empty">Generate a circuit to see rules engine insights.</p>
      ) : (
        <>
          <div className="insights-summary">
            <div className="insights-stat">
              <span className="insights-stat-label">Stations</span>
              <strong>{selectedStations}</strong>
            </div>
            <div className="insights-stat">
              <span className="insights-stat-label">Placed</span>
              <strong>{placedSuccessfully}</strong>
            </div>
            <div className="insights-stat">
              <span className="insights-stat-label">Warnings</span>
              <strong>{totalCount}</strong>
            </div>
          </div>

          <div className="insights-sections">
            <div className="insights-section">
              <h3>Rule Checks</h3>
              <div className="rule-check-list">
                <RuleCheckRow
                  label="Weight Benches"
                  value={`${ruleValidation.weightBenches.count} / ${ruleValidation.weightBenches.limit}`}
                  isViolation={isOverLimit(ruleValidation.weightBenches)}
                />
                <RuleCheckRow
                  label="Adjacent Benches"
                  value={ruleValidation.adjacentBenchViolations.count}
                  isViolation={ruleValidation.adjacentBenchViolations.count > 0}
                />
                <RuleCheckRow
                  label="TRX Stations"
                  value={`${ruleValidation.trxStations.count} / ${ruleValidation.trxStations.limit}`}
                  isViolation={isOverLimit(ruleValidation.trxStations)}
                />
                <RuleCheckRow
                  label="Leg Sled"
                  value={`${ruleValidation.legSledStations.count} / ${ruleValidation.legSledStations.limit}`}
                  isViolation={isOverLimit(ruleValidation.legSledStations)}
                />
                <RuleCheckRow
                  label="Heavy Low Back"
                  value={`${ruleValidation.heavyLowBack.count} / ${ruleValidation.heavyLowBack.limit}`}
                  isViolation={isOverLimit(ruleValidation.heavyLowBack)}
                />
                <RuleCheckRow
                  label="Heavy Shoulder"
                  value={`${ruleValidation.heavyShoulder.count} / ${ruleValidation.heavyShoulder.limit}`}
                  isViolation={isOverLimit(ruleValidation.heavyShoulder)}
                />
                <RuleCheckRow
                  label="Twisting Loaded"
                  value={`${ruleValidation.twistingLoaded.count} / ${ruleValidation.twistingLoaded.limit}`}
                  isViolation={isOverLimit(ruleValidation.twistingLoaded)}
                />
                <RuleCheckRow
                  label="Location Conflicts"
                  value={ruleValidation.locationConflicts.count}
                  isViolation={ruleValidation.locationConflicts.count > 0}
                />
              </div>
            </div>

            <div className="insights-section">
              <h3>Category Balance</h3>
              <div className="category-progress-list">
                {availableCategories.map((category) => {
                  const actual = counts[category] ?? 0
                  const target = targets[category] ?? 0
                  const percent = target > 0 ? Math.min(100, (actual / target) * 100) : 0
                  const isMismatch = actual !== target

                  return (
                    <div key={category} className="category-progress">
                      <div className="category-progress-header">
                        <span className="category-progress-name">{category}</span>
                        <span className="category-progress-count">
                          {actual} / {target}
                        </span>
                      </div>
                      <div className="category-progress-track">
                        <div
                          className={`category-progress-fill${isMismatch ? ' category-progress-fill--warn' : ''}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {unavailableCategories.length > 0 && (
                <div className="category-unavailable">
                  <h4>Unavailable</h4>
                  <p>{unavailableCategories.join(', ')}</p>
                </div>
              )}

              {categoryWarnings.length > 0 && (
                <ul className="insights-notes-list">
                  {categoryWarnings.map((warning, index) => (
                    <li key={`category-${index}-${warning}`}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="insights-section">
              <h3>Location Notes</h3>
              {locationWarnings.length === 0 ? (
                <p className="insights-ok">All locations look good.</p>
              ) : (
                <ul className="insights-notes-list insights-notes-list--warn">
                  {locationWarnings.map((warning, index) => (
                    <li key={`location-${index}-${warning}`}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>

            {otherWarnings.length > 0 && (
              <div className="insights-section">
                <h3>Additional Notes</h3>
                <ul className="insights-notes-list">
                  {otherWarnings.map((warning, index) => (
                    <li key={`other-${index}-${warning}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
