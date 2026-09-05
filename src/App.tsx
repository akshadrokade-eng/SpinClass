import { useState, useCallback, useEffect, useRef } from "react";
import type { Student } from "./types";
import { parseCsv, CsvParseError } from "./utils/csvParser";
import { saveSession, loadSession, clearSession } from "./utils/storage";
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
import "./App.css";

const savedSession = loadSession();

function App() {
  const [students, setStudents] = useState<Student[]>(
    savedSession?.students ?? [],
  );
  const [askedIds, setAskedIds] = useState<number[]>(
    savedSession?.askedIds ?? [],
  );
  const [noRepeatMode, setNoRepeatMode] = useState(
    savedSession?.noRepeatMode ?? true,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const [animPhase, setAnimPhase] = useState<"idle" | "spinning" | "completed">("idle");
  const [revealedStudent, setRevealedStudent] = useState<Student | null>(null);

  const slotRef = useRef<SlotMachineHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentWinnerRef = useRef<Student | null>(null);

  useEffect(() => {
    if (students.length > 0) {
      saveSession(students, askedIds, noRepeatMode);
    }
  }, [students, askedIds, noRepeatMode]);

  const handleCsvUpload = useCallback(
    (content: string) => {
      try {
        const parsed = parseCsv(content);
        setStudents(parsed);
        setAskedIds([]);
        setNoRepeatMode(true);
        setRoundComplete(false);
        setAnimPhase("idle");
        setRevealedStudent(null);
        currentWinnerRef.current = null;
        slotRef.current?.cancel();
        setCsvError(null);
        clearSession();
        saveSession(parsed, [], true);
      } catch (err) {
        if (err instanceof CsvParseError) {
          setCsvError(err.message);
        } else {
          setCsvError("Failed to parse CSV file.");
        }
      }
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
  }, [confirmReset]);

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

  const handleEscape = useCallback(() => {
    if (drawerOpen) {
      setDrawerOpen(false);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [drawerOpen]);

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
        onMenuToggle={() => setDrawerOpen((p) => !p)}
        onFullscreen={handleFullscreen}
        onReset={handleReset}
      />

      {confirmReset && (
        <div className="confirm-reset-banner" role="alert">
          Click Reset again to confirm
        </div>
      )}

      <main className="main-content">
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
/* f41f447 (Add Developed by Fidsen footer) */
            <div className="credit">Developed by Fidsen</div>
/* f41f447 (Add Developed by Fidsen footer) */
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
