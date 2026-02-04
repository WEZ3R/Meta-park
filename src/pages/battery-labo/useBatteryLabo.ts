import { useEffect, useState, useRef } from "react";

export type ColorPhase = "safe" | "caution" | "danger" | "critical";

export interface BatteryLaboState {
  clusters: number[];
  isCharging: boolean;
  currentCluster: number;
  isWarning: boolean;
  colorPhase: ColorPhase;
  cooldownStartTime: number | null;
  pressure: number;
  allDepleted: boolean;
  showUrgentPopup: boolean;
}

export function useBatteryLabo(isShutdown: boolean = false): BatteryLaboState {
  const [clusters, setClusters] = useState([100]);
  const [isCharging, setIsCharging] = useState(false);
  const [pressure, setPressure] = useState(0);
  const [colorPhase, setColorPhase] = useState<ColorPhase>("safe");
  const [isWarning, setIsWarning] = useState(false);
  const [cooldownStartTime, setCooldownStartTime] = useState<number | null>(null);
  const [showUrgentPopup, setShowUrgentPopup] = useState(false);

  // Refs pour la logique interne
  const stateRef = useRef({
    isCharging: false,
    pressure: 0,
    chargingStartTime: null as number | null,
    stopChargingAt: null as number | null,
    pressureAtStart: 0,
    pressureAtRelease: 0,
    cooldownStartTime: null as number | null,
    warningTimer: null as number | null,
    hasExceeded: false, // true si on a dépassé le seuil (trop tard)
  });

  // Gamepad polling
  useEffect(() => {
    let animationId: number;
    const DEADZONE = 0.15;

    const pollGamepads = () => {
      const gps = navigator.getGamepads();
      let leverPressed = false;

      for (const gp of gps) {
        if (gp) {
          const hasActiveAxis = gp.axes.some((value) => Math.abs(value) > DEADZONE);
          const hasActiveButton = gp.buttons.some((button) => button.pressed);

          if (hasActiveAxis || hasActiveButton) {
            leverPressed = true;
            break;
          }
        }
      }

      setIsCharging(leverPressed);
      animationId = requestAnimationFrame(pollGamepads);
    };
    pollGamepads();

    return () => cancelAnimationFrame(animationId);
  }, []);

  // Logique principale de pression - tout dans un seul effet
  useEffect(() => {
    const state = stateRef.current;
    const prevIsCharging = state.isCharging;
    state.isCharging = isCharging;

    // Transition: pas en charge -> en charge (début)
    // Bloqué si on a dépassé le seuil et que la pression n'est pas à 0
    if (isCharging && !prevIsCharging && !(state.hasExceeded && state.pressure > 0)) {
      state.pressureAtStart = state.pressure;
      state.chargingStartTime = Date.now();
      state.hasExceeded = false; // Reset le flag de dépassement
      const randomDelay = 3000 + Math.random() * 5000;
      state.stopChargingAt = state.chargingStartTime + randomDelay;

      console.log(`🎯 Pression départ: ${state.pressureAtStart.toFixed(1)}% - ${(randomDelay / 1000).toFixed(1)}s pour relâcher`);

      // Timer d'échec
      state.warningTimer = window.setTimeout(() => {
        console.log("💥 Trop tard ! Décharge totale !");
        setClusters([0]);
        state.hasExceeded = true; // Marquer le dépassement
        state.pressureAtRelease = 100;
        state.cooldownStartTime = Date.now();
        state.chargingStartTime = null;
        state.stopChargingAt = null;
        state.warningTimer = null;
        setIsWarning(false);
        setCooldownStartTime(state.cooldownStartTime);
      }, randomDelay);

      setIsWarning(true);
    } else if (isCharging && !prevIsCharging && state.hasExceeded) {
      console.log("⛔ Levier bloqué ! Attendez que la pression redescende à 0.");
    }

    // Transition: en charge -> pas en charge (relâchement)
    if (!isCharging && prevIsCharging) {
      if (state.warningTimer) {
        clearTimeout(state.warningTimer);
        state.warningTimer = null;
        setIsWarning(false);
      }

      state.pressureAtRelease = state.pressure;
      state.cooldownStartTime = Date.now();
      state.chargingStartTime = null;
      state.stopChargingAt = null;

      console.log(`✅ Relâché à ${state.pressureAtRelease.toFixed(1)}%`);
      setCooldownStartTime(state.cooldownStartTime);
    }

    // Boucle de mise à jour
    const interval = setInterval(() => {
      let newPressure = state.pressure;

      if (state.isCharging && state.chargingStartTime && state.stopChargingAt && !state.hasExceeded) {
        // En charge: augmenter la pression (seulement si pas en pénalité)
        const totalTime = state.stopChargingAt - state.chargingStartTime;
        const elapsed = Date.now() - state.chargingStartTime;
        const progress = Math.min(100, (elapsed / totalTime) * 100);
        newPressure = state.pressureAtStart + (100 - state.pressureAtStart) * (progress / 100);
      } else if (state.cooldownStartTime) {
        // Cooldown: diminuer la pression
        // Normal: 5s, après dépassement: 10s (2x plus lent)
        const cooldownDuration = state.hasExceeded ? 10000 : 5000;
        const elapsed = Date.now() - state.cooldownStartTime;
        const progress = Math.min(100, (elapsed / cooldownDuration) * 100);
        newPressure = state.pressureAtRelease * (1 - progress / 100);

        if (progress >= 100) {
          state.cooldownStartTime = null;
          state.hasExceeded = false; // Reset quand la pression atteint 0
          setCooldownStartTime(null);
          newPressure = 0;
          console.log("✅ Pression à 0 - Levier débloqué");
        }
      }

      newPressure = Math.max(0, Math.min(100, newPressure));

      if (Math.abs(newPressure - state.pressure) > 0.1) {
        state.pressure = newPressure;
        setPressure(newPressure);

        // Mettre à jour colorPhase
        let phase: ColorPhase = "safe";
        if (newPressure >= 85) phase = "critical";
        else if (newPressure >= 65) phase = "danger";
        else if (newPressure >= 40) phase = "caution";
        setColorPhase(phase);

        // Afficher popup d'urgence quand pression >= 70% (pas en pénalité)
        setShowUrgentPopup(newPressure >= 70 && state.isCharging && !state.hasExceeded);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isCharging]);

  // Cluster charge/discharge logic
  useEffect(() => {
    const CHARGE_SPEED = 100 / 8;
    const DISCHARGE_SPEED_NORMAL = 100 / 180; // 3 minutes
    const DISCHARGE_SPEED_SHUTDOWN = 100 / 1; // 1 seconde par batterie en shutdown
    const state = stateRef.current;

    const interval = setInterval(() => {
      setClusters((prev) => {
        const newClusters = [...prev];

        // En shutdown: décharge rapide (1s par batterie)
        if (isShutdown) {
          for (let i = newClusters.length - 1; i >= 0; i--) {
            if (newClusters[i] > 0) {
              newClusters[i] = Math.max(0, newClusters[i] - DISCHARGE_SPEED_SHUTDOWN / 60);
              break;
            }
          }
        }
        // Charge seulement si levier actif ET pas en pénalité ET pas en shutdown
        else if (isCharging && !state.hasExceeded) {
          const currentClusterIndex = newClusters.findIndex((c) => c < 100);
          if (currentClusterIndex !== -1) {
            newClusters[currentClusterIndex] = Math.min(
              100,
              newClusters[currentClusterIndex] + CHARGE_SPEED / 60
            );
          }
        } else {
          for (let i = newClusters.length - 1; i >= 0; i--) {
            if (newClusters[i] > 0) {
              newClusters[i] = Math.max(0, newClusters[i] - DISCHARGE_SPEED_NORMAL / 60);
              break;
            }
          }
        }

        return newClusters;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isCharging, isShutdown]);

  const currentCluster = clusters.findIndex((c) => c < 100);
  const allDepleted = clusters.every((c) => c <= 0);

  return {
    clusters,
    isCharging,
    currentCluster,
    isWarning,
    colorPhase,
    cooldownStartTime,
    pressure,
    allDepleted,
    showUrgentPopup,
  };
}
