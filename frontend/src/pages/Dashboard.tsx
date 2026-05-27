import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { cache } from '../services/cache' // Import cache
import { SkeletonCard, SkeletonList } from '../components/Skeleton' // Import Skeleton
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Building2,
  Calendar
} from 'lucide-react'

export default function Dashboard() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [ncs, setNcs] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Cek data di cache terlebih dahulu
    const cached = cache.get('dashboard')
    if (cached) {
      setDeliveries(cached.deliveries)
      setNcs(cached.ncs)
      setSuppliers(cached.suppliers)
      setMaterials(cached.materials)
      setLoading(false)
      return
    }

    // 2. Jika tidak ada cache, lakukan fetch API
    Promise.all([
      api.get('/deliveries'),
      api.get('/non-conformances'),
      api.get('/suppliers'),
      api.get('/materials'),
    ]).then(([d, n, s, m]) => {
      const data = { 
        deliveries: d.data, 
        ncs: n.data, 
        suppliers: s.data, 
        materials: m.data 
      }
      // Simpan data ke cache untuk penggunaan berikutnya
      cache.set('dashboard', data)
      
      setDeliveries(data.deliveries)
      setNcs(data.ncs)
      setSuppliers(data.suppliers)
      setMaterials(data.materials)
    }).catch(err => {
      console.error("Dashboard fetch error:", err)
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    {
      label: 'Total Deliveries',
      value: deliveries.length,
      sub: `${deliveries.filter(d => d.status === 'PENDING').length} pending`,
      color: '#0f172a',
      bg: '#f1f5f9',
      icon: <ClipboardCheck size={20} />
    },
    {
      label: 'Completed',
      value: deliveries.filter(d => d.status === 'COMPLETED').length,
      sub: 'verified & approved',
      color: '#059669',
      bg: '#ecfdf5',
      icon: <CheckCircle2 size={20} />
    },
    {
      label: 'Open NC',
      value: ncs.filter(n => n.status === 'OPEN').length,
      sub: `${ncs.filter(n => n.severity === 'CRITICAL').length} critical`,
      color: '#dc2626',
      bg: '#fef2f2',
      icon: <AlertTriangle size={20} />
    },
    {
      label: 'Active Suppliers',
      value: suppliers.filter(s => s.status === 'ACTIVE').length,
      sub: `${materials.length} materials`,
      color: '#7c3aed',
      bg: '#f5f3ff',
      icon: <Building2 size={20} />
    },
  ]

  const pending = deliveries.filter(d => d.status === 'PENDING' || d.status === 'IN_PROGRESS')
  const recentNC = ncs.filter(n => n.status === 'OPEN').slice(0, 5)

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string, text: string, label: string }> = {
      PENDING:     { bg: 'bg-amber-50 border border-amber-200/60', text: 'text-amber-800', label: 'Pending' },
      IN_PROGRESS: { bg: 'bg-slate-100 border border-slate-200/60', text: 'text-slate-800', label: 'In Progress' },
      COMPLETED:   { bg: 'bg-emerald-50 border border-emerald-200/60', text: 'text-emerald-800', label: 'Completed' },
      REJECTED:    { bg: 'bg-rose-50 border border-rose-200/60', text: 'text-rose-800', label: 'Rejected' },
    }
    const s = map[status] || { bg: 'bg-slate-50 border border-slate-100', text: 'text-slate-700', label: status }
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    )
  }

  const severityBadge = (severity: string) => {
    const map: Record<string, { bg: string, text: string }> = {
      CRITICAL: { bg: 'bg-rose-50 border border-rose-200/60', text: 'text-rose-800' },
      MAJOR:    { bg: 'bg-amber-50 border border-amber-200/60', text: 'text-amber-800' },
      MINOR:    { bg: 'bg-slate-100 border border-slate-200/60', text: 'text-slate-800' },
    }
    const s = map[severity] || { bg: 'bg-slate-50 border border-slate-100', text: 'text-slate-700' }
    return (
      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${s.bg} ${s.text}`}>
        {severity}
      </span>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">
              Dashboard
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Selamat datang, <strong className="text-slate-700 font-semibold">{user?.name}</strong>
            </p>
          </div>
          
          {/* Tanggal Hari Ini di Pojok Kanan Atas */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-3.5 py-2.5 rounded-xl w-fit self-start sm:self-center shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Stats Cards dengan Skeleton Loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : stats.map(s => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-0.5 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-extrabold leading-none mb-1.5" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two columns List Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pending deliveries dengan SkeletonList */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">Perlu Verifikasi</p>
              <button onClick={() => navigate('/deliveries')} className="text-xs text-slate-800 hover:text-slate-900 font-bold bg-transparent border-none cursor-pointer flex items-center gap-1 transition-colors">
                Lihat semua
              </button>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[350px] flex-1">
              {loading ? (
                <SkeletonList rows={4} />
              ) : pending.length === 0 ? (
                <div className="text-center py-10 px-6">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-3 stroke-[2.5]" size={32} />
                  <p className="text-sm text-slate-400">Semua delivery sudah diverifikasi</p>
                </div>
              ) : pending.slice(0, 5).map(d => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/deliveries/${d.id}`)}
                  className="flex justify-between items-center px-6 py-3.5 hover:bg-slate-50/75 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold text-slate-800 tracking-tight">{d.deliveryNo}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px]">
                      {d.purchaseOrder?.supplier?.supplierName} · {new Date(d.arrivalDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {statusBadge(d.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open NC dengan SkeletonList */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">Non-Conformances Terbuka</p>
              <button onClick={() => navigate('/non-conformances')} className="text-xs text-slate-800 hover:text-slate-900 font-bold bg-transparent border-none cursor-pointer flex items-center gap-1 transition-colors">
                Lihat semua
              </button>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[350px] flex-1">
              {loading ? (
                <SkeletonList rows={4} />
              ) : recentNC.length === 0 ? (
                <div className="text-center py-10 px-6">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-3 stroke-[2.5]" size={32} />
                  <p className="text-sm text-slate-400">Tidak ada NC yang terbuka</p>
                </div>
              ) : recentNC.map(nc => (
                <div
                  key={nc.id}
                  onClick={() => navigate('/non-conformances')}
                  className="flex justify-between items-center px-6 py-3.5 hover:bg-slate-50/75 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-4 flex-1">
                    <p className="text-xs font-bold font-mono text-slate-700 tracking-wider mb-0.5">{nc.ncNumber}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {nc.task?.deliveryItem?.material?.name || 'Unknown material'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {severityBadge(nc.severity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom banner — hanya jika ada pending */}
        {!loading && pending.length > 0 && (
          <div className="bg-gradient-to-tr from-slate-950 via-blue-950 to-indigo-950 rounded-2xl p-5 md:px-8 md:py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-lg shadow-slate-950/15 border border-white/5 hover:shadow-xl hover:shadow-slate-950/20 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <div className="relative z-10">
              <p className="text-sm md:text-base font-bold text-white tracking-tight">
                {pending.length} delivery menunggu verifikasi
              </p>
              <p className="text-xs text-slate-300/80 mt-1 max-w-md leading-relaxed">
                Segera lakukan verifikasi dokumen Certificate of Analysis untuk mencegah hambatan pada rantai produksi.
              </p>
            </div>
            <button
              onClick={() => navigate('/deliveries')}
              className="relative z-10 bg-white hover:bg-slate-50 text-slate-900 font-extrabold rounded-xl px-5 py-2.5 text-xs shadow-md transition-all active:scale-[0.98] self-start sm:self-center cursor-pointer"
            >
              Verifikasi Sekarang
            </button>
          </div>
        )}

      </div>
    </Layout>
  )
}