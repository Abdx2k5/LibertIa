// =============================================================
// FICHIER  : src/pages/community/Forums.jsx
// TÂCHE    : T60 — Page des forums (Community discussions)
//
// Liste les discussions de la communauté : recherche, filtres par
// catégorie, tri, et composer pour démarrer un nouveau sujet.
// Données mock (forumData.js) en attendant le backend.
// =============================================================

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Forums.module.css";
import {
  FORUM_CATEGORIES,
  FORUM_SORTS,
  FORUM_STATS,
  TOP_CONTRIBUTORS,
  getAllThreads,
} from "../../mocks/forumData";
import { ROUTES } from "../../utils/constants";

function initials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

function categoryLabel(id) {
  return FORUM_CATEGORIES.find((c) => c.id === id)?.label || id;
}

function formatCount(value) {
  if (value == null) return "0";
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, "")}k`;
}

export default function Forums() {
  const navigate = useNavigate();

  const [threads, setThreads] = useState(getAllThreads);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("tous");
  const [sort, setSort] = useState("recent");
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState({ titre: "", categorie: "destinations", contenu: "" });

  // compteurs par catégorie (pour la sidebar)
  const categoryCounts = useMemo(() => {
    const counts = { tous: threads.length };
    for (const t of threads) counts[t.categorie] = (counts[t.categorie] || 0) + 1;
    return counts;
  }, [threads]);

  const visibleThreads = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = threads.filter((t) => {
      const matchesCategory = activeCategory === "tous" || t.categorie === activeCategory;
      const matchesSearch =
        !query ||
        t.titre.toLowerCase().includes(query) ||
        t.extrait.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      // les sujets épinglés restent toujours en tête
      if (a.epingle !== b.epingle) return a.epingle ? -1 : 1;
      if (sort === "populaire") return b.votes - a.votes;
      if (sort === "sans_reponse") return a.reponses - b.reponses;
      return a.derniereActiviteTs - b.derniereActiviteTs; // récents
    });

    return sorted;
  }, [threads, activeCategory, search, sort]);

  const handleCreate = (event) => {
    event.preventDefault();
    const titre = draft.titre.trim();
    if (!titre) return;

    const thread = {
      id: `local-${Date.now()}`,
      titre,
      extrait: draft.contenu.trim() || "Nouvelle discussion lancée par la communauté.",
      auteur: { nom: "Vous", badge: "Membre" },
      categorie: draft.categorie,
      tags: [],
      reponses: 0,
      vues: 0,
      votes: 0,
      derniereActivite: "à l'instant",
      derniereActiviteTs: 0,
      epingle: false,
      populaire: false,
      resolu: false,
      isOwn: true,
    };

    setThreads((prev) => [thread, ...prev]);
    setDraft({ titre: "", categorie: "destinations", contenu: "" });
    setComposerOpen(false);
    setActiveCategory("tous");
    setSort("recent");
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* ── HERO ── */}
        <header className={styles.heroCard}>
          <button type="button" className={styles.backLink} onClick={() => navigate(ROUTES.COMMUNITY)}>
            ‹ Retour à la communauté
          </button>

          <div className={styles.heroTop}>
            <div className={styles.heroText}>
              <span className={styles.heroKicker}>Communauté</span>
              <h1 className={styles.heroTitle}>
                Forums de <span>discussion</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Posez vos questions, partagez vos expériences et trouvez des réponses
                auprès de milliers de voyageurs Libertia.
              </p>
            </div>

            <button
              type="button"
              className={styles.newButton}
              onClick={() => setComposerOpen((v) => !v)}
            >
              ＋ Nouvelle discussion
            </button>
          </div>

          <input
            type="text"
            className={styles.searchInput}
            placeholder="Rechercher une discussion, un sujet, un tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className={styles.statsRow}>
            {FORUM_STATS.map((stat) => (
              <div key={stat.label} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* ── Composer de nouvelle discussion ── */}
        {composerOpen && (
          <form className={styles.composer} onSubmit={handleCreate}>
            <input
              type="text"
              className={styles.composerTitle}
              placeholder="Titre de votre discussion"
              value={draft.titre}
              onChange={(e) => setDraft((d) => ({ ...d, titre: e.target.value }))}
              autoFocus
            />
            <div className={styles.composerRow}>
              <select
                className={styles.composerSelect}
                value={draft.categorie}
                onChange={(e) => setDraft((d) => ({ ...d, categorie: e.target.value }))}
              >
                {FORUM_CATEGORIES.filter((c) => c.id !== "tous").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className={styles.composerText}
              placeholder="Décrivez votre question ou votre sujet..."
              rows={3}
              value={draft.contenu}
              onChange={(e) => setDraft((d) => ({ ...d, contenu: e.target.value }))}
            />
            <div className={styles.composerActions}>
              <button type="button" className={styles.composerCancel} onClick={() => setComposerOpen(false)}>
                Annuler
              </button>
              <button type="submit" className={styles.composerPublish} disabled={!draft.titre.trim()}>
                Publier la discussion
              </button>
            </div>
          </form>
        )}

        <div className={styles.layout}>
          {/* ── COLONNE PRINCIPALE ── */}
          <section className={styles.mainColumn}>
            <div className={styles.filterTabs} aria-label="Filtrer par catégorie">
              {FORUM_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.filterTab} ${cat.id === activeCategory ? styles.filterTabActive : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className={styles.filterIcon}>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            <div className={styles.toolbar}>
              <span className={styles.resultCount}>
                {visibleThreads.length} discussion{visibleThreads.length > 1 ? "s" : ""}
              </span>
              <div className={styles.sortTabs} role="group" aria-label="Trier">
                {FORUM_SORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.sortTab} ${s.id === sort ? styles.sortTabActive : ""}`}
                    onClick={() => setSort(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {visibleThreads.length === 0 ? (
              <div className={styles.emptyState}>Aucune discussion ne correspond à votre recherche.</div>
            ) : (
              <ul className={styles.threadList}>
                {visibleThreads.map((t) => (
                  <li key={t.id}>
                    <article className={styles.thread}>
                      <div className={styles.votes}>
                        <span className={styles.votesArrow}>▲</span>
                        <span className={styles.votesCount}>{formatCount(t.votes)}</span>
                        <span className={styles.votesLabel}>votes</span>
                      </div>

                      <div className={styles.threadBody}>
                        <div className={styles.threadBadges}>
                          {t.epingle && <span className={`${styles.badge} ${styles.badgePin}`}>📌 Épinglé</span>}
                          {t.populaire && <span className={`${styles.badge} ${styles.badgeHot}`}>🔥 Populaire</span>}
                          {t.resolu && <span className={`${styles.badge} ${styles.badgeSolved}`}>✓ Résolu</span>}
                          {t.reponses === 0 && !t.resolu && (
                            <span className={`${styles.badge} ${styles.badgeUnanswered}`}>Sans réponse</span>
                          )}
                        </div>

                        <h3 className={styles.threadTitle}>{t.titre}</h3>
                        <p className={styles.threadExcerpt}>{t.extrait}</p>

                        {t.tags.length > 0 && (
                          <div className={styles.tagRow}>
                            {t.tags.map((tag) => (
                              <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                          </div>
                        )}

                        <div className={styles.threadMeta}>
                          <span className={styles.authorChip}>
                            <span className={styles.authorAvatar}>{initials(t.auteur.nom)}</span>
                            <span className={styles.authorName}>{t.auteur.nom}</span>
                            {t.auteur.badge && <span className={styles.authorBadge}>{t.auteur.badge}</span>}
                          </span>
                          <span className={styles.metaDot}>·</span>
                          <span className={styles.metaCat}>{categoryLabel(t.categorie)}</span>
                          <span className={styles.metaDot}>·</span>
                          <span className={styles.metaTime}>{t.derniereActivite}</span>
                        </div>
                      </div>

                      <div className={styles.threadStats}>
                        <div className={styles.statBlock}>
                          <span className={styles.statBig}>{formatCount(t.reponses)}</span>
                          <span className={styles.statSmall}>réponses</span>
                        </div>
                        <div className={styles.statBlock}>
                          <span className={styles.statBig}>{formatCount(t.vues)}</span>
                          <span className={styles.statSmall}>vues</span>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── SIDEBAR ── */}
          <aside className={styles.sidebar}>
            <section className={styles.sidebarCard}>
              <h2 className={styles.sidebarTitle}>Catégories</h2>
              <div className={styles.catList}>
                {FORUM_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`${styles.catRow} ${cat.id === activeCategory ? styles.catRowActive : ""}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className={styles.catIcon}>{cat.icon}</span>
                    <span className={styles.catLabel}>{cat.label}</span>
                    <span className={styles.catCount}>{categoryCounts[cat.id] || 0}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.sidebarCard}>
              <h2 className={styles.sidebarTitle}>Meilleurs contributeurs</h2>
              <div className={styles.contribList}>
                {TOP_CONTRIBUTORS.map((c, index) => (
                  <div key={c.nom} className={styles.contribRow}>
                    <span className={styles.contribRank}>{index + 1}</span>
                    <span className={styles.contribAvatar}>{initials(c.nom)}</span>
                    <div className={styles.contribInfo}>
                      <span className={styles.contribName}>{c.nom}</span>
                      <span className={styles.contribMeta}>{c.info}</span>
                    </div>
                    <span className={styles.contribMessages}>{formatCount(c.messages)} msg</span>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.guidelinesCard}>
              <h2 className={styles.guidelinesTitle}>Règles du forum</h2>
              <ul className={styles.guidelinesList}>
                <li>Restez courtois et bienveillant 💜</li>
                <li>Recherchez avant de poster un doublon</li>
                <li>Partagez des infos précises et à jour</li>
                <li>Signalez tout contenu inapproprié</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
