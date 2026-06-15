// =============================================================
// FICHIER  : src/pages/collaboration/BoitesCollaboratives.jsx
// TÂCHE    : T80 — Page Boîtes collaboratives (Collaboration workspace)
//
// Espaces partagés de planification : chaque "boîte" rassemble des
// membres qui déposent des idées (destinations, hébergements...),
// votent et font évoluer leur statut (idée → validé / écarté).
// Persisté en localStorage (master-détail + filtres + membres).
// =============================================================

import { useMemo, useState } from "react";
import styles from "./BoitesCollaboratives.module.css";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuthStore } from "../../store/authStore";
import {
  BOITES_SEED,
  ITEM_CATEGORIES,
  ITEM_STATUSES,
  BOX_COLORS,
} from "../../mocks/boitesData";

function initials(name = "") {
  return (
    name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?"
  );
}
const catMeta = (id) => ITEM_CATEGORIES.find((c) => c.id === id) || ITEM_CATEGORIES[ITEM_CATEGORIES.length - 1];
const statusMeta = (id) => ITEM_STATUSES.find((s) => s.id === id) || ITEM_STATUSES[0];

export default function BoitesCollaboratives() {
  const { user } = useAuthStore();
  const me = user?.nom || "Vous";

  const [boites, setBoites] = useLocalStorage("libertia_boites", BOITES_SEED);
  const [selectedId, setSelectedId] = useState(() => BOITES_SEED[0]?.id || null);

  // composer item
  const [draft, setDraft] = useState("");
  const [draftCat, setDraftCat] = useState("destination");
  const [filterStatut, setFilterStatut] = useState("tous");
  const [filterCat, setFilterCat] = useState("tous");

  // nouvelle boîte
  const [newBoxOpen, setNewBoxOpen] = useState(false);
  const [boxForm, setBoxForm] = useState({ nom: "", description: "", couleur: BOX_COLORS[0] });

  // invitation membre
  const [inviteName, setInviteName] = useState("");

  const selected = useMemo(
    () => boites.find((b) => b.id === selectedId) || boites[0] || null,
    [boites, selectedId]
  );

  // ── Helpers de mise à jour de la boîte courante ──
  const updateBox = (id, updater) =>
    setBoites((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));

  const addItem = (e) => {
    e.preventDefault();
    const texte = draft.trim();
    if (!texte || !selected) return;
    const item = {
      id: `i-${Date.now()}`,
      texte,
      categorie: draftCat,
      auteur: me,
      votes: 0,
      voted: false,
      statut: "idee",
    };
    updateBox(selected.id, (b) => ({ ...b, items: [item, ...b.items] }));
    setDraft("");
  };

  const toggleVote = (itemId) =>
    updateBox(selected.id, (b) => ({
      ...b,
      items: b.items.map((it) =>
        it.id === itemId
          ? { ...it, voted: !it.voted, votes: it.votes + (it.voted ? -1 : 1) }
          : it
      ),
    }));

  const setStatut = (itemId, statut) =>
    updateBox(selected.id, (b) => ({
      ...b,
      items: b.items.map((it) => (it.id === itemId ? { ...it, statut } : it)),
    }));

  const deleteItem = (itemId) =>
    updateBox(selected.id, (b) => ({ ...b, items: b.items.filter((it) => it.id !== itemId) }));

  const inviteMember = (e) => {
    e.preventDefault();
    const nom = inviteName.trim();
    if (!nom || !selected) return;
    if (selected.membres.some((m) => m.nom.toLowerCase() === nom.toLowerCase())) {
      setInviteName("");
      return;
    }
    updateBox(selected.id, (b) => ({
      ...b,
      membres: [...b.membres, { id: `m-${Date.now()}`, nom }],
    }));
    setInviteName("");
  };

  const createBox = (e) => {
    e.preventDefault();
    const nom = boxForm.nom.trim();
    if (!nom) return;
    const box = {
      id: `b-${Date.now()}`,
      nom,
      description: boxForm.description.trim(),
      couleur: boxForm.couleur,
      membres: [{ id: `m-${Date.now()}`, nom: me }],
      items: [],
    };
    setBoites((prev) => [box, ...prev]);
    setSelectedId(box.id);
    setBoxForm({ nom: "", description: "", couleur: BOX_COLORS[0] });
    setNewBoxOpen(false);
  };

  const deleteBox = (id) => {
    setBoites((prev) => {
      const next = prev.filter((b) => b.id !== id);
      if (id === selectedId) setSelectedId(next[0]?.id || null);
      return next;
    });
  };

  const visibleItems = useMemo(() => {
    if (!selected) return [];
    return selected.items
      .filter((it) => filterStatut === "tous" || it.statut === filterStatut)
      .filter((it) => filterCat === "tous" || it.categorie === filterCat)
      .sort((a, b) => b.votes - a.votes);
  }, [selected, filterStatut, filterCat]);

  const boxStats = (b) => ({
    items: b.items.length,
    valides: b.items.filter((i) => i.statut === "valide").length,
  });

  return (
    <div className={styles.page}>
      <div className={styles.layout}>

        {/* ── Liste des boîtes ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <h2 className={styles.sidebarTitle}>Boîtes</h2>
            <button type="button" className={styles.newBoxBtn} onClick={() => setNewBoxOpen(true)}>＋</button>
          </div>

          <div className={styles.boxList}>
            {boites.length === 0 && <p className={styles.sideEmpty}>Aucune boîte. Créez-en une !</p>}
            {boites.map((b) => {
              const st = boxStats(b);
              const active = selected && b.id === selected.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  className={`${styles.boxRow} ${active ? styles.boxRowActive : ""}`}
                  onClick={() => setSelectedId(b.id)}
                >
                  <span className={styles.boxDot} style={{ background: b.couleur }} />
                  <span className={styles.boxRowInfo}>
                    <span className={styles.boxRowName}>{b.nom}</span>
                    <span className={styles.boxRowMeta}>
                      {b.membres.length} membre{b.membres.length > 1 ? "s" : ""} · {st.items} idée{st.items > 1 ? "s" : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Détail boîte ── */}
        <main className={styles.workspace}>
          {!selected ? (
            <div className={styles.workspaceEmpty}>
              <span className={styles.emptyIcon}>🤝</span>
              <h2>Créez votre première boîte collaborative</h2>
              <p>Invitez vos compagnons de voyage et planifiez ensemble.</p>
              <button type="button" className={styles.primaryBtn} onClick={() => setNewBoxOpen(true)}>
                ＋ Nouvelle boîte
              </button>
            </div>
          ) : (
            <>
              <header className={styles.wsHeader} style={{ borderColor: `${selected.couleur}66` }}>
                <div className={styles.wsHeaderTop}>
                  <div className={styles.wsTitleWrap}>
                    <span className={styles.boxDotLg} style={{ background: selected.couleur }} />
                    <div>
                      <h1 className={styles.wsTitle}>{selected.nom}</h1>
                      {selected.description && <p className={styles.wsDesc}>{selected.description}</p>}
                    </div>
                  </div>
                  <button type="button" className={styles.deleteBoxBtn} onClick={() => deleteBox(selected.id)}>
                    🗑 Supprimer la boîte
                  </button>
                </div>

                {/* membres */}
                <div className={styles.membersRow}>
                  <div className={styles.avatars}>
                    {selected.membres.map((m) => (
                      <span key={m.id} className={styles.avatar} title={m.nom}>{initials(m.nom)}</span>
                    ))}
                  </div>
                  <form className={styles.inviteForm} onSubmit={inviteMember}>
                    <input
                      className={styles.inviteInput}
                      placeholder="Inviter (nom)..."
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                    />
                    <button type="submit" className={styles.inviteBtn} disabled={!inviteName.trim()}>Inviter</button>
                  </form>
                </div>

                <div className={styles.wsStats}>
                  <span><strong>{selected.items.length}</strong> idées</span>
                  <span><strong>{selected.items.filter((i) => i.statut === "valide").length}</strong> validées</span>
                  <span><strong>{selected.items.reduce((acc, i) => acc + i.votes, 0)}</strong> votes</span>
                </div>
              </header>

              {/* composer */}
              <form className={styles.composer} onSubmit={addItem}>
                <select
                  className={styles.composerCat}
                  value={draftCat}
                  onChange={(e) => setDraftCat(e.target.value)}
                >
                  {ITEM_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
                <input
                  className={styles.composerInput}
                  placeholder="Proposer une idée à la boîte..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button type="submit" className={styles.composerBtn} disabled={!draft.trim()}>Ajouter</button>
              </form>

              {/* filtres */}
              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <button
                    type="button"
                    className={`${styles.filterPill} ${filterStatut === "tous" ? styles.filterPillActive : ""}`}
                    onClick={() => setFilterStatut("tous")}
                  >Tous</button>
                  {ITEM_STATUSES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`${styles.filterPill} ${filterStatut === s.id ? styles.filterPillActive : ""}`}
                      onClick={() => setFilterStatut(s.id)}
                    >{s.label}</button>
                  ))}
                </div>
                <select
                  className={styles.filterCat}
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                >
                  <option value="tous">Toutes catégories</option>
                  {ITEM_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>

              {/* items */}
              {visibleItems.length === 0 ? (
                <div className={styles.itemsEmpty}>Aucune idée pour ce filtre. Lancez la discussion ci-dessus ☝️</div>
              ) : (
                <ul className={styles.itemList}>
                  {visibleItems.map((it) => {
                    const cm = catMeta(it.categorie);
                    const sm = statusMeta(it.statut);
                    return (
                      <li key={it.id} className={styles.item}>
                        <button
                          type="button"
                          className={`${styles.voteBtn} ${it.voted ? styles.voteBtnActive : ""}`}
                          onClick={() => toggleVote(it.id)}
                          aria-pressed={it.voted}
                          aria-label="Voter"
                        >
                          <span className={styles.voteArrow}>▲</span>
                          <span className={styles.voteCount}>{it.votes}</span>
                        </button>

                        <div className={styles.itemBody}>
                          <p className={styles.itemText}>{it.texte}</p>
                          <div className={styles.itemMeta}>
                            <span className={styles.catChip}>{cm.icon} {cm.label}</span>
                            <span className={styles.statusChip} style={{ color: sm.color, borderColor: `${sm.color}55`, background: `${sm.color}1a` }}>
                              {sm.label}
                            </span>
                            <span className={styles.itemAuthor}>par {it.auteur}</span>
                          </div>
                        </div>

                        <div className={styles.itemActions}>
                          <div className={styles.statusBtns}>
                            {ITEM_STATUSES.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                className={`${styles.statusSet} ${it.statut === s.id ? styles.statusSetActive : ""}`}
                                style={it.statut === s.id ? { background: `${s.color}22`, color: s.color, borderColor: `${s.color}66` } : undefined}
                                onClick={() => setStatut(it.id, s.id)}
                                title={`Marquer comme ${s.label}`}
                              >
                                {s.id === "valide" ? "✓" : s.id === "ecarte" ? "✕" : "•"}
                              </button>
                            ))}
                          </div>
                          <button type="button" className={styles.itemDelete} onClick={() => deleteItem(it.id)} aria-label="Supprimer">🗑</button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Modal nouvelle boîte ── */}
      {newBoxOpen && (
        <div className={styles.modalBackdrop} onClick={() => setNewBoxOpen(false)}>
          <form className={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={createBox}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Nouvelle boîte collaborative</h2>
              <button type="button" className={styles.modalClose} onClick={() => setNewBoxOpen(false)}>✕</button>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Nom *</label>
              <input
                className={styles.input}
                value={boxForm.nom}
                onChange={(e) => setBoxForm((f) => ({ ...f, nom: e.target.value }))}
                placeholder="Ex : Roadtrip Portugal 🇵🇹"
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                rows={2}
                value={boxForm.description}
                onChange={(e) => setBoxForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="De quoi parle cette boîte ?"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Couleur</label>
              <div className={styles.colorRow}>
                {BOX_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.colorDot} ${boxForm.couleur === c ? styles.colorDotActive : ""}`}
                    style={{ background: c }}
                    onClick={() => setBoxForm((f) => ({ ...f, couleur: c }))}
                    aria-label={`Couleur ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btnCancel} onClick={() => setNewBoxOpen(false)}>Annuler</button>
              <button type="submit" className={styles.btnSave} disabled={!boxForm.nom.trim()}>Créer la boîte</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
