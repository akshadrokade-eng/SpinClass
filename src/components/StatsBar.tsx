import "../components/StatsBar.css";

interface StatsBarProps {
  total: number;
  asked: number;
  remaining: number;
}

export function StatsBar({ total, asked, remaining }: StatsBarProps) {
  return (
    <div className="stats-bar" role="status" aria-label="Student statistics">
      <div className="stat-item">
        <span className="stat-value">{total}</span>
        <span className="stat-label">TOTAL</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value">{asked}</span>
        <span className="stat-label">ASKED</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value">{remaining}</span>
        <span className="stat-label">REMAINING</span>
      </div>
    </div>
  );
}
