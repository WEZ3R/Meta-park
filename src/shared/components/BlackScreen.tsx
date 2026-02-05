import { useApp } from "../context/AppContext";
import { useLocation } from "react-router-dom";
import "./BlackScreen.css";

export function BlackScreen() {
  const { status } = useApp();
  const location = useLocation();

  const pathname = location.pathname;
  const isBatteryPage = pathname === "/battery-labo";
  const isExcluded = pathname === "/dino-chase" || pathname === "/questionnaire" || pathname === "/scoring";

  if (isExcluded) return null;

  const rawOpacity = status?.blackScreenOpacity ?? 0;

  // Sur la page batterie, l'opacité max est 80%
  const maxOpacity = isBatteryPage ? 80 : 100;
  const opacity = Math.min(rawOpacity, maxOpacity);

  if (opacity <= 0) return null;

  return (
    <div
      className="black-screen-overlay"
      style={{ opacity: opacity / 100 }}
    >
      {!isBatteryPage && (
        <div className="black-screen-popup">
          <div className="black-screen-icon">⚠</div>
          <div className="black-screen-text">
            Veuillez utiliser le levier pour relancer le générateur
          </div>
        </div>
      )}
    </div>
  );
}
