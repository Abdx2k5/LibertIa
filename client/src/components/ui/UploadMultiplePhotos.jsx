// =============================================================
// FICHIER  : src/components/ui/UploadMultiplePhotos.jsx
// TÂCHE    : T77 — Upload multiple photos avec compression
//
// Permet de sélectionner / glisser-déposer plusieurs photos,
// les compresse côté client (Canvas API, 1920px max, JPEG 0.8)
// puis les envoie une à une vers POST /api/dossiers/:folderId/photos
// (endpoint T79 — body JSON { data: <dataURL base64>, caption }).
//
// PROPS :
//   - onUploadComplete(uploadedPhotos) → appelé une fois l'envoi
//     du lot terminé, avec la liste des photos envoyées avec succès
//   - maxFiles  → nombre max de photos (défaut 10)
//   - folderId  → id du carnet (Dossier) cible
// =============================================================

import { useCallback, useRef, useState } from "react";
import api from "../../services/api";
import styles from "./UploadMultiplePhotos.module.css";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo avant compression
const MAX_DIMENSION = 1920; // px sur le plus grand côté
const JPEG_QUALITY = 0.8;

// ── Icônes inline (T77) ──
const UploadCloudIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 18a4.5 4.5 0 0 1-1.5-8.74A6 6 0 0 1 17.32 7H18a4 4 0 0 1 0 8h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 12v7m0-7-3 3m3-3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RetryIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Formate une taille en octets ("2.4MB" / "380KB") ──
function formatSize(bytes) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes}o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Convertit un Blob en data URL base64 — format attendu par
//    POST /api/dossiers/:id/photos ({ data: <dataURL>, caption }) ──
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(blob);
  });
}

// ── Compresse une image via Canvas : redimensionne à 1920px max sur le
//    plus grand côté, réexporte en JPEG qualité 0.8 ──
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Compression de l'image impossible"));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image invalide ou illisible"));
    };

    img.src = objectUrl;
  });
}

export default function UploadMultiplePhotos({ onUploadComplete, maxFiles = 10, folderId }) {
  const [items, setItems] = useState([]);
  const [rejections, setRejections] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const openPicker = () => inputRef.current?.click();

  // ── Compresse un fichier et met à jour son état dans la liste ──
  const runCompression = useCallback(async (item) => {
    try {
      const blob = await compressImage(item.file);
      const previewUrl = URL.createObjectURL(blob);
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, compressedBlob: blob, compressedSize: blob.size, previewUrl, status: "ready", stage: null, error: null }
            : it
        )
      );
    } catch (err) {
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, status: "error", stage: "compress", error: err.message || "Compression impossible" }
            : it
        )
      );
    }
  }, []);

  // ── Valide puis ajoute les fichiers sélectionnés / déposés ──
  const handleFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList || []);
      if (incoming.length === 0) return;

      const newRejections = [];
      const accepted = [];
      let availableSlots = Math.max(0, maxFiles - items.length);

      for (const file of incoming) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          newRejections.push({ id: createId(), name: file.name, reason: "Format non supporté (JPG, PNG ou WEBP uniquement)" });
          continue;
        }
        if (file.size > MAX_SIZE_BYTES) {
          newRejections.push({ id: createId(), name: file.name, reason: "Fichier trop volumineux (10 Mo max)" });
          continue;
        }
        if (availableSlots <= 0) {
          newRejections.push({ id: createId(), name: file.name, reason: `Nombre maximum de photos atteint (${maxFiles})` });
          continue;
        }
        availableSlots -= 1;
        accepted.push(file);
      }

      setRejections(newRejections);
      if (accepted.length === 0) return;

      const pendingItems = accepted.map((file) => ({
        id: createId(),
        file,
        originalSize: file.size,
        compressedBlob: null,
        compressedSize: null,
        previewUrl: null,
        status: "compressing",
        stage: null,
        progress: 0,
        error: null,
        photo: null,
      }));

      setItems((prev) => [...prev, ...pendingItems]);
      pendingItems.forEach((item) => runCompression(item));
    },
    [items.length, maxFiles, runCompression]
  );

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeItem = (id) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((it) => it.id !== id);
    });
  };

  // ── Téléverse un fichier compressé vers /api/dossiers/:folderId/photos ──
  const uploadItem = useCallback(
    async (item) => {
      if (!item.compressedBlob || !folderId) return null;

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "uploading", progress: 0, error: null, stage: null } : it))
      );

      try {
        const dataUrl = await blobToDataUrl(item.compressedBlob);
        const response = await api.post(
          `/api/dossiers/${folderId}/photos`,
          { data: dataUrl, caption: "" },
          {
            onUploadProgress: (evt) => {
              const progress = evt.total ? Math.round((evt.loaded * 100) / evt.total) : 0;
              setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, progress } : it)));
            },
          }
        );

        const photo = response?.data?.photo || null;
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: "success", progress: 100, photo } : it))
        );
        return photo;
      } catch (err) {
        const message = err.response?.data?.message || "Échec de l'envoi, veuillez réessayer";
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: "error", stage: "upload", progress: 0, error: message } : it))
        );
        return null;
      }
    },
    [folderId]
  );

  const retryItem = (item) => {
    if (item.stage === "compress") {
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: "compressing", error: null, stage: null } : it)));
      runCompression(item);
    } else {
      uploadItem(item);
    }
  };

  const handleUploadAll = async () => {
    if (!folderId) return;
    setIsUploading(true);

    const toUpload = items.filter((it) => it.status === "ready" || (it.status === "error" && it.stage === "upload"));
    const uploaded = [];

    for (const item of toUpload) {
      const photo = await uploadItem(item);
      if (photo) uploaded.push(photo);
    }

    setIsUploading(false);
    onUploadComplete?.(uploaded);
  };

  const uploadableCount = items.filter((it) => it.status === "ready" || (it.status === "error" && it.stage === "upload")).length;
  const uploadDisabled = items.length === 0 || uploadableCount === 0 || isUploading || !folderId;

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`}
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
      >
        <span className={styles.dropzoneIcon}>
          <UploadCloudIcon />
        </span>
        <p className={styles.dropzoneText}>Glissez vos photos ici ou cliquez pour sélectionner</p>
        <p className={styles.dropzoneHint}>JPG, PNG ou WEBP — 10 Mo max par fichier</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={handleInputChange}
        />
      </div>

      {!folderId && (
        <p className={styles.notice}>Sélectionnez un carnet de voyage pour téléverser vos photos.</p>
      )}

      {rejections.length > 0 && (
        <ul className={styles.rejectionList}>
          {rejections.map((r) => (
            <li key={r.id} className={styles.rejectionItem}>
              <strong>{r.name}</strong> — {r.reason}
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.thumb}>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeItem(item.id)}
                title="Retirer cette photo"
                aria-label={`Retirer ${item.file.name}`}
              >
                <CloseIcon />
              </button>

              {item.previewUrl ? (
                <img src={item.previewUrl} alt={item.file.name} className={styles.thumbImg} />
              ) : (
                <div className={styles.thumbPlaceholder} />
              )}

              <div className={styles.thumbInfo}>
                <span className={styles.thumbName} title={item.file.name}>{item.file.name}</span>
                <span className={styles.thumbSize}>
                  {item.compressedSize != null
                    ? `${formatSize(item.originalSize)} → ${formatSize(item.compressedSize)}`
                    : formatSize(item.originalSize)}
                </span>
              </div>

              {(item.status === "uploading" || item.status === "success") && (
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${item.status === "success" ? 100 : item.progress}%` }}
                  />
                </div>
              )}

              {item.status === "compressing" && (
                <div className={styles.thumbStatus} role="status">
                  <span className={styles.spinner} />
                  Compression...
                </div>
              )}

              {item.status === "success" && (
                <div className={`${styles.thumbStatus} ${styles.thumbSuccess}`} role="status">
                  <CheckIcon /> Envoyée
                </div>
              )}

              {item.status === "error" && (
                <div className={`${styles.thumbStatus} ${styles.thumbError}`} role="status">
                  <span className={styles.thumbErrorMsg}>
                    <ErrorIcon /> {item.error}
                  </span>
                  <button type="button" className={styles.retryBtn} onClick={() => retryItem(item)}>
                    <RetryIcon /> Réessayer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button type="button" className={styles.uploadBtn} onClick={handleUploadAll} disabled={uploadDisabled}>
        {isUploading ? "Envoi en cours..." : `Téléverser ${uploadableCount} photo${uploadableCount === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
