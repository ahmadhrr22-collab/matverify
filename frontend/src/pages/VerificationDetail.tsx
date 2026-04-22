import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  IN_REVIEW: 'bg-blue-50 text-blue-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
}

export default function VerificationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)

  const fetchData = async () => {
    try {
      const [d, t] = await Promise.all([
        api.get(`/deliveries/${id}`),
        api.get('/tasks')
      ])
      setDelivery(d.data)
      setTasks(t.data.filter((t: any) => t.deliveryItem?.delivery?.id === id))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    fetchData() 
  }, [id])

  const handleComplete = async (action: 'approve' | 'reject') => {
    const msg = action === 'approve'
      ? 'Approve delivery ini? Semua task akan ditandai APPROVED.'
      : 'Reject delivery ini? Semua task akan ditandai REJECTED.'
      
    if (!confirm(msg)) return
    
    setCompleting(true)
    try {
      await api.patch(`/deliveries/${id}/complete`, { action })
      fetchData()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Gagal mengupdate status')
    } finally { 
      setCompleting(false) 
    }
  }

  const handleUpload = async (taskId: string, file: File, docType: string) => {
    setUploading(taskId + docType)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('docType', docType)
      
      const res = await api.post(`/documents/upload/${taskId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const v = res.data.geminiValidation
      if (v) {
        alert(`AI Analysis selesai!\nScore: ${v.overallScore}%\nStatus: ${v.status}\n${v.summary}`)
      }
      fetchData()
    } catch (e: any) {
      alert('Upload gagal: ' + (e.response?.data?.message || e.message))
    } finally {
      setUploading(null)
    }
  }

  if (loading) return <Layout><div className="text-center py-20 text-gray-400">Memuat...</div></Layout>
  if (!delivery) return <Layout><div className="text-center py-20 text-gray-400">Delivery tidak ditemukan</div></Layout>

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/deliveries')} className="text-gray-400 hover:text-gray-600 text-sm">← Kembali</button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Verifikasi — {delivery.deliveryNo}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{delivery.purchaseOrder?.supplier?.supplierName} · {new Date(delivery.arrivalDate).toLocaleDateString('id-ID')}</p>
          </div>
        </div>
        
        {delivery.status === 'PENDING' || delivery.status === 'IN_PROGRESS' ? (
          <div className="flex gap-3">
            <button
              onClick={() => handleComplete('reject')}
              disabled={completing}
              className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              Reject Delivery
            </button>
            <button
              onClick={() => handleComplete('approve')}
              disabled={completing}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {completing ? 'Memproses...' : 'Approve & Complete'}
            </button>
          </div>
        ) : (
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            delivery.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {delivery.status === 'COMPLETED' ? 'Delivery Completed' : 'Delivery Rejected'}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">Belum ada task verifikasi</div>
        ) : tasks.map(task => (
          <div key={task.id} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-medium text-gray-900">{task.deliveryItem?.material?.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Batch: {task.deliveryItem?.batchNo} ·
                  Qty: {task.deliveryItem?.qtyReceived} {task.deliveryItem?.material?.unit} ·
                  Expiry: {new Date(task.deliveryItem?.expiryDate).toLocaleDateString('id-ID')}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[task.status] || 'bg-gray-100 text-gray-500'}`}>
                {task.status}
              </span>
            </div>

            <div className="border-t border-gray-50 pt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Upload Dokumen untuk AI Analysis</p>
              <div className="grid grid-cols-3 gap-3">
                {['COA', 'LABEL', 'DELIVERY_NOTE'].map(docType => {
                  const existing = task.documents?.find((d: any) => d.docType === docType)
                  const isUploading = uploading === task.id + docType
                  
                  return (
                    <div key={docType} className={`border rounded-lg p-3 ${existing ? 'border-green-200 bg-green-50' : 'border-gray-200 border-dashed'}`}>
                      <p className="text-xs font-medium text-gray-600 mb-2">{docType.replace('_', ' ')}</p>
                      {existing ? (
                        <div>
                          <p className="text-xs text-green-700 font-medium">Terverifikasi</p>
                          <p className="text-xs text-gray-500">Confidence: {Math.round((existing.confidence || 0) * 100)}%</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            existing.validationStatus === 'PASSED' ? 'bg-green-100 text-green-700' :
                            existing.validationStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                            existing.validationStatus === 'MANUAL_REVIEW' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {existing.validationStatus}
                          </span>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <span className="text-xs text-blue-600 hover:underline">
                            {isUploading ? 'Menganalisis AI...' : '+ Upload & Analisis AI'}
                          </span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={!!uploading}
                            onChange={e => {
                              const file = e.target.files?.[0]
                              if (file) handleUpload(task.id, file, docType)
                            }} 
                          />
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {task.documents?.length > 0 && (
              <div className="border-t border-gray-50 pt-4 mt-4 space-y-4">
                <p className="text-xs font-medium text-gray-500">Hasil AI Analysis</p>
                {task.documents.map((doc: any) => (
                  <div key={doc.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">{doc.docType}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          doc.validationStatus === 'PASSED' ? 'bg-green-100 text-green-700' :
                          doc.validationStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                          doc.validationStatus === 'MANUAL_REVIEW' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {doc.validationStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">Azure confidence: {Math.round((doc.confidence || 0) * 100)}%</span>
                        {doc.validationDetail?.overallScore !== undefined && (
                          <span className="text-xs font-medium text-blue-600">
                            Gemini score: {doc.validationDetail.overallScore}%
                          </span>
                        )}
                      </div>
                    </div>

                    {doc.validationDetail?.summary && (
                      <div className="bg-white rounded-lg p-3 mb-3 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Ringkasan Gemini AI:</p>
                        <p className="text-xs text-gray-700">{doc.validationDetail.summary}</p>
                      </div>
                    )}

                    {doc.validationDetail?.results && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Detail Validasi per Field:</p>
                        <div className="space-y-2">
                          {doc.validationDetail.results.map((r: any, idx: number) => (
                            <div key={idx} className={`flex items-start gap-3 p-2 rounded-lg ${r.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                              <span className={`text-sm mt-0.5 flex-shrink-0 ${r.passed ? 'text-green-500' : 'text-red-500'}`}>
                                {r.passed ? '✓' : '✗'}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium text-gray-700">{r.specField}</span>
                                  <span className="text-xs text-gray-400">
                                    {Math.round((r.confidence || 0) * 100)}% confident
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Expect: <span className="font-medium">{r.expectedValue}</span> ·
                                  Got: <span className={`font-medium ${r.passed ? 'text-green-700' : 'text-red-700'}`}>
                                    {r.extractedValue || 'Not found'}
                                  </span>
                                  {r.extractedField && r.extractedField !== r.specField && (
                                    <span className="text-gray-400"> (from "{r.extractedField}")</span>
                                  )}
                                </p>
                                {r.reasoning && (
                                  <p className="text-xs text-gray-400 mt-0.5 italic">{r.reasoning}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {doc.extractedData && Object.keys(doc.extractedData).length > 0 && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs font-medium text-gray-400 mb-2">Raw data dari Azure AI:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {Object.entries(doc.extractedData).map(([k, v]) => (
                            <div key={k} className="text-xs">
                              <span className="text-gray-400">{k}: </span>
                              <span className="text-gray-600">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {task.nonConformances?.length > 0 && (
              <div className="border-t border-red-100 pt-4 mt-4">
                <p className="text-xs font-medium text-red-600 mb-2">Non-Conformances Auto-Generated</p>
                {task.nonConformances.map((nc: any) => (
                  <div key={nc.id} className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-red-700">{nc.ncNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        nc.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {nc.severity}
                      </span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">{nc.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  )
}