import { useRef, useCallback } from "react";

interface SpinParams {
  rowHeight: number;
  targetOffset: number;
  totalRows: number;
  targetStripIndex: number;
  onComplete: () => void;
}

function quintic(t: number): number {
  return t * t * t * (t * (6 * t - 15) + 10);
}

export function useSlotAnimation() {
  const animFrameRef = useRef(0);
  const cancelledRef = useRef(false);
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const spin = useCallback(
    (trackEl: HTMLElement, params: SpinParams) => {
      const { rowHeight, targetOffset, totalRows, targetStripIndex, onComplete } = params;
      cancel();

      if (totalRows === 0) return;

      trackEl.style.transition = "none";

      if (reducedMotion.current) {
        trackEl.style.transform = `translate3d(0, ${targetOffset}px, 0)`;
        setTimeout(onComplete, 300);
        return;
      }

      cancelledRef.current = false;

      const extraSpins = 2 + Math.floor(Math.random() * 2);
      const totalDistance = extraSpins * totalRows + targetStripIndex;
      const totalDuration = 3500 + Math.random() * 500;

      trackEl.style.willChange = "transform";

      const startTime = performance.now();

      const animate = (now: number) => {
        if (cancelledRef.current) return;

        const elapsed = now - startTime;
        const rawProgress = Math.min(elapsed / totalDuration, 1);
        const easedProgress = quintic(rawProgress);

        const currentRow = easedProgress * totalDistance;
        const currentOffset = -(currentRow * rowHeight);
        trackEl.style.transform = `translate3d(0, ${currentOffset}px, 0)`;

        const t1 = rawProgress * (1 - rawProgress);
        const blurAmount = t1 * t1 * 40;
        trackEl.style.filter = blurAmount > 0.2
          ? `blur(${blurAmount.toFixed(1)}px)`
          : "none";

        if (rawProgress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          trackEl.style.transform = `translate3d(0, ${targetOffset}px, 0)`;
          trackEl.style.filter = "none";
          trackEl.style.willChange = "auto";
          onComplete();
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [cancel],
  );

  return { spin, cancel };
}
