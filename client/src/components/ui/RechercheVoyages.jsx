import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./RechercheVoyages.module.css";

const FILTERS = [
  { id: "tous", label: "Tous" },
  { id: "Europe", label: "Europe" },
  { id: "Asie", label: "Asie" },
  { id: "Amérique", label: "Amérique" },
  { id: "Afrique", label: "Afrique" },
  { id: "Solo", label: "Solo" },
  { id: "Groupe", label: "Groupe" },
  { id: "Budget", label: "Budget" },
];

const SORT_OPTIONS = [
  { id: "recent", label: "Plus récent" },
  { id: "budget-asc", label: "Budget croissant" },
  { id: "budget-desc", label: "Budget décroissant" },
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatBudget(value) {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString("fr-FR")} €`;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getSortLabel(sortId) {
  return SORT_OPTIONS.find((option) => option.id === sortId)?.label || SORT_OPTIONS[0].label;
}

function matchesFilter(voyage, activeFilter) {
  if (activeFilter === "tous") return true;
  if (activeFilter === "Budget") return Number(voyage.budget) <= 1000;
  return voyage.continent === activeFilter || voyage.type === activeFilter;
}

function sortVoyages(voyages, sortId) {
  const sorted = [...voyages];

  if (sortId === "budget-asc") {
    sorted.sort((a, b) => Number(a.budget) - Number(b.budget));
  } else if (sortId === "budget-desc") {
    sorted.sort((a, b) => Number(b.budget) - Number(a.budget));
  } else {
    sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return sorted;
}

export default function RechercheVoyages({ voyages = [], onFilter }) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("tous");
  const [sortId, setSortId] = useState("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const filteredVoyages = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    const filtered = voyages.filter((voyage) => {
      const searchable = normalizeText(
        `${voyage.destination} ${voyage.continent} ${voyage.type}`
      );
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      return matchesQuery && matchesFilter(voyage, activeFilter);
    });

    return sortVoyages(filtered, sortId);
  }, [voyages, query, activeFilter, sortId]);

  useEffect(() => {
    onFilter?.(filteredVoyages);
  }, [filteredVoyages, onFilter]);

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
    <section className={styles.card} aria-label="Recherche de voyages">
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
          placeholder="Rechercher une destination, un pays..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Rechercher une destination, un pays"
        />

        {query.trim() ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearQuery}
            aria-label="Effacer la recherche"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.pillsScroll} role="tablist" aria-label="Filtres de voyage">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`${styles.pill} ${activeFilter === filter.id ? styles.pillActive : ""}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
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
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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

      <div className={styles.summary}>
        <span>{filteredVoyages.length} voyage{filteredVoyages.length > 1 ? "s" : ""} trouvé{filteredVoyages.length > 1 ? "s" : ""}</span>
        <span>{getSortLabel(sortId)}</span>
      </div>

      <div className={styles.grid}>
        {filteredVoyages.map((voyage) => (
          <article key={voyage.id} className={styles.voyageCard}>
            <div className={styles.voyageTop}>
              <h3 className={styles.destination}>{voyage.destination}</h3>
              <span className={styles.budget}>{formatBudget(voyage.budget)}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaTag}>{voyage.continent}</span>
              <span className={styles.metaTag}>{voyage.type}</span>
              <span className={styles.metaDate}>{formatDate(voyage.date)}</span>
            </div>
          </article>
        ))}

        {!filteredVoyages.length ? (
          <div className={styles.emptyState}>
            Aucun voyage ne correspond à votre recherche.
          </div>
        ) : null}
      </div>
    </section>
  );
}
