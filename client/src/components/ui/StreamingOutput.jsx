import { useEffect, useState } from "react";
import voyageService from "../../services/voyage.service";
import Spinner from "./Spinner";
import styles from "./StreamingOutput.module.css";

export default function StreamingOutput({ prompt }) {
  const [status, setStatus] = useState("");
  const [output, setOutput] = useState("");
  const [voyageId, setVoyageId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!prompt || !prompt.trim()) return;

    let active = true;

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
        await voyageService.streamGenerer(prompt, {
          onStatus: handleStatus,
          onToken: handleToken,
          onDone: handleDone,
          onError: handleError,
        });
        if (!active) return;
      } catch (err) {
        if (active) {
          setError(err?.message || "Erreur réseau. Veuillez réessayer.");
        }
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [prompt]);

  if (!prompt || !prompt.trim()) return null;

  return (
    <div className={styles.wrapper} aria-live="polite">
      <div className={styles.header}>
        <span className={styles.title}>Réponse IA</span>
        {loading && <Spinner size={18} label="Génération en cours..." />}
      </div>
      {status && <div className={styles.status}>Étape : {status}</div>}
      {error && <div className={styles.error}>{error}</div>}
      {!error && <div className={styles.output}>{output}</div>}
      {voyageId && !error && (
        <div className={styles.done}>Voyage enregistré • ID : {voyageId}</div>
      )}
    </div>
  );
}
