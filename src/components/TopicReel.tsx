import { useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback } from "react";
import "../components/TopicReel.css";

export interface TopicReelHandle {
  spin: (topics: string[], targetIndex: number) => void;
  cancel: () => void;
}

interface TopicReelProps {
  topics: string[];
  onSpinComplete: () => void;
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export const TopicReel = forwardRef<TopicReelHandle, TopicReelProps>(
  function TopicReel({ topics, onSpinComplete }, ref) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [finalTopic, setFinalTopic] = useState("");
    const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cleanup = useCallback(() => {
      if (spinTimerRef.current !== null) {
        clearTimeout(spinTimerRef.current);
        spinTimerRef.current = null;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      spin(topicsList: string[], targetIndex: number) {
        if (topicsList.length === 0) return;

        cleanup();

        const topic = topicsList[targetIndex % topicsList.length];

        setIsSpinning(true);
        setFinalTopic("");
        setActiveIndex(0);

        let tick = 0;
        const totalTicks = 30;
        let delay = 20;

        const cycle = () => {
          setActiveIndex((prev) => mod(prev + 1, topicsList.length));
          tick++;

          if (tick >= totalTicks) {
            setActiveIndex(targetIndex % topicsList.length);
            setFinalTopic(topic);
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
        setFinalTopic("");
      },
    }));

    useEffect(() => cleanup, [cleanup]);

    useEffect(() => {
      return () => {
        cleanup();
      };
    }, [cleanup]);

    const displayTopic = isSpinning
      ? topics[activeIndex % topics.length]
      : finalTopic || (topics.length > 0 ? topics[0] : "");

    return (
      <div className="topic-reel-container">
        <div className="topic-reel-wrapper">
          <div
            className={`topic-reel-indicator-left ${!isSpinning && topics.length > 0 ? "indicator-active" : ""}`}
            aria-hidden="true"
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="7,1 2,6 7,11" />
            </svg>
          </div>
          <div className="topic-reel-clip">
            <div className="topic-reel-track">
              <div
                key={`${isSpinning ? "s" : "i"}-${displayTopic}`}
                className="topic-slot-row topic-slot-row-center"
              >
                {displayTopic}
              </div>
            </div>
          </div>
          <div
            className={`topic-reel-indicator-right ${!isSpinning && topics.length > 0 ? "indicator-active" : ""}`}
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
