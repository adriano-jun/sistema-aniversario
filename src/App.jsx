import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/shared/PrivateRoute'
import LoginPage from './components/auth/LoginPage'
import Dashboard from './components/dashboard/Dashboard'
import EventForm from './components/events/EventForm'
import InvitePage from './components/invite/InvitePage'
import RSVPDashboard from './components/rsvp/RSVPDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Área pública */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/convite/:slug" element={<InvitePage />} />

          {/* Área privada (requer login) */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/eventos/novo" element={<EventForm />} />
            <Route path="/eventos/:id/editar" element={<EventForm />} />
            <Route path="/eventos/:id/rsvp" element={<RSVPDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
