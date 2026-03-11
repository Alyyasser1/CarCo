import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification,
} from "firebase/auth";
import type { UserCredential, ConfirmationResult } from "firebase/auth";
import { auth } from "./firebaseConfig";

// Email Signup
export const signup = (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Email Login
export const login = (
  email: string,
  password: string,
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Google Sign-in
export const googleSignIn = (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// Phone Auth — Step 1: Send OTP
export const sendOTP = (
  phoneNumber: string,
  recaptchaContainerId: string,
): Promise<ConfirmationResult> => {
  const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
    size: "invisible",
  });
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

// Logout
export const logout = (): Promise<void> => {
  return signOut(auth);
};

// Send Email Verification
export const verifyEmail = (): Promise<void> => {
  if (!auth.currentUser) return Promise.reject(new Error("No user logged in."));
  return sendEmailVerification(auth.currentUser);
};
