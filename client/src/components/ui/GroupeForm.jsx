// =============================================================
// FICHIER  : src/components/ui/GroupeForm.jsx
// TÂCHE    : T63 — Formulaire création de groupe (M4)
//
// Formulaire dans une Modal pour créer un groupe de voyage.
// Pas de service groupe dédié : la soumission remonte via onCreate.
// Point d'extension backend : remplacer onCreate par un appel
// groupeService.creerGroupe(payload) quand l'API sera disponible.
//
// PROPS :
//   - isOpen     → boolean
//   - onClose    → function
//   - onCreate   → function(groupe) — reçoit le groupe construit
//   - categories → string[] (optionnel) — défaut : GROUP_CATEGORIES
// =============================================================

import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { GROUP_CATEGORIES } from "../../mocks/groupsData";

const EMPTY_FORM = {
  nom: "",
  description: "",
  categorie: "",
  type: "Public",
  localisation: "",
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
  textarea: { minHeight: 80, resize: "vertical" },
  errorBorder: { border: "1px solid rgba(248,113,113,0.5)" },
  errorMsg: { fontSize: 12, color: "#f87171" },
  typeRow: { display: "flex", gap: 10 },
  typeBtn: (active) => ({
    flex: 1,
    padding: "10px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    background: active ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
    border: active ? "1px solid rgba(6,182,212,0.45)" : "1px solid rgba(255,255,255,0.08)",
    color: active ? "#e7f0ff" : "#94a3b8",
  }),
  tagInputRow: { display: "flex", gap: 8 },
  chips: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#cbd5e1",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 999,
    padding: "4px 10px",
  },
  chipRemove: { cursor: "pointer", color: "#94a3b8", fontWeight: 700 },
};

export default function GroupeForm({ isOpen, onClose, onCreate, categories }) {
  const categoryList = (categories || GROUP_CATEGORIES).filter((c) => c !== "Tous");

  const [form, setForm] = useState(EMPTY_FORM);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [touched, setTouched] = useState({});

  const nomError = touched.nom && !form.nom.trim() ? "Le nom est requis." : "";

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(EMPTY_FORM);
    setTags([]);
    setTagInput("");
    setTouched({});
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const addTag = () => {
    const raw = tagInput.trim().replace(/^#/, "");
    if (!raw) return;
    const tag = `#${raw}`;
    if (!tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ nom: true });
    if (!form.nom.trim()) return;

    const groupe = {
      id: `g-${Date.now()}`,
      nom: form.nom.trim(),
      description: form.description.trim(),
      categorie: form.categorie || categoryList[0],
      type: form.type,
      localisation: form.localisation.trim(),
      tags,
      membres: 1,
      verifie: false,
    };

    onCreate?.(groupe);
    reset();
    onClose?.();
  };

  const footer = (
    <>
      <Button variant="primary" type="button" onClick={handleSubmit} fullWidth>
        Créer le groupe
      </Button>
      <Button variant="outline" type="button" onClick={handleClose} fullWidth>
        Annuler
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Créer un groupe" size="md" footer={footer}>
      <form onSubmit={handleSubmit}>
        <div style={s.field}>
          <label style={s.label}>Nom du groupe *</label>
          <input
            style={{ ...s.input, ...(nomError ? s.errorBorder : {}) }}
            placeholder="Ex : Voyages solo Europe"
            value={form.nom}
            onChange={(e) => update("nom", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, nom: true }))}
          />
          {nomError && <span style={s.errorMsg}>{nomError}</span>}
        </div>

        <div style={s.field}>
          <label style={s.label}>Description</label>
          <textarea
            style={{ ...s.input, ...s.textarea }}
            placeholder="À qui s'adresse ce groupe ?"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Catégorie</label>
          <select style={s.input} value={form.categorie} onChange={(e) => update("categorie", e.target.value)}>
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={s.field}>
          <label style={s.label}>Visibilité</label>
          <div style={s.typeRow}>
            {["Public", "Privé"].map((type) => (
              <button
                key={type}
                type="button"
                style={s.typeBtn(form.type === type)}
                onClick={() => update("type", type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Localisation</label>
          <input
            style={s.input}
            placeholder="Ex : Europe, Japon, Monde…"
            value={form.localisation}
            onChange={(e) => update("localisation", e.target.value)}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Tags</label>
          <div style={s.tagInputRow}>
            <input
              style={s.input}
              placeholder="Ajouter un tag puis Entrée"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <Button variant="outline" type="button" onClick={addTag}>
              Ajouter
            </Button>
          </div>
          {tags.length > 0 && (
            <div style={s.chips}>
              {tags.map((tag) => (
                <span key={tag} style={s.chip}>
                  {tag}
                  <span style={s.chipRemove} onClick={() => removeTag(tag)} aria-label={`Retirer ${tag}`}>
                    ✕
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
