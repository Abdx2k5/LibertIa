import { useState, useRef } from "react";
import styles from "./EditProfileForm.module.css";

// TODO: importer depuis authStore et userService
// import { useAuthStore } from "../../store/authStore";
// import { updateProfile } from "../../services/auth.service";

const LANGUAGES = ["Français", "English", "العربية", "Español", "Deutsch"];
const COUNTRIES  = ["Maroc", "France", "Espagne", "Italie", "Portugal", "États-Unis", "Canada", "Autre"];

export default function EditProfileForm({ onCancel, onSaved }) {
  // TODO: initialiser depuis useAuthStore()
  const [form, setForm] = useState({
    firstName:   "Asmae",
    lastName:    "Benali",
    username:    "asmae_b",
    email:       "asmae@libertia.app",
    phone:       "+212 6 00 00 00 00",
    bio:         "Passionnée de voyages et de nouvelles aventures ✈️",
    country:     "Maroc",
    city:        "Tanger",
    language:    "Français",
    website:     "",
  });

  const [avatar, setAvatar]       = useState(null);   // base64 preview
  const [errors, setErrors]       = useState({});
  const [status, setStatus]       = useState("idle"); // idle | loading | success | error
  const [activeTab, setActiveTab] = useState("info"); // info | security | preferences
  const fileRef                   = useRef(null);

  /* ── Handlers ── */
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((v) => ({ ...v, [key]: "" }));
  };

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Prénom requis.";
    if (!form.lastName.trim())  e.lastName  = "Nom requis.";
    if (!form.username.trim())  e.username  = "Nom d'utilisateur requis.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide.";
    if (form.bio.length > 160)  e.bio = "Max 160 caractères.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus("loading");
    try {
      // TODO: await updateProfile({ ...form, avatar });
      await new Promise((r) => setTimeout(r, 1300));
      setStatus("success");
      setTimeout(() => { setStatus("idle"); onSaved?.(); }, 1800);
    } catch {
      setStatus("error");
    }
  };

  const initials = `${form.firstName[0] ?? ""}${form.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className={styles.root}>

      {/* ── En-tête ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.pageTitle}>Modifier le profil</h2>
          <p className={styles.pageSubtitle}>Mettez à jour vos informations personnelles</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.btnCancel} onClick={onCancel}>
            Annuler
          </button>
          <button
            type="submit"
            form="edit-profile-form"
            className={styles.btnSave}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <span className={styles.btnInner}>
                <span className={styles.spinner} /> Enregistrement…
              </span>
            ) : status === "success" ? (
              <span className={styles.btnInner}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Enregistré !
              </span>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {[
          { key: "info",        label: "Informations" },
          { key: "security",   label: "Sécurité" },
          { key: "preferences",label: "Préférences" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form id="edit-profile-form" onSubmit={handleSubmit} noValidate>

        {/* ════ TAB : INFORMATIONS ════ */}
        {activeTab === "info" && (
          <div className={styles.section}>

            {/* Avatar */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrap}>
                {avatar ? (
                  <img src={avatar} alt="avatar" className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarInitials}>{initials}</div>
                )}
                <button
                  type="button"
                  className={styles.avatarEditBtn}
                  onClick={() => fileRef.current?.click()}
                  title="Changer la photo"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="13" height="13">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
              <div className={styles.avatarMeta}>
                <span className={styles.avatarName}>{form.firstName} {form.lastName}</span>
                <span className={styles.avatarHandle}>@{form.username}</span>
                <button type="button" className={styles.avatarChangeBtn} onClick={() => fileRef.current?.click()}>
                  Changer la photo
                </button>
              </div>
            </div>

            <div className={styles.divider} />

            {/* Grille champs */}
            <div className={styles.sectionLabel}>Informations personnelles</div>
            <div className={styles.grid2}>
              <Field label="Prénom" error={errors.firstName}>
                <input className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
                  value={form.firstName} onChange={set("firstName")} placeholder="Votre prénom" />
              </Field>
              <Field label="Nom" error={errors.lastName}>
                <input className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}
                  value={form.lastName} onChange={set("lastName")} placeholder="Votre nom" />
              </Field>
            </div>

            <div className={styles.grid2}>
              <Field label="Nom d'utilisateur" error={errors.username}>
                <div className={styles.inputAddon}>
                  <span className={styles.addon}>@</span>
                  <input className={`${styles.input} ${styles.inputWithAddon} ${errors.username ? styles.inputError : ""}`}
                    value={form.username} onChange={set("username")} placeholder="nom_utilisateur" />
                </div>
              </Field>
              <Field label="Email" error={errors.email}>
                <input className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  type="email" value={form.email} onChange={set("email")} placeholder="vous@exemple.com" />
              </Field>
            </div>

            <div className={styles.grid2}>
              <Field label="Téléphone">
                <input className={styles.input} value={form.phone} onChange={set("phone")} placeholder="+212 6 00 00 00 00" />
              </Field>
              <Field label="Site web">
                <input className={styles.input} value={form.website} onChange={set("website")} placeholder="https://monsite.com" />
              </Field>
            </div>

            <Field label={<span>Bio <span className={styles.charCount}>{form.bio.length}/160</span></span>} error={errors.bio}>
              <textarea
                className={`${styles.textarea} ${errors.bio ? styles.inputError : ""}`}
                value={form.bio}
                onChange={set("bio")}
                rows={3}
                placeholder="Parlez de vous en quelques mots…"
              />
            </Field>

            <div className={styles.divider} />

            <div className={styles.sectionLabel}>Localisation</div>
            <div className={styles.grid2}>
              <Field label="Pays">
                <select className={styles.select} value={form.country} onChange={set("country")}>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Ville">
                <input className={styles.input} value={form.city} onChange={set("city")} placeholder="Votre ville" />
              </Field>
            </div>
          </div>
        )}

        {/* ════ TAB : SÉCURITÉ ════ */}
        {activeTab === "security" && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Changer le mot de passe</div>
            <div className={styles.securityNote}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="15" height="15">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Pour changer votre mot de passe, utilisez le lien de réinitialisation envoyé à votre email.
            </div>
            <Field label="Mot de passe actuel">
              <input className={styles.input} type="password" placeholder="••••••••" />
            </Field>
            <div className={styles.grid2}>
              <Field label="Nouveau mot de passe">
                <input className={styles.input} type="password" placeholder="Min. 8 caractères" />
              </Field>
              <Field label="Confirmer">
                <input className={styles.input} type="password" placeholder="Répétez le mot de passe" />
              </Field>
            </div>

            <div className={styles.divider} />
            <div className={styles.sectionLabel}>Sessions actives</div>
            <div className={styles.sessionCard}>
              <div className={styles.sessionDot} />
              <div>
                <div className={styles.sessionDevice}>Cet appareil · Chrome / Windows</div>
                <div className={styles.sessionTime}>Connecté maintenant · Tanger, Maroc</div>
              </div>
              <span className={styles.sessionBadge}>Actif</span>
            </div>
          </div>
        )}

        {/* ════ TAB : PRÉFÉRENCES ════ */}
        {activeTab === "preferences" && (
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Langue & région</div>
            <div className={styles.grid2}>
              <Field label="Langue de l'interface">
                <select className={styles.select} value={form.language} onChange={set("language")}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>

            <div className={styles.divider} />
            <div className={styles.sectionLabel}>Notifications</div>
            {[
              { key: "notifEmail",   label: "Notifications par email",     desc: "Recevez les updates importantes par email" },
              { key: "notifVoyage",  label: "Activité sur mes voyages",    desc: "Commentaires, likes et partages" },
              { key: "notifCommu",   label: "Activité communauté",         desc: "Réponses à vos posts et follows" },
              { key: "notifPromo",   label: "Offres et nouveautés",        desc: "Promotions et nouvelles fonctionnalités" },
            ].map(({ key, label, desc }) => (
              <ToggleRow key={key} label={label} desc={desc} />
            ))}

            <div className={styles.divider} />
            <div className={styles.sectionLabel}>Confidentialité</div>
            {[
              { key: "privProfil",  label: "Profil public",               desc: "Visible par tous les membres" },
              { key: "privVoyages", label: "Voyages publics par défaut",   desc: "Les nouveaux voyages seront publics" },
            ].map(({ key, label, desc }) => (
              <ToggleRow key={key} label={label} desc={desc} defaultOn />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className={styles.globalError}>
            Une erreur est survenue. Veuillez réessayer.
          </div>
        )}
      </form>
    </div>
  );
}

/* ── Sous-composants internes ── */
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1rem" }}>
      <label style={{ fontSize: "11.5px", fontWeight: 500, color: "rgba(170,200,235,0.65)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: "12px", color: "#f09595" }}>{error}</span>}
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}>
      <div>
        <div style={{ fontSize: "14px", color: "#ddeeff", marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "12px", color: "rgba(170,200,235,0.45)" }}>{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        style={{
          width: "40px", height: "22px", borderRadius: "99px", border: "none", cursor: "pointer",
          background: on ? "linear-gradient(135deg,#378ADD,#185FA5)" : "rgba(255,255,255,0.1)",
          position: "relative", transition: "background 0.25s", flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: "3px",
          left: on ? "21px" : "3px",
          width: "16px", height: "16px", borderRadius: "50%",
          background: "#fff", transition: "left 0.25s",
        }} />
      </button>
    </div>
  );
}