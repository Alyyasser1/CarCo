import { useState, useRef, useEffect } from "react";
import NavbarLoggedIn from "../components/navbar/NavbarLoggedIn";
import NavbarLoggedOut from "../components/navbar/NavbarLoggedOut";
import AuthModal from "../components/auth/AuthModal";
import useAuth from "../hooks/useAuth";
import styles from "./DiagnosisPage.module.css";
import Footer from "../components/footer/Footer";
import Button from "../components/ui/Button";
import { getCarDiagnosis, type DiagnosisResult } from "../services/aiService";
import { saveSession } from "../firebase/firestore";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - 1989 },
  (_, i) => CURRENT_YEAR - i,
);

type ModalView = "login" | "signup" | null;

interface YearDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

function YearDropdown({ value, onChange }: YearDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={styles.selectWrapper} ref={ref}>
      <button
        type="button"
        className={`${styles.selectTrigger} ${open ? styles.selectTriggerOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? styles.selectValue : styles.selectPlaceholder}>
          {value || "Select year"}
        </span>
        <span className={styles.selectArrow}>▾</span>
      </button>

      {open && (
        <div className={styles.selectMenu}>
          <div
            className={styles.selectOption}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            Select year
          </div>
          {YEARS.map((y) => (
            <div
              key={y}
              className={`${styles.selectOption} ${String(y) === value ? styles.selectOptionActive : ""}`}
              onClick={() => {
                onChange(String(y));
                setOpen(false);
              }}
            >
              {y}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiagnosisPage() {
  const isSubmitting = useRef(false);

  const { user, loading } = useAuth();
  const [modal, setModal] = useState<ModalView>(null);

  const [brand, setBrand] = useState("");
  const [year, setYear] = useState("");
  const [problem, setProblem] = useState("");
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // validation first, before touching isSubmitting
    if (!brand.trim()) {
      setError("Please enter your car brand.");
      return;
    }
    if (!problem.trim()) {
      setError("Please describe the problem.");
      return;
    }

    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setError(null);
    setThinking(true);
    setResult(null);

    try {
      const data = await getCarDiagnosis({ brand, year, problem });
      setResult(data);
      if (user) await saveSession(user.uid, "diagnosis", problem.trim(), data);
    } catch (err: unknown) {
      const message = (err as Error).message || "";
      setError(message || "Something went wrong. Please try again.");
    } finally {
      setThinking(false);
      isSubmitting.current = false;
    }
  };

  const hasInput = brand.trim() || year || problem.trim();

  return (
    <div className={styles.page}>
      {!loading &&
        (user ? (
          <NavbarLoggedIn />
        ) : (
          <NavbarLoggedOut
            onLogin={() => setModal("login")}
            onSignup={() => setModal("signup")}
          />
        ))}

      <div className={styles.layout}>
        {/* LEFT PANEL */}
        <div className={styles.formPanel}>
          <p className={styles.eyebrow}>AI-Powered</p>
          <h1 className={styles.title}>Diagnose Your Car</h1>
          <p className={styles.subtitle}>
            Describe the issue and we'll find out what's wrong.
          </p>

          {/* BRAND */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Car Brand</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Toyota, BMW, Hyundai..."
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          {/* YEAR */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Year</label>
            <YearDropdown value={year} onChange={setYear} />
          </div>

          {/* PROBLEM */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Describe the Problem</label>
            <textarea
              className={styles.textarea}
              placeholder="e.g. My car makes a grinding noise when braking, the engine shakes at idle, there's a burning smell from the hood..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={7}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <Button
            text={thinking ? "Diagnosing..." : "Diagnose →"}
            onClick={handleSubmit}
            disabled={thinking}
            variant="primary"
            fullWidth
          />
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.resultPanel}>
          {thinking && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>Analyzing the problem...</p>
            </div>
          )}

          {!thinking && result && (
            <div className={styles.resultContent}>
              <p className={styles.resultEyebrow}>Diagnosis</p>
              <div className={styles.causeList}>
                {result.causes.map((cause, i) => (
                  <div key={i} className={styles.causeCard}>
                    <div className={styles.causeHeader}>
                      <h3 className={styles.causeName}>{cause.cause}</h3>
                      <span
                        className={`${styles.severity} ${styles[cause.severity]}`}
                      >
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
                        {cause.visitMechanic
                          ? "⚠ Visit a mechanic"
                          : "✓ DIY possible"}
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
            </div>
          )}

          {!thinking && !result && (
            <div className={styles.emptyState}>
              <div className={styles.illustration}>
                <svg
                  viewBox="0 0 200 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.illustrationSvg}
                >
                  {/* Engine block */}
                  <rect
                    x="60"
                    y="50"
                    width="80"
                    height="60"
                    rx="3"
                    fill="rgba(255,255,255,0.03)"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                  {/* Cylinders */}
                  <rect
                    x="70"
                    y="38"
                    width="14"
                    height="16"
                    rx="2"
                    fill="rgba(255,255,255,0.04)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <rect
                    x="93"
                    y="38"
                    width="14"
                    height="16"
                    rx="2"
                    fill="rgba(255,255,255,0.04)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <rect
                    x="116"
                    y="38"
                    width="14"
                    height="16"
                    rx="2"
                    fill="rgba(255,255,255,0.04)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  {/* Pipes */}
                  <path
                    d="M40 70 H60"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="2"
                  />
                  <path
                    d="M140 70 H160"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="2"
                  />
                  <path
                    d="M100 110 V130"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="2"
                  />
                  {/* Warning light */}
                  <circle
                    cx="100"
                    cy="80"
                    r="12"
                    fill="rgba(180,0,0,0.08)"
                    stroke="var(--red)"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                  <text
                    x="100"
                    y="85"
                    textAnchor="middle"
                    fill="var(--red)"
                    fontSize="12"
                    opacity="0.7"
                    fontFamily="monospace"
                  >
                    !
                  </text>
                  {/* Bolts */}
                  <circle
                    cx="68"
                    cy="58"
                    r="3"
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="132"
                    cy="58"
                    r="3"
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="68"
                    cy="102"
                    r="3"
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="132"
                    cy="102"
                    r="3"
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <p className={styles.emptyTitle}>
                Your diagnosis
                <br />
                will appear here
              </p>
              <p className={styles.emptySubtitle}>
                {hasInput
                  ? "Ready — hit Diagnose"
                  : "Enter your car details to begin"}
              </p>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        key={modal}
        isOpen={modal !== null}
        initialView={modal ?? "login"}
        onClose={() => setModal(null)}
      />
      <Footer />
    </div>
  );
}
