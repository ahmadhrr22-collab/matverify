import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { toast } from '../components/Toast' 
import { 
  Check, 
  X, 
  FileText, 
  Sparkles
} from 'lucide-react'

const statusColor: Record<string, string> = {
  PENDING: 'bg-amber-50 border border-amber-200/60 text-amber-800',
  IN_REVIEW: 'bg-slate-100 border border-slate-200 text-slate-800',
  APPROVED: 'bg-emerald-50 border border-emerald-200/60 text-emerald-800',
  REJECTED: 'bg-rose-50 border border-rose-200/60 text-rose-800',
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
        
        const statusLabel = status === 'PASSED' ? 'success' : status === 'FAILED' ? 'error' : 'warning'
        toast[statusLabel as 'success' | 'error' | 'warning'](
          `AI Analysis — ${status}`,
          `Score: ${score}% · ${summary}`
        )
      }
      fetchData()
    } catch (e: any) {
      toast.error('Upload gagal', e.response?.data?.message || e.message)
    } finally {
      setUploading(null)
    }
  }

  const handleComplete = async (action: 'approve' | 'reject') => {
    setCompleting(true)
    try {
      await api.patch(`/deliveries/${id}/complete`, { action })
      
      toast.success(
        action === 'approve' ? 'Delivery Approved' : 'Delivery Rejected',
        action === 'approve' ? 'Semua task telah di-approve' : 'Delivery telah ditolak'
      )
      
      fetchData()
    } catch (e: any) {
      toast.error('Gagal memproses delivery', e.response?.data?.message || e.message)
    } finally {
      setCompleting(false)
    }
  }

  const hasDocuments = tasks.some((t: any) => t.documents?.length > 0)
  const isActionable = (delivery?.status === 'PENDING' || delivery?.status === 'IN_PROGRESS') && hasDocuments

  if (loading) return <Layout><div className="text-center py-20 text-slate-400 font-medium animate-pulse">Loading data...</div></Layout>
  if (!delivery) return <Layout><div className="text-center py-20 text-slate-400 font-medium">Delivery not found</div></Layout>

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button 
            onClick={() => navigate('/deliveries')} 
            className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98] transition-all shadow-sm cursor-pointer uppercase tracking-wider w-fit"
          >
            Kembali
          </button>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-heading">
              Verification — {delivery.deliveryNo}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              <strong className="text-slate-700 font-semibold">{delivery.purchaseOrder?.supplier?.supplierName}</strong> · {new Date(delivery.arrivalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        {(delivery.status === 'COMPLETED' || delivery.status === 'REJECTED') && (
          <div className="self-start md:self-center">
            <span className={`px-4 py-2.5 border rounded-xl text-xs font-extrabold uppercase tracking-widest shadow-sm ${
              delivery.status === 'COMPLETED' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {delivery.status === 'COMPLETED' ? 'Approved' : 'Rejected'}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm font-medium">
            No verification tasks found
          </div>
        ) : tasks.map(task => (
          <div key={task.id} className="bg-white rounded-2xl border border-slate-100/80 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <p className="font-bold text-slate-800 text-base font-heading">{task.deliveryItem?.material?.name}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Batch: <strong className="text-slate-600 font-mono">{task.deliveryItem?.batchNo}</strong> · 
                  Qty: <strong className="text-slate-600">{task.deliveryItem?.qtyReceived} {task.deliveryItem?.material?.unit}</strong> · 
                  Expiry: <strong className="text-slate-600">{new Date(task.deliveryItem?.expiryDate).toLocaleDateString('id-ID')}</strong>
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider self-start ${statusColor[task.status] || 'bg-slate-100 text-slate-500'}`}>
                {task.status}
              </span>
            </div>

            <div className="border-t border-slate-50 pt-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                <FileText size={12} /> Document Upload & AI Analysis
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['COA', 'LABEL', 'DELIVERY_NOTE'].map(docType => {
                  const existing = task.documents?.find((d: any) => d.docType === docType)
                  const isUploading = uploading === task.id + docType
                  return (
                    <div key={docType} className={`border rounded-xl p-4 flex flex-col justify-between min-h-[110px] transition-all duration-200 ${
                      existing 
                        ? 'border-emerald-100 bg-emerald-50/20 shadow-sm' 
                        : 'border-slate-200 border-dashed hover:border-slate-300 hover:bg-slate-50/30'
                    }`}>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{docType.replace('_', ' ')}</p>
                        {existing ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <p className="text-xs text-emerald-800 font-bold">Verified</p>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">Confidence: {Math.round((existing.confidence || 0) * 100)}%</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 mb-2 leading-relaxed">Dokumen belum diunggah.</p>
                        )}
                      </div>
                      
                      {existing ? (
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md w-fit mt-2 ${
                          existing.validationStatus === 'PASSED' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' :
                          existing.validationStatus === 'FAILED' ? 'bg-rose-50 border border-rose-100 text-rose-800' :
                          existing.validationStatus === 'MANUAL_REVIEW' ? 'bg-amber-50 border border-amber-100 text-amber-800' :
                          'bg-slate-50 border border-slate-200 text-slate-600'
                        }`}>{existing.validationStatus}</span>
                      ) : (
                        <label className="cursor-pointer mt-3 w-fit">
                          <span className="text-xs font-semibold text-slate-800 hover:text-slate-900 hover:underline">
                            {isUploading ? 'Analyzing Document...' : '+ Upload & AI Analysis'}
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
              <div className="border-t border-slate-50 pt-5 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-slate-600" /> AI Verification Results
                </p>
                {task.documents.map((doc: any) => (
                  <div key={doc.id} className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm bg-white">
                    <div className={`px-5 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b ${
                      doc.validationStatus === 'PASSED' ? 'bg-emerald-50/10 border-emerald-100/50' :
                      doc.validationStatus === 'FAILED' ? 'bg-rose-50/10 border-rose-100/50' :
                      doc.validationStatus === 'MANUAL_REVIEW' ? 'bg-amber-50/10 border-amber-100/50' :
                      'bg-slate-50/30 border-slate-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-600 tracking-wider uppercase font-heading">{doc.docType.replace('_', ' ')}</span>
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          doc.validationStatus === 'PASSED' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                          doc.validationStatus === 'FAILED' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                          doc.validationStatus === 'MANUAL_REVIEW' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                          'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          {doc.validationStatus === 'PASSED' ? 'Passed' :
                           doc.validationStatus === 'FAILED' ? 'Failed' :
                           doc.validationStatus === 'MANUAL_REVIEW' ? 'Manual Review' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OCR Confidence</p>
                          <p className="text-xs font-extrabold text-slate-700 mt-0.5">{Math.round((doc.confidence || 0) * 100)}%</p>
                        </div>
                        {doc.validationDetail?.overallScore !== undefined && (
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Match Score</p>
                            <p className={`text-xs font-extrabold mt-0.5 ${
                              doc.validationDetail.overallScore >= 80 ? 'text-emerald-700' :
                              doc.validationDetail.overallScore >= 50 ? 'text-amber-700' : 'text-rose-700'
                            }`}>{doc.validationDetail.overallScore}%</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {doc.validationDetail?.summary && (
                      <div className="px-5 py-4 bg-white border-b border-slate-50 flex items-start gap-2">
                        <InfoIcon className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ringkasan Analisis AI</p>
                          <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-0.5">{doc.validationDetail.summary}</p>
                        </div>
                      </div>
                    )}

                    {doc.validationDetail?.results && (
                      <div className="px-5 py-4 bg-white divide-y divide-slate-100/50">
                        <div className="pb-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Field Verification Details</p>
                        </div>
                        <div className="pt-2 space-y-1.5">
                          {doc.validationDetail.results.map((r: any, idx: number) => (
                            <div key={idx} className="hover:bg-slate-50/30 p-2.5 rounded-xl transition-all duration-150">
                              <div className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-3">
                                {/* Col 1: Status hollow check & Spec Field */}
                                <div className="md:col-span-4 flex items-center gap-2.5">
                                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                                    r.passed 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100/80' 
                                      : 'bg-rose-50 text-rose-600 border-rose-100/80'
                                  }`}>
                                    {r.passed ? <Check size={11} className="stroke-[2.5]" /> : <X size={11} className="stroke-[2.5]" />}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-800 leading-tight">{r.specField}</p>
                                    {r.extractedField && r.extractedField !== r.specField && (
                                      <p className="text-[9px] text-slate-400 font-semibold font-mono uppercase mt-0.5">mapped from "{r.extractedField}"</p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Col 2: Expected Spec */}
                                <div className="md:col-span-3">
                                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block md:hidden mb-0.5">Expected Spec</span>
                                  <span className="inline-flex font-mono text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/50 px-2.5 py-1 rounded-lg">
                                    {r.expectedValue || '-'}
                                  </span>
                                </div>

                                {/* Col 3: Extracted Value */}
                                <div className="md:col-span-3">
                                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block md:hidden mb-0.5">Extracted Value</span>
                                  <span className={`inline-flex font-mono text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${
                                    r.passed 
                                      ? 'bg-emerald-50/40 border-emerald-100/50 text-emerald-700' 
                                      : 'bg-rose-50/40 border-rose-100/50 text-rose-700'
                                  }`}>
                                    {r.extractedValue || 'Not found'}
                                  </span>
                                </div>

                                {/* Col 4: Match Confidence */}
                                <div className="md:col-span-2 md:text-right">
                                  <span className="text-[8px] text-slate-450 font-bold uppercase tracking-wider block md:hidden">Match Confidence</span>
                                  <span className="text-xs font-mono font-extrabold text-slate-550">{Math.round((r.confidence || 0) * 100)}%</span>
                                </div>
                              </div>

                              {/* Reasoning in compact layout */}
                              {r.reasoning && (
                                <div className="mt-2 ml-7 pl-2.5 border-l border-slate-200 text-[10px] text-slate-500 font-medium leading-relaxed">
                                  {r.reasoning}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {doc.extractedData && Object.keys(doc.extractedData).length > 0 && (
                      <details className="border-t border-slate-100 bg-slate-50/30">
                        <summary className="px-5 py-3 text-xs font-bold text-slate-400 cursor-pointer hover:bg-slate-50/50 select-none transition-colors">
                          View raw extracted data ({Object.keys(doc.extractedData).length} fields)
                        </summary>
                        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border-t border-slate-100 bg-slate-50/50">
                          {Object.entries(doc.extractedData).map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center text-xs py-1 border-b border-slate-200/40">
                              <span className="text-slate-400 font-medium font-mono">{k}</span>
                              <span className="text-slate-700 font-bold tracking-tight text-right">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action buttons at bottom: user specific matte gray/light-green layout */}
      {isActionable && (
        <div className="fixed bottom-6 right-6 flex gap-3.5 z-50 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-100/80 shadow-2xl animate-slideUp">
          <button
            onClick={() => handleComplete('reject')}
            disabled={completing}
            className="px-5 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200/85 text-slate-700 border border-slate-200 rounded-xl active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer uppercase tracking-wider"
          >
            Reject Delivery
          </button>
          <button
            onClick={() => handleComplete('approve')}
            disabled={completing}
            className="px-5 py-2.5 text-xs font-bold bg-emerald-100 hover:bg-emerald-250/90 text-emerald-800 border border-emerald-200 rounded-xl active:scale-[0.98] disabled:opacity-50 shadow-sm transition-all cursor-pointer uppercase tracking-wider"
          >
            {completing ? 'Processing...' : 'Approve & Complete'}
          </button>
        </div>
      )}
    </Layout>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}