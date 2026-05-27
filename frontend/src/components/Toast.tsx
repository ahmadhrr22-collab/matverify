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
  success: <CheckCircle2 size={16} className="text-emerald-400 stroke-[2.5]" />,
  error: <AlertCircle size={16} className="text-rose-400 stroke-[2.5]" />,
  warning: <AlertTriangle size={16} className="text-amber-400 stroke-[2.5]" />,
  info: <Info size={16} className="text-slate-400 stroke-[2.5]" />,
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setLeaving(true)
      setTimeout(onRemove, 300)
    }, 4500) 
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setLeaving(true)
    setTimeout(onRemove, 300)
  }

  return (
    <div 
      className="flex items-center gap-3 bg-slate-950/95 backdrop-blur-md border border-slate-800/80 rounded-2xl px-4 py-3 shadow-2xl pointer-events-auto transition-all duration-300 min-w-[280px] max-w-[360px]"
      style={{
        transform: visible && !leaving ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>
      
      {/* Text Content */}
      <div className="flex-1 min-w-0 pr-1">
        <p className="text-xs font-bold text-slate-100 tracking-tight leading-tight">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5 font-sans">
            {toast.message}
          </p>
        )}
      </div>
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-slate-500 hover:text-slate-300 hover:bg-white/5 p-1 rounded-lg transition-all cursor-pointer"
      >
        <X size={13} />
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
    <div className="fixed bottom-6 right-6 z-[100000] flex flex-col-reverse gap-2.5 pointer-events-none">
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