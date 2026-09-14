import { useState, useCallback, useRef } from "react";
import type { Student } from "./types";
import { saveSession, clearSession } from "./utils/storage";
import { useKeyboard } from "./hooks/useKeyboard";
import { Header } from "./components/Header";
import { StatsBar } from "./components/StatsBar";
import { SpinButton } from "./components/SpinButton";
import { ViewStudentsButton } from "./components/ViewStudentsButton";
import { SlotMachine, type SlotMachineHandle } from "./components/SlotMachine";
import { SelectedDisplay } from "./components/SelectedDisplay";
import { StudentDrawer } from "./components/StudentDrawer";
import { CsvUpload } from "./components/CsvUpload";
import { RoundComplete } from "./components/RoundComplete";
import { TeamTopicPage } from "./pages/TeamTopicPage";
import "./App.css";

type Page = "spinclass" | "team-topic";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("spinclass");

  // Start with fresh state - no automatic session restoration
  const [students, setStudents] = useState<Student[]>([]);
  const [askedIds, setAskedIds] = useState<number[]>([]);
  const [noRepeatMode, setNoRepeatMode] = useState<boolean>(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ttDrawerOpen, setTtDrawerOpen] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const ttResetCallbackRef = useRef<(() => void) | null>(null);

  const [animPhase, setAnimPhase] = useState<"idle" | "spinning" | "completed">("idle");
  const [revealedStudent, setRevealedStudent] = useState<Student | null>(null);

  const slotRef = useRef<SlotMachineHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentWinnerRef = useRef<Student | null>(null);

  const handleCsvUpload = useCallback(
    (parsed: Student[]) => {
      if (parsed.length === 0) {
        setCsvError("No students were found in this file.");
        return;
      }
      setStudents(parsed);
      setAskedIds([]);
      setNoRepeatMode(true);
      setRoundComplete(false);
      setAnimPhase("idle");
      setRevealedStudent(null);
      currentWinnerRef.current = null;
      slotRef.current?.cancel();
      clearSession();
      saveSession(parsed, [], true);
      setCsvError(null);
    },
    [],
  );

  const handleSpinComplete = useCallback(() => {
    const winner = currentWinnerRef.current;
    if (!winner) return;
    setRevealedStudent(winner);
    setAnimPhase("completed");
    setAskedIds((prev) => {
      if (!prev.includes(winner.id)) {
        return [...prev, winner.id];
      }
      return prev;
    });
  }, []);

  const handleSpin = useCallback(() => {
    if (animPhase === "spinning" || students.length === 0) return;
    if (roundComplete) return;

    const eligible = noRepeatMode
      ? students.filter((s) => !askedIds.includes(s.id))
      : students;
    if (eligible.length === 0) {
      setRoundComplete(true);
      return;
    }

    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    currentWinnerRef.current = winner;

    setRevealedStudent(null);
    setAnimPhase("spinning");

    const names = students.map((s) => s.name);
    const winnerIndex = names.indexOf(winner.name);

    slotRef.current?.spin(names, winnerIndex >= 0 ? winnerIndex : 0);
  }, [animPhase, students, askedIds, noRepeatMode, roundComplete]);

  const handleReset = useCallback(() => {
    if (currentPage === "team-topic") {
      setTtDrawerOpen(false);
      ttResetCallbackRef.current?.();
      return;
    }
    if (confirmReset) {
      setStudents([]);
      setAskedIds([]);
      setNoRepeatMode(true);
      setRoundComplete(false);
      setConfirmReset(false);
      setAnimPhase("idle");
      setRevealedStudent(null);
      currentWinnerRef.current = null;
      slotRef.current?.cancel();
      clearSession();
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  }, [confirmReset, currentPage]);

  const handleStartNewRound = useCallback(() => {
    setAskedIds([]);
    setRoundComplete(false);
    setAnimPhase("idle");
    setRevealedStudent(null);
    currentWinnerRef.current = null;
    slotRef.current?.cancel();
  }, []);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  }, []);

  const handleMenuToggle = useCallback(() => {
    if (currentPage === "team-topic") {
      setTtDrawerOpen((p) => !p);
    } else {
      setDrawerOpen((p) => !p);
    }
  }, [currentPage]);

  const handleTtPageReset = useCallback(() => {
    setTtDrawerOpen(false);
  }, []);

  const handleEscape = useCallback(() => {
    if (currentPage === "team-topic") {
      if (ttDrawerOpen) {
        setTtDrawerOpen(false);
      } else if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } else {
      if (drawerOpen) {
        setDrawerOpen(false);
      } else if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [drawerOpen, ttDrawerOpen, currentPage]);

  useKeyboard({ onSpin: handleSpin, onEscape: handleEscape });

  const total = students.length;
  const asked = askedIds.length;
  const remaining = total - asked;

  const spinDisabled =
    animPhase === "spinning" ||
    students.length === 0 ||
    (noRepeatMode && remaining === 0 && animPhase !== "completed");

  const spinPhase: "idle" | "spinning" | "completed" =
    animPhase === "spinning" ? "spinning" : animPhase === "completed" ? "completed" : "idle";

  return (
    <div className="app" ref={containerRef}>
      <Header
        onMenuToggle={handleMenuToggle}
        onFullscreen={handleFullscreen}
        onReset={handleReset}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {confirmReset && (
        <div className="confirm-reset-banner" role="alert">
          Click Reset again to confirm
        </div>
      )}

      <main className={`main-content ${currentPage === "team-topic" ? "main-content-top" : ""}`}>
        {currentPage === "team-topic" ? (
          <TeamTopicPage
            drawerOpen={ttDrawerOpen}
            onDrawerClose={() => setTtDrawerOpen(false)}
            onPageReset={handleTtPageReset}
            resetCallbackRef={ttResetCallbackRef}
          />
        ) : (
          <>
            {students.length === 0 ? (
              <CsvUpload onUpload={handleCsvUpload} error={csvError} />
            ) : (
              <>
                <div className="slot-area">
                  <SlotMachine
                    ref={slotRef}
                    studentNames={students.map((s) => s.name)}
                    onSpinComplete={handleSpinComplete}
                  />
                </div>

                <SelectedDisplay
                  name={revealedStudent?.name ?? ""}
                  visible={animPhase === "completed" && revealedStudent !== null}
                />

                <RoundComplete
                  visible={roundComplete && animPhase === "idle"}
                  onStartNewRound={handleStartNewRound}
                />

                {!roundComplete && (
                  <div className="controls-row">
                    <div className="controls-left">
                      <StatsBar total={total} asked={asked} remaining={remaining} />
                    </div>
                    <div className="controls-center">
                      <SpinButton
                        onClick={handleSpin}
                        disabled={spinDisabled}
                        phase={spinPhase}
                      />
                    </div>
                    <div className="controls-right">
                      <ViewStudentsButton
                        onClick={() => setDrawerOpen(true)}
                      />
                    </div>
                  </div>
                )}
                <div className="credit">Developed by Fidsen</div>
              </>
            )}
          </>
        )}
      </main>

      <StudentDrawer
        isOpen={drawerOpen}
        students={students}
        askedIds={askedIds}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

export default App;