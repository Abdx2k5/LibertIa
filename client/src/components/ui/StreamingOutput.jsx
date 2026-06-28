import { useEffect, useRef, useState } from "react";
import voyageService from "../../services/voyage.service";
import Spinner from "./Spinner";
import styles from "./StreamingOutput.module.css";

// ── Affichage structuré de l'itinéraire ──
function ItineraireAffichage({ data }) {
  if (!data) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* En-tête */}
      <div style={{ borderBottom: "1px solid rgba(167,139,250,0.2)", paddingBottom: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#e5e7eb", marginBottom: 4 }}>
          ✈️ {data.destination || "Destination"}
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {data.duree_jours && (
            <span style={{ fontSize: 13, color: "#a1a1aa" }}>
              📅 {data.duree_jours} jour{data.duree_jours > 1 ? "s" : ""}
            </span>
          )}
          {data.checkin && data.checkout && (
            <span style={{ fontSize: 13, color: "#a1a1aa" }}>
              🗓️ {data.checkin} → {data.checkout}
            </span>
          )}
        </div>
      </div>

      {/* Jours */}
      {data.jours && data.jours.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.jours.map((j, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(167,139,250,0.1)",
              borderRadius: 12,
              padding: "12px 16px"
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa", marginBottom: 8 }}>
                Jour {j.jour}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {j.matin && (
                  <div style={{ fontSize: 13, color: "#e5e7eb" }}>
                    🌅 <strong>Matin :</strong> {j.matin.activite}
                    {j.matin.lieu && <span style={{ color: "#a1a1aa" }}> — {j.matin.lieu}</span>}
                    {j.matin.duree && <span style={{ color: "#6b7280" }}> ({j.matin.duree})</span>}
                  </div>
                )}
                {j.apres_midi && (
                  <div style={{ fontSize: 13, color: "#e5e7eb" }}>
                    ☀️ <strong>Après-midi :</strong> {j.apres_midi.activite}
                    {j.apres_midi.lieu && <span style={{ color: "#a1a1aa" }}> — {j.apres_midi.lieu}</span>}
                    {j.apres_midi.duree && <span style={{ color: "#6b7280" }}> ({j.apres_midi.duree})</span>}
                  </div>
                )}
                {j.soir && (
                  <div style={{ fontSize: 13, color: "#e5e7eb" }}>
                    🌙 <strong>Soir :</strong> {j.soir.activite}
                    {j.soir.lieu && <span style={{ color: "#a1a1aa" }}> — {j.soir.lieu}</span>}
                    {j.soir.duree && <span style={{ color: "#6b7280" }}> ({j.soir.duree})</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hébergement */}
      {data.hebergement_recommande && (
        <div style={{ background: "rgba(167,139,250,0.08)", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", marginBottom: 4 }}>🏨 Hébergement recommandé</div>
          <div style={{ fontSize: 13, color: "#e5e7eb" }}>
            {data.hebergement_recommande.nom}
            {data.hebergement_recommande.prix_nuit && (
              <span style={{ color: "#a1a1aa" }}> — {data.hebergement_recommande.prix_nuit}/nuit</span>
            )}
          </div>
        </div>
      )}

      {/* Vol */}
      {data.vol_recommande && (
        <div style={{ background: "rgba(59,130,246,0.08)", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#60a5fa", marginBottom: 4 }}>✈️ Vol recommandé</div>
          <div style={{ fontSize: 13, color: "#e5e7eb" }}>
            {data.vol_recommande.compagnie}
            {data.vol_recommande.prix && (
              <span style={{ color: "#a1a1aa" }}> — {data.vol_recommande.prix}</span>
            )}
            {data.vol_recommande.duree && (
              <span style={{ color: "#6b7280" }}> ({data.vol_recommande.duree})</span>
            )}
          </div>
        </div>
      )}

      {/* Restaurants */}
      {data.restaurants_recommandes && data.restaurants_recommandes.length > 0 && (
        <div style={{ background: "rgba(34,197,94,0.07)", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#4ade80", marginBottom: 6 }}>🍽️ Restaurants recommandés</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {data.restaurants_recommandes.map((r, i) => (
              <span key={i} style={{
                fontSize: 12, color: "#e5e7eb",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 6, padding: "3px 8px"
              }}>{r}</span>
            ))}
          </div>
        </div>
      )}

      {/* Budget */}
      {data.budget_detail && (
        <div style={{ background: "rgba(251,191,36,0.07)", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fbbf24", marginBottom: 6 }}>💰 Budget estimé</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {Object.entries(data.budget_detail).map(([k, v]) => (
              <div key={k} style={{ fontSize: 12, color: "#e5e7eb" }}>
                <span style={{ color: "#a1a1aa", textTransform: "capitalize" }}>{k} : </span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conseils */}
      {data.conseils && data.conseils.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb", marginBottom: 6 }}>💡 Conseils pratiques</div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            {data.conseils.map((c, i) => (
              <li key={i} style={{ fontSize: 13, color: "#a1a1aa" }}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Composant principal ──
export default function StreamingOutput({ prompt }) {
  const [status, setStatus]   = useState("");
  const [rawOutput, setRawOutput] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [voyageId, setVoyageId] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!prompt || !prompt.trim()) return;
    let active = true;
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("");
    setRawOutput("");
    setParsedData(null);
    setVoyageId("");
    setError("");
    setLoading(true);

    let buffer = "";

    const handleStatus = (payload) => {
      if (!active) return;
      setStatus(payload?.message || payload?.step || payload?.status || "En cours...");
    };

    const handleToken = (token) => {
      if (!active) return;
      buffer += token;
      setRawOutput(buffer);

      // Essayer de parser le JSON au fur et à mesure
      try {
        const parsed = JSON.parse(buffer);
        setParsedData(parsed);
      } catch {
        // JSON incomplet — on attend le prochain token
      }
    };

    const handleDone = (payload) => {
      if (!active) return;
      setVoyageId(payload?.voyageId || "");
      setLoading(false);

      // Parser final avec l'itinéraire complet de l'event done
      if (payload?.itineraire) {
        setParsedData(payload.itineraire);
      } else {
        // Dernier essai sur le buffer accumulé
        try {
          const parsed = JSON.parse(buffer);
          setParsedData(parsed);
        } catch {
          // Garder le texte brut si JSON invalide
        }
      }
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
          { onStatus: handleStatus, onToken: handleToken, onDone: handleDone, onError: handleError },
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
        if (active) setLoading(false);
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
  const isTimeout   = errorLower.includes("timeout");
  const errorText   = isTimeout ? "Le serveur met trop de temps à répondre, réessaie." : error;

  return (
    <div className={styles.wrapper} aria-live="polite">
      <div className={styles.header}>
        <span className={styles.title}>Réponse IA</span>
        <div className={styles.actions}>
          {loading && <Spinner size={18} label="Génération en cours..." />}
          {loading && (
            <button type="button" className={styles.cancelBtn} onClick={() => abortRef.current?.abort()}>
              Annuler
            </button>
          )}
        </div>
      </div>

      {status && <div className={styles.status}>⚙️ {status}</div>}

      {error && (
        <div className={isCancelled ? styles.info : styles.error}>{errorText}</div>
      )}

      {!error && (
        <div className={styles.output}>
          {parsedData ? (
            <ItineraireAffichage data={parsedData} />
          ) : rawOutput ? (
            // Affichage texte brut pendant la génération (avant parsing réussi)
            <div style={{ color: "#a1a1aa", fontSize: 13, fontStyle: "italic" }}>
              Génération en cours...
            </div>
          ) : null}
        </div>
      )}

      {voyageId && !error && (
        <div className={styles.done}>
          ✅ Voyage enregistré
        </div>
      )}
    </div>
  );
}