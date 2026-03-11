import NavbarLoggedIn from "../components/navbar/NavbarLoggedIn";
import NavbarLoggedOut from "../components/navbar/NavbarLoggedOut";
import AuthModal from "../components/auth/AuthModal";
import useAuth from "../hooks/useAuth";
import styles from "./RecommendationPage.module.css";
import { useState, useRef, useEffect } from "react";
import Footer from "../components/footer/Footer";
import Button from "../components/ui/Button";
import { saveSession } from "../firebase/firestore";
import {
  getCarRecommendations,
  type RecommendationResult,
} from "../services/aiService";
const BRANDS = [
  "BMW",
  "Mercedes",
  "Audi",
  "Volkswagen",
  "Skoda",
  "Opel",
  "Kia",
  "Hyundai",
  "Honda",
  "Toyota",
  "Jetour",
  "GAC",
  "Nissan",
  "Mazda",
  "Ford",
  "Chevrolet",
  "Peugeot",
  "Renault",
  "Fiat",
  "Volvo",
];

const CATEGORIES = ["Sedan", "SUV", "Sports", "Pickup Truck"];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - 1989 },
  (_, i) => CURRENT_YEAR - i,
);

type ModalView = "login" | "signup" | null;

export default function RecommendationPage() {
  const isSubmitting = useRef(false);
  const { user, loading } = useAuth();
  const [modal, setModal] = useState<ModalView>(null);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [yearFrom, setYearFrom] = useState<string>("");
  const [yearTo, setYearTo] = useState<string>("");
  const [requirements, setRequirements] = useState("");
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const handleSubmit = async () => {
    // validation first, before touching isSubmitting
    if (selectedBrands.length === 0) {
      setError("Please select at least one brand.");
      return;
    }
    if (!selectedCategory) {
      setError("Please select a category.");
      return;
    }

    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setError(null);
    setThinking(true);
    setResult(null);

    try {
      const data = await getCarRecommendations({
        brands: selectedBrands,
        category: selectedCategory,
        yearFrom,
        yearTo,
        requirements,
      });
      setResult(data);
      const title = requirements.trim() || selectedBrands.join(", ");
      if (user) await saveSession(user.uid, "recommendation", title, data);
    } catch (err: unknown) {
      const message = (err as Error).message || "";
      setError(message || "Something went wrong. Please try again.");
    } finally {
      setThinking(false);
      isSubmitting.current = false;
    }
  };

  const hasInput =
    selectedBrands.length > 0 || selectedCategory || requirements.trim();

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
          <h1 className={styles.title}>Find Your Car</h1>
          <p className={styles.subtitle}>
            Tell us what you want and we'll find the perfect match.
          </p>

          {/* BRANDS */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Brand</label>
            <div className={styles.chips}>
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  className={`${styles.chip} ${selectedBrands.includes(brand) ? styles.chipActive : ""}`}
                  onClick={() => toggleBrand(brand)}
                  type="button"
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* CATEGORY — single select */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Category</label>
            <div className={styles.chips}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.chip} ${selectedCategory === cat ? styles.chipActive : ""}`}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat ? null : cat)
                  }
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* YEAR RANGE — two dropdowns */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Year</label>
            <div className={styles.yearRow}>
              <YearDropdown
                value={yearFrom}
                onChange={setYearFrom}
                placeholder="From"
                years={YEARS.slice().reverse()}
              />
              <span className={styles.yearDivider}>—</span>
              <YearDropdown
                value={yearTo}
                onChange={setYearTo}
                placeholder="To"
                years={YEARS}
              />
            </div>
          </div>

          {/* REQUIREMENTS */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Requirements</label>
            <textarea
              className={styles.textarea}
              placeholder="e.g. fuel efficient, under $30,000, good for family trips, automatic transmission..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <Button
            text={thinking ? "Searching..." : "Get Recommendation →"}
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
              <p className={styles.loadingText}>
                Analyzing your preferences...
              </p>
            </div>
          )}

          {!thinking && result && (
            <div className={styles.resultContent}>
              <p className={styles.resultEyebrow}>Recommendations</p>
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
            </div>
          )}

          {!thinking && !result && (
            <div className={styles.emptyState}>
              <div className={styles.carIllustration}>
                <svg
                  viewBox="0 0 200 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.carSvg}
                >
                  <rect
                    x="20"
                    y="45"
                    width="160"
                    height="35"
                    rx="4"
                    fill="rgba(255,255,255,0.04)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <path
                    d="M45 45 L65 20 L135 20 L155 45"
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="55"
                    cy="82"
                    r="12"
                    fill="rgba(255,255,255,0.05)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                  />
                  <circle cx="55" cy="82" r="5" fill="rgba(255,255,255,0.08)" />
                  <circle
                    cx="145"
                    cy="82"
                    r="12"
                    fill="rgba(255,255,255,0.05)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="145"
                    cy="82"
                    r="5"
                    fill="rgba(255,255,255,0.08)"
                  />
                  <rect
                    x="68"
                    y="25"
                    width="30"
                    height="18"
                    rx="2"
                    fill="rgba(255,255,255,0.04)"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                  <rect
                    x="102"
                    y="25"
                    width="30"
                    height="18"
                    rx="2"
                    fill="rgba(255,255,255,0.04)"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                  <rect
                    x="22"
                    y="55"
                    width="18"
                    height="8"
                    rx="1"
                    fill="var(--red)"
                    opacity="0.6"
                  />
                  <rect
                    x="160"
                    y="55"
                    width="18"
                    height="8"
                    rx="1"
                    fill="rgba(255,200,0,0.4)"
                  />
                </svg>
              </div>
              <p className={styles.emptyTitle}>
                Your recommendation
                <br />
                will appear here
              </p>
              <p className={styles.emptySubtitle}>
                {hasInput
                  ? "Ready — hit Get Recommendation"
                  : "Select a brand and category to begin"}
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
interface YearDropdownProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  years: number[];
}

function YearDropdown({
  value,
  onChange,
  placeholder,
  years,
}: YearDropdownProps) {
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
          {value || placeholder}
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
            {placeholder}
          </div>
          {years.map((y) => (
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
