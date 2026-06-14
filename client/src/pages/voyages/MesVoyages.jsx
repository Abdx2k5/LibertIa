import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MesVoyages.module.css";
import { useVoyage } from "../../hooks/useVoyage";
import { Badge, Button, ShareButton, DeleteButton } from "../../components/ui";
import ShareModal from "../../components/modals/ShareModal";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVoyage, setSelectedVoyage] = useState(null);

  const loadVoyages = useCallback(() => { getMesVoyages(); }, [getMesVoyages]);
  useEffect(() => { loadVoyages(); }, [loadVoyages]);

  const displayVoyages = voyages.length > 0 ? voyages : MOCK_VOYAGES;
  const isDemo = voyages.length === 0;

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const findVoyage = (id) => displayVoyages.find((v) => (v._id || v.id) === id);

  const handleShareClick = (id) => {
    setSelectedVoyage(findVoyage(id));
    setShareModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedVoyage(findVoyage(id));
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedVoyage) {
      // TODO: brancher sur DELETE /api/voyages/:id puis rafraîchir la liste
      console.log("Suppression du voyage :", selectedVoyage);
      setDeleteModalOpen(false);
      setSelectedVoyage(null);
    }
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
                    {v.partage && <Badge variant="cyan">Partagé</Badge>}
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
                    <ShareButton voyageId={id} onShare={handleShareClick} variant="outline" size="sm" />
                    <DeleteButton voyageId={id} onDelete={handleDeleteClick} variant="danger" size="sm" />
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

      {/* ── Modal de partage ── */}
      {selectedVoyage && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => { setShareModalOpen(false); setSelectedVoyage(null); }}
          voyageTitle={selectedVoyage.titre || selectedVoyage.destination || "Mon voyage"}
          voyageId={selectedVoyage._id || selectedVoyage.id}
        />
      )}

      {/* ── Modal de suppression ── */}
      {selectedVoyage && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setSelectedVoyage(null); }}
          onConfirm={handleConfirmDelete}
          voyageTitle={selectedVoyage.titre || selectedVoyage.destination || "Mon voyage"}
          loading={false}
        />
      )}
    </div>
  );
}
