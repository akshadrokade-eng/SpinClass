import { useEffect, useCallback } from "react";

interface KeyboardHandlers {
  onSpin: () => void;
  onEscape: () => void;
}

export function useKeyboard({ onSpin, onEscape }: KeyboardHandlers) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        onSpin();
      }
      if (e.key === "Escape") {
        onEscape();
      }
    },
    [onSpin, onEscape],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
