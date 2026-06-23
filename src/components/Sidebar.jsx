export default function Sidebar({ activeView, onNavigate }) {
  const navItems = [
    { id: 'create', label: 'Create Class' },
    { id: 'classes', label: 'My Classes' },
    { id: 'exercises', label: 'Exercise Library', disabled: true },
    { id: 'templates', label: 'Station Templates', disabled: true },
    { id: 'equipment', label: 'Equipment', disabled: true },
    { id: 'reports', label: 'Reports', disabled: true },
    { id: 'settings', label: 'Settings', disabled: true },
  ]

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
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`sidebar-nav-item${activeView === item.id ? ' is-active' : ''}`}
                aria-current={activeView === item.id ? 'page' : undefined}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    onNavigate(item.id)
                  }
                }}
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
