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

  useEffect(() => { fetchData() }, [id])

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
        const score = v.overallScore ?? v.score ?? 'N/A'
        const status = v.status ?? 'Unknown'
        const summary = v.summary ?? ''
        alert(`AI Analysis Complete\nScore: ${score}%\nStatus: ${status}\n${summary}`)
      }
      fetchData()
    } catch (e: any) {
      alert('Upload failed: ' + (e.response?.data?.message || e.message))
    } finally {
      setUploading(null)
    }
  }

  const handleComplete = async (action: 'approve' | 'reject') => {
    const msg = action === 'approve'
      ? 'Approve this delivery? All tasks will be marked as APPROVED.'
      : 'Reject this delivery? All tasks will be marked as REJECTED.'
    if (!confirm(msg)) return
    setCompleting(true)
    try {
      await api.patch(`/deliveries/${id}/complete`, { action })
      fetchData()
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update status')
    } finally {
      setCompleting(false)
    }
  }

  const hasDocuments = tasks.some((t: any) => t.documents?.length > 0)
  const isActionable = (delivery?.status === 'PENDING' || delivery?.status === 'IN_PROGRESS') && hasDocuments

  if (loading) return <Layout><div className="text-center py-20 text-gray-400">Loading...</div></Layout>
  if (!delivery) return <Layout><div className="text-center py-20 text-gray-400">Delivery not found</div></Layout>

  return (
    <Layout>
      {/* Header — only status label, no buttons here */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/deliveries')} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Verification — {delivery.deliveryNo}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {delivery.purchaseOrder?.supplier?.supplierName} · {new Date(delivery.arrivalDate).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
        {/* Only show final status label if already completed/rejected */}
        {(delivery.status === 'COMPLETED' || delivery.status === 'REJECTED') && (
          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            delivery.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {delivery.status === 'COMPLETED' ? '✓ Delivery Approved' : '✗ Delivery Rejected'}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            No verification tasks found
          </div>
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Document Upload & AI Analysis</p>
              <div className="grid grid-cols-3 gap-3">
                {['COA', 'LABEL', 'DELIVERY_NOTE'].map(docType => {
                  const existing = task.documents?.find((d: any) => d.docType === docType)
                  const isUploading = uploading === task.id + docType
                  return (
                    <div key={docType} className={`border rounded-lg p-3 ${existing ? 'border-green-200 bg-green-50' : 'border-gray-200 border-dashed'}`}>
                      <p className="text-xs font-semibold text-gray-500 mb-2 tracking-wider">{docType.replace('_', ' ')}</p>
                      {existing ? (
                        <div>
                          <p className="text-xs text-green-700 font-medium">Verified</p>
                          <p className="text-xs text-gray-500">OCR: {Math.round((existing.confidence || 0) * 100)}%</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            existing.validationStatus === 'PASSED' ? 'bg-green-100 text-green-700' :
                            existing.validationStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                            existing.validationStatus === 'MANUAL_REVIEW' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>{existing.validationStatus}</span>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <span className="text-xs text-blue-600 hover:underline">
                            {isUploading ? 'Analyzing...' : '+ Upload & AI Analysis'}
                          </span>
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                            disabled={!!uploading}
                            onChange={e => {
                              const file = e.target.files?.[0]
                              if (file) handleUpload(task.id, file, docType)
                            }} />
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {task.documents?.length > 0 && (
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Verification Results</p>
                {task.documents.map((doc: any) => (
                  <div key={doc.id} className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className={`px-4 py-3 flex justify-between items-center ${
                      doc.validationStatus === 'PASSED' ? 'bg-green-50 border-b border-green-100' :
                      doc.validationStatus === 'FAILED' ? 'bg-red-50 border-b border-red-100' :
                      doc.validationStatus === 'MANUAL_REVIEW' ? 'bg-amber-50 border-b border-amber-100' :
                      'bg-gray-50 border-b border-gray-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-600 tracking-wider">{doc.docType.replace('_', ' ')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          doc.validationStatus === 'PASSED' ? 'bg-green-100 text-green-700' :
                          doc.validationStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                          doc.validationStatus === 'MANUAL_REVIEW' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {doc.validationStatus === 'PASSED' ? 'Passed' :
                           doc.validationStatus === 'FAILED' ? 'Failed' :
                           doc.validationStatus === 'MANUAL_REVIEW' ? 'Manual Review' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">OCR Confidence</p>
                          <p className="text-xs font-semibold text-gray-600">{Math.round((doc.confidence || 0) * 100)}%</p>
                        </div>
                        {doc.validationDetail?.overallScore !== undefined && (
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Validation Score</p>
                            <p className={`text-xs font-semibold ${
                              doc.validationDetail.overallScore >= 80 ? 'text-green-600' :
                              doc.validationDetail.overallScore >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}>{doc.validationDetail.overallScore}%</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {doc.validationDetail?.summary && (
                      <div className="px-4 py-3 bg-white border-b border-gray-50">
                        <p className="text-xs text-gray-500 font-medium mb-0.5">AI Summary</p>
                        <p className="text-sm text-gray-700">{doc.validationDetail.summary}</p>
                      </div>
                    )}

                    {doc.validationDetail?.results && (
                      <div className="px-4 py-3 bg-white">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Field Validation</p>
                        <div className="space-y-2">
                          {doc.validationDetail.results.map((r: any, idx: number) => (
                            <div key={idx} className={`grid grid-cols-12 gap-2 items-start p-2.5 rounded-lg ${r.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                              <div className="col-span-1 pt-0.5">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${r.passed ? 'bg-green-500' : 'bg-red-500'}`}>
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    {r.passed ? (
                                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    ) : (
                                      <path d="M3 3l4 4M7 3l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                                    )}
                                  </svg>
                                </div>
                              </div>
                              <div className="col-span-3">
                                <p className="text-xs font-semibold text-gray-700">{r.specField}</p>
                                {r.extractedField && r.extractedField !== r.specField && (
                                  <p className="text-xs text-gray-400 mt-0.5">from "{r.extractedField}"</p>
                                )}
                              </div>
                              <div className="col-span-3">
                                <p className="text-xs text-gray-400">Expected</p>
                                <p className="text-xs font-medium text-gray-600">{r.expectedValue}</p>
                              </div>
                              <div className="col-span-3">
                                <p className="text-xs text-gray-400">Extracted</p>
                                <p className={`text-xs font-medium ${r.passed ? 'text-green-700' : 'text-red-600'}`}>
                                  {r.extractedValue || 'Not found'}
                                </p>
                              </div>
                              <div className="col-span-2 text-right">
                                <p className="text-xs text-gray-400">Confidence</p>
                                <p className="text-xs font-medium text-gray-600">{Math.round((r.confidence || 0) * 100)}%</p>
                              </div>
                              {r.reasoning && (
                                <div className="col-span-12 mt-1">
                                  <p className="text-xs text-gray-400 italic">{r.reasoning}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {doc.extractedData && Object.keys(doc.extractedData).length > 0 && (
                      <details className="border-t border-gray-50">
                        <summary className="px-4 py-2.5 text-xs text-gray-400 cursor-pointer hover:bg-gray-50 select-none">
                          View raw extracted data ({Object.keys(doc.extractedData).length} fields)
                        </summary>
                        <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5 bg-gray-50">
                          {Object.entries(doc.extractedData).map(([k, v]) => (
                            <div key={k} className="flex gap-2 text-xs">
                              <span className="text-gray-400 flex-shrink-0">{k}:</span>
                              <span className="text-gray-600 font-medium">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}

            {task.nonConformances?.length > 0 && (
              <div className="border-t border-red-100 pt-4 mt-4">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Non-Conformances</p>
                {task.nonConformances.map((nc: any) => (
                  <div key={nc.id} className="bg-red-50 border border-red-100 rounded-lg p-3 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-red-700 font-medium">{nc.ncNumber}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        nc.severity === 'CRITICAL' ? 'bg-red-200 text-red-800' : 'bg-amber-100 text-amber-700'
                      }`}>{nc.severity}</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">{nc.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Approve/Reject buttons — bottom right, only shown after documents uploaded */}
      {isActionable && (
        <div className="fixed bottom-6 right-6 flex gap-3 z-50">
          <button
            onClick={() => handleComplete('reject')}
            disabled={completing}
            className="px-5 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 shadow-lg"
          >
            Reject Delivery
          </button>
          <button
            onClick={() => handleComplete('approve')}
            disabled={completing}
            className="px-5 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-lg"
          >
            {completing ? 'Processing...' : 'Approve & Complete'}
          </button>
        </div>
      )}
    </Layout>
  )
}