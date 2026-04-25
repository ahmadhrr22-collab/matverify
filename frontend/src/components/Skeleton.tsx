export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div style={{
            height: 14,
            borderRadius: 6,
            background: 'linear-gradient(90deg, #f3f4f6 25%, #e9eaeb 50%, #f3f4f6 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.2s infinite',
            width: i === 0 ? '60%' : i === cols - 1 ? '40%' : '80%',
          }} />
        </td>
      ))}
      <style>{`@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }`}</style>
    </tr>
  )
}

export function SkeletonCard() {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #f0f0ef',
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, borderRadius: 6, background: '#f3f4f6', width: '50%', marginBottom: 8 }} />
        <div style={{ height: 22, borderRadius: 6, background: '#f3f4f6', width: '30%', marginBottom: 6 }} />
        <div style={{ height: 10, borderRadius: 6, background: '#f3f4f6', width: '40%' }} />
      </div>
      <style>{`@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }`}</style>
    </div>
  )
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          borderBottom: '1px solid #f7f7f6',
        }}>
          <div>
            <div style={{ height: 13, borderRadius: 6, background: 'linear-gradient(90deg, #f3f4f6 25%, #e9eaeb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s infinite', width: 140, marginBottom: 6 }} />
            <div style={{ height: 11, borderRadius: 6, background: 'linear-gradient(90deg, #f3f4f6 25%, #e9eaeb 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s infinite', width: 100 }} />
          </div>
          <div style={{ height: 20, borderRadius: 20, background: '#f3f4f6', width: 60 }} />
        </div>
      ))}
      <style>{`@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }`}</style>
    </>
  )
}