import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./shared/context/AppContext";
import { AuthProvider } from "./shared/context/AuthContext";
import { AdminPage } from "./pages/admin";
import { TestNeutralisantPage } from "./pages/testNeutralisant";
import { AdnTrexPage } from "./pages/adnTrex";
import { CameraPublique1Page } from "./pages/cameraPublique1";
import { CameraPublique2Page } from "./pages/cameraPublique2";
import { VitalsPage } from "./pages/vitals";
import { RetranscriptionDirectPage } from "./pages/retranscriptionDirect";
import { DinoChaseGame } from "./pages/dinoChase";
import "./App.css";
import { BatteryLabo } from "./pages/battery-labo";

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
      <Route path="/" element={<Navigate to="/admin" />} />
      <Route path="/battery-labo" element={<BatteryLabo />} />
    </Routes>
  );
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
  );
}

export default App;
