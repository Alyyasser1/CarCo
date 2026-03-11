import type { SavedSession } from "../../firebase/firestore";
import type {
  RecommendationResult,
  DiagnosisResult,
} from "../../services/aiService";
import styles from "./HistoryModal.module.css";

interface Props {
  session: SavedSession;
  onClose: () => void;
}

export default function HistoryModal({ session, onClose }: Props) {
  const isRecommendation = session.type === "recommendation";

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>
              {isRecommendation ? "Recommendation" : "Diagnosis"}
            </p>
            <h2 className={styles.title}>{session.title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {isRecommendation
            ? renderRecommendation(
                session.result as RecommendationResult,
                styles,
              )
            : renderDiagnosis(session.result as DiagnosisResult, styles)}
        </div>
      </div>
    </div>
  );
}

function renderRecommendation(
  result: RecommendationResult,
  styles: Record<string, string>,
) {
  return (
    <div className={styles.carList}>
      {result.cars.map((car, i) => (
        <div key={i} className={styles.carCard}>
          <div className={styles.carHeader}>
            <h3 className={styles.carName}>{car.name}</h3>
            <span className={styles.carPrice}>{car.priceRange}</span>
          </div>
          <p className={styles.carEngine}>{car.engineSpecs}</p>
          <p className={styles.carWhy}>{car.whyItMatches}</p>
          <div className={styles.carFooter}>
            <div className={styles.carPros}>
              <span className={styles.prosLabel}>Pros</span>
              <ul>
                {car.pros.map((p, j) => (
                  <li key={j}>{p}</li>
                ))}
              </ul>
            </div>
            <div className={styles.carCons}>
              <span className={styles.consLabel}>Cons</span>
              <ul>
                {car.cons.map((c, j) => (
                  <li key={j}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderDiagnosis(
  result: DiagnosisResult,
  styles: Record<string, string>,
) {
  return (
    <div className={styles.causeList}>
      {result.causes.map((cause, i) => (
        <div key={i} className={styles.causeCard}>
          <div className={styles.causeHeader}>
            <h3 className={styles.causeName}>{cause.cause}</h3>
            <span className={`${styles.severity} ${styles[cause.severity]}`}>
              {cause.severity}
            </span>
          </div>
          <div className={styles.causeMeta}>
            <span className={styles.repairCost}>
              Est. repair: {cause.estimatedRepairCost}
            </span>
            <span
              className={`${styles.mechanicTag} ${cause.visitMechanic ? styles.mechanicYes : styles.mechanicNo}`}
            >
              {cause.visitMechanic ? "⚠ Visit a mechanic" : "✓ DIY possible"}
            </span>
          </div>
          <ul className={styles.fixSteps}>
            {cause.fixSteps.map((step, j) => (
              <li key={j}>{step}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
