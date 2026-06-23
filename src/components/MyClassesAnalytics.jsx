import { useEffect, useState } from 'react'
import { fetchMyClassesAnalytics } from '../lib/myClassesAnalytics'

function formatFamilyList(families) {
  if (!families?.length) return '—'

  return families.map(({ family, count }) => `${family} (${count})`).join(', ')
}

export default function MyClassesAnalytics({ refreshKey = 0 }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadAnalytics() {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchMyClassesAnalytics()
        if (!cancelled) {
          setAnalytics(data)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message ?? 'Failed to load analytics.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAnalytics()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  return (
    <section className="my-classes-analytics-card" aria-labelledby="my-classes-analytics-title">
      <h2 id="my-classes-analytics-title">My Classes Analytics</h2>

      {loading ? (
        <p className="empty-state">Loading analytics…</p>
      ) : error ? (
        <p className="save-message error" role="alert">
          {error}
        </p>
      ) : (
        <div className="my-classes-analytics-grid">
          <article className="analytics-card">
            <span className="analytics-card-label">Total Saved Classes</span>
            <strong className="analytics-card-value">{analytics.totalSavedClasses}</strong>
          </article>

          <article className="analytics-card">
            <span className="analytics-card-label">Classes in Last 30 Days</span>
            <strong className="analytics-card-value">{analytics.classesInLast30Days}</strong>
          </article>

          <article className="analytics-card">
            <span className="analytics-card-label">Average Stations per Class</span>
            <strong className="analytics-card-value">
              {analytics.averageStationsPerClass ?? '—'}
            </strong>
          </article>

          <article className="analytics-card">
            <span className="analytics-card-label">Most Used Exercise Families</span>
            <strong className="analytics-card-value analytics-card-value-text">
              {formatFamilyList(analytics.topExerciseFamilies)}
            </strong>
          </article>

          <article className="analytics-card">
            <span className="analytics-card-label">Most Recent Class Date</span>
            <strong className="analytics-card-value">{analytics.mostRecentClassDate}</strong>
          </article>

          <article className="analytics-card">
            <span className="analytics-card-label">Rule Violations</span>
            <strong className="analytics-card-value">
              {analytics.ruleViolationsAvailable ? analytics.ruleViolationsCount : '—'}
            </strong>
          </article>
        </div>
      )}
    </section>
  )
}
