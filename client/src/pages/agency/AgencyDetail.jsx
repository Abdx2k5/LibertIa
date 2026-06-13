import { useParams, useNavigate } from "react-router-dom";
import styles from "./AgencyDetail.module.css";
import { Badge, Button } from "../../components/ui";
import { getAgencyById } from "../../mocks/agencyData";

const imgAgencyPlaceholder = "https://www.figma.com/api/mcp/asset/0926e5cc-1f5e-4862-a22b-22daa1cef4d7";

export default function AgencyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const agency = getAgencyById(id);

  if (!agency) {
    return (
      <div className={styles.page}>
        <div className={styles.main}>
          <div className={styles.section}>
            <h1 className={styles.heroName}>Agence introuvable</h1>
            <p className={styles.heroLocation}>Cette agence n'existe pas ou plus.</p>
            <Button variant="outline" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>
              ← Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.main}>

        {/* ── Hero agence ── */}
        <div className={styles.hero}>
          <div className={styles.logoWrap}>
            <img
              src={agency.logo || imgAgencyPlaceholder}
              alt={agency.nom}
              className={styles.logoImg}
            />
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.heroTitleRow}>
              <h1 className={styles.heroName}>{agency.nom}</h1>
              {agency.verifiee && <Badge variant="cyan">✓ Agence vérifiée</Badge>}
            </div>
            <p className={styles.heroLocation}>📍 {agency.localisation}</p>
            <div className={styles.heroMeta}>
              <span className={styles.ratingValue}>⭐ {agency.note}</span>
              <span className={styles.ratingCount}>({agency.avis} avis)</span>
              <span className={styles.metaDot}>•</span>
              <span className={styles.metaText}>Membre depuis {agency.membreDepuis}</span>
            </div>
            <div className={styles.specialitesRow}>
              {agency.specialites.map((tag) => (
                <Badge key={tag} variant="premium">{tag}</Badge>
              ))}
            </div>
          </div>
          <Button variant="primary" size="lg" onClick={() => window.location.href = `mailto:${agency.contact.email}`}>
            Contacter l'agence
          </Button>
        </div>

        {/* ── Informations sur l'agence ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>À propos de l'agence</h2>
          <p className={styles.description}>{agency.description}</p>
        </div>

        <div className={styles.grid}>

          {/* ── Coordonnées ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Coordonnées</h2>
            <div className={styles.contactList}>
              <div className={styles.contactRow}>
                <span className={styles.contactIcon}>📞</span>
                <div>
                  <div className={styles.contactLabel}>Téléphone</div>
                  <div className={styles.contactValue}>{agency.contact.telephone}</div>
                </div>
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactIcon}>✉️</span>
                <div>
                  <div className={styles.contactLabel}>Email</div>
                  <div className={styles.contactValue}>{agency.contact.email}</div>
                </div>
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactIcon}>📍</span>
                <div>
                  <div className={styles.contactLabel}>Adresse</div>
                  <div className={styles.contactValue}>{agency.contact.adresse}</div>
                </div>
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactIcon}>🌐</span>
                <div>
                  <div className={styles.contactLabel}>Site web</div>
                  <div className={styles.contactValue}>{agency.contact.siteWeb}</div>
                </div>
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactIcon}>🕒</span>
                <div>
                  <div className={styles.contactLabel}>Horaires</div>
                  <div className={styles.contactValue}>{agency.contact.horaires}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Services proposés ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Services proposés</h2>
            <div className={styles.servicesList}>
              {agency.services.map((service) => (
                <div key={service.id} className={styles.serviceCard}>
                  <span className={styles.serviceIcon}>{service.icone}</span>
                  <div className={styles.serviceBody}>
                    <div className={styles.serviceTitle}>{service.titre}</div>
                    <div className={styles.serviceDesc}>{service.description}</div>
                  </div>
                  <div className={styles.servicePrice}>{service.prix}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
