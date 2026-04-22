import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
}

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    deliveryNo: '', supplierId: '', poNumber: '', poDate: '', arrivalDate: '', notes: ''
  })
  const [items, setItems] = useState([
    { materialId: '', qtyOrdered: '', qtyReceived: '', batchNo: '', expiryDate: '' }
  ])

  const fetchAll = async () => {
    try {
      const [d, s, m] = await Promise.all([
        api.get('/deliveries'), api.get('/suppliers'), api.get('/materials')
      ])
      setDeliveries(d.data)
      setSuppliers(s.data)
      setMaterials(m.data)
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
      resetForm()
      fetchAll()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menyimpan delivery')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, deliveryNo: string) => {
    if (!confirm(`Hapus delivery "${deliveryNo}" beserta semua data verifikasinya?`)) return
    try {
      await api.delete(`/deliveries/${id}`)
      fetchAll()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menghapus')
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Deliveries</h2>
          <p className="text-sm text-gray-500 mt-0.5">Penerimaan bahan baku</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Buat Delivery
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Buat Delivery Baru</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">No. Delivery</label>
                <input
                  required
                  value={form.deliveryNo}
                  onChange={e => setForm({...form, deliveryNo: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="DEL-2026-001"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Supplier</label>
                <select
                  required
                  value={form.supplierId}
                  onChange={e => setForm({...form, supplierId: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.supplierName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">No. PO</label>
                <input
                  required
                  value={form.poNumber}
                  onChange={e => setForm({...form, poNumber: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="PO-2026-001"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tanggal PO</label>
                <input
                  type="date"
                  required
                  value={form.poDate}
                  onChange={e => setForm({...form, poDate: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tanggal Tiba</label>
                <input
                  type="date"
                  required
                  value={form.arrivalDate}
                  onChange={e => setForm({...form, arrivalDate: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Catatan</label>
                <input
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Opsional"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">Item Material</h4>
                <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:underline">
                  + Tambah Item
                </button>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-5 gap-3 mb-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Material</label>
                    <select
                      required
                      value={item.materialId}
                      onChange={e => updateItem(i, 'materialId', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih</option>
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Qty Order</label>
                    <input
                      required
                      type="number"
                      value={item.qtyOrdered}
                      onChange={e => updateItem(i, 'qtyOrdered', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Qty Terima</label>
                    <input
                      required
                      type="number"
                      value={item.qtyReceived}
                      onChange={e => updateItem(i, 'qtyReceived', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Batch No</label>
                    <input
                      required
                      value={item.batchNo}
                      onChange={e => updateItem(i, 'batchNo', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="BT-001"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Expiry Date</label>
                      <input
                        required
                        type="date"
                        value={item.expiryDate}
                        onChange={e => updateItem(i, 'expiryDate', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        className="text-red-400 hover:text-red-600 pb-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Buat Delivery & Generate Tasks'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">No. Delivery</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Supplier</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Tanggal</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Items</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Memuat...</td></tr>
            ) : deliveries.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada delivery</td></tr>
            ) : deliveries.map(d => (
              <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{d.deliveryNo}</td>
                <td className="px-4 py-3 text-gray-900">{d.purchaseOrder?.supplier?.supplierName || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(d.arrivalDate).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3 text-gray-500">{d.items?.length || 0} item</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[d.status] || 'bg-gray-100 text-gray-500'}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/deliveries/${d.id}`)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Verifikasi →
                    </button>
                    <button
                      onClick={() => handleDelete(d.id, d.deliveryNo)}
                      className="text-xs text-red-500 hover:underline"
                    >
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