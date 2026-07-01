import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MesVoyages.module.css";
import { useVoyage } from "../../hooks/useVoyage";
import { Button, VisibilityToggle, VoyageActionsMenu, CarteMapbox } from "../../components/ui";
import { ROUTES } from "../../utils/constants";

// ── Icônes inline (T44) ──
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: -2 }} aria-hidden="true">
    <path d="m12 3-1.9 5.7a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.7a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: -2 }} aria-hidden="true">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: -2 }} aria-hidden="true">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const WalletIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: -2 }} aria-hidden="true">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: -2 }} aria-hidden="true">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

// ── Voyages de démonstration (affichés si l'utilisateur n'a encore rien généré) ──
const MOCK_VOYAGES = [
  {
    _id: "mock-1",
    titre: "Tokyo — 2026-07-10",
    destination: "Tokyo, Japon",
    dates: { start: "2026-07-10", end: "2026-07-17" },
    budget: { total: 1850, currency: "EUR" },
    partage: true,
    likeCount: 12,
    coordonnees: { lat: 35.6762, lng: 139.6503 },
    itineraire: {
      jours: [
        { jour: 1, matin: { activite: "Visite du temple Senso-ji", lieu: "Asakusa" }, apres_midi: { activite: "Shibuya Crossing", lieu: "Shibuya" }, soir: { activite: "Dîner izakaya", lieu: "Shinjuku" } },
        { jour: 2, matin: { activite: "Marché de Tsukiji", lieu: "Tsukiji" }, apres_midi: { activite: "Parc Ueno", lieu: "Ueno" }, soir: { activite: "Akihabara by night", lieu: "Akihabara" } },
      ],
    },
  },
  {
    _id: "mock-2",
    titre: "Marrakech — 2026-08-02",
    destination: "Marrakech, Maroc",
    dates: { start: "2026-08-02", end: "2026-08-06" },
    budget: { total: 620, currency: "EUR" },
    partage: false,
    likeCount: 0,
    coordonnees: { lat: 31.6295, lng: -7.9811 },
    itineraire: {
      jours: [
        { jour: 1, matin: { activite: "Place Jemaa el-Fna", lieu: "Médina" }, apres_midi: { activite: "Jardin Majorelle", lieu: "Guéliz" }, soir: { activite: "Dîner sur les toits", lieu: "Médina" } },
      ],
    },
  },
];

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function MesVoyages() {
  const navigate = useNavigate();
  const {
    voyages, loading, error, getMesVoyages,
    carteVoyages, carteLoading, getCarteVoyages,
  } = useVoyage();

  const [expandedId, setExpandedId] = useState(null);
  // T44 — bascule entre la vue liste et la carte interactive
  const [vue, setVue] = useState("liste");

  const loadVoyages = useCallback(() => { getMesVoyages(); }, [getMesVoyages]);
  useEffect(() => { loadVoyages(); }, [loadVoyages]);

  const displayVoyages = voyages.length > 0 ? voyages : MOCK_VOYAGES;
  const isDemo = voyages.length === 0;

  // T44 — charge les voyages géolocalisés à l'ouverture de la vue carte
  useEffect(() => {
    if (vue === "carte" && !isDemo) getCarteVoyages();
  }, [vue, isDemo, getCarteVoyages]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ── Actions voyage (T45/T49/T51) — branchées en local/mock ──
  const handleDelete = async (id) => {
    // TODO: brancher sur DELETE /api/voyages/:id puis rafraîchir la liste
    console.log("Suppression du voyage :", id);
  };

  const handleDuplicate = async (id) => {
    // TODO: brancher sur POST /api/voyages/:id/duplicate puis rafraîchir
    console.log("Duplication du voyage :", id);
  };

  const handleVisibility = (id, isPublic) => {
    // TODO: brancher sur PATCH /api/voyages/:id { partage: isPublic }
    console.log("Visibilité du voyage :", id, isPublic ? "public" : "privé");
  };

  // T44 — points géolocalisés pour la carte interactive
  const carteSource = isDemo ? MOCK_VOYAGES : carteVoyages;
  const points = carteSource
    .filter((v) => v.coordonnees?.lat != null && v.coordonnees?.lng != null)
    .map((v) => {
      const id = v._id || v.id;
      return {
        id,
        lat: v.coordonnees.lat,
        lng: v.coordonnees.lng,
        title: v.titre || v.destination,
        subtitle: v.destination,
        onClick: isDemo ? undefined : () => navigate(ROUTES.VOYAGE_DETAIL.replace(":id", id)),
      };
    });

  return (
    <div className={styles.page}>
      
      <div className={styles.main}>

        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Mes voyages</h1>
            <p className={styles.pageSub}>Retrouvez tous les itinéraires générés par votre assistant IA.</p>
          </div>
          <Button variant="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
            <SparklesIcon /> Nouveau voyage
          </Button>
        </div>

        {/* T44 — bascule Liste / Carte */}
        <div className={styles.viewToggle} role="group" aria-label="Mode d'affichage">
          <button
            type="button"
            className={`${styles.viewBtn} ${vue === "liste" ? styles.viewBtnActive : ""}`}
            onClick={() => setVue("liste")}
            aria-pressed={vue === "liste"}
          >
            <ListIcon />
            Liste
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${vue === "carte" ? styles.viewBtnActive : ""}`}
            onClick={() => setVue("carte")}
            aria-pressed={vue === "carte"}
          >
            <MapIcon />
            Carte
          </button>
        </div>

        {isDemo && (
          <div className={styles.demoBanner}>
            Aucun voyage généré pour l'instant — voici un aperçu avec des exemples.
          </div>
        )}

        {error && <div className={styles.errorText}>{error}</div>}

        {vue === "carte" ? (
          <div className={styles.carteWrap}>
            {carteLoading && !isDemo && <p className={styles.carteLoading}>Chargement de la carte...</p>}
            <CarteMapbox
              points={points}
              height={480}
              emptyMessage="Aucun voyage géolocalisé pour le moment."
            />
          </div>
        ) : loading && displayVoyages.length === 0 ? (
          <div className={styles.emptyState}>Chargement de vos voyages...</div>
        ) : displayVoyages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Vous n'avez encore aucun voyage.</p>
            <Button variant="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
              Générer mon premier itinéraire
            </Button>
          </div>
        ) : (
          <div className={styles.grid}>
            {displayVoyages.map((v) => {
              const id = v._id || v.id;
              const isExpanded = expandedId === id;
              const jours = v.itineraire?.jours || [];

              return (
                <div key={id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.cardTitle}>{v.titre || v.destination}</h3>
                      <p className={styles.cardDestination}><MapPinIcon />{v.destination}</p>
                    </div>
                    <VisibilityToggle
                      variant="segmented"
                      isPublic={!!v.partage}
                      onChange={(isPublic) => handleVisibility(id, isPublic)}
                    />
                  </div>

                  <div className={styles.cardMeta}>
                    <span><CalendarIcon />{formatDate(v.dates?.start)} → {formatDate(v.dates?.end)}</span>
                    {v.budget?.total != null && (
                      <span><WalletIcon />{v.budget.total} {v.budget.currency || "EUR"}</span>
                    )}
                    {v.likeCount > 0 && <span><HeartIcon />{v.likeCount}</span>}
                  </div>

                  <div className={styles.cardActions}>
                    <Button variant="outline" size="sm" onClick={() => toggleExpand(id)}>
                      {isExpanded ? "Masquer l'itinéraire" : "Voir l'itinéraire"}
                    </Button>
                    <div className={styles.actionsMenu}>
                      <VoyageActionsMenu
                        voyage={{ id, titre: v.titre || v.destination, isPublic: !!v.partage }}
                        showVisibility={false}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onVisibility={handleVisibility}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={styles.itinerary}>
                      {jours.length === 0 ? (
                        <p className={styles.noItinerary}>Aucun détail d'itinéraire disponible.</p>
                      ) : (
                        jours.map((jour) => (
                          <div key={jour.jour} className={styles.dayBlock}>
                            <div className={styles.dayLabel}>Jour {jour.jour}</div>
                            <ul className={styles.dayList}>
                              {jour.matin && <li><strong>Matin :</strong> {jour.matin.activite} {jour.matin.lieu && `— ${jour.matin.lieu}`}</li>}
                              {jour.apres_midi && <li><strong>Après-midi :</strong> {jour.apres_midi.activite} {jour.apres_midi.lieu && `— ${jour.apres_midi.lieu}`}</li>}
                              {jour.soir && <li><strong>Soir :</strong> {jour.soir.activite} {jour.soir.lieu && `— ${jour.soir.lieu}`}</li>}
                            </ul>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

