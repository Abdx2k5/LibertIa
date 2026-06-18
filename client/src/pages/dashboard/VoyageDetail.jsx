import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./VoyageDetail.module.css";
import { useVoyage } from "../../hooks/useVoyage";
import voyageService from "../../services/voyage.service";
import { Spinner, Button, Badge, ShareButton, DeleteButton, ExportPdfButton } from "../../components/ui";
import ShareModal from "../../components/modals/ShareModal";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";
import { formatDate } from "../../utils/helpers";
import { ROUTES } from "../../utils/constants";

const MOMENTS = [
  { key: "matin", label: "Matin" },
  { key: "apres_midi", label: "Après-midi" },
  { key: "soir", label: "Soir" },
];

export default function VoyageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { voyage, loading, error, getById } = useVoyage();

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadVoyage = useCallback(() => { getById(id); }, [getById, id]);
  useEffect(() => { loadVoyage(); }, [loadVoyage]);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await voyageService.deleteVoyage(id);
      navigate(ROUTES.DASHBOARD);
    } catch {
      setDeleteError("Impossible de supprimer ce voyage pour le moment.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>
          <Spinner size={32} color="var(--accent)" label="Chargement du voyage..." />
        </div>
      </div>
    );
  }

  if (error || !voyage) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}>
          <p className={styles.errorText}>{error || "Voyage introuvable."}</p>
          <Link to={ROUTES.DASHBOARD} className={styles.backLink}>← Retour au tableau de bord</Link>
        </div>
      </div>
    );
  }

  const itineraire = voyage.itineraire || {};
  const jours = itineraire.jours || [];
  const conseils = itineraire.conseils || [];
  const restaurants = itineraire.restaurants_recommandes || [];
  const hebergement = itineraire.hebergement_recommande;
  const vol = itineraire.vol_recommande;
  const budgetDetail = itineraire.budget_detail;

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <Link to={ROUTES.DASHBOARD} className={styles.backLink}>← Retour au tableau de bord</Link>

        {/* ── En-tête d'impression (visible uniquement dans le PDF exporté) ── */}
        <div className={styles.printHeader}>
          <div className={styles.printHeaderBrand}>LibertIa — Itinéraire de voyage</div>
          <div className={styles.printHeaderDate}>Exporté le {formatDate(new Date().toISOString())}</div>
        </div>

        {/* ── Header ── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{voyage.titre || voyage.destination}</h1>
            <p className={styles.destination}>{voyage.destination}</p>
            {voyage.dates?.start && voyage.dates?.end && (
              <p className={styles.dates}>
                {formatDate(voyage.dates.start)} → {formatDate(voyage.dates.end)}
              </p>
            )}
            <div className={styles.badges}>
              <Badge variant={voyage.partage ? "success" : "default"}>
                {voyage.partage ? "Partagé" : "Privé"}
              </Badge>
              {voyage.budget?.total ? (
                <Badge variant="premium">Budget {voyage.budget.total}€</Badge>
              ) : null}
            </div>
          </div>
          <div className={styles.actions}>
            <ExportPdfButton onExport={() => window.print()} variant="outline" />
            <ShareButton voyageId={voyage._id} onShare={() => setShareModalOpen(true)} variant="outline" />
            <DeleteButton voyageId={voyage._id} onDelete={() => setDeleteModalOpen(true)} variant="danger" />
          </div>
        </div>

        {/* ── Prompt original ── */}
        {voyage.prompt && (
          <div className={styles.promptCard}>
            <span className={styles.promptLabel}>Votre demande</span>
            <p className={styles.promptText}>« {voyage.prompt} »</p>
          </div>
        )}

        {/* ── Itinéraire jour par jour ── */}
        {jours.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Itinéraire jour par jour</h2>
            <div className={styles.joursList}>
              {jours.map((jour, idx) => (
                <div key={idx} className={styles.jourCard}>
                  <div className={styles.jourHeader}>Jour {jour.jour ?? idx + 1}</div>
                  <div className={styles.momentsList}>
                    {MOMENTS.map(({ key, label }) => {
                      const moment = jour[key];
                      if (!moment || !moment.activite) return null;
                      return (
                        <div key={key} className={styles.moment}>
                          <div className={styles.momentLabel}>{label}</div>
                          <div className={styles.momentActivite}>{moment.activite}</div>
                          <div className={styles.momentMeta}>
                            {moment.lieu && <span>{moment.lieu}</span>}
                            {moment.duree && <span className={styles.momentDuree}>{moment.duree}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recommandations ── */}
        {(hebergement || vol || restaurants.length > 0) && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recommandations</h2>
            <div className={styles.recosGrid}>
              {hebergement && (
                <div className={styles.recoCard}>
                  <div className={styles.recoLabel}>Hébergement</div>
                  <div className={styles.recoTitle}>{hebergement.nom}</div>
                  {hebergement.prix_nuit && (
                    <div className={styles.recoMeta}>{hebergement.prix_nuit} / nuit</div>
                  )}
                </div>
              )}
              {vol && (
                <div className={styles.recoCard}>
                  <div className={styles.recoLabel}>Vol</div>
                  <div className={styles.recoTitle}>{vol.compagnie}</div>
                  <div className={styles.recoMeta}>
                    {vol.prix && <span>{vol.prix}</span>}
                    {vol.duree && <span> · {vol.duree}</span>}
                  </div>
                </div>
              )}
              {restaurants.length > 0 && (
                <div className={styles.recoCard}>
                  <div className={styles.recoLabel}>Restaurants conseillés</div>
                  <ul className={styles.recoList}>
                    {restaurants.map((r, idx) => (
                      <li key={idx}>{typeof r === "string" ? r : r.nom}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Budget ── */}
        {budgetDetail && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Détail du budget</h2>
            <div className={styles.budgetGrid}>
              {Object.entries(budgetDetail).map(([key, value]) => (
                <div key={key} className={styles.budgetItem}>
                  <div className={styles.budgetKey}>{key.replace(/_/g, " ")}</div>
                  <div className={styles.budgetValue}>{value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Conseils ── */}
        {conseils.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Conseils</h2>
            <ul className={styles.conseilsList}>
              {conseils.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* ── SHARE MODAL ── */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        voyageTitle={voyage.titre || voyage.prompt || "Mon voyage"}
        voyageId={voyage._id}
      />

      {/* ── DELETE MODAL ── */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        voyageTitle={voyage.titre || voyage.prompt || "Mon voyage"}
        loading={deleting}
      />
      {deleteError && (
        <div className={styles.deleteErrorToast}>
          {deleteError}
          <Button variant="ghost" size="sm" onClick={() => setDeleteError(null)}>✕</Button>
        </div>
      )}
    </div>
  );
}
