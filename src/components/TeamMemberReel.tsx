import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from "react";
import { useSlotAnimation } from "../hooks/useSlotAnimation";
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

const REEL_PADDING = 200;

export const TeamMemberReel = forwardRef<TeamMemberReelHandle, TeamMemberReelProps>(
  function TeamMemberReel({ studentNames, teamSize, onSpinComplete }, ref) {
    const trackRef = useRef<HTMLDivElement>(null);
    const clipRef = useRef<HTMLDivElement>(null);
    const [isIdle, setIsIdle] = useState(true);
    const spinningRef = useRef(false);
    const lastNamesRef = useRef<string[]>([]);

    const { spin: doSpin, cancel } = useSlotAnimation();

    const measureRowHeight = (): number => {
      const track = trackRef.current;
      if (!track || track.children.length === 0) return 44;
      const firstRow = track.children[0] as HTMLElement;
      return firstRow.offsetHeight || 44;
    };

    const measureClipHeight = (): number => {
      const clip = clipRef.current;
      return clip ? clip.clientHeight : 240;
    };

    useImperativeHandle(ref, () => ({
      spin(names: string[], targetIndices: number[]) {
        const track = trackRef.current;
        if (!track || names.length === 0 || targetIndices.length === 0) return;

        spinningRef.current = true;
        setIsIdle(false);

        const reelNames: string[] = [];
        for (let i = 0; i < REEL_PADDING; i++) {
          reelNames.push(names[i % names.length]);
        }
        for (const idx of targetIndices) {
          reelNames.push(names[idx % names.length]);
        }

        track.innerHTML = "";
        track.style.transition = "none";
        track.style.transform = "translate3d(0, 0, 0)";
        track.style.filter = "none";

        for (let i = 0; i < reelNames.length; i++) {
          const row = document.createElement("div");
          row.className = "tm-slot-row";
          row.textContent = reelNames[i];
          track.appendChild(row);
        }

        const rowHeight = measureRowHeight();
        const clipHeight = measureClipHeight();
        const targetRowCenter = REEL_PADDING * rowHeight + rowHeight / 2;
        const clipCenter = clipHeight / 2;
        const finalOffset = clipCenter - targetRowCenter;

        requestAnimationFrame(() => {
          doSpin(track, {
            rowHeight,
            targetOffset: finalOffset,
            totalRows: reelNames.length,
            targetStripIndex: REEL_PADDING,
            onComplete: () => {
              track.style.transition = "none";
              track.style.transform = "translate3d(0, 0, 0)";
              track.style.filter = "none";

              track.innerHTML = "";
              const displayCount = Math.min(teamSize, targetIndices.length);
              for (let i = 0; i < displayCount; i++) {
                const row = document.createElement("div");
                row.className = "tm-slot-row tm-slot-row-center";
                row.textContent = reelNames[REEL_PADDING + i];
                track.appendChild(row);
              }

              const newTrackHeight = displayCount * rowHeight;
              const newClipCenter = clipHeight / 2;
              const newTargetCenter = newTrackHeight / 2;
              track.style.transform = `translate3d(0, ${newClipCenter - newTargetCenter}px, 0)`;

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

      const displayCount = Math.min(teamSize, studentNames.length);
      const clipHeight = measureClipHeight();
      const rowHeight = measureRowHeight();
      const totalTrackHeight = displayCount * rowHeight;
      const clipCenter = clipHeight / 2;
      const trackCenter = totalTrackHeight / 2;

      for (let i = 0; i < displayCount; i++) {
        const row = document.createElement("div");
        row.className = "tm-slot-row tm-slot-row-center";
        row.textContent = studentNames[i];
        track.appendChild(row);
      }

      track.style.transform = `translate3d(0, ${clipCenter - trackCenter}px, 0)`;
    }, [studentNames, teamSize]);

    return (
      <div className="tm-reel-container">
        <div className="tm-reel-wrapper">
          <div
            className={`tm-reel-indicator-top ${isIdle && studentNames.length > 0 ? "indicator-active" : ""}`}
            aria-hidden="true"
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="1,7 6,2 11,7" />
            </svg>
          </div>
          <div className="tm-reel-clip" ref={clipRef}>
            <div className="tm-reel-track" ref={trackRef} />
          </div>
          <div
            className={`tm-reel-indicator-bottom ${isIdle && studentNames.length > 0 ? "indicator-active" : ""}`}
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
