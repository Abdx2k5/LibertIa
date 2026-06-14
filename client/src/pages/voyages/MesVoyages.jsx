import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MesVoyages.module.css";
import { useVoyage } from "../../hooks/useVoyage";
import { Button, VisibilityToggle, VoyageActionsMenu } from "../../components/ui";
import { ROUTES } from "../../utils/constants";

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
  const { voyages, loading, error, getMesVoyages } = useVoyage();

  const [expandedId, setExpandedId] = useState(null);

  const loadVoyages = useCallback(() => { getMesVoyages(); }, [getMesVoyages]);
  useEffect(() => { loadVoyages(); }, [loadVoyages]);

  const displayVoyages = voyages.length > 0 ? voyages : MOCK_VOYAGES;
  const isDemo = voyages.length === 0;

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

  return (
    <div className={styles.page}>
      <div className={styles.main}>

        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Mes voyages</h1>
            <p className={styles.pageSub}>Retrouvez tous les itinéraires générés par votre assistant IA.</p>
          </div>
          <Button variant="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
            ✨ Nouveau voyage
          </Button>
        </div>

        {isDemo && (
          <div className={styles.demoBanner}>
            Aucun voyage généré pour l'instant — voici un aperçu avec des exemples.
          </div>
        )}

        {error && <div className={styles.errorText}>{error}</div>}

        {loading && displayVoyages.length === 0 ? (
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
                      <p className={styles.cardDestination}>📍 {v.destination}</p>
                    </div>
                    <VisibilityToggle
                      variant="segmented"
                      isPublic={!!v.partage}
                      onChange={(isPublic) => handleVisibility(id, isPublic)}
                    />
                  </div>

                  <div className={styles.cardMeta}>
                    <span>🗓️ {formatDate(v.dates?.start)} → {formatDate(v.dates?.end)}</span>
                    {v.budget?.total != null && (
                      <span>💰 {v.budget.total} {v.budget.currency || "EUR"}</span>
                    )}
                    {v.likeCount > 0 && <span>❤️ {v.likeCount}</span>}
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
