import { X, Check } from "lucide-react";
import "../components/StudentDrawer.css";

interface TeamTopicDrawerProps {
  isOpen: boolean;
  studentNames: string[];
  topicNames: string[];
  usedStudentNames: Set<string>;
  onClose: () => void;
}

export function TeamTopicDrawer({
  isOpen,
  studentNames,
  topicNames,
  usedStudentNames,
  onClose,
}: TeamTopicDrawerProps) {
  const doneCount = usedStudentNames.size;

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
        aria-label="Student and topic list"
        aria-hidden={!isOpen}
      >
        <div className="drawer-header">
          <h3 className="drawer-title">STUDENTS & TOPICS</h3>
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Close list"
          >
            <X size={20} />
          </button>
        </div>
        <div className="drawer-list">
          {studentNames.length > 0 && (
            <>
              <div className="drawer-section-header">
                <span className="drawer-section-title">STUDENTS</span>
                <span className="drawer-section-count">{doneCount} / {studentNames.length} done</span>
              </div>
              {studentNames.map((name, i) => {
                const isDone = usedStudentNames.has(name);
                return (
                  <div
                    key={`s-${i}`}
                    className={`drawer-student ${isDone ? "asked" : ""}`}
                  >
                    <span className="drawer-student-name">
                      {String(i + 1).padStart(2, "0")}. {name}
                    </span>
                    {isDone && (
                      <span className="drawer-student-check">
                        <Check size={14} />
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          )}
          {topicNames.length > 0 && (
            <>
              <div className="drawer-section-header">
                <span className="drawer-section-title">TOPICS</span>
                <span className="drawer-section-count">{topicNames.length}</span>
              </div>
              {topicNames.map((name, i) => (
                <div key={`t-${i}`} className="drawer-student">
                  <span className="drawer-student-name">
                    {String(i + 1).padStart(2, "0")}. {name}
                  </span>
                </div>
              ))}
            </>
          )}
          {studentNames.length === 0 && topicNames.length === 0 && (
            <div className="drawer-empty">
              No data loaded yet.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
