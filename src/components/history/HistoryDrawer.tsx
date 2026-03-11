import { useEffect, useState, useCallback } from "react";
import {
  getUserSessions,
  deleteSession,
  type SavedSession,
} from "../../firebase/firestore";
import useAuth from "../../hooks/useAuth";
import HistoryModal from "./HistoryModal";
import styles from "./Drawer.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  refreshKey?: number;
}

export default function HistoryDrawer({ isOpen, onClose, refreshKey }: Props) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SavedSession | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserSessions(user.uid);
      setSessions(data);
    } catch {
      console.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) fetchSessions();
  }, [isOpen, user, fetchSessions, refreshKey]);

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      console.error("Failed to delete session");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerHeader}>
          <p className={styles.eyebrow}>Your History</p>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading...</p>
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No saved sessions yet.</p>
            <p className={styles.emptySubtext}>
              Your recommendations and diagnoses will appear here.
            </p>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className={styles.sessionList}>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={styles.sessionItem}
                onClick={() => setSelected(session)}
              >
                <div className={styles.sessionTop}>
                  <span
                    className={`${styles.typeTag} ${session.type === "recommendation" ? styles.tagRecommend : styles.tagDiagnosis}`}
                  >
                    {session.type === "recommendation"
                      ? "Recommend"
                      : "Diagnosis"}
                  </span>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, session.id)}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
                <p className={styles.sessionTitle}>{session.title}</p>
                <p className={styles.sessionDate}>
                  {formatDate(session.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <HistoryModal session={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
