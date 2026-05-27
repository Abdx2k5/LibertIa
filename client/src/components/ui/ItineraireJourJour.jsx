import { useState } from "react";
import styles from "./ItineraireJourJour.module.css";

export default function ItineraireJourJour({ voyage }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!voyage?.jours || voyage.jours.length === 0) return null;
  const selectedDay = voyage.jours[selectedDayIndex];

  const budget = voyage.budget || { total: 0, vols: 0, hotel: 0, activites: 0 };
  const reste = Math.max(0, budget.total - (budget.vols + budget.hotel + budget.activites));
  const segments = [
    { label: "Vols", amount: budget.vols, color: "#aa3bff" },
    { label: "Hôtel", amount: budget.hotel, color: "#00d9ff" },
    { label: "Activités", amount: budget.activites, color: "#4ade80" },
    { label: "Reste", amount: reste, color: "#64748b" },
  ];

  const total = budget.total || 1;
  const segmentWidths = segments.map((s) => ((s.amount / total) * 100).toFixed(1));

  return (
    <div className={styles.wrapper}>
      {/* Destination & Dates */}
      <div className={styles.header}>
        <h2 className={styles.destination}>{voyage.destination}</h2>
        {voyage.dates && (
          <p className={styles.dates}>
            {voyage.dates.debut} → {voyage.dates.fin}
          </p>
        )}
      </div>

      {/* Day Selector (Horizontal Tabs) */}
      <div className={styles.daySelector}>
        <div className={styles.dayTabs}>
          {voyage.jours.map((day, idx) => (
            <button
              key={idx}
              className={`${styles.dayTab} ${
                selectedDayIndex === idx ? styles.dayTabActive : ""
              }`}
              onClick={() => setSelectedDayIndex(idx)}
            >
              <div className={styles.dayNumber}>Jour {day.jour}</div>
              <div className={styles.dayDate}>{day.date}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Activities for Selected Day */}
      <div className={styles.activitiesContainer}>
        {selectedDay.activites && selectedDay.activites.length > 0 ? (
          <div className={styles.activitiesList}>
            {selectedDay.activites.map((activity, idx) => (
              <div key={idx} className={styles.activityRow}>
                <div className={styles.timeBadge}>{activity.heure}</div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>{activity.titre}</div>
                  {activity.description && (
                    <div className={styles.activityDesc}>{activity.description}</div>
                  )}
                </div>
                <div className={styles.activityMeta}>
                  {activity.duree && (
                    <div className={styles.durationPill}>{activity.duree}</div>
                  )}
                  <div
                    className={`${styles.price} ${
                      activity.prix === 0 ? styles.priceFree : ""
                    }`}
                  >
                    {activity.prix === 0 ? "Gratuit" : `${activity.prix}€`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noActivities}>Aucune activité pour ce jour.</div>
        )}
      </div>

      {/* Budget Summary Bar */}
      <div className={styles.budgetContainer}>
        <div className={styles.budgetBar}>
          {segments.map((segment, idx) => (
            segment.amount > 0 && (
              <div
                key={idx}
                className={styles.budgetSegment}
                style={{
                  width: `${segmentWidths[idx]}%`,
                  backgroundColor: segment.color,
                }}
                title={`${segment.label}: ${segment.amount}€`}
              />
            )
          ))}
        </div>
        <div className={styles.budgetLegend}>
          {segments.map((segment, idx) => (
            segment.amount > 0 && (
              <div key={idx} className={styles.budgetItem}>
                <div
                  className={styles.budgetDot}
                  style={{ backgroundColor: segment.color }}
                />
                <span className={styles.budgetLabel}>{segment.label}</span>
                <span className={styles.budgetAmount}>{segment.amount}€</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
