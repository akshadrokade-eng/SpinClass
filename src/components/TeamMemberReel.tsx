import { useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import "../components/TeamMemberReel.css";

export interface TeamMemberReelHandle {
  spin: (names: string[], targetIndices: number[]) => void;
  cancel: () => void;
}

interface TeamMemberReelProps {
  studentNames: string[];
  teamSize: number;
  onSpinComplete: () => void;
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export const TeamMemberReel = forwardRef<TeamMemberReelHandle, TeamMemberReelProps>(
  function TeamMemberReel({ studentNames, teamSize, onSpinComplete }, ref) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [finalTeam, setFinalTeam] = useState<string[]>([]);
    const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cleanup = useCallback(() => {
      if (spinTimerRef.current !== null) {
        clearTimeout(spinTimerRef.current);
        spinTimerRef.current = null;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      spin(names: string[], targetIndices: number[]) {
        if (names.length === 0 || targetIndices.length === 0) return;

        cleanup();

        const team = targetIndices.map((i) => names[i % names.length]);

        setIsSpinning(true);
        setFinalTeam([]);
        setActiveIndex(0);

        let tick = 0;
        const totalTicks = 30;
        let delay = 20;

        const cycle = () => {
          setActiveIndex((prev) => mod(prev + 1, names.length));
          tick++;

          if (tick >= totalTicks) {
            const anchorIndex = targetIndices[0] % names.length;
            setActiveIndex(anchorIndex);
            setFinalTeam(team);
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
        setFinalTeam([]);
      },
    }));

    useEffect(() => cleanup, [cleanup]);

    useEffect(() => {
      return () => {
        cleanup();
      };
    }, [cleanup]);

    const displayNames: string[] = [];

    if (isSpinning) {
      for (let offset = -2; offset <= 2; offset++) {
        const idx = mod(activeIndex + offset, studentNames.length);
        displayNames.push(studentNames[idx]);
      }
    } else if (finalTeam.length > 0) {
      for (let i = 0; i < Math.min(teamSize, finalTeam.length); i++) {
        displayNames.push(finalTeam[i]);
      }
    } else {
      for (let i = 0; i < Math.min(teamSize, studentNames.length); i++) {
        displayNames.push(studentNames[i]);
      }
    }

    return (
      <div className="tm-reel-container">
        <div className="tm-reel-wrapper">
          <div
            className={`tm-reel-indicator-top ${!isSpinning && studentNames.length > 0 ? "indicator-active" : ""}`}
            aria-hidden="true"
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="1,7 6,2 11,7" />
            </svg>
          </div>
          <div className="tm-reel-clip">
            <div className="tm-reel-track">
              {displayNames.map((name, i) => {
                const isCenter = isSpinning ? i === 2 : true;
                return (
                  <div
                    key={`${isSpinning ? "s" : "i"}-${i}-${name}`}
                    className={`tm-slot-row ${isCenter ? "tm-slot-row-center" : ""}`}
                  >
                    {name}
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className={`tm-reel-indicator-bottom ${!isSpinning && studentNames.length > 0 ? "indicator-active" : ""}`}
            aria-hidden="true"
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="1,1 6,6 11,1" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
);
