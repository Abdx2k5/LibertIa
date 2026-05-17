import { useEffect, useState } from 'react';
import styles from './ProgressBar.module.css';

export default function ProgressBar({ progress = 0, label = 'Scraping...', status = 'generating' }) {
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

      {status === 'generating' && (
        <div className={styles.spinner} />
      )}

      {isComplete && (
        <div className={styles.completeText}>✓ Terminé</div>
      )}
    </div>
  );
}
