import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './shared/context/AppContext'
import { AuthProvider } from './shared/context/AuthContext'
import { ViewerPage } from './features/viewer'
import { QuadPage } from './features/quad'
import { AdminPage } from './features/admin'
import './App.css'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/viewer" element={<ViewerPage />} />
      <Route path="/quad" element={<QuadPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/" element={<Navigate to="/viewer" />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
