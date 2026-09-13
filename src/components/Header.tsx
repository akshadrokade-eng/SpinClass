import { List, Maximize2, RotateCcw } from "lucide-react";
import "../components/Header.css";

type Page = "spinclass" | "team-topic";

interface HeaderProps {
  onMenuToggle: () => void;
  onFullscreen: () => void;
  onReset: () => void;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Header({ onMenuToggle, onFullscreen, onReset, currentPage, onPageChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">SPINCLASS</div>
        <nav className="header-nav" aria-label="Page navigation">
          <button
            className={`header-nav-btn ${currentPage === "spinclass" ? "active" : ""}`}
            onClick={() => onPageChange("spinclass")}
            aria-current={currentPage === "spinclass" ? "page" : undefined}
          >
            SPINCLASS
          </button>
          <button
            className={`header-nav-btn ${currentPage === "team-topic" ? "active" : ""}`}
            onClick={() => onPageChange("team-topic")}
            aria-current={currentPage === "team-topic" ? "page" : undefined}
          >
            TEAM & TOPIC
          </button>
        </nav>
      </div>
      <div className="header-actions">
        <button
          className="header-btn"
          onClick={onMenuToggle}
          aria-label="Toggle student list"
          title="Student list"
        >
          <List size={16} />
        </button>
        <button
          className="header-btn"
          onClick={onFullscreen}
          aria-label="Toggle fullscreen"
          title="Fullscreen"
        >
          <Maximize2 size={16} />
        </button>
        <button
          className="header-btn"
          onClick={onReset}
          aria-label="Reset session"
          title="Reset session"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
}
