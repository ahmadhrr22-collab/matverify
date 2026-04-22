import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

const severityColor: Record<string, string> = {
  MINOR: 'bg-amber-50 text-amber-700',
  MAJOR: 'bg-orange-50 text-orange-700',
  CRITICAL: 'bg-red-50 text-red-700',
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-red-50 text-red-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  RESOLVED: 'bg-green-50 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-500',
}

export default function NonConformances() {
  const [ncs, setNcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/non-conformances').then(r => setNcs(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Non-Conformances</h2>
        <p className="text-sm text-gray-500 mt-0.5">Laporan ketidaksesuaian material</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Total NC</p>
          <p className="text-3xl font-semibold text-gray-900">{ncs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Open</p>
          <p className="text-3xl font-semibold text-red-600">{ncs.filter(n => n.status === 'OPEN').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Critical</p>
          <p className="text-3xl font-semibold text-red-600">{ncs.filter(n => n.severity === 'CRITICAL').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium">NC Number</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Material</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Deskripsi</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Severity</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Memuat...</td></tr>
            ) : ncs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada non-conformance</td></tr>
            ) : ncs.map(nc => (
              <tr key={nc.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{nc.ncNumber}</td>
                <td className="px-4 py-3 text-gray-900">{nc.task?.deliveryItem?.material?.name || '-'}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{nc.description}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColor[nc.severity] || 'bg-gray-100 text-gray-500'}`}>
                    {nc.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[nc.status] || 'bg-gray-100 text-gray-500'}`}>
                    {nc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(nc.createdAt).toLocaleDateString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}