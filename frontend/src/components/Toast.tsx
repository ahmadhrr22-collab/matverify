import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

let addToastFn: ((toast: Omit<Toast, 'id'>) => void) | null = null

export const toast = {
  success: (title: string, message?: string) => addToastFn?.({ type: 'success', title, message }),
  error: (title: string, message?: string) => addToastFn?.({ type: 'error', title, message }),
  warning: (title: string, message?: string) => addToastFn?.({ type: 'warning', title, message }),
  info: (title: string, message?: string) => addToastFn?.({ type: 'info', title, message }),
}

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-500 stroke-[2.5]" />,
  error: <AlertCircle size={18} className="text-rose-500 stroke-[2.5]" />,
  warning: <AlertTriangle size={18} className="text-amber-500 stroke-[2.5]" />,
  info: <Info size={18} className="text-slate-600 stroke-[2.5]" />,
}

const accentColors = {
  success: '#10b981',
  error: '#f43f5e',
  warning: '#f59e0b',
  info: '#3b82f6',
}

const iconBgs = {
  success: 'bg-emerald-50 border-emerald-100/50',
  error: 'bg-rose-50 border-rose-100/50',
  warning: 'bg-amber-50 border-amber-100/50',
  info: 'bg-slate-100 border-slate-200/60/50',
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setLeaving(true)
      setTimeout(onRemove, 300)
    }, 5000) 
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setLeaving(true)
    setTimeout(onRemove, 300)
  }

  return (
    <div 
      className="flex items-start gap-3 bg-white/95 backdrop-blur-md border border-slate-100/80 rounded-2xl p-4 shadow-xl pointer-events-auto transition-all duration-300 min-w-[300px] max-w-[380px]"
      style={{
        borderLeft: `4px solid ${accentColors[toast.type]}`,
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
      }}
    >
      {/* Icon with soft background bubble */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${iconBgs[toast.type]}`}>
        {icons[toast.type]}
      </div>
      
      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-heading leading-tight">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 font-sans">
            {toast.message}
          </p>
        )}
      </div>
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1 rounded-lg transition-all cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    addToastFn = (t) => {
      const id = Math.random().toString(36).slice(2)
      setToasts(prev => [...prev, { ...t, id }])
    }
    return () => { addToastFn = null }
  }, [])

  return (
    <div className="fixed top-6 right-6 z-[100000] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <ToastItem
          key={t.id}
          toast={t}
          onRemove={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
        />
      ))}
    </div>
  )
}