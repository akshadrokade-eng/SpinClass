import { X, Check } from "lucide-react";
import type { Student } from "../types";
import "../components/StudentDrawer.css";

interface StudentDrawerProps {
  isOpen: boolean;
  students: Student[];
  askedIds: number[];
  onClose: () => void;
}

export function StudentDrawer({
  isOpen,
  students,
  askedIds,
  onClose,
}: StudentDrawerProps) {
  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Student list"
        aria-hidden={!isOpen}
      >
        <div className="drawer-header">
          <h3 className="drawer-title">STUDENTS</h3>
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Close student list"
          >
            <X size={20} />
          </button>
        </div>
        <div className="drawer-list">
          {students.map((student) => {
            const isAsked = askedIds.includes(student.id);
            return (
              <div
                key={student.id}
                className={`drawer-student ${isAsked ? "asked" : ""}`}
              >
                <span className="drawer-student-name">
                  {student.rollNo ? `${student.rollNo}. ` : ""}
                  {student.name}
                </span>
                {isAsked && (
                  <span className="drawer-student-check">
                    <Check size={14} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
