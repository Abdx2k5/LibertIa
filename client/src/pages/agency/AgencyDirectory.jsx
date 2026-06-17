// =============================================================
// FICHIER  : src/pages/agency/AgencyDirectory.jsx
// TÂCHE    : T89 — Annuaire des agences (M6)
//
// Liste les agences (via agencyService, repli mock), avec recherche
// et filtres par spécialité / vérifiées. Affiche une grille de
// AgencyCard et ouvre AgencyContactForm au clic « Contacter ».
// =============================================================

import { useEffect, useMemo, useState } from "react";
import styles from "./AgencyDirectory.module.css";
import AgencyCard from "../../components/ui/AgencyCard";
import AgencyContactForm from "../../components/ui/AgencyContactForm";
import agencyService from "../../services/agency.service";

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export default function AgencyDirectory() {
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [specialite, setSpecialite] = useState("Toutes");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [contactAgence, setContactAgence] = useState(null);

  useEffect(() => {
    let active = true;
    agencyService
      .listerAgences()
      .then((data) => {
        if (active) setAgences(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const specialites = useMemo(() => {
    const set = new Set();
    agences.forEach((a) => (a.specialites || []).forEach((s) => set.add(s)));
    return ["Toutes", ...Array.from(set)];
  }, [agences]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return agences.filter((a) => {
      const matchQuery = !q || normalize(`${a.nom} ${a.localisation}`).includes(q);
      const matchSpec = specialite === "Toutes" || (a.specialites || []).includes(specialite);
      const matchVerified = !verifiedOnly || a.verifiee;
      return matchQuery && matchSpec && matchVerified;
    });
  }, [agences, query, specialite, verifiedOnly]);

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <header className={styles.header}>
          <span className={styles.kicker}>🏢 Annuaire</span>
          <h1 className={styles.title}>Agences de voyage partenaires</h1>
          <p className={styles.subtitle}>
            Trouvez une agence vérifiée pour organiser votre prochain voyage sur-mesure.
          </p>
        </header>

        <div className={styles.toolbar}>
          <input
            type="text"
            className={styles.search}
            placeholder="Rechercher une agence, une destination..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className={`${styles.chip} ${verifiedOnly ? styles.chipActive : ""}`}
            onClick={() => setVerifiedOnly((v) => !v)}
          >
            ✓ Vérifiées
          </button>
        </div>

        <div className={styles.specTabs}>
          {specialites.map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.specTab} ${s === specialite ? styles.specTabActive : ""}`}
              onClick={() => setSpecialite(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <p className={styles.empty}>Chargement des agences…</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>Aucune agence ne correspond à votre recherche.</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((agence) => (
              <AgencyCard
                key={agence.id || agence._id}
                agence={agence}
                onContact={setContactAgence}
              />
            ))}
          </div>
        )}
      </div>

      <AgencyContactForm
        isOpen={Boolean(contactAgence)}
        agence={contactAgence}
        onClose={() => setContactAgence(null)}
      />
    </div>
  );
}
