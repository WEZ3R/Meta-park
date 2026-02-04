import { useApp } from "../context/AppContext";
import { useLocation } from "react-router-dom";
import "./BlackScreen.css";

export function BlackScreen() {
  const { status } = useApp();
  const location = useLocation();

  const isBatteryPage = location.pathname === "/battery-labo";
  const rawOpacity = status?.blackScreenOpacity ?? 0;

  // Sur la page batterie, l'opacité max est 80%
  const maxOpacity = isBatteryPage ? 80 : 100;
  const opacity = Math.min(rawOpacity, maxOpacity);

  if (opacity <= 0) return null;

  return (
    <div
      className="black-screen-overlay"
      style={{ opacity: opacity / 100 }}
    />
  );
}
