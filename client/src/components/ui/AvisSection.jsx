// =============================================================
// FICHIER  : src/components/ui/AvisSection.jsx
// TÂCHE    : T95 — Avis sur les agences / hôtels / vols
//
// PROPS :
//   - cibleNom  → string — nom de la cible (ex: "Air France")
//   - cibleType → "agence" | "hotel" | "vol"
// =============================================================

import { useCallback, useEffect, useState } from "react";
import styles from "./AvisSection.module.css";
import { useAuthStore } from "../../store/authStore";
import avisService from "../../services/avis.service";

const STAR_PATH = "M12 2.5l2.95 6.04 6.66.97-4.82 4.7 1.14 6.63L12 17.77l-5.93 3.07 1.14-6.63-4.82-4.7 6.66-.97L12 2.5z";

// ─────────────────────────────────────────────
//  Icônes (SVG inline)
// ─────────────────────────────────────────────
function StarShape({ size = 20, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={STAR_PATH} fill={filled ? "#fbbf24" : "none"} stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function PickerStarShape({ size = 28, filled }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={STAR_PATH} fill={filled ? "#aa3bff" : "none"} stroke={filled ? "#aa3bff" : "#6b7280"} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ─────────────────────────────────────────────
//  Étoiles d'affichage — gère les demi-étoiles via un clip
// ─────────────────────────────────────────────
function RatingStars({ value = 0, size = 20 }) {
  return (
    <div className={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fillRatio = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={styles.starWrap} style={{ width: size, height: size }}>
            <StarShape size={size} filled={false} />
            <span className={styles.starFillClip} style={{ width: `${fillRatio * 100}%` }}>
              <StarShape size={size} filled />
            </span>
          </span>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Sélecteur d'étoiles pour le nouvel avis
// ─────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className={styles.starPicker} role="radiogroup" aria-label="Votre note">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={styles.starPickerBtn}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
          aria-pressed={value === n}
        >
          <PickerStarShape filled={n <= display} />
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function initials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

function formatRelative(date) {
  if (!date) return "";
  const then = new Date(date);
  const diffSec = Math.floor((Date.now() - then.getTime()) / 1000);

  if (diffSec < 60) return "à l'instant";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `il y a ${diffHour} h`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `il y a ${diffMonth} mois`;

  const diffYear = Math.floor(diffDay / 365);
  return `il y a ${diffYear} an${diffYear > 1 ? "s" : ""}`;
}

export default function AvisSection({ cibleNom, cibleType }) {
  const { user } = useAuthStore();

  const [avis, setAvis] = useState([]);
  const [moyenne, setMoyenne] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [noteChoisie, setNoteChoisie] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const charger = useCallback(async () => {
    if (!cibleNom || !cibleType) return;
    setLoading(true);
    try {
      const data = await avisService.getAvis(cibleNom, cibleType);
      setAvis(data.data || []);
      setMoyenne(data.moyenne || 0);
      setTotal(data.total || 0);
      setError(null);
    } catch {
      setError("Impossible de charger les avis.");
    } finally {
      setLoading(false);
    }
  }, [cibleNom, cibleType]);

  useEffect(() => {
    let actif = true;
    (async () => {
      await charger();
      if (!actif) return;
    })();
    return () => { actif = false; };
  }, [charger]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!noteChoisie || submitting) return;

    setSubmitting(true);
    try {
      await avisService.creerAvis({
        cibleType,
        cibleNom,
        note: noteChoisie,
        commentaire: commentaire.trim()
      });
      setNoteChoisie(0);
      setCommentaire("");
      setError(null);
      await charger();
    } catch {
      setError("Impossible de publier votre avis. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await avisService.supprimerAvis(id);
      setError(null);
      await charger();
    } catch {
      setError("Impossible de supprimer cet avis.");
    }
  };

  return (
    <div className={styles.wrap}>
      {/* ── En-tête : note moyenne ── */}
      <div className={styles.header}>
        <div className={styles.moyenneBlock}>
          <span className={styles.moyenneValue}>{total > 0 ? moyenne.toFixed(1) : "—"}</span>
          <RatingStars value={moyenne} />
        </div>
        <span className={styles.totalLabel}>{total} avis</span>
      </div>

      {/* ── Formulaire nouvel avis ── */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <StarPicker value={noteChoisie} onChange={setNoteChoisie} />

        <textarea
          className={styles.textarea}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value.slice(0, 500))}
          maxLength={500}
          rows={3}
          placeholder="Partagez votre expérience..."
        />

        <div className={styles.formFooter}>
          <span className={styles.charCount}>{commentaire.length}/500</span>
          <button type="submit" className={styles.submitBtn} disabled={!noteChoisie || submitting}>
            {submitting ? "Publication..." : "Publier l'avis"}
          </button>
        </div>
      </form>

      {error ? <div className={styles.error}>{error}</div> : null}

      {/* ── Liste des avis ── */}
      {loading ? (
        <p className={styles.empty}>Chargement des avis...</p>
      ) : avis.length === 0 ? (
        <p className={styles.empty}>Aucun avis pour le moment. Soyez le premier !</p>
      ) : (
        <ul className={styles.list}>
          {avis.map((a) => {
            const estMonAvis = user?._id && a.utilisateur?._id && String(a.utilisateur._id) === String(user._id);
            return (
              <li key={a._id} className={styles.item}>
                <div className={styles.avatar}>
                  {a.utilisateur?.profilePhoto ? (
                    <img src={a.utilisateur.profilePhoto} alt={a.utilisateur?.nom || "Utilisateur"} />
                  ) : (
                    <span>{initials(a.utilisateur?.nom)}</span>
                  )}
                </div>

                <div className={styles.itemBody}>
                  <div className={styles.itemHead}>
                    <span className={styles.itemAuteur}>{a.utilisateur?.nom || "Utilisateur"}</span>
                    <RatingStars value={a.note} size={14} />
                    {estMonAvis ? (
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(a._id)}
                        aria-label="Supprimer mon avis"
                      >
                        <TrashIcon />
                      </button>
                    ) : null}
                  </div>

                  {a.commentaire ? <p className={styles.itemText}>{a.commentaire}</p> : null}
                  <span className={styles.itemDate}>{formatRelative(a.createdAt)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
