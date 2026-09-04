import { RotateCcw } from "lucide-react";
import "../components/SpinButton.css";

interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
  phase: "idle" | "spinning" | "completed";
}

export function SpinButton({ onClick, disabled, phase }: SpinButtonProps) {
  const label = phase === "spinning" ? "SPINNING..." : phase === "completed" ? "SPIN AGAIN" : "SPIN";

  return (
    <button
      className={`spin-button ${phase === "spinning" ? "spin-button-active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-busy={phase === "spinning"}
    >
      <span className="spin-button-text">{label}</span>
      {phase === "spinning" ? (
        <RotateCcw size={18} className="spin-button-icon spin-button-spinning" />
      ) : (
        <RotateCcw size={18} className="spin-button-icon" />
      )}
    </button>
  );
}
