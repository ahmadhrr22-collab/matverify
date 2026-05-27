import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import { 
  LayoutDashboard, 
  Truck, 
  Building2, 
  Boxes, 
  GitFork, 
  AlertOctagon, 
  LogOut,
  ShieldCheck
} from 'lucide-react'

const menus = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/deliveries', label: 'Deliveries', icon: <Truck size={18} /> },
  { path: '/suppliers', label: 'Suppliers', icon: <Building2 size={18} /> },
  { path: '/materials', label: 'Materials', icon: <Boxes size={18} /> },
  { path: '/field-mappings', label: 'Field Mapping', icon: <GitFork size={18} /> },
  { path: '/non-conformances', label: 'Non-Conformances', icon: <AlertOctagon size={18} /> },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)

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
    <div className="w-56 min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-slate-950 via-blue-950 to-indigo-950 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-950/15 border border-white/10">
            <ShieldCheck size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">MatVerify</p>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">QC Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Menus */}
      <nav className="flex-1 p-3 space-y-1">
        {menus.map((m) => {
          const active = pathname === m.path
          return (
            <Link
              key={m.path}
              to={m.path}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                active 
                  ? 'text-slate-900 bg-slate-100/80 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className={active ? 'text-slate-900' : 'text-slate-400'}>{m.icon}</span>
              {m.label}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Logout Section */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800 flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate leading-none mb-1">{user?.name}</p>
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-rose-100 bg-rose-50/10 hover:bg-rose-50 text-rose-600 hover:text-rose-700 transition-all font-semibold text-xs tracking-wide text-left cursor-pointer"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>

      {/* Modal Konfirmasi */}
      <ConfirmModal
        isOpen={showLogout}
        title="Keluar dari MatVerify?"
        message="Sesi Anda akan diakhiri. Anda perlu login kembali untuk mengakses sistem."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        confirmColor="#dc2626"
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </div>
  )
}