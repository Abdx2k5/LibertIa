// =============================================================
// FICHIER  : src/components/ui/AgencyContactForm.jsx
// TÂCHE    : T93 — Formulaire contact agence (M6)
//
// Modal de contact d'une agence. Suit le pattern DossierForm.
// Soumission via agencyService.contacterAgence (repli simulé si
// l'endpoint n'existe pas encore).
//
// PROPS :
//   - isOpen  → boolean
//   - onClose → function
//   - agence  → { id|_id, nom }
//   - onSent  → function(payload)  (optionnel)
// =============================================================

import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import agencyService from "../../services/agency.service";

const EMPTY_FORM = { nom: "", email: "", sujet: "", message: "" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  textarea: { minHeight: 110, resize: "vertical" },
  errorBorder: { border: "1px solid rgba(248,113,113,0.5)" },
  errorMsg: { fontSize: 12, color: "#f87171" },
  formError: {
    fontSize: 13,
    color: "#f87171",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: 6,
    padding: "8px 12px",
    marginBottom: 12,
  },
  success: {
    fontSize: 14,
    color: "#4ade80",
    textAlign: "center",
    padding: "12px 0",
  },
};

export default function AgencyContactForm({ isOpen, onClose, agence, onSent }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [sent, setSent] = useState(false);

  const id = agence?.id || agence?._id;

  const errors = {
    nom: !form.nom.trim() ? "Votre nom est requis." : "",
    email: !form.email.trim()
      ? "Votre email est requis."
      : !EMAIL_RE.test(form.email.trim())
      ? "Email invalide."
      : "",
    message: !form.message.trim() ? "Le message est requis." : "",
  };

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm(EMPTY_FORM);
    setTouched({});
    setApiError("");
    setLoading(false);
    setSent(false);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ nom: true, email: true, message: true });
    if (errors.nom || errors.email || errors.message) return;

    setLoading(true);
    setApiError("");

    const payload = {
      nom: form.nom.trim(),
      email: form.email.trim(),
      sujet: form.sujet.trim(),
      message: form.message.trim(),
    };

    try {
      await agencyService.contacterAgence(id, payload);
      onSent?.(payload);
      setSent(true);
    } catch {
      setApiError("Impossible d'envoyer le message. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const footer = sent ? (
    <Button variant="primary" type="button" onClick={handleClose} fullWidth>
      Fermer
    </Button>
  ) : (
    <>
      <Button variant="primary" type="button" onClick={handleSubmit} loading={loading} fullWidth>
        Envoyer
      </Button>
      <Button variant="outline" type="button" onClick={handleClose} disabled={loading} fullWidth>
        Annuler
      </Button>
    </>
  );

  const renderField = (key, label, placeholder, asTextarea = false) => {
    const showError = touched[key] && errors[key];
    const common = {
      style: { ...s.input, ...(asTextarea ? s.textarea : {}), ...(showError ? s.errorBorder : {}) },
      placeholder,
      value: form[key],
      onChange: (e) => update(key, e.target.value),
      onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
    };
    return (
      <div style={s.field}>
        <label style={s.label}>{label}</label>
        {asTextarea ? <textarea {...common} /> : <input {...common} />}
        {showError && <span style={s.errorMsg}>{errors[key]}</span>}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={agence ? `Contacter ${agence.nom}` : "Contacter l'agence"}
      size="md"
      footer={footer}
    >
      {sent ? (
        <p style={s.success}>✓ Votre message a bien été envoyé. L'agence vous répondra par email.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {apiError && <div style={s.formError}>{apiError}</div>}
          {renderField("nom", "Votre nom *", "Prénom Nom")}
          {renderField("email", "Votre email *", "vous@email.com")}
          {renderField("sujet", "Sujet", "Objet de votre demande")}
          {renderField("message", "Message *", "Votre message…", true)}
        </form>
      )}
    </Modal>
  );
}
