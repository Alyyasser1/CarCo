import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import type {
  RecommendationResult,
  DiagnosisResult,
} from "../services/aiService";

export interface SavedSession {
  id: string;
  type: "recommendation" | "diagnosis";
  title: string;
  createdAt: Date;
  result: RecommendationResult | DiagnosisResult;
}

interface FirestoreSession {
  userId: string;
  type: "recommendation" | "diagnosis";
  title: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  result: RecommendationResult | DiagnosisResult;
}

// Save a session
export async function saveSession(
  userId: string,
  type: "recommendation" | "diagnosis",
  title: string,
  result: RecommendationResult | DiagnosisResult,
): Promise<void> {
  const data: FirestoreSession = {
    userId,
    type,
    title:
      title.trim().slice(0, 80) ||
      (type === "recommendation" ? "Car Recommendation" : "Car Diagnosis"),
    createdAt: serverTimestamp(),
    result,
  };
  await addDoc(collection(db, "sessions"), data);
}

// Get all sessions for a user
export async function getUserSessions(userId: string): Promise<SavedSession[]> {
  const q = query(collection(db, "sessions"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const sessions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<SavedSession, "id" | "createdAt">),
    createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
  }));

  // Sort on the client side instead
  return sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Delete a session
export async function deleteSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(db, "sessions", sessionId));
}
