import { useEffect, useRef } from "react";
import "./BatteryLabo.css";
import { useBatteryLabo } from "./useBatteryLabo";
import { Cluster } from "./Cluster";
import { useApp } from "../../shared/context/AppContext";

export function BatteryLabo() {
  const { setBlackScreen, status } = useApp();
  const blackScreenTriggered = useRef(false);
  const isShutdown = status?.isShutdown ?? false;

  const {
    clusters,
    isCharging,
    currentCluster,
    isWarning,
    colorPhase,
    cooldownStartTime,
    pressure,
    allDepleted,
    showUrgentPopup,
  } = useBatteryLabo(isShutdown);

  // Console log de l'état blackScreen
  useEffect(() => {
    console.log(`📺 BlackScreen état: ${status?.isBlackScreen}`);
  }, [status?.isBlackScreen]);

  // Déclencher blackScreen quand toutes les batteries sont vides
  useEffect(() => {
    if (allDepleted && !blackScreenTriggered.current) {
      blackScreenTriggered.current = true;
      console.log("🔴 Toutes les batteries sont vides ! BlackScreen activé.");
      console.log("📺 BlackScreen passe en TRUE");
      setBlackScreen(true);
    }
  }, [allDepleted, setBlackScreen]);

  // Déterminer le message de pression
  const getPressureMessage = () => {
    if (!isCharging && pressure === 0)
      return { text: "EN ATTENTE", class: "idle" };
    if (pressure < 40) return { text: "PRESSION STABLE", class: "safe" };
    if (pressure < 65) return { text: "PRESSION MODÉRÉE", class: "caution" };
    if (pressure < 85) return { text: "PRESSION ÉLEVÉE", class: "danger" };
    return { text: "PRESSION CRITIQUE", class: "critical" };
  };

  const pressureInfo = getPressureMessage();

  return (
    <div className="battery-labo">
      <h1 className="self-center">
        Niveau de charge de la batterie de secours
      </h1>

      <div className="energy-clusters">
        {clusters.map((charge, index) => (
          <Cluster
            key={index}
            charge={charge}
            index={index}
            isActive={
              currentCluster === index &&
              (isCharging || cooldownStartTime !== null)
            }
            colorPhase={colorPhase}
            isWarning={isWarning && currentCluster === index}
          />
        ))}
      </div>

      {/* Message d'état de pression */}
      <div className={`pressure-status ${pressureInfo.class}`}>
        <div className="pressure-label">ÉTAT DE LA DYNAMO</div>
        <div className="pressure-value">{pressureInfo.text}</div>
        <div className="pressure-percent">{Math.round(pressure)}%</div>
      </div>

      {/* Popup d'urgence */}
      {showUrgentPopup && (
        <div className="urgent-popup">
          <div className="urgent-popup-content">
            <div className="urgent-icon">⚠️</div>
            <div className="urgent-title">ALERTE SURCHAUFFE</div>
            <div className="urgent-message">
              RELÂCHEZ LE LEVIER IMMÉDIATEMENT
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
