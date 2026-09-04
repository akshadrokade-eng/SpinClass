import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from "react";
import { useSlotAnimation } from "../hooks/useSlotAnimation";
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
const REEL_PADDING = 40;

export const SlotMachine = forwardRef<SlotMachineHandle, SlotMachineProps>(
  function SlotMachine({ studentNames, onSpinComplete }, ref) {
    const trackRef = useRef<HTMLDivElement>(null);
    const clipRef = useRef<HTMLDivElement>(null);
    const [isIdle, setIsIdle] = useState(true);
    const spinningRef = useRef(false);
    const lastNamesRef = useRef<string[]>([]);

    const { spin: doSpin, cancel } = useSlotAnimation();

    const buildReelNames = (names: string[], targetIdx: number): string[] => {
      const reel: string[] = [];
      for (let i = 0; i < REEL_PADDING; i++) {
        reel.push(names[i % names.length]);
      }
      reel.push(names[targetIdx]);
      return reel;
    };

    const measureRowHeight = (): number => {
      const track = trackRef.current;
      if (!track || track.children.length === 0) return 72;
      const firstRow = track.children[0] as HTMLElement;
      return firstRow.offsetHeight || 72;
    };

    const measureClipHeight = (): number => {
      const clip = clipRef.current;
      return clip ? clip.clientHeight : 504;
    };

    useImperativeHandle(ref, () => ({
      spin(names: string[], winnerIndex: number) {
        const track = trackRef.current;
        if (!track || names.length === 0) return;

        spinningRef.current = true;
        setIsIdle(false);

        const reelNames = buildReelNames(names, winnerIndex);
        const targetStripIndex = REEL_PADDING;

        track.innerHTML = "";
        track.style.transition = "none";
        track.style.transform = "translate3d(0, 0, 0)";
        track.style.filter = "none";

        for (let i = 0; i < reelNames.length; i++) {
          const row = document.createElement("div");
          row.className = "slot-row";
          row.textContent = reelNames[i];
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.justifyContent = "center";
          row.style.fontFamily = '"Courier New", Courier, monospace';
          row.style.userSelect = "none";
          track.appendChild(row);
        }

        const rowHeight = measureRowHeight();
        const clipHeight = measureClipHeight();
        const targetRowCenter = targetStripIndex * rowHeight + rowHeight / 2;
        const clipCenter = clipHeight / 2;
        const finalOffset = clipCenter - targetRowCenter;

        requestAnimationFrame(() => {
          doSpin(track, {
            rowHeight,
            targetOffset: finalOffset,
            totalRows: reelNames.length,
            targetStripIndex,
            onComplete: () => {
              spinningRef.current = false;
              setIsIdle(true);
              onSpinComplete();
            },
          });
        });
      },
      cancel() {
        spinningRef.current = false;
        setIsIdle(true);
        cancel();
      },
    }));

    useEffect(() => {
      return () => {
        spinningRef.current = false;
        cancel();
      };
    }, [cancel]);

    useEffect(() => {
      if (studentNames.length === 0) return;
      if (spinningRef.current) return;
      const track = trackRef.current;
      if (!track) return;

      const namesKey = studentNames.join("\0");
      if (namesKey === lastNamesRef.current.join("\0")) return;
      lastNamesRef.current = studentNames;

      track.innerHTML = "";
      track.style.transition = "none";
      track.style.transform = "translate3d(0, 0, 0)";
      track.style.filter = "none";

      const displayNames = studentNames.slice(0, VISIBLE_COUNT);
      const centerIdx = Math.floor(VISIBLE_COUNT / 2);

      for (let i = 0; i < displayNames.length; i++) {
        const row = document.createElement("div");
        row.className = "slot-row";
        if (i === centerIdx) row.classList.add("slot-row-center");
        else if (Math.abs(i - centerIdx) === 1) row.classList.add("slot-row-near");
        else row.classList.add("slot-row-far");
        row.textContent = displayNames[i];
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.justifyContent = "center";
        row.style.fontFamily = '"Courier New", Courier, monospace';
        row.style.userSelect = "none";
        track.appendChild(row);
      }
    }, [studentNames]);

    return (
      <div className="slot-container">
        <div className="slot-reel-clip" ref={clipRef}>
          <div
            className="slot-reel-track"
            ref={trackRef}
          />
        </div>
        <div className="slot-selection-window" />
        <div
          className={`slot-indicator-left ${isIdle && studentNames.length > 0 ? "indicator-active" : ""}`}
          aria-hidden="true"
        >
          <svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor">
            <polygon points="0,0 18,10 0,20" />
          </svg>
        </div>
        <div
          className={`slot-indicator-right ${isIdle && studentNames.length > 0 ? "indicator-active" : ""}`}
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
