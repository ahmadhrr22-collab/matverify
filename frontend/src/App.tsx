import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import ToastProvider from './components/Toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Suppliers from './pages/Suppliers'
import Materials from './pages/Materials'
import Deliveries from './pages/Deliveries'
import NonConformances from './pages/NonConformances'
import VerificationDetail from './pages/VerificationDetail'
import FieldMappings from './pages/FieldMappings'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  return token ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/suppliers" element={<PrivateRoute><Suppliers /></PrivateRoute>} />
        <Route path="/materials" element={<PrivateRoute><Materials /></PrivateRoute>} />
        <Route path="/deliveries" element={<PrivateRoute><Deliveries /></PrivateRoute>} />
        <Route path="/deliveries/:id" element={<PrivateRoute><VerificationDetail /></PrivateRoute>} />
        <Route path="/non-conformances" element={<PrivateRoute><NonConformances /></PrivateRoute>} />
        <Route path="/field-mappings" element={<PrivateRoute><FieldMappings /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}