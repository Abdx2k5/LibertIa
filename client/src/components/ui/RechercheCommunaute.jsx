// =============================================================
// FICHIER  : src/components/ui/RechercheCommunaute.jsx
// TÂCHE    : T67 — Recherche communautaire (M4)
//
// Barre de recherche + filtres (catégorie, type) + tri pour la
// communauté (groupes / membres). Calqué sur RechercheVoyages.
//
// PROPS :
//   - items      → array d'éléments communautaires
//                  format : { id, nom, localisation, categorie, type,
//                  membres, date|createdAt, tags[] }
//   - categories → string[] (optionnel) — défaut : déduit des items
//   - onFilter   → function(filtered) — appelé à chaque changement
// =============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./RechercheCommunaute.module.css";

const TYPES = [
  { id: "tous", label: "Tous" },
  { id: "Public", label: "Public" },
  { id: "Privé", label: "Privé" },
];

const SORT_OPTIONS = [
  { id: "membres", label: "Plus de membres" },
  { id: "recent", label: "Plus récent" },
  { id: "alpha", label: "Ordre A→Z" },
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function getSortLabel(sortId) {
  return SORT_OPTIONS.find((option) => option.id === sortId)?.label || SORT_OPTIONS[0].label;
}

function sortItems(items, sortId) {
  const sorted = [...items];
  if (sortId === "membres") {
    sorted.sort((a, b) => (Number(b.membres) || 0) - (Number(a.membres) || 0));
  } else if (sortId === "alpha") {
    sorted.sort((a, b) => String(a.nom || "").localeCompare(String(b.nom || ""), "fr"));
  } else {
    sorted.sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0).getTime() -
        new Date(a.date || a.createdAt || 0).getTime()
    );
  }
  return sorted;
}

export default function RechercheCommunaute({ items = [], categories, onFilter }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [activeType, setActiveType] = useState("tous");
  const [sortId, setSortId] = useState("membres");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const categoryList = useMemo(() => {
    if (categories && categories.length) return categories;
    const set = new Set(items.map((item) => item.categorie).filter(Boolean));
    return ["Tous", ...Array.from(set)];
  }, [categories, items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    const filtered = items.filter((item) => {
      const searchable = normalizeText(
        `${item.nom} ${item.localisation} ${(item.tags || []).join(" ")}`
      );
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesCategory = activeCategory === "Tous" || item.categorie === activeCategory;
      const matchesType = activeType === "tous" || item.type === activeType;
      return matchesQuery && matchesCategory && matchesType;
    });

    return sortItems(filtered, sortId);
  }, [items, query, activeCategory, activeType, sortId]);

  useEffect(() => {
    onFilter?.(filteredItems);
  }, [filteredItems, onFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearQuery = () => setQuery("");

  return (
    <section className={styles.card} aria-label="Recherche communautaire">
      <div className={styles.searchBar}>
        <span className={styles.searchIcon} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Rechercher un groupe, une destination, un thème..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Rechercher dans la communauté"
        />

        {query.trim() ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearQuery}
            aria-label="Effacer la recherche"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.pillsScroll} role="tablist" aria-label="Filtres de catégorie">
          {categoryList.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.sortWrap} ref={sortRef}>
          <button
            type="button"
            className={styles.sortButton}
            onClick={() => setSortOpen((value) => !value)}
            aria-expanded={sortOpen}
            aria-haspopup="menu"
          >
            <span>Tri</span>
            <span className={styles.sortLabel}>{getSortLabel(sortId)}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {sortOpen ? (
            <div className={styles.sortMenu} role="menu">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.sortItem} ${sortId === option.id ? styles.sortItemActive : ""}`}
                  onClick={() => {
                    setSortId(option.id);
                    setSortOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.typeRow} role="tablist" aria-label="Filtres de type">
        {TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`${styles.typePill} ${activeType === type.id ? styles.typePillActive : ""}`}
            onClick={() => setActiveType(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className={styles.summary}>
        <span>
          {filteredItems.length} résultat{filteredItems.length > 1 ? "s" : ""}
        </span>
        <span>{getSortLabel(sortId)}</span>
      </div>
    </section>
  );
}
