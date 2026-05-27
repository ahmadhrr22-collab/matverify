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
  FlaskConical,
  Database,
  Scale,
  Code,
  Layers,
  Sparkles
} from 'lucide-react'

export default function Materials() {
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    materialCode: '', 
    name: '', 
    category: '', 
    unit: '',
    qualitySpecs: '{\n  "purity": "min 99%",\n  "moisture": "max 0.5%",\n  "heavy_metals": "max 10ppm"\n}'
  })

  // Search and category filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // State untuk target penghapusan (ConfirmModal)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  const fetchMaterials = () => {
    const cached = cache.get('materials-page')
    if (cached) {
      setMaterials(cached)
      setLoading(false)
      return
    }

    api.get('/materials')
      .then(r => {
        cache.set('materials-page', r.data)
        setMaterials(r.data)
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMaterials() }, [])

  const openEdit = (m: any) => {
    setEditingId(m.id)
    setForm({
      materialCode: m.materialCode,
      name: m.name,
      category: m.category,
      unit: m.unit,
      qualitySpecs: JSON.stringify(m.qualitySpecs, null, 2)
    })
    setShowForm(true)
    // Scroll to form smoothly
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({ 
      materialCode: '', 
      name: '', 
      category: '', 
      unit: '', 
      qualitySpecs: '{\n  "purity": "min 99%",\n  "moisture": "max 0.5%",\n  "heavy_metals": "max 10ppm"\n}' 
    })
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, qualitySpecs: JSON.parse(form.qualitySpecs) }
      if (editingId) {
        await api.put(`/materials/${editingId}`, data)
        toast.success('Material berhasil diupdate')
      } else {
        await api.post('/materials', data)
        toast.success('Material berhasil disimpan')
      }

      cache.clear('materials-page')
      cache.clear('dashboard')
      cache.clear('deliveries-page')

      resetForm()
      fetchMaterials()
    } catch (e: any) {
      toast.error('Gagal menyimpan', e.response?.data?.message || 'Pastikan Quality Specs format JSON valid')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/materials/${deleteTarget.id}`)
      
      cache.clear('materials-page')
      cache.clear('dashboard')
      cache.clear('deliveries-page')

      toast.success('Material berhasil dihapus')
      fetchMaterials()
    } catch (e: any) {
      toast.error('Gagal menghapus', e.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setDeleteTarget(null)
    }
  }

  // Filter materials dynamically based on search query and category filter
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.materialCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.unit.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === '' || m.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Get unique categories for dropdown filter
  const categories = Array.from(new Set(materials.map(m => m.category).filter(Boolean)))

  // Helper to render parsed quality specs beautifully
  const renderSpecPills = (specs: any) => {
    try {
      const obj = typeof specs === 'string' ? JSON.parse(specs) : specs
      return (
        <div className="flex flex-wrap gap-1.5 max-w-xs sm:max-w-sm">
          {Object.entries(obj).map(([key, val]) => (
            <span key={key} className="inline-flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-200/60 text-slate-600 px-2 py-0.5 rounded-lg font-mono font-medium shadow-sm">
              <span className="text-slate-400 font-bold uppercase">{key}</span>: 
              <span className="text-slate-800 font-extrabold">{String(val)}</span>
            </span>
          ))}
        </div>
      )
    } catch (e) {
      return <span className="text-xs text-slate-400 italic">Invalid Specs Format</span>
    }
  }

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-100 border border-slate-200/50 text-slate-800 p-1.5 rounded-lg border border-slate-200/60/50">
              <FlaskConical size={16} />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800 bg-slate-100/50 px-2 py-0.5 rounded-md">Bahan Baku Farmasi</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">Materials</h2>
          <p className="text-xs text-slate-500">Katalog master data bahan baku aktif, eksipien, dan spesifikasi standar kualitas</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true) }} 
          className="btn-primary text-xs font-bold px-5 py-3 flex items-center gap-2 cursor-pointer uppercase tracking-wider self-start sm:self-center"
        >
          <Plus size={16} className="stroke-[2.5]" />
          Tambah Material
        </button>
      </div>

      {/* Form Tambah/Edit Material (Glassmorphism layout) */}
      {showForm && (
        <div className="glass-panel rounded-2xl p-6 mb-6 shadow-md space-y-6 animate-fadeIn transition-all">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-slate-600 animate-spin-slow" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                {editingId ? 'Edit Master Material' : 'Registrasi Material Baru'}
              </h3>
            </div>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Identitas Material */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informasi Utama</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Kode Material</label>
                  <input 
                    required 
                    value={form.materialCode} 
                    onChange={e => setForm({ ...form, materialCode: e.target.value })}
                    className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 disabled:opacity-60 disabled:cursor-not-allowed font-mono text-sm"
                    placeholder="MAT-001" 
                    disabled={!!editingId} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Material</label>
                  <input 
                    required 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 text-sm font-semibold"
                    placeholder="Paracetamol API (Active Pharmaceutical Ingredient)" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Satuan (Unit)</label>
                  <input 
                    required 
                    value={form.unit} 
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 text-sm font-mono"
                    placeholder="kg" 
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Kategori & Kualifikasi Specs */}
            <div className="space-y-4 border-t border-slate-100/50 pt-5">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klasifikasi & Spesifikasi Uji Mutu</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Kategori</label>
                  <input 
                    required 
                    value={form.category} 
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 text-sm"
                    placeholder="Active Ingredient / Excipient" 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quality Specs (Format JSON)</label>
                    <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                      <Code size={10} /> Standar CoA Validasi AI
                    </span>
                  </div>
                  <textarea 
                    rows={4} 
                    required
                    value={form.qualitySpecs} 
                    onChange={e => setForm({ ...form, qualitySpecs: e.target.value })}
                    className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 font-mono text-xs leading-relaxed" 
                    placeholder='{\n  "purity": "min 99%",\n  "moisture": "max 0.5%",\n  "heavy_metals": "max 10ppm"\n}'
                  />
                  <div className="flex items-start gap-1.5 mt-2 bg-amber-50/50 border border-amber-100/50 p-2.5 rounded-xl text-[10px] text-amber-800">
                    <Code size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="leading-normal">
                      <strong>Penting:</strong> Spesifikasi mutu di atas ditulis dalam objek JSON murni. Parameter ini akan digunakan oleh <strong>Gemini AI</strong> untuk mengekstrak, mencocokkan, dan memverifikasi sertifikat CoA pengiriman secara otomatis.
                    </p>
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
                {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Daftarkan Material'}
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
              placeholder="Cari Kode, Nama, Kategori, atau Satuan..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-800 focus:bg-white transition-all focus:ring-2 focus:ring-4 focus:ring-slate-100/50"
            />
          </div>
          <div className="w-full sm:w-56 relative">
            <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 outline-none focus:border-slate-800 focus:bg-white transition-all appearance-none cursor-pointer font-semibold"
            >
              <option value="">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
          Menampilkan <span className="text-slate-800 font-extrabold font-mono">{filteredMaterials.length}</span> dari <span className="text-slate-600 font-extrabold font-mono">{materials.length}</span> material
        </div>
      </div>

      {/* Table Card (Ultra-Premium View) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Material</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Satuan (Unit)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Spesifikasi Mutu (Specs)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-8">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-slate-400 font-medium">
                    {searchQuery || categoryFilter ? 'Tidak ada material yang cocok dengan kriteria pencarian' : 'Belum ada data material terdaftar'}
                  </td>
                </tr>
              ) : filteredMaterials.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/30 transition-colors group">
                  {/* Kode Material */}
                  <td className="px-6 py-4 font-extrabold font-mono text-xs text-slate-800 tracking-wider">
                    {m.materialCode}
                  </td>
                  {/* Nama Material (with beautiful chemistry icon avatar) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/50 text-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200/60/50">
                        <FlaskConical size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 tracking-tight">{m.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium font-mono">ID: {m.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  {/* Kategori */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {m.category}
                    </span>
                  </td>
                  {/* Unit with Scale Icon */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold bg-slate-50/50 border border-slate-100/50 px-2 py-0.5 rounded-lg w-fit">
                      <Scale size={12} className="text-slate-400" />
                      <span>{m.unit}</span>
                    </div>
                  </td>
                  {/* Quality Specs Pills (Beautiful parsed representation) */}
                  <td className="px-6 py-4">
                    {renderSpecPills(m.qualitySpecs)}
                  </td>
                  {/* Actions buttons */}
                  <td className="px-6 py-4 text-right pr-8">
                    <div className="flex gap-1.5 justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Tombol Edit (Edit3 icon) */}
                      <button 
                        onClick={() => openEdit(m)} 
                        title="Modifikasi Data"
                        className="p-2 rounded-xl text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.96]"
                      >
                        <Edit3 size={15} />
                      </button>
                      {/* Tombol Hapus (Trash icon) */}
                      <button 
                        onClick={() => setDeleteTarget({ id: m.id, label: m.name })} 
                        title="Hapus Material"
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
        title="Hapus Master Material?"
        message={`Material "${deleteTarget?.label}" akan dihapus permanen dari master data. Tindakan ini akan menghapus spesifikasi kualitas uji CoA yang terhubung.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        confirmColor="#e11d48"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  )
}