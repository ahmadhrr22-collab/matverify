import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

export default function Dashboard() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [ncs, setNcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.get('/deliveries'), api.get('/non-conformances')])
      .then(([d, n]) => { setDeliveries(d.data); setNcs(n.data) })
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Deliveries', value: deliveries.length, color: 'text-blue-600' },
    { label: 'Pending Verifikasi', value: deliveries.filter(d => d.status === 'PENDING').length, color: 'text-amber-600' },
    { label: 'Completed', value: deliveries.filter(d => d.status === 'COMPLETED').length, color: 'text-green-600' },
    { label: 'Open NC', value: ncs.filter(n => n.status === 'OPEN').length, color: 'text-red-600' },
  ]

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Selamat datang, {user?.name}</h2>
        <p className="text-sm text-gray-500 mt-0.5">Overview verifikasi material hari ini</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-semibold ${s.color}`}>{loading ? '-' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Delivery terbaru</h3>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Memuat...</p>
          ) : deliveries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada delivery</p>
          ) : deliveries.slice(0, 5).map(d => (
            <div key={d.id} onClick={() => navigate(`/deliveries/${d.id}`)}
              className="flex justify-between items-center py-2.5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2">
              <div>
                <p className="text-sm text-gray-900">{d.deliveryNo}</p>
                <p className="text-xs text-gray-400">{d.purchaseOrder?.supplier?.supplierName}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                d.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                d.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                'bg-blue-50 text-blue-700'
              }`}>{d.status}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Non-conformance terbaru</h3>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Memuat...</p>
          ) : ncs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Tidak ada NC open</p>
          ) : ncs.slice(0, 5).map(nc => (
            <div key={nc.id} onClick={() => navigate('/non-conformances')}
              className="flex justify-between items-center py-2.5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2">
              <div>
                <p className="text-sm font-mono text-gray-900">{nc.ncNumber}</p>
                <p className="text-xs text-gray-400 truncate max-w-48">{nc.description}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                nc.severity === 'CRITICAL' ? 'bg-red-50 text-red-700' :
                nc.severity === 'MAJOR' ? 'bg-orange-50 text-orange-700' :
                'bg-amber-50 text-amber-700'
              }`}>{nc.severity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-blue-700">Ada delivery yang perlu diverifikasi</p>
          <p className="text-xs text-blue-500 mt-0.5">{deliveries.filter(d => d.status === 'PENDING').length} delivery menunggu verifikasi AI</p>
        </div>
        <button onClick={() => navigate('/deliveries')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Lihat Deliveries →
        </button>
      </div>
    </Layout>
  )
}