import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { toast } from '../components/Toast'
import { cache } from '../services/cache' 
import { SkeletonRow } from '../components/Skeleton' 
import ConfirmModal from '../components/ConfirmModal' 
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  X,
  Building2,
  ShieldCheck,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    supplierCode: '', supplierName: '', certNumber: '', email: '', phone: '', status: 'ACTIVE'
  })

  // Search and status filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // State untuk target penghapusan (ConfirmModal)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  const fetchSuppliers = () => {
    const cached = cache.get('suppliers-page')
    if (cached) {
      setSuppliers(cached)
      setLoading(false)
      return
    }

    api.get('/suppliers')
      .then(r => {
        cache.set('suppliers-page', r.data)
        setSuppliers(r.data)
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSuppliers() }, [])

  const openEdit = (s: any) => {
    setEditingId(s.id)
    setForm({ 
      supplierCode: s.supplierCode, 
      supplierName: s.supplierName, 
      certNumber: s.certNumber || '', 
      email: s.email || '', 
      phone: s.phone || '', 
      status: s.status 
    })
    setShowForm(true)
    // Scroll to form smoothly
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({ supplierCode: '', supplierName: '', certNumber: '', email: '', phone: '', status: 'ACTIVE' })
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, form)
        toast.success('Supplier berhasil diupdate')
      } else {
        await api.post('/suppliers', form)
        toast.success('Supplier berhasil disimpan')
      }

      cache.clear('suppliers-page')
      cache.clear('dashboard')
      cache.clear('deliveries-page')

      resetForm()
      fetchSuppliers()
    } catch (e: any) {
      toast.error('Gagal menyimpan', e.response?.data?.message || 'Terjadi kesalahan pada server')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/suppliers/${deleteTarget.id}`)
      
      cache.clear('suppliers-page')
      cache.clear('dashboard')
      cache.clear('deliveries-page')

      toast.success('Supplier berhasil dihapus')
      fetchSuppliers()
    } catch (e: any) {
      toast.error('Gagal menghapus', e.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setDeleteTarget(null)
    }
  }

  // Filter suppliers dynamically based on search query and status filter
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.supplierCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === '' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string, text: string, label: string, dot: string }> = {
      ACTIVE:    { bg: 'bg-emerald-50 border border-emerald-100', text: 'text-emerald-800', label: 'Active', dot: 'bg-emerald-500' },
      INACTIVE:  { bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-700', label: 'Inactive', dot: 'bg-slate-400' },
      SUSPENDED: { bg: 'bg-rose-50 border border-rose-100', text: 'text-rose-800', label: 'Suspended', dot: 'bg-rose-500' },
    }
    const s = map[status] || { bg: 'bg-slate-50 border border-slate-100', text: 'text-slate-700', label: status, dot: 'bg-slate-400' }
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
        {s.label}
      </span>
    )
  }

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-100 border border-slate-200/50 text-slate-800 p-1.5 rounded-lg border border-slate-200/60/50">
              <Building2 size={16} />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800 bg-slate-100/50 px-2 py-0.5 rounded-md">Mitra Industri</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">Suppliers</h2>
          <p className="text-xs text-slate-500">Daftar mitra penyuplai bahan baku aktif perusahaan yang terverifikasi</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true) }} 
          className="btn-primary text-xs font-bold px-5 py-3 flex items-center gap-2 cursor-pointer uppercase tracking-wider self-start sm:self-center"
        >
          <Plus size={16} className="stroke-[2.5]" />
          Tambah Supplier
        </button>
      </div>

      {/* Form Tambah/Edit Supplier (Glassmorphism layout) */}
      {showForm && (
        <div className="glass-panel rounded-2xl p-6 mb-6 shadow-md space-y-6 animate-fadeIn transition-all">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-slate-600 animate-spin-slow" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                {editingId ? 'Modifikasi Data Supplier' : 'Registrasi Supplier Baru'}
              </h3>
            </div>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Identitas Utama */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identitas Penyuplai</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Kode Supplier</label>
                  <input 
                    required 
                    value={form.supplierCode} 
                    onChange={e => setForm({ ...form, supplierCode: e.target.value })}
                    className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 disabled:opacity-60 disabled:cursor-not-allowed font-mono text-sm"
                    placeholder="SUP-001" 
                    disabled={!!editingId} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Supplier</label>
                  <input 
                    required 
                    value={form.supplierName} 
                    onChange={e => setForm({ ...form, supplierName: e.target.value })}
                    className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 text-sm font-semibold"
                    placeholder="PT BioPharma Chemical" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">No. Sertifikasi GMP / QC</label>
                  <input 
                    value={form.certNumber} 
                    onChange={e => setForm({ ...form, certNumber: e.target.value })}
                    className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 text-sm font-mono"
                    placeholder="CERT-NHS-7762" 
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Kontak & Status */}
            <div className="space-y-4 border-t border-slate-100/50 pt-5">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kontak & Hubungan Bisnis</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Kontak</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 text-sm"
                    placeholder="kontak@mitra.com" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Telepon Kantor</label>
                  <input 
                    value={form.phone} 
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 text-sm"
                    placeholder="021-1234567" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status Hubungan</label>
                  <div className="relative">
                    <select 
                      value={form.status} 
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="input-field appearance-none cursor-pointer text-sm font-semibold pr-10"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end border-t border-slate-100/50 pt-5">
              <button 
                type="button" 
                onClick={resetForm} 
                className="px-5 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-wider cursor-pointer active:scale-[0.98]"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="btn-primary text-xs font-bold px-5 py-2.5 uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Daftarkan Supplier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters Console */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Kode, Nama, Sertifikasi, Email, atau Telepon..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white transition-all focus:ring-2 focus:ring-4 focus:ring-slate-100/50"
            />
          </div>
          <div className="w-full sm:w-48 relative">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 outline-none focus:border-slate-800 focus:bg-white transition-all appearance-none cursor-pointer font-semibold"
            >
              <option value="">Semua Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
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
          Menampilkan <span className="text-slate-800 font-extrabold font-mono">{filteredSuppliers.length}</span> dari <span className="text-slate-600 font-extrabold font-mono">{suppliers.length}</span> supplier
        </div>
      </div>

      {/* Table Card (Ultra-Premium View) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Supplier</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">No. Sertifikasi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kontak & Hubungan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-8">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-slate-400 font-medium">
                    {searchQuery || statusFilter ? 'Tidak ada supplier yang cocok dengan kriteria pencarian' : 'Belum ada data supplier terdaftar'}
                  </td>
                </tr>
              ) : filteredSuppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                  {/* Kode Supplier */}
                  <td className="px-6 py-4 font-extrabold font-mono text-xs text-slate-800 tracking-wider">
                    {s.supplierCode}
                  </td>
                  {/* Nama Supplier (with beautiful leading icon) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200/60/50">
                        <Building2 size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 tracking-tight">{s.supplierName}</p>
                        <p className="text-[9px] text-slate-400 font-medium font-mono">ID: {s.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  {/* Certificate Number with green badge icon */}
                  <td className="px-6 py-4">
                    {s.certNumber ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold bg-slate-50 border border-slate-100/70 px-2.5 py-1 rounded-lg w-fit font-mono">
                        <ShieldCheck size={13} className="text-emerald-500 stroke-[2.5]" />
                        <span>{s.certNumber}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic font-medium">-</span>
                    )}
                  </td>
                  {/* Contact details with small icons */}
                  <td className="px-6 py-4 space-y-1">
                    {s.email && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                        <Mail size={12} className="text-slate-400 stroke-[2]" />
                        <span>{s.email}</span>
                      </div>
                    )}
                    {s.phone && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                        <Phone size={12} className="text-slate-400 stroke-[2]" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                    {!s.email && !s.phone && (
                      <span className="text-xs text-slate-400 italic font-medium">-</span>
                    )}
                  </td>
                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    {statusBadge(s.status)}
                  </td>
                  {/* Actions buttons */}
                  <td className="px-6 py-4 text-right pr-8">
                    <div className="flex gap-1.5 justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Tombol Edit (Edit3 icon) */}
                      <button 
                        onClick={() => openEdit(s)} 
                        title="Modifikasi Data"
                        className="p-2 rounded-xl text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.96]"
                      >
                        <Edit3 size={15} />
                      </button>
                      {/* Tombol Hapus (Trash icon) */}
                      <button 
                        onClick={() => setDeleteTarget({ id: s.id, label: s.supplierName })} 
                        title="Hapus Supplier"
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100/80 transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.96]"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Record Supplier?"
        message={`Mitra Supplier "${deleteTarget?.label}" akan dihapus permanen dari sistem. Pastikan tidak ada data Purchase Order atau pengiriman bahan baku aktif yang terhubung.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        confirmColor="#e11d48"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  )
}