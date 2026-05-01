import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import AppShell from './components/layout/AppShell'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import Faculties from './pages/admin/Faculties'
import Groups from './pages/admin/Groups'
import Students from './pages/admin/Students'
import Payments from './pages/admin/Payments'
import DirectorDashboard from './pages/director/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AppShell />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/faculties" element={<Faculties />} />
              <Route path="/admin/groups" element={<Groups />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/payments" element={<Payments />} />
            </Route>
          </Route>

          {/* Director routes */}
          <Route element={<ProtectedRoute allowedRoles={['director']} />}>
            <Route element={<AppShell />}>
              <Route path="/director" element={<DirectorDashboard />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
