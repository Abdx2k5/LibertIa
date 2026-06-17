// =============================================================
// FICHIER  : src/pages/souvenirs/MesSouvenirs.jsx
// TÂCHE    : T72 — Page Mes Souvenirs (User content storage)
//
// Espace personnel de stockage des souvenirs de voyage : photo,
// titre, lieu, date, note et album. Persisté en localStorage
// (fonctionne hors-ligne). Recherche, filtres, favoris, deux
// vues (cartes détaillées / galerie lightbox).
// =============================================================

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./MesSouvenirs.module.css";
import useLocalStorage from "../../hooks/useLocalStorage";
import { SOUVENIRS_SEED, SOUVENIR_CATEGORIES } from "../../mocks/souvenirsData";
import GaleriePhoto from "../../components/ui/GaleriePhoto";
import DossierCard from "../../components/ui/DossierCard";
import DossierForm from "../../components/ui/DossierForm";
import dossierService from "../../services/dossier.service";

const EMPTY_FORM = {
  titre: "",
  lieu: "",
  date: "",
  album: "",
  categorie: "Ville",
  note: "",
  url: null,
};

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Lecture impossible"));
    reader.readAsDataURL(file);
  });
}

export default function MesSouvenirs() {
  const [souvenirs, setSouvenirs] = useLocalStorage("libertia_souvenirs", SOUVENIRS_SEED);

  const [search, setSearch] = useState("");
  const [album, setAlbum] = useState("Tous");
  const [favOnly, setFavOnly] = useState(false);
  const [view, setView] = useState("cartes"); // "cartes" | "galerie"

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [detail, setDetail] = useState(null);
  const fileRef = useRef(null);

  // ── Dossiers souvenirs (T73/T74) — câblés sur l'API ──
  const [dossiers, setDossiers] = useState([]);
  const [dossierFormOpen, setDossierFormOpen] = useState(false);

  // Chargement des dossiers : échoue silencieusement si l'API n'est pas
  // disponible (la page reste utilisable, le bouton « Nouveau dossier » aussi).
  useEffect(() => {
    let active = true;
    dossierService
      .getMesDossiers()
      .then((data) => {
        if (active) setDossiers(Array.isArray(data) ? data : data?.dossiers || []);
      })
      .catch(() => {
        if (active) setDossiers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDossierCreated = (dossier) => {
    if (dossier) setDossiers((prev) => [dossier, ...prev]);
  };

  const handleDossierDelete = async (id) => {
    try {
      await dossierService.supprimerDossier(id);
    } catch {
      /* on retire localement même si l'API échoue */
    }
    setDossiers((prev) => prev.filter((d) => d.id !== id));
  };

  // ── Albums + statistiques dérivés ──
  const albums = useMemo(() => {
    const set = new Set(souvenirs.map((s) => s.album).filter(Boolean));
    return ["Tous", ...Array.from(set)];
  }, [souvenirs]);

  const stats = useMemo(() => {
    const lieux = new Set(souvenirs.map((s) => s.lieu).filter(Boolean));
    const albumSet = new Set(souvenirs.map((s) => s.album).filter(Boolean));
    return {
      total: souvenirs.length,
      lieux: lieux.size,
      albums: albumSet.size,
      favoris: souvenirs.filter((s) => s.favori).length,
    };
  }, [souvenirs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return souvenirs.filter((s) => {
      const matchAlbum = album === "Tous" || s.album === album;
      const matchFav = !favOnly || s.favori;
      const matchSearch =
        !q ||
        s.titre.toLowerCase().includes(q) ||
        s.lieu.toLowerCase().includes(q) ||
        (s.note || "").toLowerCase().includes(q);
      return matchAlbum && matchFav && matchSearch;
    });
  }, [souvenirs, search, album, favOnly]);

  // ── Actions ──
  const toggleFavori = (id) => {
    setSouvenirs((prev) => prev.map((s) => (s.id === id ? { ...s, favori: !s.favori } : s)));
    setDetail((d) => (d && d.id === id ? { ...d, favori: !d.favori } : d));
  };

  const deleteSouvenir = (id) => {
    setSouvenirs((prev) => prev.filter((s) => s.id !== id));
    setDetail((d) => (d && d.id === id ? null : d));
  };

  const handlePickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setForm((f) => ({ ...f, url }));
    } catch {
      /* ignore */
    }
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const titre = form.titre.trim();
    if (!titre) return;

    const souvenir = {
      id: `s-${Date.now()}`,
      titre,
      lieu: form.lieu.trim() || "Lieu inconnu",
      date: form.date || new Date().toISOString().slice(0, 10),
      album: form.album.trim() || "Sans album",
      categorie: form.categorie,
      note: form.note.trim(),
      url: form.url,
      favori: false,
      couleur: "#aa3bff",
    };

    setSouvenirs((prev) => [souvenir, ...prev]);
    setForm(EMPTY_FORM);
    setFormOpen(false);
  };

  const galeriePhotos = filtered.map((s) => ({
    id: s.id,
    url: s.url,
    titre: s.titre,
    lieu: s.lieu,
    date: formatDate(s.date),
  }));

  return (
    <div className={styles.page}>
      <div className={styles.main}>

        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.kicker}>📸 Carnet personnel</span>
            <h1 className={styles.title}>Mes souvenirs</h1>
            <p className={styles.subtitle}>
              Conservez et revivez les moments forts de vos voyages, où que vous soyez.
            </p>
          </div>
          <button type="button" className={styles.addButton} onClick={() => setFormOpen(true)}>
            ＋ Ajouter un souvenir
          </button>
        </header>

        {/* ── Statistiques ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Souvenirs</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.lieux}</span>
            <span className={styles.statLabel}>Lieux visités</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.albums}</span>
            <span className={styles.statLabel}>Albums</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.favoris}</span>
            <span className={styles.statLabel}>Favoris</span>
          </div>
        </div>

        {/* ── Dossiers souvenirs (T73/T74) ── */}
        <section className={styles.dossiersSection}>
          <div className={styles.dossiersHeader}>
            <h2 className={styles.dossiersTitle}>Dossiers</h2>
            <button
              type="button"
              className={styles.dossierAddBtn}
              onClick={() => setDossierFormOpen(true)}
            >
              ＋ Nouveau dossier
            </button>
          </div>

          {dossiers.length === 0 ? (
            <p className={styles.dossiersEmpty}>
              Aucun dossier pour l'instant. Créez-en un pour regrouper vos souvenirs.
            </p>
          ) : (
            <div className={styles.dossiersGrid}>
              {dossiers.map((dossier) => (
                <DossierCard
                  key={dossier.id}
                  dossier={dossier}
                  onOpen={() => {}}
                  onDelete={handleDossierDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Barre d'outils ── */}
        <div className={styles.toolbar}>
          <input
            type="text"
            className={styles.search}
            placeholder="Rechercher un souvenir, un lieu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className={styles.toolbarRight}>
            <button
              type="button"
              className={`${styles.chip} ${favOnly ? styles.chipActive : ""}`}
              onClick={() => setFavOnly((v) => !v)}
            >
              ★ Favoris
            </button>

            <div className={styles.viewToggle}>
              <button
                type="button"
                className={`${styles.viewBtn} ${view === "cartes" ? styles.viewBtnActive : ""}`}
                onClick={() => setView("cartes")}
              >
                ▦ Cartes
              </button>
              <button
                type="button"
                className={`${styles.viewBtn} ${view === "galerie" ? styles.viewBtnActive : ""}`}
                onClick={() => setView("galerie")}
              >
                ◳ Galerie
              </button>
            </div>
          </div>
        </div>

        {/* ── Albums ── */}
        <div className={styles.albumTabs}>
          {albums.map((a) => (
            <button
              key={a}
              type="button"
              className={`${styles.albumTab} ${a === album ? styles.albumTabActive : ""}`}
              onClick={() => setAlbum(a)}
            >
              {a}
            </button>
          ))}
        </div>

        {/* ── Contenu ── */}
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🗺️</span>
            <p>Aucun souvenir ne correspond. Ajoutez votre premier moment de voyage !</p>
            <button type="button" className={styles.addButton} onClick={() => setFormOpen(true)}>
              ＋ Ajouter un souvenir
            </button>
          </div>
        ) : view === "galerie" ? (
          <GaleriePhoto photos={galeriePhotos} colonnes={3} />
        ) : (
          <div className={styles.grid}>
            {filtered.map((s) => (
              <article key={s.id} className={styles.card} onClick={() => setDetail(s)}>
                <div
                  className={styles.cardImg}
                  style={
                    s.url
                      ? { backgroundImage: `url(${s.url})` }
                      : { background: `linear-gradient(135deg, ${s.couleur || "#aa3bff"}55, #1e1f27)` }
                  }
                >
                  {!s.url && <span className={styles.cardImgIcon}>📷</span>}
                  <button
                    type="button"
                    className={`${styles.favBtn} ${s.favori ? styles.favBtnActive : ""}`}
                    onClick={(e) => { e.stopPropagation(); toggleFavori(s.id); }}
                    aria-label={s.favori ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    {s.favori ? "★" : "☆"}
                  </button>
                  <span className={styles.cardCategorie}>{s.categorie}</span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{s.titre}</h3>
                  <p className={styles.cardMeta}>📍 {s.lieu}</p>
                  <p className={styles.cardDate}>{formatDate(s.date)}</p>
                  {s.note && <p className={styles.cardNote}>{s.note}</p>}
                  <div className={styles.cardFooter}>
                    <span className={styles.albumPill}>{s.album}</span>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={(e) => { e.stopPropagation(); deleteSouvenir(s.id); }}
                      aria-label="Supprimer"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ajout ── */}
      {formOpen && (
        <div className={styles.modalBackdrop} onClick={() => setFormOpen(false)}>
          <form className={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nouveau souvenir</h2>
              <button type="button" className={styles.modalClose} onClick={() => setFormOpen(false)}>✕</button>
            </div>

            <button
              type="button"
              className={styles.uploadZone}
              onClick={() => fileRef.current?.click()}
              style={form.url ? { backgroundImage: `url(${form.url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              {!form.url && (
                <>
                  <span className={styles.uploadIcon}>🖼️</span>
                  <span>Ajouter une photo</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePickFile} />

            <div className={styles.field}>
              <label className={styles.label}>Titre *</label>
              <input
                className={styles.input}
                value={form.titre}
                onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                placeholder="Ex : Lever de soleil sur le Fuji"
                autoFocus
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Lieu</label>
                <input
                  className={styles.input}
                  value={form.lieu}
                  onChange={(e) => setForm((f) => ({ ...f, lieu: e.target.value }))}
                  placeholder="Ville, Pays"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  className={styles.input}
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Album</label>
                <input
                  className={styles.input}
                  value={form.album}
                  onChange={(e) => setForm((f) => ({ ...f, album: e.target.value }))}
                  placeholder="Ex : Japon 2026"
                  list="albums-list"
                />
                <datalist id="albums-list">
                  {albums.filter((a) => a !== "Tous").map((a) => <option key={a} value={a} />)}
                </datalist>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Catégorie</label>
                <select
                  className={styles.input}
                  value={form.categorie}
                  onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}
                >
                  {SOUVENIR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Note</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Qu'est-ce qui rend ce moment inoubliable ?"
              />
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btnCancel} onClick={() => setFormOpen(false)}>Annuler</button>
              <button type="submit" className={styles.btnSave} disabled={!form.titre.trim()}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal création dossier (T74) ── */}
      <DossierForm
        isOpen={dossierFormOpen}
        onClose={() => setDossierFormOpen(false)}
        onCreated={handleDossierCreated}
      />

      {/* ── Modal détail ── */}
      {detail && (
        <div className={styles.modalBackdrop} onClick={() => setDetail(null)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.modalClose} onClick={() => setDetail(null)}>✕</button>
            <div
              className={styles.detailImg}
              style={
                detail.url
                  ? { backgroundImage: `url(${detail.url})` }
                  : { background: `linear-gradient(135deg, ${detail.couleur || "#aa3bff"}66, #1e1f27)` }
              }
            >
              {!detail.url && <span className={styles.detailImgIcon}>📷</span>}
            </div>
            <div className={styles.detailBody}>
              <div className={styles.detailTop}>
                <h2 className={styles.detailTitle}>{detail.titre}</h2>
                <button
                  type="button"
                  className={`${styles.favBtn} ${detail.favori ? styles.favBtnActive : ""}`}
                  onClick={() => toggleFavori(detail.id)}
                >
                  {detail.favori ? "★" : "☆"}
                </button>
              </div>
              <p className={styles.detailMeta}>📍 {detail.lieu} · {formatDate(detail.date)}</p>
              <div className={styles.detailChips}>
                <span className={styles.albumPill}>{detail.album}</span>
                <span className={styles.cardCategorie} style={{ position: "static" }}>{detail.categorie}</span>
              </div>
              {detail.note && <p className={styles.detailNote}>{detail.note}</p>}
              <button type="button" className={styles.detailDelete} onClick={() => deleteSouvenir(detail.id)}>
                🗑 Supprimer ce souvenir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
