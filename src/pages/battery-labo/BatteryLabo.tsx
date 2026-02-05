import { useEffect, useRef, useCallback } from "react";
import "./BatteryLabo.css";
import { useBatteryLabo } from "./useBatteryLabo";
import { Cluster } from "./Cluster";
import { useApp } from "../../shared/context/AppContext";

const QUICK_FADE_DURATION = 300; // 300ms pour fondue rapide
const WORKING_VOLUME = 0.5; // Volume de working-generator (start est 2x plus fort à 1.0)
const START_PLAYBACK_RATE = 1.75; // start joue 0.75x plus vite
const WORKING_START_DELAY = 3000; // 3 secondes de délai avant working-generator

export function BatteryLabo() {
  const { status } = useApp();
  const isShutdown = status?.isShutdown ?? false;

  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const workingAudioRef = useRef<HTMLAudioElement | null>(null);
  const stoppingAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const workingFadeIntervalRef = useRef<number | null>(null);
  const stoppingFadeIntervalRef = useRef<number | null>(null);
  const workingDelayTimeoutRef = useRef<number | null>(null);
  const wasChargingRef = useRef(false);
  const hadBatteryRef = useRef(false);
  const wasAbove2Ref = useRef(true);
  const stoppingPlayedRef = useRef(false);

  const {
    clusters,
    isCharging,
    currentCluster,
    colorPhase,
    cooldownStartTime,
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
      onComplete?: () => void,
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
        const newVolume = Math.max(
          0,
          Math.min(1, from + volumeStep * currentStep),
        );
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
    [],
  );

  // Initialisation des audios
  useEffect(() => {
    startAudioRef.current = new Audio("/audio/start-generator.mp3");
    workingAudioRef.current = new Audio("/audio/working-generator.wav");
    stoppingAudioRef.current = new Audio("/audio/stopping-generator.wav");
    workingAudioRef.current.loop = true;

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (workingFadeIntervalRef.current)
        clearInterval(workingFadeIntervalRef.current);
      if (stoppingFadeIntervalRef.current)
        clearInterval(stoppingFadeIntervalRef.current);
      if (workingDelayTimeoutRef.current)
        clearTimeout(workingDelayTimeoutRef.current);
      startAudioRef.current?.pause();
      workingAudioRef.current?.pause();
      stoppingAudioRef.current?.pause();
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
        fadeAudio(
          startAudio,
          startAudio.volume,
          0,
          QUICK_FADE_DURATION,
          fadeIntervalRef,
        );
      };
    }

    // Relâchement du levier: fade out rapide pour arrêter le son
    if (!isCharging && wasChargingRef.current) {
      if (!startAudio.paused) {
        fadeAudio(
          startAudio,
          startAudio.volume,
          0,
          QUICK_FADE_DURATION,
          fadeIntervalRef,
          () => {
            startAudio.pause();
            startAudio.currentTime = 0;
          },
        );
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
        workingAudio
          .play()
          .then(() => {
            fadeAudio(
              workingAudio,
              0,
              WORKING_VOLUME,
              QUICK_FADE_DURATION,
              workingFadeIntervalRef,
            );
          })
          .catch(console.error);
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
        fadeAudio(
          workingAudio,
          workingAudio.volume,
          0,
          QUICK_FADE_DURATION,
          workingFadeIntervalRef,
          () => {
            workingAudio.pause();
            workingAudio.currentTime = 0;
          },
        );
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
      stoppingAudio
        .play()
        .then(() => {
          fadeAudio(
            stoppingAudio,
            0,
            WORKING_VOLUME,
            QUICK_FADE_DURATION,
            stoppingFadeIntervalRef,
          );
        })
        .catch(console.error);
      stoppingPlayedRef.current = true;
    }

    // Batterie atteint 0%: fade out rapide
    if (isAtZero && !stoppingAudio.paused) {
      fadeAudio(
        stoppingAudio,
        stoppingAudio.volume,
        0,
        QUICK_FADE_DURATION,
        stoppingFadeIntervalRef,
        () => {
          stoppingAudio.pause();
          stoppingAudio.currentTime = 0;
        },
      );
    }

    // Reset quand la batterie remonte au-dessus de 2%
    if (!isBelow2) {
      stoppingPlayedRef.current = false;
    }

    wasAbove2Ref.current = !isBelow2;
  }, [clusters, fadeAudio]);

  return (
    <div className="battery-labo">
      <h1 className="self-center">
        Tirer le levier pour charger la batterie de secours
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
            isWarning={false}
          />
        ))}
      </div>
    </div>
  );
}
