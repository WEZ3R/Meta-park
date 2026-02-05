import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './shared/context/AppContext'
import { AuthProvider } from './shared/context/AuthContext'
import { BlackScreen } from './shared/components'
import { AdminPage } from './pages/admin'
import { TestNeutralisantPage } from './pages/testNeutralisant'
import { AdnTrexPage } from './pages/adnTrex'
import { CameraPublique1Page } from './pages/cameraPublique1'
import { CameraPublique2Page } from './pages/cameraPublique2'
import { VitalsPage } from './pages/vitals'
import { RetranscriptionDirectPage } from './pages/retranscriptionDirect'
import { DinoChaseGame } from './pages/dinoChase'
import { QuestionnairePage } from './pages/questionnaire'
import { PWALauncherPage } from './pages/pwaLauncher'
import { LogsPage } from './pages/logs'
import { BatteryLabo } from "./pages/battery-labo";
import { ScoringPage } from "./pages/scoring";
import './App.css'


function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/test-neutralisant" element={<TestNeutralisantPage />} />
      <Route path="/adn-trex" element={<AdnTrexPage />} />
      <Route path="/camera-publique-1" element={<CameraPublique1Page />} />
      <Route path="/camera-publique-2" element={<CameraPublique2Page />} />
      <Route path="/vitals" element={<VitalsPage />} />
      <Route
        path="/retranscription-direct"
        element={<RetranscriptionDirectPage />}
      />
      <Route path="/dino-chase" element={<DinoChaseGame />} />
      <Route path="/questionnaire" element={<QuestionnairePage />} />
      <Route path="/logs" element={<LogsPage />} />
      <Route path="/" element={<PWALauncherPage />} />
      <Route path="/battery-labo" element={<BatteryLabo />} />
      <Route path="/scoring" element={<ScoringPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
          <BlackScreen />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
