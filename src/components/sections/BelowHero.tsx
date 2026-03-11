import styles from "./BelowHero.module.css";

const features = [
  {
    n: "01",
    name: "Budget-Smart",
    desc: "Recommendations filtered precisely to your price range, no upselling.",
  },
  {
    n: "02",
    name: "Multi-Brand",
    desc: "Covers all major manufacturers across fuel types and segments.",
  },
  {
    n: "03",
    name: "Fast Diagnosis",
    desc: "Describe any symptom. Get actionable repair steps instantly.",
  },
  {
    n: "04",
    name: "History Saved",
    desc: "Sign in to keep your sessions. Review anytime, anywhere.",
  },
];

export default function BelowHero() {
  return (
    <section className={styles.belowHero}>
      <div>
        <div className={styles.sectionTag}>Why CarCo</div>
        <h2 className={styles.sectionTitle}>INTELLIGENCE MEETS PRECISION</h2>
        <p className={styles.sectionBody}>
          CarCo combines deep automotive knowledge with cutting-edge AI to give
          you recommendations and diagnostics that actually make sense — no
          filler, no guesswork. Whether you're buying your first car or
          debugging a mysterious engine noise, we've got you covered.
        </p>
      </div>
      <div className={styles.featureGrid}>
        {features.map((f) => (
          <div className={styles.featureItem} key={f.n}>
            <div className={styles.featureNum}>{f.n}</div>
            <div className={styles.featureName}>{f.name}</div>
            <div className={styles.featureDesc}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
