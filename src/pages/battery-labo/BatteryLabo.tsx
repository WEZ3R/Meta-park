import { useEffect, useRef, useCallback, useState } from "react";
import "./BatteryLabo.css";
import { useBatteryLabo } from "./useBatteryLabo";
import { Cluster } from "./Cluster";
import { useApp } from "../../shared/context/AppContext";

const QUICK_FADE_DURATION = 300; // 300ms pour fondue rapide
const WORKING_VOLUME = 0.5; // Volume de working-generator (start est 2x plus fort à 1.0)
const START_PLAYBACK_RATE = 1.75; // start joue 0.75x plus vite
const WORKING_START_DELAY = 3000; // 3 secondes de délai avant working-generator
const POPUP_HIDE_DELAY = 2000; // 2 secondes après relâchement du levier

export function BatteryLabo() {
  const { status } = useApp();
  const isShutdown = status?.isShutdown ?? false;

  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const workingAudioRef = useRef<HTMLAudioElement | null>(null);
  const stoppingAudioRef = useRef<HTMLAudioElement | null>(null);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const workingFadeIntervalRef = useRef<number | null>(null);
  const stoppingFadeIntervalRef = useRef<number | null>(null);
  const alertFadeIntervalRef = useRef<number | null>(null);
  const workingDelayTimeoutRef = useRef<number | null>(null);
  const popupHideTimeoutRef = useRef<number | null>(null);
  const wasChargingRef = useRef(false);
  const hadBatteryRef = useRef(false);
  const wasAbove2Ref = useRef(true);
  const stoppingPlayedRef = useRef(false);

  const [visiblePopup, setVisiblePopup] = useState(false);
  const alertPlayingRef = useRef(false);

  const {
    clusters,
    isCharging,
    currentCluster,
    isWarning,
    colorPhase,
    cooldownStartTime,
    pressure,
    showUrgentPopup,
  } = useBatteryLabo(isShutdown);

  const hasBattery = clusters[0] >= 1;

  // Fonction de fondu audio
  const fadeAudio = useCallback(
    (
      audio: HTMLAudioElement,
      from: number,
      to: number,
      duration: number,
      intervalRef: React.MutableRefObject<number | null>,
      onComplete?: () => void
    ) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const steps = 15;
      const stepDuration = duration / steps;
      const volumeStep = (to - from) / steps;
      let currentStep = 0;

      audio.volume = from;

      intervalRef.current = window.setInterval(() => {
        currentStep++;
        const newVolume = Math.max(0, Math.min(1, from + volumeStep * currentStep));
        audio.volume = newVolume;

        if (currentStep >= steps) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          audio.volume = to;
          onComplete?.();
        }
      }, stepDuration);
    },
    []
  );

  // Initialisation des audios
  useEffect(() => {
    startAudioRef.current = new Audio("/audio/start-generator.wav");
    workingAudioRef.current = new Audio("/audio/working-generator.wav");
    stoppingAudioRef.current = new Audio("/audio/stopping-generator.wav");
    alertAudioRef.current = new Audio("/audio/alert-generator.wav");
    workingAudioRef.current.loop = true;
    alertAudioRef.current.loop = true;

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (workingFadeIntervalRef.current) clearInterval(workingFadeIntervalRef.current);
      if (stoppingFadeIntervalRef.current) clearInterval(stoppingFadeIntervalRef.current);
      if (alertFadeIntervalRef.current) clearInterval(alertFadeIntervalRef.current);
      if (workingDelayTimeoutRef.current) clearTimeout(workingDelayTimeoutRef.current);
      if (popupHideTimeoutRef.current) clearTimeout(popupHideTimeoutRef.current);
      startAudioRef.current?.pause();
      workingAudioRef.current?.pause();
      stoppingAudioRef.current?.pause();
      alertAudioRef.current?.pause();
    };
  }, []);

  // Gestion du son start-generator (quand on appuie sur le levier)
  useEffect(() => {
    const startAudio = startAudioRef.current;
    if (!startAudio) return;

    // Début de charge: jouer start-generator
    if (isCharging && !wasChargingRef.current) {
      startAudio.currentTime = 0;
      startAudio.volume = 1;
      startAudio.playbackRate = START_PLAYBACK_RATE;
      startAudio.play().catch(console.error);

      // Quand le son se termine, faire un fade out rapide
      startAudio.onended = () => {
        fadeAudio(startAudio, startAudio.volume, 0, QUICK_FADE_DURATION, fadeIntervalRef);
      };
    }

    // Relâchement du levier: fade out rapide pour arrêter le son
    if (!isCharging && wasChargingRef.current) {
      if (!startAudio.paused) {
        fadeAudio(startAudio, startAudio.volume, 0, QUICK_FADE_DURATION, fadeIntervalRef, () => {
          startAudio.pause();
          startAudio.currentTime = 0;
        });
      }
    }

    wasChargingRef.current = isCharging;
  }, [isCharging, fadeAudio]);

  // Gestion du son working-generator (quand batterie >= 1%)
  useEffect(() => {
    const workingAudio = workingAudioRef.current;
    if (!workingAudio) return;

    // Batterie disponible: démarrer avec délai de 3s puis fade in rapide
    if (hasBattery && !hadBatteryRef.current) {
      // Annuler tout timeout précédent
      if (workingDelayTimeoutRef.current) {
        clearTimeout(workingDelayTimeoutRef.current);
      }

      workingDelayTimeoutRef.current = window.setTimeout(() => {
        workingAudio.currentTime = 0;
        workingAudio.volume = 0;
        workingAudio.play().then(() => {
          fadeAudio(workingAudio, 0, WORKING_VOLUME, QUICK_FADE_DURATION, workingFadeIntervalRef);
        }).catch(console.error);
      }, WORKING_START_DELAY);
    }

    // Batterie vide: annuler le délai et fade out rapide
    if (!hasBattery && hadBatteryRef.current) {
      // Annuler le timeout si le son n'a pas encore démarré
      if (workingDelayTimeoutRef.current) {
        clearTimeout(workingDelayTimeoutRef.current);
        workingDelayTimeoutRef.current = null;
      }

      if (!workingAudio.paused) {
        fadeAudio(workingAudio, workingAudio.volume, 0, QUICK_FADE_DURATION, workingFadeIntervalRef, () => {
          workingAudio.pause();
          workingAudio.currentTime = 0;
        });
      }
    }

    hadBatteryRef.current = hasBattery;
  }, [hasBattery, fadeAudio]);

  // Gestion du son stopping-generator (quand batterie <= 2%)
  useEffect(() => {
    const stoppingAudio = stoppingAudioRef.current;
    const batteryLevel = clusters[0];
    if (!stoppingAudio) return;

    const isBelow2 = batteryLevel <= 2;
    const isAtZero = batteryLevel <= 0;

    // Batterie descend à 2% ou moins: jouer stopping avec fade in
    if (isBelow2 && wasAbove2Ref.current && !stoppingPlayedRef.current) {
      stoppingAudio.currentTime = 0;
      stoppingAudio.volume = 0;
      stoppingAudio.play().then(() => {
        fadeAudio(stoppingAudio, 0, WORKING_VOLUME, QUICK_FADE_DURATION, stoppingFadeIntervalRef);
      }).catch(console.error);
      stoppingPlayedRef.current = true;
    }

    // Batterie atteint 0%: fade out rapide
    if (isAtZero && !stoppingAudio.paused) {
      fadeAudio(stoppingAudio, stoppingAudio.volume, 0, QUICK_FADE_DURATION, stoppingFadeIntervalRef, () => {
        stoppingAudio.pause();
        stoppingAudio.currentTime = 0;
      });
    }

    // Reset quand la batterie remonte au-dessus de 2%
    if (!isBelow2) {
      stoppingPlayedRef.current = false;
    }

    wasAbove2Ref.current = !isBelow2;
  }, [clusters, fadeAudio]);

  // Gestion de la popup d'urgence et du son alert-generator
  useEffect(() => {
    const alertAudio = alertAudioRef.current;
    if (!alertAudio) return;

    // Seuil atteint: afficher popup et jouer le son
    if (showUrgentPopup) {
      // Annuler le timeout de masquage si existant
      if (popupHideTimeoutRef.current) {
        clearTimeout(popupHideTimeoutRef.current);
        popupHideTimeoutRef.current = null;
      }

      setVisiblePopup(true);

      // Jouer le son alert SEULEMENT si pas déjà en lecture
      if (!alertPlayingRef.current) {
        alertPlayingRef.current = true;
        alertAudio.currentTime = 0;
        alertAudio.volume = 0;
        alertAudio.play().then(() => {
          fadeAudio(alertAudio, 0, 1, QUICK_FADE_DURATION, alertFadeIntervalRef);
        }).catch(console.error);
      }
    }
  }, [showUrgentPopup, fadeAudio]);

  // Gestion de la fermeture de la popup (2s après relâchement)
  useEffect(() => {
    const alertAudio = alertAudioRef.current;
    if (!alertAudio) return;

    // Si popup visible mais seuil plus atteint: démarrer le délai de 2s
    if (visiblePopup && !showUrgentPopup && !popupHideTimeoutRef.current) {
      popupHideTimeoutRef.current = window.setTimeout(() => {
        setVisiblePopup(false);
        alertPlayingRef.current = false;
        popupHideTimeoutRef.current = null;

        // Fade out le son alert
        if (!alertAudio.paused) {
          fadeAudio(alertAudio, alertAudio.volume, 0, QUICK_FADE_DURATION, alertFadeIntervalRef, () => {
            alertAudio.pause();
            alertAudio.currentTime = 0;
          });
        }
      }, POPUP_HIDE_DELAY);
    }
  }, [visiblePopup, showUrgentPopup, fadeAudio]);

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
      {visiblePopup && (
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
