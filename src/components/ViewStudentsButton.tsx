import { Users } from "lucide-react";
import "../components/ViewStudentsButton.css";

interface ViewStudentsButtonProps {
  onClick: () => void;
}

export function ViewStudentsButton({ onClick }: ViewStudentsButtonProps) {
  return (
    <button
      className="view-students-btn"
      onClick={onClick}
      aria-label="View student list"
    >
      <Users size={18} />
      <span>VIEW STUDENTS</span>
    </button>
  );
}
