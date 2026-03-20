import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page introuvable</h2>
        <p className={styles.subtitle}>
          Oops ! Cette page n'existe pas ou a été déplacée.
          Retournez à l'accueil pour continuer votre aventure.
        </p>
        <Link to="/" className={styles.btn}>Retour à l'accueil</Link>
      </div>
    </div>
  );
}