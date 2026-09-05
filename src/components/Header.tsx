import { List, Maximize2, RotateCcw } from "lucide-react";
import "../components/Header.css";

interface HeaderProps {
  onMenuToggle: () => void;
  onFullscreen: () => void;
  onReset: () => void;
}

export function Header({ onMenuToggle, onFullscreen, onReset }: HeaderProps) {
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
      </div>
    </header>
  );
}