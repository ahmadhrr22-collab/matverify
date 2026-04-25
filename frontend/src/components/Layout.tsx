import Sidebar from './Sidebar'
import PageTransition from './PageTransition'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
    </div>
  )
}