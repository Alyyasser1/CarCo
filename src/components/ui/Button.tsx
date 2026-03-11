import styles from "./Button.module.css";

interface ButtonProps {
  text: string;
  onClick: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

const Button = ({
  text,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  fullWidth = false,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`
        ${variant === "primary" ? styles.primary : styles.secondary}
        ${fullWidth ? styles.fullWidth : ""}
      `.trim()}
    >
      {text}
    </button>
  );
};

export default Button;
