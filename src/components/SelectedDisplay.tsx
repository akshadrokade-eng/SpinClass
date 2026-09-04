import "../components/SelectedDisplay.css";

interface SelectedDisplayProps {
  name: string;
  visible: boolean;
}

export function SelectedDisplay({ name, visible }: SelectedDisplayProps) {
  if (!visible || !name) return null;

  return (
    <div className="selected-display selected-reveal" aria-live="polite" aria-atomic="true">
      <div className="selected-label">SELECTED</div>
      <div className="selected-name-row">
        <div className="radiating-lines left" aria-hidden="true">
          <span className="line line-1" />
          <span className="line line-2" />
          <span className="line line-3" />
        </div>
        <h2 className="selected-name">{name}</h2>
        <div className="radiating-lines right" aria-hidden="true">
          <span className="line line-1" />
          <span className="line line-2" />
          <span className="line line-3" />
        </div>
      </div>
    </div>
  );
}
