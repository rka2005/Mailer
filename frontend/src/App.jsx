import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import DashboardLayout from './layouts/DashboardLayout'
import Attachments from './pages/Attachments'
import Dashboard from './pages/Dashboard'
import EmailTemplate from './pages/EmailTemplate'
import History from './pages/History'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Register from './pages/Register'
import Settings from './pages/Settings'
import UploadExcel from './pages/UploadExcel'
import LockedSection from './components/LockedSection/LockedSection'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="upload-excel" element={<UploadExcel />} />
              <Route path="email-template" element={<LockedSection title="Email Template" />} />
              <Route path="attachments" element={<LockedSection title="Attachments" />} />
              <Route path="history" element={<LockedSection title="History" />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App