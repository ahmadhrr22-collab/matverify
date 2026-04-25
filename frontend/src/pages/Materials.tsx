import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { toast } from '../components/Toast'
import { cache } from '../services/cache' // Import cache
import { SkeletonRow } from '../components/Skeleton' // Import Skeleton
import ConfirmModal from '../components/ConfirmModal' // Import ConfirmModal

export default function Materials() {
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    materialCode: '', name: '', category: '', unit: '',
    qualitySpecs: '{"purity":"min 99%","moisture":"max 0.5%","heavy_metals":"max 10ppm"}'
  })

  // State untuk target penghapusan (ConfirmModal)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  const fetchMaterials = () => {
    // 1. Cek data di cache untuk halaman materials
    const cached = cache.get('materials-page')
    if (cached) {
      setMaterials(cached)
      setLoading(false)
      return
    }

    // 2. Jika tidak ada cache, fetch dari API
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
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({ 
      materialCode: '', 
      name: '', 
      category: '', 
      unit: '', 
      qualitySpecs: '{"purity":"min 99%","moisture":"max 0.5%","heavy_metals":"max 10ppm"}' 
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

      // Invalidate cache setiap kali ada perubahan data
      cache.clear('materials-page')
      cache.clear('dashboard')
      cache.clear('deliveries-page')

      resetForm()
      fetchMaterials()
    } catch (e: any) {
      toast.error('Gagal menyimpan', e.response?.data?.message || 'Pastikan Quality Specs format JSON valid')
    } finally { setSaving(false) }
  }

  // Fungsi handleDelete yang diperbarui menggunakan modal kustom
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/materials/${deleteTarget.id}`)
      
      // Invalidate cache setiap kali ada penghapusan data
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

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Materials</h2>
          <p className="text-sm text-gray-500 mt-0.5">Master data bahan baku</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true) }} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Tambah Material
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">{editingId ? 'Edit Material' : 'Tambah Material Baru'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Kode Material</label>
              <input required value={form.materialCode} onChange={e => setForm({ ...form, materialCode: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="MAT-001" disabled={!!editingId} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nama Material</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paracetamol API" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Kategori</label>
              <input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Active Pharmaceutical Ingredient" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Unit</label>
              <input required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="kg" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Quality Specs (JSON)</label>
              <textarea rows={3} value={form.qualitySpecs} onChange={e => setForm({ ...form, qualitySpecs: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-gray-400 mt-1">Specs ini akan dipakai AI untuk validasi CoA</p>
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kode</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Nama</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Kategori</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Unit</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Quality Specs</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
            ) : materials.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada material</td></tr>
            ) : materials.map(m => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{m.materialCode}</td>
                <td className="px-4 py-3 text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-gray-500">{m.category}</td>
                <td className="px-4 py-3 text-gray-500">{m.unit}</td>
                <td className="px-4 py-3 text-gray-400 text-xs font-mono">{JSON.stringify(m.qualitySpecs).slice(0, 40)}...</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {/* Tombol Edit (Ikon Pensil) */}
                    <button 
                      onClick={() => openEdit(m)} 
                      title="Edit Material"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {/* Tombol Hapus (Ikon Sampah) */}
                    <button 
                      onClick={() => setDeleteTarget({ id: m.id, label: m.name })} 
                      title="Hapus Material"
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Material?"
        message={`Material "${deleteTarget?.label}" akan dihapus permanen dari master data.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        confirmColor="#dc2626"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  )
}