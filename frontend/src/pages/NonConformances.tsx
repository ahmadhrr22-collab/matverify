import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { SkeletonRow } from '../components/Skeleton' 
import { 
  AlertCircle, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Layers,
  Calendar
} from 'lucide-react'

export default function NonConformances() {
  const [ncs, setNcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    api.get('/non-conformances')
      .then(r => setNcs(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  // Filter non-conformances dynamically based on search, severity, and status filters
  const filteredNCs = ncs.filter(nc => {
    const materialName = nc.task?.deliveryItem?.material?.name || ''
    const matchesSearch = nc.ncNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nc.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSeverity = severityFilter === '' || nc.severity === severityFilter
    const matchesStatus = statusFilter === '' || nc.status === statusFilter
    
    return matchesSearch && matchesSeverity && matchesStatus
  })

  // Beautiful badge helper for severity
  const renderSeverityBadge = (severity: string) => {
    const map: Record<string, { bg: string, text: string, border: string, icon: React.ReactNode }> = {
      CRITICAL: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200/60', icon: <XCircle size={11} className="stroke-[2.5]" /> },
      MAJOR:    { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200/60', icon: <AlertTriangle size={11} className="stroke-[2.5]" /> },
      MINOR:    { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200/60', icon: <AlertCircle size={11} className="stroke-[2.5]" /> },
    }
    const s = map[severity] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: <AlertCircle size={11} /> }
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${s.bg} ${s.text} ${s.border}`}>
        {s.icon}
        {severity}
      </span>
    )
  }

  // Beautiful badge helper for status
  const renderStatusBadge = (status: string) => {
    const map: Record<string, { bg: string, text: string, border: string, dot: string, icon: React.ReactNode }> = {
      OPEN:        { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200/60', dot: 'bg-red-500', icon: <AlertCircle size={11} /> },
      IN_PROGRESS: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200/60', dot: 'bg-slate-1000', icon: <Clock size={11} /> },
      RESOLVED:    { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200/60', dot: 'bg-emerald-500', icon: <CheckCircle2 size={11} /> },
      CLOSED:      { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200/60', dot: 'bg-slate-400', icon: <CheckCircle2 size={11} /> },
    }
    const s = map[status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', dot: 'bg-slate-400', icon: <AlertCircle size={11} /> }
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'OPEN' ? 'animate-pulse' : ''}`} />
        {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-red-50 text-red-600 p-1.5 rounded-lg border border-red-100/50">
            <ShieldAlert size={16} />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-600 bg-red-50/50 px-2 py-0.5 rounded-md">Laporan NC</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">Non-Conformances</h2>
        <p className="text-xs text-slate-500">Laporan deviasi kualitas dan ketidaksesuaian bahan baku terhadap standar CoA</p>
      </div>

      {/* Stats Cards (Premium Dashboard Overhaul) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Total NC Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/50 text-slate-800 border border-slate-200/60 flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold mb-0.5 uppercase tracking-wider">Total Laporan NC</p>
            <p className="text-2xl font-extrabold text-slate-800 leading-none mb-1.5">
              {loading ? '...' : ncs.length}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">terdeteksi oleh sistem</p>
          </div>
        </div>

        {/* Open NC Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center flex-shrink-0 shadow-sm">
            <AlertTriangle size={20} className="animate-bounce" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold mb-0.5 uppercase tracking-wider">Status Open / Aktif</p>
            <p className="text-2xl font-extrabold text-red-600 leading-none mb-1.5">
              {loading ? '...' : ncs.filter(n => n.status === 'OPEN').length}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">membutuhkan tindakan QC</p>
          </div>
        </div>

        {/* Critical NC Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0 shadow-sm">
            <XCircle size={20} className="animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold mb-0.5 uppercase tracking-wider">Deviasi Kritis</p>
            <p className="text-2xl font-extrabold text-rose-600 leading-none mb-1.5">
              {loading ? '...' : ncs.filter(n => n.severity === 'CRITICAL').length}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">penolakan material mutlak</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Console */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NC Number, Material, Deskripsi..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white transition-all focus:ring-2 focus:ring-4 focus:ring-slate-100/50"
            />
          </div>
          
          {/* Severity filter */}
          <div className="w-full sm:w-40 relative">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 outline-none focus:border-slate-800 focus:bg-white transition-all appearance-none cursor-pointer font-semibold"
            >
              <option value="">Semua Deviasi</option>
              <option value="CRITICAL">Critical</option>
              <option value="MAJOR">Major</option>
              <option value="MINOR">Minor</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Status filter */}
          <div className="w-full sm:w-40 relative">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 outline-none focus:border-slate-800 focus:bg-white transition-all appearance-none cursor-pointer font-semibold"
            >
              <option value="">Semua Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Match Count Indicator */}
        <div className="text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100/60 px-3 py-1.5 rounded-lg">
          Menampilkan <span className="text-slate-800 font-extrabold font-mono">{filteredNCs.length}</span> dari <span className="text-slate-600 font-extrabold font-mono">{ncs.length}</span> laporan NC
        </div>
      </div>

      {/* Table Card (Ultra-Premium View) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">NC Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Bahan Baku (Material)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Deskripsi Deviasi Kualitas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-8">Tanggal Lapor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : filteredNCs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-slate-400 font-medium">
                    {searchQuery || severityFilter || statusFilter ? 'Tidak ada laporan NC yang cocok dengan kriteria pencarian' : 'Belum ada laporan Non-Conformance kualifikasi mutu'}
                  </td>
                </tr>
              ) : filteredNCs.map(nc => (
                <tr key={nc.id} className="hover:bg-slate-50/30 transition-colors group">
                  {/* NC Number in Monospace */}
                  <td className="px-6 py-4 font-extrabold font-mono text-xs text-rose-600 tracking-wider">
                    {nc.ncNumber}
                  </td>
                  {/* Material Name with flask icon avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-100/50">
                        <Layers size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 tracking-tight">
                          {nc.task?.deliveryItem?.material?.name || '-'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium font-mono uppercase">
                          Batch: {nc.task?.deliveryItem?.batchNo || '-'}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Description truncated but hoverable */}
                  <td className="px-6 py-4 max-w-xs sm:max-w-md">
                    <p className="text-xs text-slate-600 font-semibold truncate" title={nc.description}>
                      {nc.description}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                      Penyuplai: {nc.task?.deliveryItem?.delivery?.purchaseOrder?.supplier?.supplierName || '-'}
                    </p>
                  </td>
                  {/* Severity Badge */}
                  <td className="px-6 py-4">
                    {renderSeverityBadge(nc.severity)}
                  </td>
                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    {renderStatusBadge(nc.status)}
                  </td>
                  {/* Date Reported */}
                  <td className="px-6 py-4 text-right pr-8">
                    <div className="flex items-center gap-1.5 text-slate-500 justify-end">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="text-xs font-semibold">
                        {new Date(nc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}