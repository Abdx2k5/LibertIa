import { useEffect, useState } from "react";
import styles from "./PostCard.module.css";

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
  const [liked, setLiked] = useState(false);
  const [likedPulse, setLikedPulse] = useState(false);

  useEffect(() => {
    if (!likedPulse) return undefined;

    const timer = window.setTimeout(() => setLikedPulse(false), 180);
    return () => window.clearTimeout(timer);
  }, [likedPulse]);

  const handleLike = () => {
    setLiked((current) => !current);
    setLikedPulse(true);
  };

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

        <span className={styles.time}>{post?.temps}</span>
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
          <button
            type="button"
            className={`${styles.actionButton} ${liked ? styles.actionButtonLiked : ""} ${likedPulse ? styles.actionButtonPulse : ""}`}
            onClick={handleLike}
            aria-pressed={liked}
          >
            <span className={styles.actionIcon}>❤️</span>
            <span>{formatCount((post?.likes || 0) + (liked ? 1 : 0))}</span>
          </button>

          <button type="button" className={styles.actionButton}>
            <span className={styles.actionIcon}>💬</span>
            <span>{formatCount(post?.commentaires)}</span>
          </button>

          <button type="button" className={styles.actionButton}>
            <span className={styles.actionIcon}>🔗</span>
            <span>{formatCount(post?.partages)}</span>
          </button>
        </div>

        <button type="button" className={styles.saveButton}>
          Enregistrer
        </button>
      </footer>

      {isGroup ? (
        <button type="button" className={styles.groupCta}>
          Rejoindre le groupe
        </button>
      ) : null}
    </article>
  );
}