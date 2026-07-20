import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { perfService } from "./perfService";
import { PerfTraceName } from "./types";

// A frame longer than this counts as janky (60fps target ≈ 16.67ms per frame).
const JANK_FRAME_MS = 17;

/**
 * Measures JS-thread frame drops during a scroll session and reports them to
 * Firebase as a custom trace (janky_frames / total_frames / jank_percent).
 * Imperfect by nature — JS can't see UI-thread frames — but a useful production
 * signal for how smooth the feed scrolls on real devices.
 */
export function useScrollJankTrace(traceName: PerfTraceName) {
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const totalFramesRef = useRef(0);
  const jankyFramesRef = useRef(0);
  const startedRef = useRef(false);

  // Runs once per animation frame; a delayed callback means the JS thread was
  // busy, so the gap since the last frame reveals jank.
  const tick = useCallback(() => {
    const now = Date.now();
    const delta = now - lastFrameRef.current;
    lastFrameRef.current = now;
    totalFramesRef.current += 1;
    if (delta > JANK_FRAME_MS) jankyFramesRef.current += 1;
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (startedRef.current) return; // Keep one session across drag→momentum
    startedRef.current = true;
    totalFramesRef.current = 0;
    jankyFramesRef.current = 0;
    lastFrameRef.current = Date.now();
    perfService.startTrace(traceName);
    rafRef.current = requestAnimationFrame(tick);
  }, [traceName, tick]);

  const stop = useCallback(() => {
    if (!startedRef.current) return;
    startedRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const total = totalFramesRef.current;
    const janky = jankyFramesRef.current;
    const jankPercent = total > 0 ? Math.round((janky / total) * 100) : 0;
    perfService.stopTrace(traceName, undefined, {
      total_frames: total,
      janky_frames: janky,
      jank_percent: jankPercent,
    });
  }, [traceName]);

  // A scroll session is meaningful only while the app is interactive. End it
  // before background time can inflate duration or keep requestAnimationFrame alive.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") stop();
    });
    return () => {
      sub.remove();
      stop();
    };
  }, [stop]);

  return { start, stop };
}
