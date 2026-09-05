import { List, Maximize2, RotateCcw } from "lucide-react";
import "../components/Header.css";

interface HeaderProps {
  onMenuToggle: () => void;
  onFullscreen: () => void;
  onReset: () => void;
  onSaveSession: () => void;
  onLoadSession: () => void;
  onClearSession: () => void;
  hasSavedSession: boolean;
}

export function Header({
  onMenuToggle,
  onFullscreen,
  onReset,
  onSaveSession,
  onLoadSession,
  onClearSession,
  hasSavedSession,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-logo">SPINCLASS</div>
      <div className="header-actions">
        <button
          className="header-btn"
          onClick={onMenuToggle}
          aria-label="Toggle student list"
          title="Student list"
        >
          <List size={20} />
        </button>
        <button
          className="header-btn"
          onClick={onFullscreen}
          aria-label="Toggle fullscreen"
          title="Fullscreen"
        >
          <Maximize2 size={20} />
        </button>
        <button
          className="header-btn"
          onClick={onReset}
          aria-label="Reset session"
          title="Reset session"
        >
          <RotateCcw size={20} />
        </button>
        {hasSavedSession ? (
          <>
            <button
              className="header-btn"
              onClick={onLoadSession}
              aria-label="Load saved session"
              title="Load saved session"
            >
              <RotateCcw size={20} />
            </button>
            <button
              className="header-btn"
              onClick={onClearSession}
              aria-label="Clear saved session"
              title="Clear saved session"
            >
              <List size={20} />
            </button>
          </>
        ) : (
          <button
            className="header-btn"
            onClick={onSaveSession}
            aria-label="Save session"
            title="Save session"
          >
            <Maximize2 size={20} />
          </button>
        )}
      </div>
    </header>
  );
}
