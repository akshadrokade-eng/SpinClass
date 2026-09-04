import "../components/RoundComplete.css";

interface RoundCompleteProps {
  visible: boolean;
  onStartNewRound: () => void;
}

export function RoundComplete({ visible, onStartNewRound }: RoundCompleteProps) {
  if (!visible) return null;

  return (
    <div className="round-complete" role="alert">
      <div className="round-complete-text">Round Complete!</div>
      <div className="round-complete-sub">
        All students have been selected.
      </div>
      <button className="round-complete-btn" onClick={onStartNewRound}>
        NEW ROUND
      </button>
    </div>
  );
}
