import { useState } from "react";
import styles from "./PostCard.module.css";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";
import ReportModal from "../modals/ReportModal";

const svgProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconFlag           = (p) => <svg {...svgProps} {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const IconMessageCircle  = (p) => <svg {...svgProps} {...p}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>;
const IconLink2          = (p) => <svg {...svgProps} {...p}><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;

function formatCount(value) {
  if (value == null) return "0";
  if (value < 1000) return String(value);

  const units = [
    { limit: 1_000_000, suffix: "M" },
    { limit: 1_000, suffix: "k" },
  ];

  const unit = units.find((entry) => value >= entry.limit) || units[1];
  const formatted = value / unit.limit;
  const rounded = formatted >= 10 ? formatted.toFixed(0) : formatted.toFixed(1);

  return `${rounded.replace(/\.0$/, "")}${unit.suffix}`;
}

function initialsFromName(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

export default function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const authorName = post?.auteur?.nom || "Voyageur Libertia";
  const authorBadge = post?.auteur?.badge;
  const authorLocation = post?.auteur?.localisation || "Communauté Libertia";
  const images = post?.images || [];
  const isArticle = post?.type === "article";
  const isGroup = post?.type === "groupe";

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.author}>
          <div className={styles.avatarWrap}>
            {post?.auteur?.avatar ? (
              <img src={post.auteur.avatar} alt={authorName} className={styles.avatar} />
            ) : (
              <span className={styles.avatarInitials}>{initialsFromName(authorName)}</span>
            )}
          </div>

          <div className={styles.authorMeta}>
            <div className={styles.authorTopRow}>
              <h3 className={styles.authorName}>{authorName}</h3>
              {authorBadge ? (
                <span
                  className={`${styles.badge} ${authorBadge === "Guide certifié" ? styles.badgeGuide : ""}`}
                >
                  {authorBadge}
                </span>
              ) : null}
            </div>
            <p className={styles.authorDetails}>{authorLocation}</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <span className={styles.time}>{post?.temps}</span>
          <button
            type="button"
            className={styles.reportButton}
            onClick={() => setReportOpen(true)}
            aria-label="Signaler cette publication"
            title="Signaler"
          >
            <IconFlag width={14} height={14} />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {isArticle ? (
          <button type="button" className={styles.articleLink}>
            Lire l'article
          </button>
        ) : (
          <p className={styles.content}>{post?.contenu}</p>
        )}

        {images.length > 0 ? (
          <div
            className={`${styles.imagesGrid} ${
              images.length === 1
                ? styles.imagesSingle
                : images.length === 2
                  ? styles.imagesDouble
                  : styles.imagesMasonry
            }`}
          >
            {images.map((image, index) => (
              <div
                key={`${post?.id || "post"}-${image}-${index}`}
                className={`${styles.imageSlot} ${
                  images.length >= 3 && index === 0 ? styles.imageLarge : ""
                }`}
              >
                <img src={image} alt="" className={styles.image} />
              </div>
            ))}
          </div>
        ) : null}

        {post?.tags?.length ? (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <footer className={styles.footer}>
        <div className={styles.actions}>
          <LikeButton count={post?.likes || 0} />

          <button
            type="button"
            className={`${styles.actionButton} ${showComments ? styles.actionButtonActive : ""}`}
            onClick={() => setShowComments((v) => !v)}
            aria-expanded={showComments}
          >
            <span className={styles.actionIcon}><IconMessageCircle /></span>
            <span>{formatCount(post?.commentaires)}</span>
          </button>

          <button type="button" className={styles.actionButton}>
            <span className={styles.actionIcon}><IconLink2 /></span>
            <span>{formatCount(post?.partages)}</span>
          </button>
        </div>

        <button type="button" className={styles.saveButton}>
          Enregistrer
        </button>
      </footer>

      {showComments ? (
        <CommentSection comments={post?.commentairesListe || []} />
      ) : null}

      {isGroup ? (
        <button type="button" className={styles.groupCta}>
          Rejoindre le groupe
        </button>
      ) : null}

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="publication"
        onSubmit={(payload) => console.log("Signalement:", post?.id, payload)}
      />
    </article>
  );
}