import { useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import "../components/SlotMachine.css";

export interface SlotMachineHandle {
  spin: (names: string[], winnerIndex: number) => void;
  cancel: () => void;
}

interface SlotMachineProps {
  studentNames: string[];
  onSpinComplete: () => void;
}

const VISIBLE_COUNT = 7;

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export const SlotMachine = forwardRef<SlotMachineHandle, SlotMachineProps>(
  function SlotMachine({ studentNames, onSpinComplete }, ref) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [finalWinner, setFinalWinner] = useState("");
    const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cleanup = useCallback(() => {
      if (spinTimerRef.current !== null) {
        clearTimeout(spinTimerRef.current);
        spinTimerRef.current = null;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      spin(names: string[], winnerIndex: number) {
        if (names.length === 0) return;

        cleanup();

        const winner = names[winnerIndex % names.length];

        setIsSpinning(true);
        setFinalWinner("");
        setActiveIndex(0);

        let tick = 0;
        const totalTicks = 30;
        let delay = 20;

        const cycle = () => {
          setActiveIndex((prev) => mod(prev + 1, names.length));
          tick++;

          if (tick >= totalTicks) {
            setActiveIndex(winnerIndex % names.length);
            setFinalWinner(winner);
            setIsSpinning(false);
            onSpinComplete();
            return;
          }

          if (tick < 22) {
            delay = 20;
          } else {
            delay = 20 + (tick - 22) * 6;
          }

          spinTimerRef.current = setTimeout(cycle, delay);
        };

        spinTimerRef.current = setTimeout(cycle, delay);
      },
      cancel() {
        cleanup();
        setIsSpinning(false);
        setFinalWinner("");
      },
    }));

    useEffect(() => cleanup, [cleanup]);

    useEffect(() => {
      return () => {
        cleanup();
      };
    }, [cleanup]);

    const displayNames: string[] = [];
    const centerIdx = Math.floor(VISIBLE_COUNT / 2);

    if (isSpinning) {
      for (let offset = -centerIdx; offset <= centerIdx; offset++) {
        const idx = mod(activeIndex + offset, studentNames.length);
        displayNames.push(studentNames[idx]);
      }
    } else if (finalWinner) {
      const winnerIdx = studentNames.indexOf(finalWinner);
      if (winnerIdx >= 0) {
        for (let offset = -centerIdx; offset <= centerIdx; offset++) {
          const idx = mod(winnerIdx + offset, studentNames.length);
          displayNames.push(studentNames[idx]);
        }
      } else {
        for (let i = 0; i < Math.min(VISIBLE_COUNT, studentNames.length); i++) {
          displayNames.push(studentNames[i]);
        }
      }
    } else {
      for (let i = 0; i < Math.min(VISIBLE_COUNT, studentNames.length); i++) {
        displayNames.push(studentNames[i]);
      }
    }

    return (
      <div className="slot-container">
        <div className="slot-reel-clip">
          <div className="slot-reel-track">
            {displayNames.map((name, i) => {
              let className = "slot-row";
              if (i === centerIdx) {
                className += " slot-row-center";
              } else if (Math.abs(i - centerIdx) === 1) {
                className += " slot-row-near";
              } else {
                className += " slot-row-far";
              }
              return (
                <div
                  key={`${isSpinning ? "s" : "i"}-${i}-${name}`}
                  className={className}
                >
                  {name}
                </div>
              );
            })}
          </div>
        </div>
        <div className="slot-selection-window" />
        <div
          className={`slot-indicator-left ${!isSpinning && studentNames.length > 0 ? "indicator-active" : ""}`}
          aria-hidden="true"
        >
          <svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor">
            <polygon points="0,0 18,10 0,20" />
          </svg>
        </div>
        <div
          className={`slot-indicator-right ${!isSpinning && studentNames.length > 0 ? "indicator-active" : ""}`}
          aria-hidden="true"
        >
          <svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor">
            <polygon points="18,0 0,10 18,20" />
          </svg>
        </div>
      </div>
    );
  }
);
