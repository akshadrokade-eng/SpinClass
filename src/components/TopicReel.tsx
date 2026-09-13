import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from "react";
import { useSlotAnimation } from "../hooks/useSlotAnimation";
import "../components/TopicReel.css";

export interface TopicReelHandle {
  spin: (topics: string[], targetIndex: number) => void;
  cancel: () => void;
}

interface TopicReelProps {
  topics: string[];
  onSpinComplete: () => void;
}

const REEL_PADDING = 200;

export const TopicReel = forwardRef<TopicReelHandle, TopicReelProps>(
  function TopicReel({ topics, onSpinComplete }, ref) {
    const trackRef = useRef<HTMLDivElement>(null);
    const clipRef = useRef<HTMLDivElement>(null);
    const [isIdle, setIsIdle] = useState(true);
    const spinningRef = useRef(false);
    const lastTopicsRef = useRef<string[]>([]);

    const { spin: doSpin, cancel } = useSlotAnimation();

    const measureRowHeight = (): number => {
      const track = trackRef.current;
      if (!track || track.children.length === 0) return 44;
      const firstRow = track.children[0] as HTMLElement;
      return firstRow.offsetHeight || 44;
    };

    const measureClipHeight = (): number => {
      const clip = clipRef.current;
      return clip ? clip.clientHeight : 44;
    };

    useImperativeHandle(ref, () => ({
      spin(topicsList: string[], targetIndex: number) {
        const track = trackRef.current;
        if (!track || topicsList.length === 0) return;

        spinningRef.current = true;
        setIsIdle(false);

        const reelTopics: string[] = [];
        for (let i = 0; i < REEL_PADDING; i++) {
          reelTopics.push(topicsList[i % topicsList.length]);
        }
        reelTopics.push(topicsList[targetIndex % topicsList.length]);

        track.innerHTML = "";
        track.style.transition = "none";
        track.style.transform = "translate3d(0, 0, 0)";
        track.style.filter = "none";

        for (let i = 0; i < reelTopics.length; i++) {
          const row = document.createElement("div");
          row.className = "topic-slot-row";
          row.textContent = reelTopics[i];
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
            totalRows: reelTopics.length,
            targetStripIndex: REEL_PADDING,
            onComplete: () => {
              track.style.transition = "none";
              track.style.transform = "translate3d(0, 0, 0)";
              track.style.filter = "none";

              track.innerHTML = "";
              const row = document.createElement("div");
              row.className = "topic-slot-row topic-slot-row-center";
              row.textContent = reelTopics[REEL_PADDING];
              track.appendChild(row);

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
      if (topics.length === 0) return;
      if (spinningRef.current) return;
      const track = trackRef.current;
      if (!track) return;

      const topicsKey = topics.join("\0");
      if (topicsKey === lastTopicsRef.current.join("\0")) return;
      lastTopicsRef.current = topics;

      track.innerHTML = "";
      track.style.transition = "none";
      track.style.transform = "translate3d(0, 0, 0)";
      track.style.filter = "none";

      const row = document.createElement("div");
      row.className = "topic-slot-row topic-slot-row-center";
      row.textContent = topics[0];
      track.appendChild(row);
    }, [topics]);

    return (
      <div className="topic-reel-container">
        <div className="topic-reel-wrapper">
          <div
            className={`topic-reel-indicator-left ${isIdle && topics.length > 0 ? "indicator-active" : ""}`}
            aria-hidden="true"
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="7,1 2,6 7,11" />
            </svg>
          </div>
          <div className="topic-reel-clip" ref={clipRef}>
            <div className="topic-reel-track" ref={trackRef} />
          </div>
          <div
            className={`topic-reel-indicator-right ${isIdle && topics.length > 0 ? "indicator-active" : ""}`}
            aria-hidden="true"
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="1,1 6,6 1,11" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
);
