import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const menus = [
  { path: '/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/deliveries', label: 'Deliveries', icon: '⬇' },
  { path: '/suppliers', label: 'Suppliers', icon: '🏭' },
  { path: '/materials', label: 'Materials', icon: '⬡' },
  { path: '/field-mappings', label: 'Field Mapping', icon: '⇄' },
  { path: '/non-conformances', label: 'Non-Conformances', icon: '⚠' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <div className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-lg font-semibold text-gray-900">MatVerify</h1>
        <p className="text-xs text-gray-400 mt-0.5">AI Verification System</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {menus.map((m) => (
          <Link
            key={m.path}
            to={m.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === m.path
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-base">{m.icon}</span>
            {m.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-gray-700">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          Keluar
        </button>
      </div>
    </div>
  )
}