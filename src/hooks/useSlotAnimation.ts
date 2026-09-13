import { useRef, useCallback } from "react";

interface SpinParams {
  rowHeight: number;
  targetOffset: number;
  totalRows: number;
  targetStripIndex: number;
  onComplete: () => void;
}

function slotEasing(t: number): number {
  if (t < 0.15) {
    return 4 * t * t * t;
  }
  if (t < 0.6) {
    const p = (t - 0.15) / 0.45;
    return 0.135 + p * 0.73;
  }
  const p = (t - 0.6) / 0.4;
  return 0.865 + (1 - (1 - p) * (1 - p)) * 0.135;
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

      const extraSpins = 3 + Math.floor(Math.random() * 2);
      const totalDistance = extraSpins * totalRows + targetStripIndex;
      const totalDuration = 3200 + Math.random() * 600;

      trackEl.style.willChange = "transform";

      const startTime = performance.now();
      let lastProgress = 0;

      const animate = (now: number) => {
        if (cancelledRef.current) return;

        const elapsed = now - startTime;
        const rawProgress = Math.min(elapsed / totalDuration, 1);
        const easedProgress = slotEasing(rawProgress);

        const currentRow = easedProgress * totalDistance;
        const currentOffset = -(currentRow * rowHeight);
        trackEl.style.transform = `translate3d(0, ${currentOffset}px, 0)`;

        const velocity = Math.abs(easedProgress - lastProgress);
        lastProgress = easedProgress;

        const blurAmount = velocity * 350;
        if (blurAmount > 0.3 && rawProgress < 0.95) {
          trackEl.style.filter = `blur(${Math.min(blurAmount, 6).toFixed(1)}px)`;
        } else {
          trackEl.style.filter = "none";
        }

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
