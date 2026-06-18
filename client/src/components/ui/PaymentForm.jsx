// =============================================================
// FICHIER  : src/components/ui/PaymentForm.jsx
// TÂCHE    : T102 — Formulaire de paiement
//
// Formulaire de carte bancaire avec validation manuelle
// (algorithme de Luhn pour le numéro, regex pour expiration/CVV).
// Aucune donnée n'est envoyée à un serveur — paiement simulé.
//
// PROPS :
//   - amount    → number — montant à payer (affiché en €)
//   - onSuccess → function({ transactionId, amount })
//   - onCancel  → function()
// =============================================================

import { useMemo, useState } from "react";
import styles from "./PaymentForm.module.css";

const FAILURE_RATE = 0.1; // 10% d'échec simulé

// ─────────────────────────────────────────────
//  Détection du type de carte (préfixes simplifiés)
// ─────────────────────────────────────────────
function detectCardType(digits) {
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  return null;
}

// ─────────────────────────────────────────────
//  Algorithme de Luhn
// ─────────────────────────────────────────────
function luhnValid(digits) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// ─────────────────────────────────────────────
//  Formatage des champs
// ─────────────────────────────────────────────
function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCvv(value) {
  return value.replace(/\D/g, "").slice(0, 4);
}

// ─────────────────────────────────────────────
//  Validation
// ─────────────────────────────────────────────
function isExpiryValid(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

function validateField(field, value) {
  switch (field) {
    case "nom":
      return value.trim() ? null : "Le nom du titulaire est requis";

    case "numero": {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "Le numéro de carte est requis";
      if (digits.length < 13) return "Numéro de carte incomplet";
      if (!luhnValid(digits)) return "Numéro de carte invalide";
      return null;
    }

    case "expiration":
      if (!value) return "La date d'expiration est requise";
      return isExpiryValid(value) ? null : "Date d'expiration invalide (MM/AA)";

    case "cvv":
      if (!value) return "Le CVV est requis";
      return /^\d{3,4}$/.test(value) ? null : "CVV invalide (3 ou 4 chiffres)";

    default:
      return null;
  }
}

// ─────────────────────────────────────────────
//  Icônes (SVG inline)
// ─────────────────────────────────────────────
function VisaIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden="true">
      <rect width="32" height="20" rx="3" fill="#1a1f71" />
      <text x="16" y="14" textAnchor="middle" fontSize="9" fontWeight="700" fontStyle="italic" fill="#ffffff" fontFamily="Arial, sans-serif">VISA</text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden="true">
      <rect width="32" height="20" rx="3" fill="var(--bg)" />
      <circle cx="13" cy="10" r="6" fill="#eb001b" />
      <circle cx="19" cy="10" r="6" fill="#f79e1b" fillOpacity="0.85" />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg width="32" height="20" viewBox="0 0 32 20" aria-hidden="true">
      <rect width="32" height="20" rx="3" fill="#2e77bc" />
      <text x="16" y="14" textAnchor="middle" fontSize="8" fontWeight="700" fill="#ffffff" fontFamily="Arial, sans-serif">AMEX</text>
    </svg>
  );
}

function getCardIcon(type) {
  switch (type) {
    case "visa":
      return <VisaIcon />;
    case "mastercard":
      return <MastercardIcon />;
    case "amex":
      return <AmexIcon />;
    default:
      return null;
  }
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

const FIELDS = ["nom", "numero", "expiration", "cvv"];
const INITIAL_VALUES = { nom: "", numero: "", expiration: "", cvv: "" };

export default function PaymentForm({ amount, onSuccess, onCancel }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [showCvv, setShowCvv] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const cardType = useMemo(() => detectCardType(values.numero.replace(/\D/g, "")), [values.numero]);

  const isFormValid = useMemo(
    () => FIELDS.every((field) => !validateField(field, values[field])),
    [values]
  );

  const handleChange = (field) => (event) => {
    let raw = event.target.value;
    if (field === "numero") raw = formatCardNumber(raw);
    else if (field === "expiration") raw = formatExpiry(raw);
    else if (field === "cvv") raw = formatCvv(raw);

    setValues((prev) => ({ ...prev, [field]: raw }));

    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, raw) }));
    }
    if (submitError) setSubmitError(null);
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};
    FIELDS.forEach((field) => {
      newErrors[field] = validateField(field, values[field]);
    });
    setErrors(newErrors);
    setTouched({ nom: true, numero: true, expiration: true, cvv: true });

    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    setSubmitError(null);

    setTimeout(() => {
      const success = Math.random() >= FAILURE_RATE;

      if (success) {
        onSuccess?.({ transactionId: `TXN-${Date.now()}`, amount });
        return;
      }

      setLoading(false);
      setSubmitError("Paiement refusé, vérifiez vos informations ou essayez une autre carte");
    }, 1500);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.amountBlock}>
        <span className={styles.amountLabel}>Total à payer</span>
        <span className={styles.amountValue}>{amount}€</span>
      </div>

      {submitError ? <div className={styles.errorBanner}>{submitError}</div> : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="payment-nom">Nom du titulaire</label>
        <input
          id="payment-nom"
          type="text"
          className={`${styles.input} ${errors.nom ? styles.inputError : ""}`}
          placeholder="Jean Dupont"
          value={values.nom}
          onChange={handleChange("nom")}
          onBlur={handleBlur("nom")}
          disabled={loading}
          required
        />
        {errors.nom ? <span className={styles.error}>{errors.nom}</span> : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="payment-numero">Numéro de carte</label>
        <div className={styles.inputWithIcon}>
          <input
            id="payment-numero"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            className={`${styles.input} ${errors.numero ? styles.inputError : ""}`}
            placeholder="1234 5678 9012 3456"
            value={values.numero}
            onChange={handleChange("numero")}
            onBlur={handleBlur("numero")}
            maxLength={19}
            disabled={loading}
            required
          />
          {cardType ? <span className={styles.cardIcon}>{getCardIcon(cardType)}</span> : null}
        </div>
        {errors.numero ? <span className={styles.error}>{errors.numero}</span> : null}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="payment-expiration">Date d&apos;expiration</label>
          <input
            id="payment-expiration"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            className={`${styles.input} ${errors.expiration ? styles.inputError : ""}`}
            placeholder="MM/AA"
            value={values.expiration}
            onChange={handleChange("expiration")}
            onBlur={handleBlur("expiration")}
            maxLength={5}
            disabled={loading}
            required
          />
          {errors.expiration ? <span className={styles.error}>{errors.expiration}</span> : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="payment-cvv">CVV</label>
          <div className={styles.inputWithIcon}>
            <input
              id="payment-cvv"
              type={showCvv ? "text" : "password"}
              inputMode="numeric"
              autoComplete="cc-csc"
              className={`${styles.input} ${errors.cvv ? styles.inputError : ""}`}
              placeholder="123"
              value={values.cvv}
              onChange={handleChange("cvv")}
              onBlur={handleBlur("cvv")}
              maxLength={4}
              disabled={loading}
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowCvv((v) => !v)}
              aria-label={showCvv ? "Masquer le CVV" : "Afficher le CVV"}
              disabled={loading}
            >
              {showCvv ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.cvv ? <span className={styles.error}>{errors.cvv}</span> : null}
        </div>
      </div>

      <button type="submit" className={styles.submitButton} disabled={!isFormValid || loading}>
        {loading ? <span className={styles.spinner} aria-hidden="true" /> : `Payer ${amount}€`}
      </button>

      <button type="button" className={styles.cancelLink} onClick={onCancel} disabled={loading}>
        Annuler
      </button>

      <div className={styles.securityNote}>
        <LockIcon />
        <span>Paiement sécurisé — vos données ne sont pas stockées</span>
      </div>
    </form>
  );
}
