import { useState } from "react";
import styles from "./AuthPage.module.css";
import NavbarLoggedOut from "../components/navbar/NavbarLoggedOut";
import NavbarLoggedIn from "../components/navbar/NavbarLoggedIn";
import HeroSection from "../components/hero/HeroSection";
import BelowHero from "../components/sections/BelowHero";
import AuthModal from "../components/auth/AuthModal";
import Footer from "../components/footer/Footer";
import useAuth from "../hooks/useAuth";

type ModalView = "login" | "signup" | null;

export default function AuthPage() {
  const [modal, setModal] = useState<ModalView>(null);
  const { user, loading } = useAuth();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBg} />

        {!loading &&
          (user ? (
            <NavbarLoggedIn />
          ) : (
            <NavbarLoggedOut
              onLogin={() => setModal("login")}
              onSignup={() => setModal("signup")}
            />
          ))}

        <HeroSection />
      </section>

      <BelowHero />
      <Footer />

      <AuthModal
        key={modal}
        isOpen={modal !== null}
        initialView={modal ?? "login"}
        onClose={() => setModal(null)}
      />
    </>
  );
}
