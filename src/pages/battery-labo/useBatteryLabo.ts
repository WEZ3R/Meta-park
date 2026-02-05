import { useEffect, useState, useRef } from "react";
import { api } from "../../shared/api/client";

export type ColorPhase = "safe" | "caution" | "danger" | "critical";

export interface BatteryLaboState {
  clusters: number[];
  isCharging: boolean;
  currentCluster: number;
  colorPhase: ColorPhase;
  cooldownStartTime: number | null;
  pressure: number;
  allDepleted: boolean;
}

export function useBatteryLabo(isShutdown: boolean = false): BatteryLaboState {
  const [clusters, setClusters] = useState([0]);
  const [isCharging, setIsCharging] = useState(false);
  const [pressure, setPressure] = useState(0);
  const [colorPhase, setColorPhase] = useState<ColorPhase>("safe");
  const [cooldownStartTime, setCooldownStartTime] = useState<number | null>(
    null,
  );

  // Refs pour la logique interne
  const stateRef = useRef({
    isCharging: false,
    pressure: 0,
    chargingStartTime: null as number | null,
    stopChargingAt: null as number | null,
    pressureAtStart: 0,
    pressureAtRelease: 0,
    cooldownStartTime: null as number | null,
  });

  const prevBatteryRef = useRef(100);
  const hasDroppedBelow20Ref = useRef(false);
  const spaceKeyPressedRef = useRef(false);

  // Gestion de la touche espace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !spaceKeyPressedRef.current) {
        spaceKeyPressedRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceKeyPressedRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Gamepad polling
  useEffect(() => {
    let animationId: number;
    const DEADZONE = 0.15;

    const pollGamepads = () => {
      const gps = navigator.getGamepads();
      let leverPressed = false;

      for (const gp of gps) {
        if (gp) {
          const hasActiveAxis = gp.axes.some(
            (value) => Math.abs(value) > DEADZONE,
          );
          const hasActiveButton = gp.buttons.some((button) => button.pressed);

          if (hasActiveAxis || hasActiveButton) {
            leverPressed = true;
            break;
          }
        }
      }

      // Combiner gamepad et touche espace
      setIsCharging(leverPressed || spaceKeyPressedRef.current);
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
    if (isCharging && !prevIsCharging) {
      state.pressureAtStart = state.pressure;
      state.chargingStartTime = Date.now();

      // Délai fixe de 8 secondes (de 0 à 100%)
      const baseDelay = 8000;
      const remainingPercent = (100 - state.pressureAtStart) / 100;
      const scaledDelay = baseDelay * remainingPercent;
      state.stopChargingAt = state.chargingStartTime + scaledDelay;
    }

    // Transition: en charge -> pas en charge (relâchement)
    if (!isCharging && prevIsCharging) {
      state.pressureAtRelease = state.pressure;
      state.cooldownStartTime = Date.now();
      state.chargingStartTime = null;
      state.stopChargingAt = null;
      setCooldownStartTime(state.cooldownStartTime);
    }

    // Boucle de mise à jour
    const interval = setInterval(() => {
      let newPressure = state.pressure;

      if (state.isCharging && state.chargingStartTime && state.stopChargingAt) {
        // En charge: augmenter la pression
        const totalTime = state.stopChargingAt - state.chargingStartTime;
        const elapsed = Date.now() - state.chargingStartTime;
        const progress = Math.min(100, (elapsed / totalTime) * 100);
        newPressure =
          state.pressureAtStart +
          (100 - state.pressureAtStart) * (progress / 100);
      } else if (state.cooldownStartTime) {
        // Cooldown: diminuer la pression (5s)
        const cooldownDuration = 5000;
        const elapsed = Date.now() - state.cooldownStartTime;
        const progress = Math.min(100, (elapsed / cooldownDuration) * 100);
        newPressure = state.pressureAtRelease * (1 - progress / 100);

        if (progress >= 100) {
          state.cooldownStartTime = null;
          setCooldownStartTime(null);
          newPressure = 0;
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
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isCharging]);

  // Cluster charge/discharge logic
  useEffect(() => {
    const CHARGE_SPEED = 100 / 16; // 16s pour charger complètement
    const DISCHARGE_SPEED_NORMAL = 100 / 180; // 3 minutes
    const DISCHARGE_SPEED_SHUTDOWN = 100 / 1; // 1 seconde par batterie en shutdown

    const interval = setInterval(() => {
      setClusters((prev) => {
        const newClusters = [...prev];

        // En shutdown: décharge rapide (1s par batterie)
        if (isShutdown) {
          for (let i = newClusters.length - 1; i >= 0; i--) {
            if (newClusters[i] > 0) {
              newClusters[i] = Math.max(
                0,
                newClusters[i] - DISCHARGE_SPEED_SHUTDOWN / 60,
              );
              break;
            }
          }
        }
        // Charge si levier actif
        else if (isCharging) {
          const currentClusterIndex = newClusters.findIndex((c) => c < 100);
          if (currentClusterIndex !== -1) {
            newClusters[currentClusterIndex] = Math.min(
              100,
              newClusters[currentClusterIndex] + CHARGE_SPEED / 60,
            );
          }
        } else {
          for (let i = newClusters.length - 1; i >= 0; i--) {
            if (newClusters[i] > 0) {
              newClusters[i] = Math.max(
                0,
                newClusters[i] - DISCHARGE_SPEED_NORMAL / 60,
              );
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

  // Gestion de l'opacité du blackScreen basée sur le niveau de batterie
  useEffect(() => {
    const currentCharge = clusters[0] ?? 100;
    const prevCharge = prevBatteryRef.current;
    const isDescending = currentCharge < prevCharge;

    // Détection du passage sous 20% en phase descendante
    if (isDescending && prevCharge >= 20 && currentCharge < 20) {
      hasDroppedBelow20Ref.current = true;
    }

    // Reset quand on remonte au-dessus de 20%
    if (currentCharge >= 20) {
      hasDroppedBelow20Ref.current = false;
    }

    // Calcul de l'opacité
    let opacity = 0;
    if (currentCharge < 20 && hasDroppedBelow20Ref.current) {
      opacity = 50 + ((20 - currentCharge) / 20) * 50;
    }

    opacity = Math.round(Math.max(0, Math.min(100, opacity)));

    // Envoyer au serveur
    api.setBlackScreenOpacity(opacity).catch((err) => {
      console.error("Erreur lors de la mise à jour de l'opacité:", err);
    });

    prevBatteryRef.current = currentCharge;
  }, [clusters]);

  return {
    clusters,
    isCharging,
    currentCluster,
    colorPhase,
    cooldownStartTime,
    pressure,
    allDepleted,
  };
}
