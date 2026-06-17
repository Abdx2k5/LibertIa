// =============================================================
// FICHIER  : src/components/ui/DossierForm.jsx
// TÂCHE    : T74 — Formulaire création dossier souvenir (M5)
//
// Formulaire dans une Modal pour créer un dossier souvenir.
// Câblé sur dossierService.creerDossier (POST /api/dossiers).
//
// PROPS :
//   - isOpen     → boolean — contrôle l'affichage
//   - onClose    → function — fermeture de la modal
//   - onCreated  → function(dossier) — callback après création réussie
//   - voyages    → array (optionnel) — pour associer le dossier à un voyage
//                  format attendu : [{ id, destination }]
// =============================================================

import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import dossierService from "../../services/dossier.service";

const COULEURS = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

const EMPTY_FORM = {
  titre: "",
  description: "",
  couleur: COULEURS[0],
  voyageId: "",
};

const s = {
  field: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 500, color: "#e7f0ff" },
  input: {
    width: "100%",
    backgroundColor: "#0f1724",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e7f0ff",
    borderRadius: 6,
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
  },
  textarea: { minHeight: 90, resize: "vertical" },
  errorBorder: { border: "1px solid rgba(248,113,113,0.5)" },
  errorMsg: { fontSize: 12, color: "#f87171" },
  colorRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  swatch: (color, active) => ({
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: color,
    cursor: "pointer",
    border: active ? "3px solid #e7f0ff" : "3px solid transparent",
    boxShadow: active ? `0 0 10px ${color}` : "none",
    transition: "transform 0.15s",
  }),
  formError: {
    fontSize: 13,
    color: "#f87171",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 6,
    padding: "8px 12px",
    marginBottom: 12,
  },
};

export default function DossierForm({ isOpen, onClose, onCreated, voyages = [] }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const titreError = touched.titre && !form.titre.trim() ? "Le titre est requis." : "";

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(EMPTY_FORM);
    setTouched({});
    setApiError("");
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ titre: true });
    if (!form.titre.trim()) return;

    setLoading(true);
    setApiError("");

    const payload = {
      titre: form.titre.trim(),
      description: form.description.trim(),
      couleur: form.couleur,
      ...(form.voyageId ? { voyageId: form.voyageId } : {}),
    };

    try {
      const dossier = await dossierService.creerDossier(payload);
      onCreated?.(dossier);
      reset();
      onClose?.();
    } catch (err) {
      console.error(err);
      setApiError("Impossible de créer le dossier. Réessayez plus tard.");
      setLoading(false);
    }
  };

  const footer = (
    <>
      <Button variant="primary" type="button" onClick={handleSubmit} loading={loading} fullWidth>
        Créer le dossier
      </Button>
      <Button variant="outline" type="button" onClick={handleClose} disabled={loading} fullWidth>
        Annuler
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nouveau dossier souvenir" size="md" footer={footer}>
      <form onSubmit={handleSubmit}>
        {apiError && <div style={s.formError}>{apiError}</div>}

        <div style={s.field}>
          <label style={s.label}>Titre *</label>
          <input
            style={{ ...s.input, ...(titreError ? s.errorBorder : {}) }}
            placeholder="Ex : Japon 2026"
            value={form.titre}
            onChange={(e) => update("titre", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, titre: true }))}
          />
          {titreError && <span style={s.errorMsg}>{titreError}</span>}
        </div>

        <div style={s.field}>
          <label style={s.label}>Description</label>
          <textarea
            style={{ ...s.input, ...s.textarea }}
            placeholder="Quelques mots sur ce dossier…"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Couleur</label>
          <div style={s.colorRow}>
            {COULEURS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Couleur ${color}`}
                style={s.swatch(color, form.couleur === color)}
                onClick={() => update("couleur", color)}
              />
            ))}
          </div>
        </div>

        {voyages.length > 0 && (
          <div style={s.field}>
            <label style={s.label}>Voyage associé (optionnel)</label>
            <select
              style={s.input}
              value={form.voyageId}
              onChange={(e) => update("voyageId", e.target.value)}
            >
              <option value="">Aucun</option>
              {voyages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.destination || v.titre || v.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
}
