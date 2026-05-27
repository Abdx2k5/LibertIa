import { useEffect, useRef, useState } from "react";
import voyageService from "../../services/voyage.service";
import Spinner from "./Spinner";
import styles from "./StreamingOutput.module.css";

export default function StreamingOutput({ prompt }) {
  const [status, setStatus] = useState("");
  const [output, setOutput] = useState("");
  const [voyageId, setVoyageId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!prompt || !prompt.trim()) return;

    let active = true;

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("");
    setOutput("");
    setVoyageId("");
    setError("");
    setLoading(true);

    const handleStatus = (payload) => {
      if (!active) return;
      const label = payload?.step || payload?.status || "En cours";
      setStatus(label);
    };

    const handleToken = (token) => {
      if (!active) return;
      setOutput((prev) => prev + token);
    };

    const handleDone = (payload) => {
      if (!active) return;
      setVoyageId(payload?.voyageId || "");
    };

    const handleError = (message) => {
      if (!active) return;
      setError(message || "Une erreur est survenue.");
      setLoading(false);
    };

    const run = async () => {
      try {
        await voyageService.streamGenerer(
          prompt,
          {
            onStatus: handleStatus,
            onToken: handleToken,
            onDone: handleDone,
            onError: handleError,
          },
          controller.signal
        );
        if (!active) return;
        abortRef.current = null;
      } catch (err) {
        if (!active) return;
        if (err?.name === "AbortError") {
          const reason = String(err?.message || "").toLowerCase();
          handleError(reason.includes("timeout") ? "timeout" : "Génération annulée");
          abortRef.current = null;
          return;
        }
        setError(err?.message || "Erreur réseau. Veuillez réessayer.");
        abortRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => {
      active = false;
      controller.abort();
    };
  }, [prompt]);

  if (!prompt || !prompt.trim()) return null;

  const errorLower = error.toLowerCase();
  const isCancelled = errorLower.includes("annulée");
  const isTimeout = errorLower.includes("timeout");
  const errorText = isTimeout
    ? "Le serveur met trop de temps à répondre, réessaie."
    : error;

  return (
    <div className={styles.wrapper} aria-live="polite">
      <div className={styles.header}>
        <span className={styles.title}>Réponse IA</span>
        <div className={styles.actions}>
          {loading && <Spinner size={18} label="Génération en cours..." />}
          {loading && (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => abortRef.current?.abort()}
            >
              Annuler
            </button>
          )}
        </div>
      </div>
      {status && <div className={styles.status}>Étape : {status}</div>}
      {error && (
        <div className={isCancelled ? styles.info : styles.error}>{errorText}</div>
      )}
      {!error && <div className={styles.output}>{output}</div>}
      {voyageId && !error && (
        <div className={styles.done}>Voyage enregistré • ID : {voyageId}</div>
      )}
    </div>
  );
}
