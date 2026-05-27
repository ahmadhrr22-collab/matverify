import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Eye, 
  X
} from 'lucide-react'

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  const [form, setForm] = useState({
    deliveryNo: '', supplierId: '', poNumber: '', poDate: '', arrivalDate: '', notes: ''
  })
  const [items, setItems] = useState([
    { materialId: '', qtyOrdered: '', qtyReceived: '', batchNo: '', expiryDate: '' }
  ])

  const fetchAll = async () => {
    const cached = cache.get('deliveries-page')
    if (cached) {
      setDeliveries(cached.deliveries)
      setSuppliers(cached.suppliers)
      setMaterials(cached.materials)
      setLoading(false)
      return
    }

    try {
      const [d, s, m] = await Promise.all([
        api.get('/deliveries'), api.get('/suppliers'), api.get('/materials')
      ])
      const data = { deliveries: d.data, suppliers: s.data, materials: m.data }
      cache.set('deliveries-page', data)
      setDeliveries(data.deliveries)
      setSuppliers(data.suppliers)
      setMaterials(data.materials)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const addItem = () => {
    setItems([...items, { materialId: '', qtyOrdered: '', qtyReceived: '', batchNo: '', expiryDate: '' }])
  }

  const removeItem = (i: number) => {
    setItems(items.filter((_, idx) => idx !== i))
  }

  const updateItem = (i: number, field: string, value: string) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: value }
    setItems(updated)
  }

  const resetForm = () => {
    setForm({ deliveryNo: '', supplierId: '', poNumber: '', poDate: '', arrivalDate: '', notes: '' })
    setItems([{ materialId: '', qtyOrdered: '', qtyReceived: '', batchNo: '', expiryDate: '' }])
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const po = await api.post('/purchase-orders', {
        poNumber: form.poNumber,
        supplierId: form.supplierId,
        poDate: form.poDate
      })
      const delivery = await api.post('/deliveries', {
        deliveryNo: form.deliveryNo,
        poId: po.data.id,
        arrivalDate: form.arrivalDate,
        notes: form.notes,
        items: items.map(it => ({
          materialId: it.materialId,
          qtyOrdered: parseFloat(it.qtyOrdered),
          qtyReceived: parseFloat(it.qtyReceived),
          batchNo: it.batchNo,
          expiryDate: it.expiryDate
        }))
      })
      for (const item of delivery.data.items) {
        await api.post('/tasks', { deliveryItemId: item.id, priority: 'MEDIUM' })
      }
      cache.clear('deliveries-page')
      cache.clear('dashboard')
      toast.success('Delivery & Tasks berhasil dibuat')
      resetForm()
      fetchAll()
    } catch (e: any) {
      toast.error('Gagal menyimpan delivery', e.response?.data?.message || e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.delete(`/deliveries/${deleteTarget.id}`)
      cache.clear('deliveries-page')
      cache.clear('dashboard')
      toast.success('Delivery berhasil dihapus')
      fetchAll()
    } catch (e: any) {
      toast.error('Gagal menghapus', e.response?.data?.message || 'Terjadi kesalahan')
    } finally {
      setDeleteTarget(null)
    }
  }

  // Filter deliveries dynamically based on search and status
  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = d.deliveryNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.purchaseOrder?.supplier?.supplierName || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === '' || d.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">Deliveries</h2>
          <p className="text-xs text-slate-500 mt-1">Penerimaan & registrasi bahan baku farmasi masuk</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-gradient-to-tr from-slate-950 via-blue-950 to-indigo-950 hover:opacity-95 text-white border border-white/10 text-white rounded-xl text-xs font-bold px-5 py-3 shadow-md shadow-slate-950/10 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider self-start sm:self-center"
        >
          <Plus size={16} className="stroke-[2.5]" />
          Buat Delivery
        </button>
      </div>

      {/* Form Pembuatan Delivery */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-50">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Registrasi Delivery Baru</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">No. Delivery</label>
                <input
                  required
                  value={form.deliveryNo}
                  onChange={e => setForm({ ...form, deliveryNo: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-4 focus:ring-slate-100/50"
                  placeholder="DEL-2026-0001"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Supplier</label>
                <select
                  required
                  value={form.supplierId}
                  onChange={e => setForm({ ...form, supplierId: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-slate-800 focus:bg-white"
                >
                  <option value="">Pilih Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.supplierName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">No. PO</label>
                <input
                  required
                  value={form.poNumber}
                  onChange={e => setForm({ ...form, poNumber: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-4 focus:ring-slate-100/50"
                  placeholder="PO-2026-0001"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Tanggal PO</label>
                <input
                  type="date"
                  required
                  value={form.poDate}
                  onChange={e => setForm({ ...form, poDate: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-slate-800 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Tanggal Tiba</label>
                <input
                  type="date"
                  required
                  value={form.arrivalDate}
                  onChange={e => setForm({ ...form, arrivalDate: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-slate-800 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Catatan Pengiriman</label>
                <input
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-4 focus:ring-slate-100/50"
                  placeholder="Opsional (misal: segel luar utuh)"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Daftar Material Item</h4>
                <button 
                  type="button" 
                  onClick={addItem} 
                  className="text-xs font-bold text-slate-800 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} className="stroke-[2.5]" /> Tambah Item
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, i) => (
                  <div key={i} className="flex flex-col lg:grid lg:grid-cols-12 gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30 items-end">
                    <div className="w-full lg:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Material</label>
                      <select
                        required
                        value={item.materialId}
                        onChange={e => updateItem(i, 'materialId', e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-800"
                      >
                        <option value="">Pilih</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full lg:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Qty Order</label>
                      <input
                        required
                        type="number"
                        value={item.qtyOrdered}
                        onChange={e => updateItem(i, 'qtyOrdered', e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-800"
                        placeholder="100"
                      />
                    </div>
                    <div className="w-full lg:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Qty Terima</label>
                      <input
                        required
                        type="number"
                        value={item.qtyReceived}
                        onChange={e => updateItem(i, 'qtyReceived', e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-800"
                        placeholder="100"
                      />
                    </div>
                    <div className="w-full lg:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">No. Batch</label>
                      <input
                        required
                        value={item.batchNo}
                        onChange={e => updateItem(i, 'batchNo', e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-800"
                        placeholder="B-PCT-01"
                      />
                    </div>
                    <div className="w-full lg:col-span-3 flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Expiry Date</label>
                        <input
                          required
                          type="date"
                          value={item.expiryDate}
                          onChange={e => updateItem(i, 'expiryDate', e.target.value)}
                          className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-800"
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="text-rose-500 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition-colors self-end mb-0.5"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t border-slate-50 pt-5">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 text-xs font-bold bg-gradient-to-tr from-slate-950 via-blue-950 to-indigo-950 hover:opacity-95 text-white border border-white/10 text-white rounded-xl shadow-md shadow-slate-950/10 active:scale-[0.98] disabled:opacity-50 transition-colors uppercase tracking-wider cursor-pointer"
              >
                {saving ? 'Menyimpan...' : 'Simpan & Generate Tugas'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan No. Delivery atau Supplier..."
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
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 outline-none focus:border-slate-800 focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Deliveries Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">No. Delivery</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal Datang</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Item</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-slate-400 font-medium">
                    {searchQuery || statusFilter ? 'Tidak ada delivery yang cocok dengan kriteria pencarian' : 'Belum ada data delivery pengiriman'}
                  </td>
                </tr>
              ) : filteredDeliveries.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-6 py-4.5 font-bold font-mono text-xs text-slate-700 tracking-wider">
                    {d.deliveryNo}
                  </td>
                  <td className="px-6 py-4.5 text-sm font-semibold text-slate-800">
                    {d.purchaseOrder?.supplier?.supplierName || '-'}
                  </td>
                  <td className="px-6 py-4.5 text-xs text-slate-500 font-medium">
                    {new Date(d.arrivalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4.5 text-xs text-slate-500 font-semibold">
                    {d.items?.length || 0} Item
                  </td>
                  <td className="px-6 py-4.5">
                    {statusBadge(d.status)}
                  </td>
                  <td className="px-6 py-4.5">
                    <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Tombol Verifikasi (Eye icon) */}
                      <button
                        onClick={() => navigate(`/deliveries/${d.id}`)}
                        title="Tinjau & Verifikasi"
                        className="p-2 rounded-xl text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer shadow-sm"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Tombol Hapus (Trash icon) */}
                      <button
                        onClick={() => setDeleteTarget({ id: d.id, label: d.deliveryNo })}
                        title="Hapus Record"
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer shadow-sm"
                      >
                        <Trash2 size={16} />
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
        title="Hapus Record Delivery?"
        message={`Data pengiriman "${deleteTarget?.label}" dan seluruh laporan verifikasinya akan dihapus secara permanen dari server Neon. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        confirmColor="#e11d48"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  )
}