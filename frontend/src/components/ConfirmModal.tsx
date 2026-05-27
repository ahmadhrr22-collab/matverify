import { useEffect } from 'react'
import { LogOut, AlertTriangle, Info } from 'lucide-react'

interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  isOpen, title, message,
  confirmLabel = 'Ya, lanjutkan',
  cancelLabel = 'Batal',
  onConfirm, onCancel
}: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  // Semantic styling recognition
  const isLogout = title.toLowerCase().includes('keluar') || title.toLowerCase().includes('logout')
  const isDelete = title.toLowerCase().includes('hapus') || title.toLowerCase().includes('delete')

  let iconElement = <Info size={20} className="stroke-[2.5]" />
  let iconBg = 'bg-slate-100 border border-slate-200/50 text-slate-800 border border-slate-200/60/50'
  let confirmBtnClass = 'bg-gradient-to-tr from-slate-950 via-blue-950 to-indigo-950 hover:opacity-95 text-white border border-white/10 text-white shadow-sm shadow-slate-950/10'

  if (isLogout) {
    iconElement = <LogOut size={20} className="stroke-[2.5]" />
    iconBg = 'bg-slate-50 text-slate-600 border border-slate-200/60'
    confirmBtnClass = 'bg-slate-900 hover:bg-slate-800 border border-slate-950 text-white shadow-sm shadow-slate-900/10'
  } else if (isDelete) {
    iconElement = <AlertTriangle size={20} className="stroke-[2.5]" />
    iconBg = 'bg-rose-50/70 text-rose-600 border border-rose-100/50'
    confirmBtnClass = 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/10'
  }

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 w-full max-w-[360px] border border-slate-100/80 shadow-2xl animate-slideUp transition-all duration-300"
      >
        {/* Dynamic Styled Icon container */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
          {iconElement}
        </div>

        {/* Title */}
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-2 font-heading">
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-xs text-slate-500 leading-relaxed mb-6 font-sans">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            className="px-4.5 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer active:scale-[0.98] uppercase tracking-wider"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] uppercase tracking-wider ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes fadeIn { 
          from { opacity: 0 } 
          to { opacity: 1 } 
        }
        @keyframes slideUp { 
          from { transform: translateY(16px) scale(0.96); opacity: 0 } 
          to { transform: translateY(0) scale(1); opacity: 1 } 
        }
      `}</style>
    </div>
  )
}