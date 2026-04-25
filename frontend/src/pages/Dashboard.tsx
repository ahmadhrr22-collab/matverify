import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

export default function Dashboard() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [ncs, setNcs] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/deliveries'),
      api.get('/non-conformances'),
      api.get('/suppliers'),
      api.get('/materials'),
    ]).then(([d, n, s, m]) => {
      setDeliveries(d.data)
      setNcs(n.data)
      setSuppliers(s.data)
      setMaterials(m.data)
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    {
      label: 'Total Deliveries',
      value: deliveries.length,
      sub: `${deliveries.filter(d => d.status === 'PENDING').length} pending`,
      color: '#1a56db',
      bg: '#eff4ff',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2 5h12v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
          <path d="M2 5l2.5-3.5h7L14 5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
          <path d="M14 8.5h3.5l2 3.5v3H14V8.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
          <circle cx="5" cy="17" r="1.2" fill="currentColor"/>
          <circle cx="16" cy="17" r="1.2" fill="currentColor"/>
        </svg>
      )
    },
    {
      label: 'Completed',
      value: deliveries.filter(d => d.status === 'COMPLETED').length,
      sub: 'verified & approved',
      color: '#059669',
      bg: '#ecfdf5',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3" fill="none"/>
          <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      label: 'Open NC',
      value: ncs.filter(n => n.status === 'OPEN').length,
      sub: `${ncs.filter(n => n.severity === 'CRITICAL').length} critical`,
      color: '#dc2626',
      bg: '#fef2f2',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L18 17H2L10 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
          <path d="M10 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="10" cy="14.5" r="0.8" fill="currentColor"/>
        </svg>
      )
    },
    {
      label: 'Active Suppliers',
      value: suppliers.filter(s => s.status === 'ACTIVE').length,
      sub: `${materials.length} materials`,
      color: '#7c3aed',
      bg: '#f5f3ff',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 17V8l7-5 7 5v9" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
          <rect x="7" y="11" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
          <rect x="11" y="11" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3" fill="none"/>
        </svg>
      )
    },
  ]

  const pending = deliveries.filter(d => d.status === 'PENDING' || d.status === 'IN_PROGRESS')
  const recentNC = ncs.filter(n => n.status === 'OPEN').slice(0, 5)

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string, color: string, label: string }> = {
      PENDING:     { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
      IN_PROGRESS: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
      COMPLETED:   { bg: '#dcfce7', color: '#166534', label: 'Completed' },
      REJECTED:    { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
    }
    const s = map[status] || { bg: '#f3f4f6', color: '#374151', label: status }
    return (
      <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>
        {s.label}
      </span>
    )
  }

  const severityBadge = (severity: string) => {
    const map: Record<string, { bg: string, color: string }> = {
      CRITICAL: { bg: '#fee2e2', color: '#991b1b' },
      MAJOR:    { bg: '#ffedd5', color: '#9a3412' },
      MINOR:    { bg: '#fef9c3', color: '#854d0e' },
    }
    const s = map[severity] || { bg: '#f3f4f6', color: '#374151' }
    return (
      <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20 }}>
        {severity}
      </span>
    )
  }

  return (
    <Layout>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600, color: '#111', letterSpacing: '-0.3px' }}>
            Dashboard
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
            Selamat datang, <strong style={{ color: '#374151' }}>{user?.name}</strong> — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'white',
              border: '1px solid #f0f0ef',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 12, color: '#888' }}>{s.label}</p>
                <p style={{ margin: '0 0 2px', fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                  {loading ? '—' : s.value}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

          {/* Pending deliveries */}
          <div style={{ background: 'white', border: '1px solid #f0f0ef', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f7f7f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111' }}>Perlu Verifikasi</p>
              <button onClick={() => navigate('/deliveries')} style={{ fontSize: 11, color: '#1a56db', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Lihat semua →
              </button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {loading ? (
                <p style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: '#ccc' }}>Memuat...</p>
              ) : pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 20px' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>✓</div>
                  <p style={{ margin: 0, fontSize: 13, color: '#aaa' }}>Semua delivery sudah diverifikasi</p>
                </div>
              ) : pending.slice(0, 5).map(d => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/deliveries/${d.id}`)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: '#111' }}>{d.deliveryNo}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#888' }}>{d.purchaseOrder?.supplier?.supplierName} · {new Date(d.arrivalDate).toLocaleDateString('id-ID')}</p>
                  </div>
                  {statusBadge(d.status)}
                </div>
              ))}
            </div>
          </div>

          {/* Open NC */}
          <div style={{ background: 'white', border: '1px solid #f0f0ef', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f7f7f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111' }}>Non-Conformances Terbuka</p>
              <button onClick={() => navigate('/non-conformances')} style={{ fontSize: 11, color: '#1a56db', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Lihat semua →
              </button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {loading ? (
                <p style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: '#ccc' }}>Memuat...</p>
              ) : recentNC.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 20px' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>✓</div>
                  <p style={{ margin: 0, fontSize: 13, color: '#aaa' }}>Tidak ada NC yang terbuka</p>
                </div>
              ) : recentNC.map(nc => (
                <div
                  key={nc.id}
                  onClick={() => navigate('/non-conformances')}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontSize: 12, fontFamily: 'monospace', color: '#374151', fontWeight: 500 }}>{nc.ncNumber}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                      {nc.task?.deliveryItem?.material?.name || 'Unknown material'}
                    </p>
                  </div>
                  {severityBadge(nc.severity)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom banner — only if pending > 0 */}
        {!loading && pending.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #1a56db, #2563eb)',
            borderRadius: 14,
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: 'white' }}>
                {pending.length} delivery menunggu verifikasi
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Segera verifikasi untuk mencegah keterlambatan produksi
              </p>
            </div>
            <button
              onClick={() => navigate('/deliveries')}
              style={{ background: 'white', color: '#1a56db', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Verifikasi Sekarang
            </button>
          </div>
        )}

      </div>
    </Layout>
  )
}