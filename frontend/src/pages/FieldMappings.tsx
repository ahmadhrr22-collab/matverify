import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { toast } from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'
import { 
  GitFork, 
  GitCommit, 
  Trash2, 
  Building2, 
  Sparkles, 
  Code, 
  Layers, 
  Plus, 
  Info
} from 'lucide-react'

export default function FieldMappings() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [mappings, setMappings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ externalField: '', internalField: '' })
  
  // Custom delete modal target state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; external: string; internal: string } | null>(null)

  const commonInternalFields = [
    'purity', 'moisture', 'heavy_metals', 'loss_on_drying',
    'melting_point', 'particle_size', 'ash_content', 'pH', 'assay'
  ]

  useEffect(() => {
    api.get('/suppliers').then(r => setSuppliers(r.data))
  }, [])

  const fetchMappings = (supplierId: string) => {
    setLoading(true)
    api.get(`/field-mappings/${supplierId}`)
      .then(r => setMappings(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!selectedSupplier) return
    fetchMappings(selectedSupplier)
  }, [selectedSupplier])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier) return toast.error('Kesalahan', 'Silakan pilih supplier terlebih dahulu')
    setSaving(true)
    try {
      await api.post('/field-mappings', {
        supplierId: selectedSupplier,
        externalField: form.externalField.toLowerCase().trim(),
        internalField: form.internalField.toLowerCase().trim()
      })
      toast.success('Field mapping berhasil ditambahkan')
      setForm({ externalField: '', internalField: '' })
      fetchMappings(selectedSupplier)
    } catch (e: any) {
      toast.error('Gagal menyimpan', e.response?.data?.message || 'Terjadi kesalahan')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/field-mappings/${deleteTarget.id}`)
      toast.success('Field mapping berhasil dihapus')
      setMappings(mappings.filter(m => m.id !== deleteTarget.id))
    } catch (e: any) {
      toast.error('Gagal menghapus', e.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-slate-100 border border-slate-200/50 text-slate-800 p-1.5 rounded-lg border border-slate-200/60/50">
            <GitFork size={16} />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800 bg-slate-100/50 px-2 py-0.5 rounded-md">AI Translation</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">Field Mapping</h2>
        <p className="text-xs text-slate-500">Konfigurasi pemetaan kunci parameter sertifikasi CoA dari format supplier ke standardisasi internal</p>
      </div>

      {/* Info Alert Box */}
      <div className="bg-slate-100/70 border border-slate-200/60/60 rounded-2xl p-4 mb-6 shadow-sm flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-slate-800 flex items-center justify-center flex-shrink-0">
          <Info size={16} className="stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">Mekanisme Field Mapping</p>
          <p className="text-xs text-slate-900/90 leading-relaxed">
            Setiap mitra supplier terkadang mencantumkan nama parameter pengujian berbeda pada sertifikat CoA mereka. Field mapping membantu <strong>Gemini AI</strong> secara mutlak memetakan teks asing tersebut ke parameter baku perusahaan Anda.
            <br />
            <span className="italic mt-1 block">Contoh: Nama di dokumen supplier <strong className="font-semibold font-mono">"metals content"</strong> dipetakan otomatis ke spesifikasi internal <strong className="font-semibold font-mono">"heavy_metals"</strong>.</span>
          </p>
        </div>
      </div>

      {/* Dynamic Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Suppliers Selector list */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
              <Building2 size={15} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daftar Mitra Penyuplai</span>
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1">
              {suppliers.map(s => {
                const isActive = selectedSupplier === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSupplier(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-between border ${
                      isActive
                        ? 'bg-slate-900 border border-slate-800 text-white border-blue-600 font-semibold shadow-md shadow-slate-950/10 scale-[1.01]'
                        : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/50 hover:border-slate-200 text-slate-700 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{s.supplierName}</span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded transition-colors ${
                      isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-200/60 text-slate-500'
                    }`}>
                      {s.supplierCode}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Mapping Form & Table */}
        <div className="col-span-1 lg:col-span-2">
          {!selectedSupplier ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 space-y-3 shadow-sm border border-dashed border-slate-200/80">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400 shadow-sm">
                <Building2 size={22} className="stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">Pilih Supplier Mitra</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Silakan pilih salah satu mitra penyuplai di panel kiri untuk melihat dan mengonfigurasi pemetaan parameter CoA secara khusus.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Form Tambah Mapping Baru (Glassmorphism card) */}
              <div className="glass-panel rounded-2xl p-6 shadow-md space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100/50">
                  <Sparkles size={16} className="text-slate-600 animate-spin-slow" />
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Tambah Mapping Baru</h3>
                </div>
                
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Field di CoA Supplier (Kunci Eksternal)</label>
                      <input
                        required
                        value={form.externalField}
                        onChange={e => setForm({...form, externalField: e.target.value})}
                        className="input-field focus:ring-2 focus:ring-4 focus:ring-slate-100/50 text-sm font-mono"
                        placeholder="e.g. metals content"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Nama kolom/spesifikasi persis seperti di sertifikat supplier</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Field Standar Perusahaan (Kunci Internal)</label>
                      <div className="relative">
                        <select
                          value={form.internalField}
                          onChange={e => setForm({...form, internalField: e.target.value})}
                          className="input-field appearance-none cursor-pointer pr-10 text-sm font-semibold"
                        >
                          <option value="">-- Pilih Spesifikasi Internal --</option>
                          {commonInternalFields.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                          <option value="kustom">-- Ketik Parameter Kustom --</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Custom input manual jika memilih opsi kustom atau di luar common fields */}
                      {(form.internalField === 'kustom' || (!commonInternalFields.includes(form.internalField) && form.internalField !== '')) && (
                        <div className="mt-3 animate-fadeIn">
                          <label className="block text-[9px] font-extrabold text-slate-800 mb-1 uppercase tracking-widest">Input Manual Parameter</label>
                          <input
                            required
                            value={form.internalField === 'kustom' ? '' : form.internalField}
                            onChange={e => setForm({...form, internalField: e.target.value})}
                            className="input-field text-sm font-mono focus:ring-2 focus:ring-4 focus:ring-slate-100/50"
                            placeholder="Masukkan nama parameter kustom..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end border-t border-slate-100/50 pt-4">
                    <button
                      type="submit"
                      disabled={saving || !form.externalField || !form.internalField || form.internalField === 'kustom'}
                      className="btn-primary text-xs font-bold px-5 py-2.5 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Plus size={14} className="stroke-[2.5]" />
                      {saving ? 'Menyimpan...' : 'Tambah Mapping'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Table Card - Configured mappings */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-slate-400" />
                    <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Pemetaan Terkonfigurasi</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {mappings.length} Rules
                  </span>
                </div>
                
                {loading ? (
                  <div className="text-center py-12 text-slate-400 text-sm font-medium">Memuat konfigurasi...</div>
                ) : mappings.length === 0 ? (
                  <div className="text-center py-12 px-6 text-slate-400 space-y-2">
                    <Code className="mx-auto text-slate-300 stroke-[1.5]" size={36} />
                    <p className="text-xs font-medium">Belum ada pemetaan khusus supplier ini.</p>
                    <p className="text-[10px] text-slate-400/80 max-w-xs mx-auto">Gemini AI akan tetap memproses pencocokan dokumen secara fleksibel berdasarkan keselarasan makna kata (Semantic Match).</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/30">
                          <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Field Dokumen Supplier (External)</th>
                          <th className="px-2 py-3.5 text-xs font-bold text-slate-300 uppercase tracking-wider text-center">Arah</th>
                          <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Parameter Baku Internal</th>
                          <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right pr-8">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {mappings.map(m => (
                          <tr key={m.id} className="hover:bg-slate-50/40 transition-colors group">
                            {/* External Field Badge */}
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center text-xs font-mono font-semibold text-slate-700 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg">
                                {m.externalField}
                              </span>
                            </td>
                            {/* Direction Arrow */}
                            <td className="px-2 py-4 text-center">
                              <GitCommit size={16} className="text-slate-300 mx-auto group-hover:text-slate-600 transition-colors stroke-[2.5]" />
                            </td>
                            {/* Internal Field Badge */}
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center text-xs font-mono font-extrabold text-slate-800 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                                {m.internalField}
                              </span>
                            </td>
                            {/* Delete Button */}
                            <td className="px-6 py-4 text-right pr-8">
                              <button 
                                onClick={() => setDeleteTarget({ id: m.id, external: m.externalField, internal: m.internalField })}
                                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100/80 transition-all cursor-pointer opacity-80 group-hover:opacity-100 hover:shadow active:scale-[0.96]"
                                title="Hapus Rule Mapping"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Aturan Field Mapping?"
        message={`Aturan pemetaan parameter "${deleteTarget?.external}" → "${deleteTarget?.internal}" akan dihapus permanen dari konfigurasi supplier.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        confirmColor="#e11d48"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  )
}