import { useRef, useState } from "react";
import styles from "./UploadPhoto.module.css";

const IconCamera = (p) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
  </svg>
);
const IconCheck = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

export default function UploadPhoto({ currentPhoto, onUpload, size = 96, name = "", disabled = false }) {
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const preview = currentPhoto || null;

  const openPicker = () => {
    if (disabled || status !== "idle") return;
    inputRef.current?.click();
  };

  const handleSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    const isValidSize = file.size <= 5 * 1024 * 1024;

    if (!isValidType) {
      setError("Format invalide. JPG, PNG ou WEBP uniquement.");
      return;
    }

    if (!isValidSize) {
      setError("Fichier trop lourd. Maximum 5 Mo.");
      return;
    }

    setError("");
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setStatus("uploading");

    try {
      await Promise.resolve(onUpload?.(file));
      setStatus("success");
      timerRef.current = window.setTimeout(() => {
        setStatus("idle");
        timerRef.current = null;
      }, 1500);
    } catch (uploadError) {
      setStatus("idle");
      setError("Impossible d’envoyer la photo.");
      console.error(uploadError);
    }
  };

  const isImage = Boolean(preview);
  const initials = getInitials(name);
  const showHover = status === "idle" && !disabled;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        style={{ width: size, height: size }}
        onClick={openPicker}
        aria-label="Changer la photo de profil"
        disabled={disabled || status !== "idle"}
        aria-busy={status === "uploading"}
      >
        {isImage ? (
          <img src={preview} alt={name || "Photo de profil"} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.initials} style={{ fontSize: Math.round(size * 0.34) }}>
              {initials}
            </span>
          </div>
        )}

        {showHover && (
          <div className={styles.hoverOverlay} aria-hidden="true">
            <span className={styles.camera}><IconCamera /></span>
            <span className={styles.hoverText}>Changer</span>
          </div>
        )}

        {status === "uploading" && (
          <span className={styles.loadingOverlay} aria-hidden="true">
            <span className={styles.loadingRing} />
          </span>
        )}

        {status === "success" && (
          <span className={styles.successOverlay} aria-hidden="true">
            <span className={styles.successCheck}><IconCheck /></span>
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.input}
        onChange={handleSelect}
      />

      {error ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}
