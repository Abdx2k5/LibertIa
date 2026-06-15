// =============================================================
// FICHIER  : src/components/ui/CarteMapbox.jsx
// TÂCHES   : T44 — Carte interactive des voyages
//            T85 — Carte des souvenirs géolocalisés
//
// PROPS    :
//   - points       : tableau de { id, lat, lng, title, subtitle, onClick }
//   - height       : hauteur de la carte (px ou unité CSS, défaut 420)
//   - emptyMessage : message affiché quand `points` est vide
//   - className    : classes additionnelles
//
// Affiche un message de repli (liste des lieux) si la variable
// d'environnement VITE_MAPBOX_TOKEN n'est pas configurée ou si
// l'initialisation de la carte échoue.
// =============================================================

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./CarteMapbox.module.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

const MarkerPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" fill="#aa3bff" stroke="#16171d" strokeWidth="1.5" />
    <circle cx="12" cy="10" r="2.5" fill="#16171d" />
  </svg>
);

const MapPlaceholderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"
      stroke="#6b7280"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function echapperHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function CarteMapbox({
  points = [],
  height = 420,
  emptyMessage = "Aucun lieu à afficher pour le moment.",
  className = "",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [erreur, setErreur] = useState(null);

  // ── Initialisation de la carte (une seule fois) ──
  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || mapRef.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [10, 20],
        zoom: 1.2,
      });

      // Erreurs asynchrones (jeton invalide, style indisponible...)
      map.on("error", (e) => {
        setErreur(e?.error?.message || "Erreur de chargement de la carte");
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      mapRef.current = map;
    } catch (err) {
      const message = err.message || "Erreur d'initialisation de la carte";
      // Différé pour éviter un setState synchrone dans l'effet
      queueMicrotask(() => setErreur(message));
    }

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Mise à jour des marqueurs lorsque `points` change ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const placerMarqueurs = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const valides = points.filter((p) => p.lat != null && p.lng != null);
      if (valides.length === 0) return;

      valides.forEach((p) => {
        const el = document.createElement("div");
        el.className = styles.marker;
        el.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" fill="#aa3bff" stroke="#16171d" stroke-width="1.5"/><circle cx="12" cy="10" r="2.5" fill="#16171d"/></svg>`;

        const popup = new mapboxgl.Popup({ offset: 22, closeButton: false, className: styles.popup }).setHTML(
          `<div class="${styles.popupContent}">
             <strong>${echapperHtml(p.title)}</strong>
             ${p.subtitle ? `<span>${echapperHtml(p.subtitle)}</span>` : ""}
           </div>`
        );

        const marker = new mapboxgl.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map);

        if (p.onClick) {
          el.style.cursor = "pointer";
          el.addEventListener("click", () => p.onClick(p));
        }

        markersRef.current.push(marker);
      });

      if (valides.length === 1) {
        map.flyTo({ center: [valides[0].lng, valides[0].lat], zoom: 5 });
      } else {
        const bounds = new mapboxgl.LngLatBounds();
        valides.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 10 });
      }
    };

    if (map.isStyleLoaded()) {
      placerMarqueurs();
    } else {
      map.once("load", placerMarqueurs);
    }
  }, [points]);

  // ── Repli : pas de jeton Mapbox ou erreur d'initialisation ──
  if (!MAPBOX_TOKEN || erreur) {
    return (
      <div className={`${styles.fallback} ${className}`} style={{ minHeight: height }}>
        <MapPlaceholderIcon />
        <p className={styles.fallbackTitle}>Carte interactive indisponible</p>
        <p className={styles.fallbackText}>
          {erreur
            ? "La carte n'a pas pu être chargée."
            : "Configurez une clé Mapbox (VITE_MAPBOX_TOKEN) pour activer la carte interactive."}
        </p>
        {points.length > 0 && (
          <ul className={styles.fallbackList}>
            {points.map((p) => (
              <li key={p.id} className={styles.fallbackItem}>
                <span className={styles.fallbackPin}>
                  <MarkerPinIcon />
                </span>
                <span>
                  {p.title}
                  {p.subtitle ? ` — ${p.subtitle}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${className}`} style={{ height }}>
      <div ref={containerRef} className={styles.map} />
      {points.length === 0 && (
        <div className={styles.emptyOverlay}>
          <MapPlaceholderIcon />
          <p className={styles.fallbackText}>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
