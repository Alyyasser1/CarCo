import styles from "./Hero.module.css";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className={styles.heroContent}>
      <div className={styles.eyebrow}>AI-Powered Automotive Intelligence</div>
      <h1 className={styles.heroTitle}>
        FIND YOUR
        <br />
        PERFECT <em className={styles.heroTitleAccent}>DRIVE.</em>
      </h1>
      <p className={styles.heroSub}>
        Intelligent car recommendations tailored to your budget and lifestyle.
        Expert diagnosis for every problem your car throws at you.
      </p>
      <div className={styles.heroCtas}>
        <Button
          variant="primary"
          text="Find My Car →"
          onClick={() => navigate("/recommend")}
        />
        <Button
          variant="secondary"
          text="Diagnose a Problem"
          onClick={() => navigate("/diagnose")}
        />
      </div>
    </div>
  );
}
