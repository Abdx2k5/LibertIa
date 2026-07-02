import { useEffect, useRef, useState } from "react";
import styles from "./MicroAnimated.module.css";

const MOCK_RESULT = "Tokyo, Japon, 7 jours, budget 1500€";
const STATE = {
  idle: "idle",
  listening: "listening",
  processing: "processing",
};

function MicIcon({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 15.5C14.2091 15.5 16 13.7091 16 11.5V7.5C16 5.29086 14.2091 3.5 12 3.5C9.79086 3.5 8 5.29086 8 7.5V11.5C8 13.7091 9.79086 15.5 12 15.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 11.5C5.5 15.6421 8.85786 19 13 19H11C7.13401 19 4 15.866 4 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19V21.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MicroAnimated({ onResult, disabled = false }) {
  const [state, setState] = useState(STATE.idle);
  const timersRef = useRef([]);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const handleClick = () => {
    if (disabled || state !== STATE.idle) {
      return;
    }

    clearTimers();
    setState(STATE.listening);

    const listeningTimer = setTimeout(() => {
      setState(STATE.processing);

      const processingTimer = setTimeout(() => {
        onResultRef.current?.(MOCK_RESULT);
        setState(STATE.idle);
        timersRef.current = [];
      }, 1000);

      timersRef.current = [processingTimer];
    }, 2000);

    timersRef.current = [listeningTimer];
  };

  const isListening = state === STATE.listening;
  const isProcessing = state === STATE.processing;

  const buttonClassName = [
    styles.button,
    isListening ? styles.listening : "",
    isProcessing ? styles.processing : "",
    disabled ? styles.disabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={buttonClassName}
      onClick={handleClick}
      disabled={disabled}
      aria-label={
        disabled
          ? "Microphone désactivé"
          : isListening
            ? "Écoute en cours"
            : isProcessing
              ? "Traitement en cours"
              : "Activer le micro"
      }
    >
      {isListening && (
        <span className={styles.rings} aria-hidden="true">
          <span className={styles.ringOne} />
          <span className={styles.ringTwo} />
          <span className={styles.ringThree} />
        </span>
      )}

      {isProcessing && <span className={styles.processingRing} aria-hidden="true" />}

      <MicIcon className={styles.icon} />
    </button>
  );
}
