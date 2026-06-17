// =============================================================
// FICHIER  : src/components/ui/ProgressBar.jsx
// TÂCHE    : T37 — Barre de progression scraping
//
// PROPS :
//   - progress → number (0-100) — pourcentage d'avancement
//   - label    → string — libellé au-dessus de la barre
//   - status   → "generating" | "complete"
//   - steps    → string[] (optionnel) — étapes du scraping
//                (ex: ["Vols", "Hôtels", "Activités"]). L'étape
//                courante est déduite du `progress`.
//
// Rétro-compatible : sans `steps`, le rendu est identique à avant.
// =============================================================

import { useEffect, useState } from 'react';
import styles from './ProgressBar.module.css';

export default function ProgressBar({
  progress = 0,
  label = 'Scraping...',
  status = 'generating',
  steps = [],
}) {
  const [displayProgress, setDisplayProgress] = useState(progress);

  // Smooth animation of progress bar
  useEffect(() => {
    if (progress === displayProgress) return;

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const target = progress;
        const diff = target - prev;
        return prev + diff * 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [progress, displayProgress]);

  const isComplete = status === 'complete';
  const progressPercent = Math.min(Math.round(displayProgress), 100);

  // Détermine l'index de l'étape courante à partir du pourcentage.
  const hasSteps = Array.isArray(steps) && steps.length > 0;
  const currentStep = hasSteps
    ? Math.min(steps.length - 1, Math.floor((progressPercent / 100) * steps.length))
    : -1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.percentage}>{progressPercent}%</span>
      </div>

      <div className={styles.barContainer}>
        <div
          className={`${styles.bar} ${isComplete ? styles.complete : ''}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {hasSteps && (
        <ol className={styles.steps}>
          {steps.map((step, index) => {
            const done = isComplete || index < currentStep;
            const active = !isComplete && index === currentStep;
            const stepClass = `${styles.step} ${done ? styles.stepDone : ''} ${active ? styles.stepActive : ''}`;
            return (
              <li key={step} className={stepClass}>
                <span className={styles.stepDot} aria-hidden="true">
                  {done ? '✓' : index + 1}
                </span>
                <span className={styles.stepLabel}>{step}</span>
              </li>
            );
          })}
        </ol>
      )}

      {status === 'generating' && (
        <div className={styles.spinner} />
      )}

      {isComplete && (
        <div className={styles.completeText}>✓ Terminé</div>
      )}
    </div>
  );
}
