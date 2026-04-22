import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

export default function FieldMappings() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [mappings, setMappings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ externalField: '', internalField: '' })

  const commonInternalFields = [
    'purity', 'moisture', 'heavy_metals', 'loss_on_drying',
    'melting_point', 'particle_size', 'ash_content', 'pH', 'assay'
  ]

  useEffect(() => {
    api.get('/suppliers').then(r => setSuppliers(r.data))
  }, [])

  useEffect(() => {
    if (!selectedSupplier) return
    setLoading(true)
    api.get(`/field-mappings/${selectedSupplier}`)
      .then(r => setMappings(r.data))
      .finally(() => setLoading(false))
  }, [selectedSupplier])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier) return alert('Pilih supplier dulu')
    setSaving(true)
    try {
      await api.post('/field-mappings', {
        supplierId: selectedSupplier,
        externalField: form.externalField.toLowerCase().trim(),
        internalField: form.internalField.toLowerCase().trim()
      })
      setForm({ externalField: '', internalField: '' })
      api.get(`/field-mappings/${selectedSupplier}`).then(r => setMappings(r.data))
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal menyimpan')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus mapping ini?')) return
    await api.delete(`/field-mappings/${id}`)
    setMappings(mappings.filter(m => m.id !== id))
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Field Mapping</h2>
        <p className="text-sm text-gray-500 mt-0.5">Konfigurasi pemetaan field CoA per supplier</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-blue-700 mb-1">Apa itu Field Mapping?</p>
        <p className="text-xs text-blue-600">
          Setiap supplier mungkin menggunakan nama field yang berbeda di CoA mereka.
          Field mapping membantu AI mencocokkan field supplier dengan standar internal perusahaan.
          Contoh: supplier menyebut "metals" → sistem internal menyebutnya "heavy_metals".
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Pilih Supplier</p>
            <div className="space-y-1">
              {suppliers.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSupplier(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedSupplier === s.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s.supplierName}
                  <span className="text-xs text-gray-400 ml-1">({s.supplierCode})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          {!selectedSupplier ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
              Pilih supplier untuk melihat dan mengelola field mapping
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-sm font-medium text-gray-700 mb-4">Tambah Mapping Baru</p>
                <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Field di CoA Supplier</label>
                    <input
                      required
                      value={form.externalField}
                      onChange={e => setForm({...form, externalField: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="metals"
                    />
                    <p className="text-xs text-gray-400 mt-1">Nama field yang muncul di dokumen supplier</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Field Internal Perusahaan</label>
                    <select
                      value={form.internalField}
                      onChange={e => setForm({...form, internalField: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih atau ketik manual</option>
                      {commonInternalFields.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    {!commonInternalFields.includes(form.internalField) && (
                      <input
                        value={form.internalField}
                        onChange={e => setForm({...form, internalField: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                        placeholder="heavy_metals"
                      />
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving || !form.externalField || !form.internalField}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Menyimpan...' : '+ Tambah Mapping'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-xl border border-gray-100">
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Mapping Terkonfigurasi</p>
                </div>
                {loading ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Memuat...</div>
                ) : mappings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Belum ada mapping — Gemini AI akan tetap bekerja dengan semantic understanding
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs">Field Supplier (external)</th>
                        <th className="text-left px-5 py-3 text-gray-400 font-medium text-xs"></th>
                        <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs">Field Internal</th>
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map(m => (
                        <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-5 py-3 font-mono text-xs text-gray-700">{m.externalField}</td>
                          <td className="px-2 py-3 text-gray-400 text-xs">→</td>
                          <td className="px-5 py-3 font-mono text-xs text-blue-700">{m.internalField}</td>
                          <td className="px-5 py-3">
                            <button onClick={() => handleDelete(m.id)} className="text-xs text-red-500 hover:underline">
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}