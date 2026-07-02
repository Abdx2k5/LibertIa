import { useParams, useNavigate } from "react-router-dom";
import styles from "./AgencyDetail.module.css";
import { Badge, Button } from "../../components/ui";
import { getAgencyById } from "../../mocks/agencyData";
import imgAgencyPlaceholder from "../../assets/images/community/avatar.png";

const svgProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconCheck  = (p) => <svg {...svgProps} strokeWidth="2.5" {...p}><polyline points="20 6 9 17 4 12"/></svg>;
const IconMapPin = (p) => <svg {...svgProps} {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconStar   = (p) => <svg {...svgProps} fill="currentColor" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconPhone  = (p) => <svg {...svgProps} {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IconMail   = (p) => <svg {...svgProps} {...p}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconGlobe  = (p) => <svg {...svgProps} {...p}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
const IconClock  = (p) => <svg {...svgProps} {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

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
              {agency.verifiee && <Badge variant="cyan"><IconCheck width={12} height={12} /> Agence vérifiée</Badge>}
            </div>
            <p className={styles.heroLocation}><IconMapPin /> {agency.localisation}</p>
            <div className={styles.heroMeta}>
              <span className={styles.ratingValue}><IconStar /> {agency.note}</span>
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
                <span className={styles.contactIcon}><IconPhone /></span>
                <div>
                  <div className={styles.contactLabel}>Téléphone</div>
                  <div className={styles.contactValue}>{agency.contact.telephone}</div>
                </div>
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactIcon}><IconMail /></span>
                <div>
                  <div className={styles.contactLabel}>Email</div>
                  <div className={styles.contactValue}>{agency.contact.email}</div>
                </div>
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactIcon}><IconMapPin /></span>
                <div>
                  <div className={styles.contactLabel}>Adresse</div>
                  <div className={styles.contactValue}>{agency.contact.adresse}</div>
                </div>
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactIcon}><IconGlobe /></span>
                <div>
                  <div className={styles.contactLabel}>Site web</div>
                  <div className={styles.contactValue}>{agency.contact.siteWeb}</div>
                </div>
              </div>
              <div className={styles.contactRow}>
                <span className={styles.contactIcon}><IconClock /></span>
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

