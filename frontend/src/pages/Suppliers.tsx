import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { toast } from '../components/Toast'
import { cache } from '../services/cache' // Import cache
import { SkeletonRow } from '../components/Skeleton' // Import Skeleton
import ConfirmModal from '../components/ConfirmModal' // Import ConfirmModal

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    supplierCode: '', supplierName: '', certNumber: '', email: '', phone: '', status: 'ACTIVE'
  })

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

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Suppliers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Daftar supplier bahan baku</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Tambah Supplier
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">{editingId ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Kode Supplier</label>
              <input required value={form.supplierCode} onChange={e => setForm({ ...form, supplierCode: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SUP-001" disabled={!!editingId} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nama Supplier</label>
              <input required value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PT Kimia Farma" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">No. Sertifikat</label>
              <input value={form.certNumber} onChange={e => setForm({ ...form, certNumber: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CERT-2026-001" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="supplier@email.com" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="021-1234567" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
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
              <th className="text-left px-4 py-3 text-gray-500 font-medium">No. Sertifikat</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada supplier</td></tr>
            ) : suppliers.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.supplierCode}</td>
                <td className="px-4 py-3 text-gray-900">{s.supplierName}</td>
                <td className="px-4 py-3 text-gray-500">{s.certNumber || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{s.email || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : s.status === 'SUSPENDED' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {/* Tombol Edit (Ikon Pensil) */}
                    <button 
                      onClick={() => openEdit(s)} 
                      title="Edit Supplier"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {/* Tombol Hapus (Ikon Sampah) */}
                    <button 
                      onClick={() => setDeleteTarget({ id: s.id, label: s.supplierName })} 
                      title="Hapus Supplier"
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h14M8 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2M15 6v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
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
        title="Hapus Supplier?"
        message={`Supplier "${deleteTarget?.label}" akan dihapus permanen. Pastikan tidak ada Purchase Order aktif yang terhubung.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        confirmColor="#dc2626"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  )
}