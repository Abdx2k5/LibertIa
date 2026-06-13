import { useEffect, useState } from "react";
import styles from "./BudgetChart.module.css";

function formatEuro(value) {
  const normalized = Math.round(Number(value) || 0);
  return `${normalized.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}€`;
}

function clampPercentage(value) {
  return Math.max(0, Math.min(100, value));
}

export default function BudgetChart({ budget = {} }) {
  const [mounted, setMounted] = useState(false);

  const total = Number(budget.total) || 0;
  const vols = Math.max(0, Number(budget.vols) || 0);
  const hotel = Math.max(0, Number(budget.hotel) || 0);
  const activites = Math.max(0, Number(budget.activites) || 0);

  const depenseTotale = vols + hotel + activites;
  const reste = total - depenseTotale;
  const resteAffiche = Math.max(reste, 0);
  const depassement = Math.max(-reste, 0);
  const chartTotal = total > 0 ? total : 1;
  const scale = depenseTotale > total && total > 0 ? total / depenseTotale : 1;

  const chartValues = {
    vols: vols * scale,
    hotel: hotel * scale,
    activites: activites * scale,
    reste: resteAffiche,
  };

  const angle = (value) => `${(value / chartTotal) * 360}deg`;
  const volEnd = angle(chartValues.vols);
  const hotelEnd = angle(chartValues.vols + chartValues.hotel);
  const activitesEnd = angle(chartValues.vols + chartValues.hotel + chartValues.activites);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const rows = [
    { key: "vols", label: "Vols", value: vols, color: "#aa3bff" },
    { key: "hotel", label: "Hôtel", value: hotel, color: "#A78BFA" },
    { key: "activites", label: "Activités", value: activites, color: "#4ade80" },
    { key: "reste", label: "Reste", value: resteAffiche, color: "#64748b" },
  ];

  return (
    <section
      className={styles.card}
      style={{
        "--vol-end": volEnd,
        "--hotel-end": hotelEnd,
        "--activites-end": activitesEnd,
      }}
      aria-label={`Budget total de ${formatEuro(total)}`}
    >
      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.donut}>
            <div className={styles.hole} aria-hidden="true" />
            <div className={styles.centerText}>
              <div className={styles.total}>{formatEuro(total)}</div>
              <div className={styles.label}>Budget total</div>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.rows}>
            {rows.map((row) => {
              const percent = total > 0 ? clampPercentage((row.value / total) * 100) : 0;

              return (
                <div key={row.key} className={styles.row}>
                  <div className={styles.rowHead}>
                    <span className={styles.dot} style={{ background: row.color }} />
                    <span className={styles.rowLabel}>{row.label}</span>
                  </div>

                  <div className={styles.barTrack} aria-hidden="true">
                    <div
                      className={styles.barFill}
                      style={{
                        background: row.color,
                        width: mounted ? `${percent}%` : "0%",
                      }}
                    />
                  </div>

                  <div className={styles.rowAmount}>{formatEuro(row.value)}</div>
                </div>
              );
            })}
          </div>

          <div className={styles.stats}>
            <div className={`${styles.pill} ${resteAffiche > 0 ? styles.pillSuccess : ""}`}>
              <div className={styles.pillLabel}>Économies potentielles</div>
              <div className={styles.pillValue}>{formatEuro(resteAffiche)}</div>
            </div>

            <div className={`${styles.pill} ${depassement > 0 ? styles.pillDanger : ""}`}>
              <div className={styles.pillLabel}>Dépassement</div>
              <div className={styles.pillValue}>{formatEuro(depassement)}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
