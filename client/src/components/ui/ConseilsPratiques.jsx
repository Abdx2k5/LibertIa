// =============================================================
// FICHIER  : src/components/ui/ConseilsPratiques.jsx
// TÂCHE    : T29 — Section conseils pratiques (M2)
//
// Affiche une liste de conseils pratiques (visa, santé, monnaie,
// météo, sécurité, langue) sous forme de cartes dépliables.
//
// PROPS :
//   - conseils → array { icone, titre, contenu }  (optionnel)
//   - titre    → string — titre de la section (optionnel)
// =============================================================

import { useState } from "react";
import styles from "./ConseilsPratiques.module.css";

const CONSEILS_DEFAUT = [
  { icone: "🛂", titre: "Visa & formalités", contenu: "Vérifiez la validité de votre passeport (6 mois après le retour) et les conditions de visa selon votre nationalité." },
  { icone: "💉", titre: "Santé & vaccins", contenu: "Renseignez-vous sur les vaccins recommandés et souscrivez une assurance voyage couvrant les frais médicaux." },
  { icone: "💱", titre: "Monnaie & paiement", contenu: "Prévoyez un peu d'espèces locales et vérifiez que votre carte fonctionne sur place pour éviter les frais." },
  { icone: "🌦️", titre: "Météo & saison", contenu: "Consultez la meilleure période pour partir et adaptez vos bagages au climat de la destination." },
  { icone: "🛡️", titre: "Sécurité", contenu: "Enregistrez les numéros d'urgence locaux et gardez une copie numérique de vos documents importants." },
];

export default function ConseilsPratiques({ conseils = CONSEILS_DEFAUT, titre = "Conseils pratiques" }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!conseils || conseils.length === 0) return null;

  const toggle = (index) => setOpenIndex((prev) => (prev === index ? null : index));

  return (
    <section className={styles.section} aria-label={titre}>
      {titre && <h2 className={styles.title}>{titre}</h2>}

      <div className={styles.list}>
        {conseils.map((conseil, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={conseil.titre || index} className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}>
              <button
                type="button"
                className={styles.header}
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
              >
                <span className={styles.icone} aria-hidden="true">{conseil.icone}</span>
                <span className={styles.itemTitle}>{conseil.titre}</span>
                <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} aria-hidden="true">⌄</span>
              </button>

              {isOpen && <p className={styles.contenu}>{conseil.contenu}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
