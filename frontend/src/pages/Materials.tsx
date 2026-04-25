import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { toast } from '../components/Toast' // Import toast

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

  const fetchMaterials = () => {
    api.get('/materials').then(r => setMaterials(r.data)).finally(() => setLoading(false))
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
        toast.success('Material berhasil diupdate') // Update sukses
      } else {
        await api.post('/materials', data)
        toast.success('Material berhasil disimpan') // Simpan sukses
      }
      resetForm()
      fetchMaterials()
    } catch (e: any) {
      // Ganti alert dengan toast.error
      toast.error('Gagal menyimpan', e.response?.data?.message || 'Pastikan Quality Specs format JSON valid')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus material "${name}"?`)) return
    try {
      await api.delete(`/materials/${id}`)
      toast.success('Material berhasil dihapus') // Hapus sukses
      fetchMaterials()
    } catch (e: any) {
      // Ganti alert dengan toast.error
      toast.error('Gagal menghapus', e.response?.data?.message || 'Terjadi kesalahan')
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Materials</h2>
          <p className="text-sm text-gray-500 mt-0.5">Master data bahan baku</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
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

      <div className="bg-white rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
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
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Memuat...</td></tr>
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
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(m.id, m.name)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 font-medium transition-colors">
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}