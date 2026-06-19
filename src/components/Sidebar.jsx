const NAV_ITEMS = [
  { id: 'create', label: 'Create Class', active: true },
  { id: 'classes', label: 'My Classes', active: false },
  { id: 'exercises', label: 'Exercise Library', active: false },
  { id: 'templates', label: 'Station Templates', active: false },
  { id: 'equipment', label: 'Equipment', active: false },
  { id: 'reports', label: 'Reports', active: false },
  { id: 'settings', label: 'Settings', active: false },
]

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-logo">
        <span className="sidebar-logo-mark">♡</span>
        <div>
          <strong>Thrive</strong>
          <span>Circuit Planner</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`sidebar-nav-item${item.active ? ' is-active' : ''}`}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <p className="sidebar-tagline">Strong. Confident. You.</p>
    </aside>
  )
}
