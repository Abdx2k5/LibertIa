// =============================================================
// FICHIER  : src/components/ui/CommentSection.jsx
// TÂCHE    : T58 — Commentaires
//
// Fil de commentaires inline : liste + zone de saisie + likes
// de commentaire. État local (mock) — branchez onAdd/onLike pour
// connecter au backend plus tard.
//
// PROPS :
//   - comments      → array — [{ id, auteur, avatar, contenu, temps, likes }]
//   - currentUser   → { nom, avatar }
//   - onAdd         → function(text) — nouveau commentaire
//   - placeholder   → string
// =============================================================

import { useState } from "react";
import styles from "./CommentSection.module.css";
import LikeButton from "./LikeButton";

const IconSparkles = (p) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4, verticalAlign: -2 }} {...p}>
    <path d="m12 3-1.9 5.7a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.7a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
  </svg>
);

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

export default function CommentSection({
  comments = [],
  currentUser = { nom: "Vous", avatar: null },
  onAdd,
  placeholder = "Ajouter un commentaire...",
}) {
  const [list, setList] = useState(comments);
  const [draft, setDraft] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const comment = {
      id: `local-${Date.now()}`,
      auteur: currentUser.nom,
      avatar: currentUser.avatar,
      contenu: text,
      temps: "à l'instant",
      likes: 0,
      isOwn: true,
    };

    setList((prev) => [...prev, comment]);
    setDraft("");
    onAdd?.(text);
  };

  return (
    <section className={styles.wrap} aria-label="Commentaires">
      <form className={styles.composer} onSubmit={handleSubmit}>
        <div className={styles.avatar}>
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.nom} />
          ) : (
            <span>{initials(currentUser.nom)}</span>
          )}
        </div>

        <div className={styles.composerField}>
          <textarea
            className={styles.input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            rows={1}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
          />
          <button type="submit" className={styles.send} disabled={!draft.trim()}>
            Publier
          </button>
        </div>
      </form>

      {list.length === 0 ? (
        <p className={styles.empty}>Soyez le premier à commenter <IconSparkles /></p>
      ) : (
        <ul className={styles.list}>
          {list.map((comment) => (
            <li key={comment.id} className={styles.item}>
              <div className={styles.avatar}>
                {comment.avatar ? (
                  <img src={comment.avatar} alt={comment.auteur} />
                ) : (
                  <span>{initials(comment.auteur)}</span>
                )}
              </div>

              <div className={styles.bubbleWrap}>
                <div className={styles.bubble}>
                  <div className={styles.bubbleHead}>
                    <span className={styles.author}>{comment.auteur}</span>
                    {comment.isOwn ? <span className={styles.ownTag}>Vous</span> : null}
                  </div>
                  <p className={styles.text}>{comment.contenu}</p>
                </div>

                <div className={styles.meta}>
                  <span className={styles.time}>{comment.temps}</span>
                  <LikeButton count={comment.likes} size="sm" />
                  <button type="button" className={styles.replyBtn}>
                    Répondre
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
