import { useState, useRef, useEffect } from "react";
import { logout } from "../../firebase/auth";
import useAuth from "../../hooks/useAuth";
import HistoryDrawer from "../history/HistoryDrawer";
import styles from "./NavbarLoggedIn.module.css";

export default function NavbarLoggedIn() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user?.displayName || user?.email || "User";
  const email = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          Car<span className={styles.logoAccent}>Co</span>
        </div>

        <div className={styles.right}>
          {/* History button */}
          <button
            className={styles.historyBtn}
            onClick={() => setDrawerOpen(true)}
            title="History"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>

          {/* Avatar dropdown */}
          <div ref={dropdownRef}>
            <button
              className={styles.avatar}
              onClick={() => setOpen((o) => !o)}
            >
              {initials}
            </button>

            {open && (
              <div className={styles.dropdown}>
                <p className={styles.dropdownName}>{displayName}</p>
                <p className={styles.dropdownEmail}>{email}</p>
                <div className={styles.dropdownDivider} />
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <HistoryDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
