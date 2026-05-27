import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [visible, setVisible] = useState(false)
  const [key, setKey] = useState(location.pathname)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => {
      setKey(location.pathname)
      setVisible(true)
    }, 80)
    return () => clearTimeout(t)
  }, [location.pathname])

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div
      key={key}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      {children}
    </div>
  )
}