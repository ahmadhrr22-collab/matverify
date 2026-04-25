import { useEffect, useState } from 'react'

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
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#16a34a"/>
      <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#dc2626"/>
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L14.5 13H1.5L8 1.5z" fill="#d97706"/>
      <path d="M8 6v3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.75" fill="white"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="#2563eb"/>
      <path d="M8 7v4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="5" r="0.75" fill="white"/>
    </svg>
  ),
}

const colors = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', title: '#15803d', msg: '#166534' },
  error:   { bg: '#fef2f2', border: '#fecaca', title: '#b91c1c', msg: '#991b1b' },
  warning: { bg: '#fffbeb', border: '#fde68a', title: '#b45309', msg: '#92400e' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', title: '#1d4ed8', msg: '#1e40af' },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const c = colors[toast.type]

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setLeaving(true)
      setTimeout(onRemove, 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setLeaving(true)
    setTimeout(onRemove, 300)
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '12px',
      padding: '12px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
      minWidth: '280px',
      maxWidth: '360px',
      transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.97)',
      opacity: visible && !leaving ? 1 : 0,
      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'default',
    }}>
      <div style={{ flexShrink: 0, marginTop: '1px' }}>{icons[toast.type]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: c.title, fontFamily: 'Arial' }}>
          {toast.title}
        </p>
        {toast.message && (
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: c.msg, fontFamily: 'Arial', lineHeight: 1.4 }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={handleClose}
        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: c.title, opacity: 0.5, lineHeight: 1, fontSize: '14px', marginTop: '1px' }}
      >
        ✕
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
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <ToastItem
            toast={t}
            onRemove={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
          />
        </div>
      ))}
    </div>
  )
}