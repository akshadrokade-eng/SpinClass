import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, RotateCcw } from "lucide-react";
import { parseStudentFile, parseTopicFile, DataParseError } from "../utils/dataFileParser";
import { TeamMemberReel, type TeamMemberReelHandle } from "../components/TeamMemberReel";
import { TopicReel, type TopicReelHandle } from "../components/TopicReel";
import { SpinButton } from "../components/SpinButton";
import { TeamTopicDrawer } from "../components/TeamTopicDrawer";
import "../pages/TeamTopicPage.css";

interface TeamTopicPageProps {
  drawerOpen: boolean;
  onDrawerClose: () => void;
  onPageReset: () => void;
  resetCallbackRef: React.MutableRefObject<(() => void) | null>;
}

export function TeamTopicPage({ drawerOpen, onDrawerClose, onPageReset, resetCallbackRef }: TeamTopicPageProps) {
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [topicNames, setTopicNames] = useState<string[]>([]);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [topicError, setTopicError] = useState<string | null>(null);

  const [availableStudentPool, setAvailableStudentPool] = useState<string[]>([]);
  const [availableTopicPool, setAvailableTopicPool] = useState<string[]>([]);
  const [usedStudentNames, setUsedStudentNames] = useState<Set<string>>(new Set());
  const [usedTopicNames, setUsedTopicNames] = useState<Set<string>>(new Set());

  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [teamSize, setTeamSize] = useState(3);
  const [animPhase, setAnimPhase] = useState<"idle" | "spinning" | "completed">("idle");

  const teamReelRef = useRef<TeamMemberReelHandle>(null);
  const topicReelRef = useRef<TopicReelHandle>(null);
  const resultRef = useRef<{ team: string[]; topic: string }>({ team: [], topic: "" });

  const doneCount = usedStudentNames.size;
  const remainingCount = availableStudentPool.length;
  const totalStudents = studentNames.length;

  const resetPools = useCallback(() => {
    setAvailableStudentPool([...studentNames]);
    setAvailableTopicPool([...topicNames]);
    setUsedStudentNames(new Set());
    setUsedTopicNames(new Set());
    setSelectedTeam([]);
    setSelectedTopic(null);
    setAnimPhase("idle");
    teamReelRef.current?.cancel();
    topicReelRef.current?.cancel();
    onDrawerClose();
  }, [studentNames, topicNames, onDrawerClose]);

  useEffect(() => {
    resetCallbackRef.current = resetPools;
  }, [resetPools, resetCallbackRef]);

  const handleStudentFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const supportedText = ["csv", "tsv", "txt"];
      const supportedBinary = ["xlsx", "xls"];
      const supportedJson = ["json"];

      if (!supportedText.includes(ext) && !supportedBinary.includes(ext) && !supportedJson.includes(ext)) {
        setStudentError("Unsupported file format.");
        return;
      }

      if (supportedBinary.includes(ext)) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer);
            let binary = "";
            for (let i = 0; i < data.byteLength; i++) {
              binary += String.fromCharCode(data[i]);
            }
            const base64 = btoa(binary);
            const parsed = parseStudentFile(base64, file.name, true);
            setStudentNames(parsed);
            setAvailableStudentPool([...parsed]);
            setUsedStudentNames(new Set());
            setSelectedTeam([]);
            setStudentError(null);
            setTeamSize((prev) => Math.min(prev, parsed.length));
            setAnimPhase("idle");
            teamReelRef.current?.cancel();
          } catch (err) {
            if (err instanceof DataParseError) {
              setStudentError(err.message);
            } else {
              setStudentError("Could not read this file.");
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const text = evt.target?.result;
            if (typeof text !== "string") return;
            const parsed = parseStudentFile(text, file.name);
            setStudentNames(parsed);
            setAvailableStudentPool([...parsed]);
            setUsedStudentNames(new Set());
            setSelectedTeam([]);
            setStudentError(null);
            setTeamSize((prev) => Math.min(prev, parsed.length));
            setAnimPhase("idle");
            teamReelRef.current?.cancel();
          } catch (err) {
            if (err instanceof DataParseError) {
              setStudentError(err.message);
            } else {
              setStudentError("Could not read this file.");
            }
          }
        };
        reader.readAsText(file);
      }

      e.target.value = "";
    },
    [],
  );

  const handleTopicFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const supportedText = ["csv", "tsv", "txt"];
      const supportedBinary = ["xlsx", "xls"];
      const supportedJson = ["json"];

      if (!supportedText.includes(ext) && !supportedBinary.includes(ext) && !supportedJson.includes(ext)) {
        setTopicError("Unsupported file format.");
        return;
      }

      if (supportedBinary.includes(ext)) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = new Uint8Array(evt.target?.result as ArrayBuffer);
            let binary = "";
            for (let i = 0; i < data.byteLength; i++) {
              binary += String.fromCharCode(data[i]);
            }
            const base64 = btoa(binary);
            const parsed = parseTopicFile(base64, file.name, true);
            setTopicNames(parsed);
            setAvailableTopicPool([...parsed]);
            setUsedTopicNames(new Set());
            setSelectedTopic(null);
            setTopicError(null);
            setAnimPhase("idle");
            topicReelRef.current?.cancel();
          } catch (err) {
            if (err instanceof DataParseError) {
              setTopicError(err.message);
            } else {
              setTopicError("Could not read this file.");
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const text = evt.target?.result;
            if (typeof text !== "string") return;
            const parsed = parseTopicFile(text, file.name);
            setTopicNames(parsed);
            setAvailableTopicPool([...parsed]);
            setUsedTopicNames(new Set());
            setSelectedTopic(null);
            setTopicError(null);
            setAnimPhase("idle");
            topicReelRef.current?.cancel();
          } catch (err) {
            if (err instanceof DataParseError) {
              setTopicError(err.message);
            } else {
              setTopicError("Could not read this file.");
            }
          }
        };
        reader.readAsText(file);
      }

      e.target.value = "";
    },
    [],
  );

  const handleTeamSizeChange = useCallback(
    (delta: number) => {
      setTeamSize((prev) => {
        const max = availableStudentPool.length;
        const next = prev + delta;
        if (next < 1) return 1;
        if (next > max) return max;
        return next;
      });
    },
    [availableStudentPool.length],
  );

  const handleSpinComplete = useCallback(() => {
    setAnimPhase("completed");
    setSelectedTeam(resultRef.current.team);
    setSelectedTopic(resultRef.current.topic);

    const usedStudents = resultRef.current.team;
    setAvailableStudentPool((prev) =>
      prev.filter((name) => !usedStudents.includes(name)),
    );
    setUsedStudentNames((prev) => {
      const next = new Set(prev);
      for (const name of usedStudents) {
        next.add(name);
      }
      return next;
    });

    const usedTopic = resultRef.current.topic;
    setAvailableTopicPool((prev) =>
      prev.filter((name) => name !== usedTopic),
    );
    setUsedTopicNames((prev) => {
      const next = new Set(prev);
      next.add(usedTopic);
      return next;
    });
  }, []);

  const handleSpin = useCallback(() => {
    if (animPhase === "spinning") return;
    if (availableStudentPool.length === 0 || availableTopicPool.length === 0) return;
    if (teamSize > availableStudentPool.length) return;

    const shuffledStudents = [...availableStudentPool].sort(
      () => Math.random() - 0.5,
    );
    const team = shuffledStudents.slice(0, teamSize);

    const topicIdx = Math.floor(Math.random() * availableTopicPool.length);
    const topic = availableTopicPool[topicIdx];

    resultRef.current = { team, topic };

    setAnimPhase("spinning");
    setSelectedTeam([]);
    setSelectedTopic(null);

    const allStudentIndices = team.map((name) =>
      studentNames.indexOf(name),
    );
    const topicIndex = topicNames.indexOf(topic);

    teamReelRef.current?.spin(studentNames, allStudentIndices);
    topicReelRef.current?.spin(topicNames, topicIndex >= 0 ? topicIndex : 0);
  }, [animPhase, availableStudentPool, availableTopicPool, teamSize, studentNames, topicNames]);

  const handleFullReset = useCallback(() => {
    setAvailableStudentPool([...studentNames]);
    setAvailableTopicPool([...topicNames]);
    setUsedStudentNames(new Set());
    setUsedTopicNames(new Set());
    setSelectedTeam([]);
    setSelectedTopic(null);
    setAnimPhase("idle");
    teamReelRef.current?.cancel();
    topicReelRef.current?.cancel();
    onPageReset();
  }, [studentNames, topicNames, onPageReset]);

  const handleResetTopics = useCallback(() => {
    setAvailableTopicPool([...topicNames]);
    setUsedTopicNames(new Set());
    setSelectedTopic(null);
    setAnimPhase("idle");
    topicReelRef.current?.cancel();
  }, [topicNames]);

  const canSpin =
    studentNames.length > 0 &&
    topicNames.length > 0 &&
    availableStudentPool.length >= teamSize &&
    availableTopicPool.length > 0 &&
    animPhase !== "spinning";

  const spinPhase: "idle" | "spinning" | "completed" =
    animPhase === "spinning" ? "spinning" : animPhase === "completed" ? "completed" : "idle";

  const showStudentUpload = studentNames.length === 0;
  const showTopicUpload = topicNames.length === 0;

  return (
    <div className="tt-page">
      <div className="tt-top-row">
        <div className="tt-team-section">
          <div className="tt-section-header">
            <span className="tt-section-label">Team Members</span>
            {studentNames.length > 0 && (
              <div className="tt-section-meta">
                <span className="tt-section-count">
                  {doneCount} / {totalStudents} done
                </span>
                <button
                  className="tt-reset-btn"
                  onClick={handleFullReset}
                  aria-label="Reset all pools"
                  title="Reset"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            )}
          </div>
          {showStudentUpload ? (
            <div className="tt-upload-area">
              <label
                className="tt-upload-zone"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    (e.currentTarget.querySelector("input") as HTMLInputElement)?.click();
                  }
                }}
              >
                <Upload size={20} className="tt-upload-icon" />
                <div className="tt-upload-text">UPLOAD TEAM MEMBERS</div>
                <div className="tt-upload-hint">CSV, TSV, TXT, JSON, XLSX</div>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.json,.xlsx,.xls"
                  onChange={handleStudentFile}
                  className="tt-file-input"
                  aria-label="Upload student file"
                />
              </label>
              {studentError && (
                <div className="tt-error" role="alert">{studentError}</div>
              )}
            </div>
          ) : (
            <div className="tt-picker-container">
              <TeamMemberReel
                ref={teamReelRef}
                studentNames={studentNames}
                teamSize={teamSize}
                onSpinComplete={handleSpinComplete}
              />
            </div>
          )}
        </div>

        <div className="tt-topic-section">
          <div className="tt-section-header">
            <span className="tt-section-label">Topic</span>
            {topicNames.length > 0 && (
              <div className="tt-section-meta">
                <span className="tt-section-count">
                  {usedTopicNames.size} / {topicNames.length} done
                </span>
                <button
                  className="tt-reset-btn"
                  onClick={handleResetTopics}
                  aria-label="Reset topic pool"
                  title="Reset topics"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            )}
          </div>
          {showTopicUpload ? (
            <div className="tt-upload-area">
              <label
                className="tt-upload-zone tt-upload-zone-small"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    (e.currentTarget.querySelector("input") as HTMLInputElement)?.click();
                  }
                }}
              >
                <Upload size={18} className="tt-upload-icon" />
                <div className="tt-upload-text">UPLOAD TOPIC</div>
                <div className="tt-upload-hint">CSV, TSV, TXT, JSON, XLSX</div>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.json,.xlsx,.xls"
                  onChange={handleTopicFile}
                  className="tt-file-input"
                  aria-label="Upload topic file"
                />
              </label>
              {topicError && (
                <div className="tt-error" role="alert">{topicError}</div>
              )}
            </div>
          ) : (
            <div className="tt-picker-container" style={{ minHeight: 220 }}>
              <TopicReel
                ref={topicReelRef}
                topics={topicNames}
                onSpinComplete={handleSpinComplete}
              />
            </div>
          )}
        </div>
      </div>

      <div className="tt-controls">
        {studentNames.length > 0 && (
          <div className="tt-team-size">
            <span className="tt-team-size-label">Team Size</span>
            <div className="tt-team-size-controls">
              <button
                className="tt-size-btn"
                onClick={() => handleTeamSizeChange(-1)}
                disabled={teamSize <= 1}
                aria-label="Decrease team size"
              >
                −
              </button>
              <span className="tt-size-value">{teamSize}</span>
              <button
                className="tt-size-btn"
                onClick={() => handleTeamSizeChange(1)}
                disabled={teamSize >= availableStudentPool.length}
                aria-label="Increase team size"
              >
                +
              </button>
            </div>
          </div>
        )}

        <SpinButton
          onClick={handleSpin}
          disabled={!canSpin}
          phase={spinPhase}
        />

        {remainingCount > 0 && remainingCount < teamSize && (
          <div className="tt-exhaustion-msg" role="alert">
            {remainingCount} student{remainingCount !== 1 ? "s" : ""} remain · team size is {teamSize}
          </div>
        )}

        {remainingCount === 0 && studentNames.length > 0 && (
          <div className="tt-exhaustion-msg" role="alert">
            All students have been used.
            <button className="tt-exhaustion-reset" onClick={handleFullReset}>
              Reset
            </button>
          </div>
        )}

        {availableTopicPool.length === 0 && topicNames.length > 0 && (
          <div className="tt-exhaustion-msg" role="alert">
            All topics have been used.
            <button className="tt-exhaustion-reset" onClick={handleResetTopics}>
              Reset Topics
            </button>
          </div>
        )}
      </div>

      {animPhase === "completed" && selectedTeam.length > 0 && (
        <div className="tt-result" aria-live="polite">
          <div className="tt-result-divider" />
          <div className="tt-result-grid">
            <div>
              <div className="tt-result-label">Team</div>
              {selectedTeam.map((name, i) => (
                <div key={name} className="tt-result-member">
                  <span className="tt-result-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="tt-result-name">{name}</span>
                </div>
              ))}
            </div>
            {selectedTopic && (
              <div>
                <div className="tt-result-label">Topic</div>
                <div className="tt-result-topic-name">{selectedTopic}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <TeamTopicDrawer
        isOpen={drawerOpen}
        studentNames={studentNames}
        topicNames={topicNames}
        usedStudentNames={usedStudentNames}
        onClose={onDrawerClose}
      />
    </div>
  );
}
