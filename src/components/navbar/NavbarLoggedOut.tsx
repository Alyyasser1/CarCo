import styles from "./NavbarLoggedOut.module.css";
import Button from "../ui/Button";

interface Props {
  onLogin: () => void;
  onSignup: () => void;
}

export default function NavbarLoggedOut({ onLogin, onSignup }: Props) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        Car<span className={styles.logoAccent}>Co</span>
      </div>
      <div className={styles.navLinks}>
        <Button variant="secondary" text="Log In" onClick={onLogin} />
        <Button variant="primary" text="Get Started" onClick={onSignup} />
      </div>
    </nav>
  );
}
