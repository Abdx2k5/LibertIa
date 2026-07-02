// =============================================================
// FICHIER  : src/pages/design-system/DesignSystem.jsx
// TÂCHE    : T129 — Bibliothèque composants UI design system
//
// Page catalogue présentant les 36 composants de
// src/components/ui/ avec des données factices réalistes,
// regroupés par catégorie. Sert de documentation visuelle
// pour l'équipe de développement.
// =============================================================

import styles from "./DesignSystem.module.css";
import streamingStyles from "../../components/ui/StreamingOutput.module.css";
import paymentModalStyles from "../../components/ui/PaymentModal.module.css";
import {
  Button,
  Input,
  Card,
  Badge,
  Spinner,
  Pill,
  LogoutButton,
  ShareButton,
  DeleteButton,
  LikeButton,
  FollowButton,
  DuplicateButton,
  VisibilityToggle,
  VoyageActionsMenu,
  ItineraireJourJour,
  VolCard,
  HotelCard,
  ActiviteCard,
  BudgetChart,
  CarteMapbox,
  RechercheVoyages,
  ExportPdfButton,
  PostCard,
  CommentSection,
  AvisSection,
  GaleriePhoto,
  UploadMultiplePhotos,
  UploadPhoto,
  ChatMessagerie,
  MicroAnimated,
  PaymentForm,
  NotificationBell,
  ProgressBar,
} from "../../components/ui";

// ── Icônes inline (pas d'emoji) ──────────────────────────────
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

// ── Catégories (navigation latérale) ─────────────────────────
const CATEGORIES = [
  { id: "base-ui", label: "Base UI" },
  { id: "actions", label: "Actions" },
  { id: "voyage", label: "Voyage" },
  { id: "communaute", label: "Communauté" },
  { id: "souvenirs", label: "Souvenirs & Médias" },
  { id: "assistant-ia", label: "Assistant IA" },
  { id: "paiement", label: "Paiement" },
  { id: "systeme", label: "Système" },
];

// ── Données factices (mêmes patterns que Dashboard / Profile / Community) ──
const MOCK_VOL = {
  compagnie: "Air France",
  numero: "AF 275",
  depart: { ville: "Paris", heure: "08:30" },
  arrivee: { ville: "Tokyo", heure: "06:20+1" },
  duree: "14h50",
  escales: 0,
  prix: 780,
  classe: "Économique",
};

const MOCK_HOTEL = {
  nom: "Tokyo Daiichi Hotel",
  etoiles: 4,
  note: 4.5,
  avis: 2340,
  quartier: "Shibuya",
  prixNuit: 120,
  nuits: 10,
  prixTotal: 1200,
  services: ["Petit-déjeuner", "Spa", "Parking"],
  budgetStatus: "warning",
};

const MOCK_ACTIVITE = {
  titre: "Temple Senso-ji",
  note: 4.75,
  duree: "3h",
  prix: 25,
  categorie: "Culture",
};

const MOCK_BUDGET = { total: 1500, vols: 780, hotel: 650, activites: 70 };

const MOCK_VOYAGE = {
  destination: "Tokyo, Japon",
  dates: { debut: "12 mars 2024", fin: "19 mars 2024" },
  budget: MOCK_BUDGET,
  jours: [
    {
      jour: 1,
      date: "12 mars",
      activites: [
        { heure: "09:00", titre: "Arrivée à l'aéroport de Narita", description: "Transfert vers l'hôtel à Asakusa", duree: "1h30", prix: 0 },
        { heure: "14:00", titre: "Temple Senso-ji", description: "Visite du plus ancien temple de Tokyo", duree: "2h", prix: 0 },
        { heure: "19:00", titre: "Dîner à Asakusa", duree: "1h30", prix: 35 },
      ],
    },
    {
      jour: 2,
      date: "13 mars",
      activites: [
        { heure: "10:00", titre: "Shibuya Crossing", description: "La traversée la plus célèbre du monde", duree: "1h", prix: 0 },
        { heure: "15:00", titre: "Parc Rikugien et jardins", duree: "2h30", prix: 35 },
      ],
    },
  ],
};

const MOCK_VOYAGES_RECHERCHE = [
  { id: "1", destination: "Tokyo, Japon", continent: "Asie", type: "Solo", budget: 1500, date: "2024-03-12" },
  { id: "2", destination: "Barcelone, Espagne", continent: "Europe", type: "Groupe", budget: 800, date: "2024-05-02" },
  { id: "3", destination: "New York, USA", continent: "Amérique", type: "Budget", budget: 950, date: "2024-07-20" },
];

const MOCK_CARTE_POINTS = [
  { id: "1", lat: 35.6762, lng: 139.6503, title: "Tokyo", subtitle: "Point de départ" },
  { id: "2", lat: 35.0116, lng: 135.7681, title: "Kyoto", subtitle: "Jour 4 à 6" },
  { id: "3", lat: 34.3853, lng: 132.4553, title: "Hiroshima", subtitle: "Jour 7" },
];

const MOCK_PHOTOS = [
  { id: "1", url: null, titre: "Temple Senso-ji", lieu: "Tokyo", date: "Mars 2024" },
  { id: "2", url: null, titre: "Mont Fuji", lieu: "Fuji", date: "Mars 2024" },
  { id: "3", url: null, titre: "Arashiyama Bamboo Grove", lieu: "Kyoto", date: "Avril 2024" },
  { id: "4", url: null, titre: "Shibuya Crossing", lieu: "Tokyo", date: "Mars 2024" },
];

const MOCK_POST = {
  id: "1",
  auteur: { nom: "Sophie Martin", avatar: null, badge: "Guide certifié", localisation: "Tokyo, Japon" },
  temps: "il y a 2 heures",
  contenu: "Ma première expérience avec Libertia a été impeccable. L'itinéraire généré était parfaitement adapté à mon budget !",
  images: [],
  tags: ["#Japon", "#voyage", "#solo"],
  likes: 234,
  commentaires: 45,
  partages: 12,
  type: "post",
};

const MOCK_COMMENTS = [
  { id: "c1", auteur: "Mehdi El Amrani", avatar: null, contenu: "Super itinéraire, merci pour le partage !", temps: "il y a 1 heure", likes: 5 },
  { id: "c2", auteur: "Nina Laurent", avatar: null, contenu: "Le temple Senso-ji est magnifique, j'y étais en avril.", temps: "il y a 30 min", likes: 2 },
];

// ── Carte d'un composant du catalogue ────────────────────────
function ComponentCard({ name, wide = false, children }) {
  return (
    <div className={`${styles.card} ${wide ? styles.cardWide : ""}`}>
      <span className={styles.cardLabel}>{name}</span>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

export default function DesignSystem() {
  const handleNavClick = (event, id) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={styles.page}>
      {/* ── Sidebar de navigation ── */}
      <aside className={styles.sidebar}>
        <p className={styles.sidebarTitle}>Catégories</p>
        <nav className={styles.nav} aria-label="Navigation des catégories de composants">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className={styles.navLink}
              onClick={(event) => handleNavClick(event, cat.id)}
            >
              {cat.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* ── Contenu principal ── */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Design System — LibertAI</h1>
          <p className={styles.subtitle}>Catalogue des composants UI</p>
        </header>

        {/* ── Base UI ── */}
        <section id="base-ui" className={styles.section}>
          <h2 className={styles.sectionTitle}>Base UI</h2>
          <div className={styles.grid}>
            <ComponentCard name="Button">
              <div className={styles.rowGroup}>
                <Button variant="primary">Primaire</Button>
                <Button variant="outline">Contour</Button>
                <Button variant="ghost">Fantôme</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </ComponentCard>

            <ComponentCard name="Input">
              <div className={styles.stackGroup}>
                <Input label="Adresse e-mail" placeholder="vous@example.com" value="" onChange={() => {}} />
                <Input placeholder="Rechercher une destination..." variant="search" value="" onChange={() => {}} />
              </div>
            </ComponentCard>

            <ComponentCard name="Card">
              <Card variant="glass" padding={20}>
                <h3 className={styles.demoTitle}>Carte de présentation</h3>
                <p className={styles.demoText}>
                  Contenu d'exemple pour illustrer le composant Card avec son fond translucide et ses coins arrondis.
                </p>
              </Card>
            </ComponentCard>

            <ComponentCard name="Modal">
              <div className={styles.modalPreview}>
                <div className={styles.modalPreviewBox}>
                  <div className={styles.modalPreviewHeader}>
                    <h3 className={styles.modalPreviewTitle}>Supprimer le voyage</h3>
                    <span className={styles.modalPreviewClose} aria-hidden="true">
                      <CloseIcon />
                    </span>
                  </div>
                  <p className={styles.modalPreviewBody}>
                    Êtes-vous sûr de vouloir supprimer ce voyage ? Cette action est irréversible.
                  </p>
                  <div className={styles.modalPreviewFooter}>
                    <Button variant="ghost" size="sm">Annuler</Button>
                    <Button variant="danger" size="sm">Supprimer</Button>
                  </div>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard name="Badge">
              <div className={styles.rowGroup}>
                <Badge variant="success">Confirmé</Badge>
                <Badge variant="warning">En attente</Badge>
                <Badge variant="premium">Premium</Badge>
                <Badge variant="default">Brouillon</Badge>
              </div>
            </ComponentCard>

            <ComponentCard name="Spinner">
              <Spinner size={32} color="var(--accent)" label="Chargement..." />
            </ComponentCard>

            <ComponentCard name="Pill">
              <div className={styles.rowGroup}>
                <Pill active>Tous</Pill>
                <Pill>Europe</Pill>
                <Pill>Asie</Pill>
              </div>
            </ComponentCard>
          </div>
        </section>

        {/* ── Actions ── */}
        <section id="actions" className={styles.section}>
          <h2 className={styles.sectionTitle}>Actions</h2>
          <div className={styles.grid}>
            <ComponentCard name="LogoutButton">
              <LogoutButton onClick={() => {}} />
            </ComponentCard>

            <ComponentCard name="ShareButton">
              <ShareButton voyageId="v1" onShare={() => {}} />
            </ComponentCard>

            <ComponentCard name="DeleteButton">
              <DeleteButton voyageId="v1" onDelete={() => {}} />
            </ComponentCard>

            <ComponentCard name="LikeButton">
              <LikeButton count={234} liked={false} onToggle={() => {}} />
            </ComponentCard>

            <ComponentCard name="FollowButton">
              <div className={styles.rowGroup}>
                <FollowButton following={false} onToggle={() => {}} />
                <FollowButton following onToggle={() => {}} />
              </div>
            </ComponentCard>

            <ComponentCard name="DuplicateButton">
              <DuplicateButton voyageId="v1" onDuplicate={() => {}} />
            </ComponentCard>

            <ComponentCard name="VisibilityToggle">
              <div className={styles.stackGroup}>
                <VisibilityToggle isPublic={false} onChange={() => {}} />
                <VisibilityToggle isPublic variant="segmented" onChange={() => {}} />
              </div>
            </ComponentCard>

            <ComponentCard name="VoyageActionsMenu">
              <VoyageActionsMenu
                voyage={{ id: "v1", titre: "Tokyo — 7 jours", isPublic: false }}
                onDelete={() => {}}
                onDuplicate={() => {}}
                onVisibility={() => {}}
              />
            </ComponentCard>
          </div>
        </section>

        {/* ── Voyage ── */}
        <section id="voyage" className={styles.section}>
          <h2 className={styles.sectionTitle}>Voyage</h2>
          <div className={styles.grid}>
            <ComponentCard name="ItineraireJourJour" wide>
              <ItineraireJourJour voyage={MOCK_VOYAGE} />
            </ComponentCard>

            <ComponentCard name="VolCard">
              <VolCard vol={MOCK_VOL} onSelect={() => {}} isSelected={false} />
            </ComponentCard>

            <ComponentCard name="HotelCard">
              <HotelCard hotel={MOCK_HOTEL} onSelect={() => {}} isSelected={false} />
            </ComponentCard>

            <ComponentCard name="ActiviteCard">
              <ActiviteCard activite={MOCK_ACTIVITE} onAdd={() => {}} isAdded={false} />
            </ComponentCard>

            <ComponentCard name="BudgetChart" wide>
              <BudgetChart budget={MOCK_BUDGET} />
            </ComponentCard>

            <ComponentCard name="CarteMapbox" wide>
              <CarteMapbox points={MOCK_CARTE_POINTS} height={260} />
            </ComponentCard>

            <ComponentCard name="RechercheVoyages" wide>
              <RechercheVoyages voyages={MOCK_VOYAGES_RECHERCHE} onFilter={() => {}} />
            </ComponentCard>

            <ComponentCard name="ExportPdfButton">
              <ExportPdfButton onExport={() => {}} />
            </ComponentCard>
          </div>
        </section>

        {/* ── Communauté ── */}
        <section id="communaute" className={styles.section}>
          <h2 className={styles.sectionTitle}>Communauté</h2>
          <div className={styles.grid}>
            <ComponentCard name="PostCard">
              <PostCard post={MOCK_POST} />
            </ComponentCard>

            <ComponentCard name="CommentSection">
              <CommentSection comments={MOCK_COMMENTS} onAdd={() => {}} />
            </ComponentCard>

            <ComponentCard name="AvisSection">
              <AvisSection cibleNom="Mitsui Garden Hotel" cibleType="hotel" />
            </ComponentCard>
          </div>
        </section>

        {/* ── Souvenirs & Médias ── */}
        <section id="souvenirs" className={styles.section}>
          <h2 className={styles.sectionTitle}>Souvenirs & Médias</h2>
          <div className={styles.grid}>
            <ComponentCard name="GaleriePhoto">
              <GaleriePhoto photos={MOCK_PHOTOS} colonnes={2} />
            </ComponentCard>

            <ComponentCard name="UploadMultiplePhotos">
              <UploadMultiplePhotos onUploadComplete={() => {}} maxFiles={10} folderId={null} />
            </ComponentCard>

            <ComponentCard name="UploadPhoto">
              <UploadPhoto currentPhoto={null} onUpload={() => {}} name="Sophie Martin" />
            </ComponentCard>

            <ComponentCard name="ChatMessagerie" wide>
              <ChatMessagerie boxId={null} currentUser={{ nom: "Vous" }} />
            </ComponentCard>
          </div>
        </section>

        {/* ── Assistant IA ── */}
        <section id="assistant-ia" className={styles.section}>
          <h2 className={styles.sectionTitle}>Assistant IA</h2>
          <div className={styles.grid}>
            <ComponentCard name="StreamingOutput">
              <div className={streamingStyles.wrapper}>
                <div className={streamingStyles.header}>
                  <span className={streamingStyles.title}>Réponse IA</span>
                </div>
                <div className={streamingStyles.status}>Étape : Génération de l'itinéraire</div>
                <div className={streamingStyles.output}>
                  Voici votre itinéraire pour Tokyo : Jour 1 — arrivée à Narita, installation à Asakusa et visite
                  du temple Senso-ji...
                </div>
                <div className={streamingStyles.done}>Voyage enregistré • ID : 64f2a1b3c9d4e5f6a7b8c9d0</div>
              </div>
            </ComponentCard>

            <ComponentCard name="MicroAnimated">
              <MicroAnimated onResult={() => {}} />
            </ComponentCard>
          </div>
        </section>

        {/* ── Paiement ── */}
        <section id="paiement" className={styles.section}>
          <h2 className={styles.sectionTitle}>Paiement</h2>
          <div className={styles.grid}>
            <ComponentCard name="PaymentForm" wide>
              <PaymentForm amount={1200} onSuccess={() => {}} onCancel={() => {}} />
            </ComponentCard>

            <ComponentCard name="PaymentModal">
              <div className={styles.modalPreview}>
                <div className={styles.modalPreviewBox}>
                  <div className={styles.modalPreviewHeader}>
                    <h3 className={styles.modalPreviewTitle}>Paiement confirmé</h3>
                    <span className={styles.modalPreviewClose} aria-hidden="true">
                      <CloseIcon />
                    </span>
                  </div>
                  <div className={paymentModalStyles.success}>
                    <CheckCircleIcon />
                    <h3 className={paymentModalStyles.successTitle}>Paiement confirmé !</h3>
                    <div className={paymentModalStyles.successDetails}>
                      <div className={paymentModalStyles.detailRow}>
                        <span className={paymentModalStyles.detailLabel}>Numéro de transaction</span>
                        <span className={paymentModalStyles.detailValue}>TXN-1718012345678</span>
                      </div>
                      <div className={paymentModalStyles.detailRow}>
                        <span className={paymentModalStyles.detailLabel}>Montant</span>
                        <span className={paymentModalStyles.detailValue}>1200€</span>
                      </div>
                    </div>
                    <button type="button" className={paymentModalStyles.viewButton}>
                      Voir ma réservation
                    </button>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        </section>

        {/* ── Système ── */}
        <section id="systeme" className={styles.section}>
          <h2 className={styles.sectionTitle}>Système</h2>
          <div className={styles.grid}>
            <ComponentCard name="NotificationBell">
              <NotificationBell />
            </ComponentCard>

            <ComponentCard name="ProgressBar">
              <ProgressBar progress={65} label="Génération de l'itinéraire..." status="generating" />
            </ComponentCard>
          </div>
        </section>
      </main>
    </div>
  );
}
