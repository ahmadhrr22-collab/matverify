import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
    </svg>
  ),
  deliveries: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 4h10v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M1 4l2-3h6l2 3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <path d="M11 7h3l1 3v2h-4V7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <circle cx="3.5" cy="13.5" r="1" fill="currentColor"/>
      <circle cx="12.5" cy="13.5" r="1" fill="currentColor"/>
    </svg>
  ),
  suppliers: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 13V6l6-4 6 4v7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <rect x="5" y="8" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <rect x="9" y="8" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  ),
  materials: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1l6.5 3.5v7L8 15 1.5 11.5v-7L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <path d="M8 1v14M1.5 4.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  fieldMapping: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="5" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <rect x="1" y="7" width="5" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <rect x="10" y="4" width="5" height="3" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      <path d="M6 3.5h2.5M6 8.5H8a2 2 0 012 2v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M8 3l1.5 1L8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  nc: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
    </svg>
  ),
}

const menus = [
  { path: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
  { path: '/deliveries', label: 'Deliveries', icon: icons.deliveries },
  { path: '/suppliers', label: 'Suppliers', icon: icons.suppliers },
  { path: '/materials', label: 'Materials', icon: icons.materials },
  { path: '/field-mappings', label: 'Field Mapping', icon: icons.fieldMapping },
  { path: '/non-conformances', label: 'Non-Conformances', icon: icons.nc },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  return (
    <div style={{ width: '220px', minHeight: '100vh', background: '#fff', borderRight: '1px solid #f0f0ef', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #f0f0ef' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#1a56db', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h7M3 12h4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="12" cy="11" r="2.5" stroke="#fff" strokeWidth="1.4" fill="none"/>
              <path d="M13.8 12.8l1.5 1.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#111', letterSpacing: '-0.2px' }}>MatVerify</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>QC Intelligence</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px' }}>
        {menus.map((m) => {
          const active = pathname === m.path
          return (
            <Link
              key={m.path}
              to={m.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                color: active ? '#1a56db' : '#555',
                background: active ? '#eff4ff' : 'transparent',
                marginBottom: '1px',
                transition: 'all 0.1s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = '#f7f7f6'
                  ;(e.currentTarget as HTMLElement).style.color = '#111'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = '#555'
                }
              }}
            >
              <span style={{ color: active ? '#1a56db' : '#888', flexShrink: 0 }}>{m.icon}</span>
              {m.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid #f0f0ef' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', marginBottom: '4px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#1a56db', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#e53e3e', textAlign: 'left' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#fff5f5')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Keluar
        </button>
      </div>
    </div>
  )
}