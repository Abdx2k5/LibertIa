// =============================================================
// FICHIER  : src/components/ui/GaleriePhoto.jsx
// TÂCHE    : T76 — Galerie de photos avec lightbox
//
// PROPS    :
//   - photos     : tableau d'objets { id, url, titre, lieu, date }
//   - colonnes   : nombre de colonnes (défaut: 3)
//
// FEATURES :
//   - Grille CSS masonry avec gap 8px
//   - Hover overlay avec titre + lieu + date + fullscreen icon
//   - Click → Lightbox (Portal)
//   - Lightbox: prev/next arrows, counter, ESC key, keyboard nav
//   - Smooth fade transitions
// =============================================================

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./GaleriePhoto.module.css";

export default function GaleriePhoto({ photos = [], colonnes = 3 }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── Gestion lightbox ──
  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // ── Gestion clavier ──
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goNext, goPrev]);

  const current = photos[currentIndex];

  return (
    <>
      {/* ── Grille de photos ── */}
      <div
        className={styles.galerie}
        style={{ gridTemplateColumns: `repeat(${colonnes}, 1fr)` }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={styles.photoCell}
            onClick={() => openLightbox(index)}
          >
            <div
              className={styles.photoImg}
              style={
                photo.url
                  ? { backgroundImage: `url(${photo.url})` }
                  : {
                      background: "linear-gradient(135deg, #2a2b35, #1e1f27)",
                    }
              }
            />
            <div className={styles.overlay}>
              <div className={styles.overlayContent}>
                <h3 className={styles.overlayTitre}>{photo.titre}</h3>
                <p className={styles.overlayMeta}>
                  {photo.lieu} • {photo.date}
                </p>
              </div>
              <div className={styles.fullscreenIcon}>⛶</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Lightbox Portal ── */}
      {lightboxOpen &&
        createPortal(
          <div className={styles.lightboxBackdrop} onClick={closeLightbox}>
            <div className={styles.lightbox} onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button className={styles.closeBtn} onClick={closeLightbox}>
                ✕
              </button>

              {/* Counter */}
              <div className={styles.counter}>
                {currentIndex + 1} / {photos.length}
              </div>

              {/* Image container */}
              <div className={styles.lightboxImageContainer}>
                {current && (
                  <div
                    className={styles.lightboxImage}
                    style={
                      current.url
                        ? { backgroundImage: `url(${current.url})` }
                        : {
                            background:
                              "linear-gradient(135deg, #2a2b35, #1e1f27)",
                          }
                    }
                  />
                )}
              </div>

              {/* Info bottom-left */}
              {current && (
                <div className={styles.lightboxInfo}>
                  <h2 className={styles.lightboxTitre}>{current.titre}</h2>
                  <p className={styles.lightboxMeta}>
                    {current.lieu} • {current.date}
                  </p>
                </div>
              )}

              {/* Navigation arrows */}
              <button
                className={`${styles.navBtn} ${styles.prevBtn}`}
                onClick={goPrev}
              >
                ←
              </button>
              <button
                className={`${styles.navBtn} ${styles.nextBtn}`}
                onClick={goNext}
              >
                →
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
