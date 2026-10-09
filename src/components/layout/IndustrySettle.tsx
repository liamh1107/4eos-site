"use client";

import { useEffect } from "react";
import { detectTier, prefersReducedMotion } from "@/lib/env";
import {
  cubeZoomArmed,
  disarmCubeZoom,
  setCloud,
  setFocus,
  setIntensity,
  setZoom,
  signal,
  snapPhase,
} from "@/components/signal/store";

/**
 * The zoom through an industry face ends on black. The die is swapped for
 * the unmanaged cloud while that black is still held, then the dots fade in.
 * The die stays gone until the industries chapter is on screen again.
 *
 * Only a click on the homepage die arms this. Arriving from /industries,
 * the nav, a search result, or a reload gets a plain cut to the cloud.
 */
export function IndustrySettle() {
  useEffect(() => {
    const onCube = signal.rendered > 3.4 && signal.rendered < 4.6;
    // Read, do not clear: dev strict mode runs this effect twice before the
    // first frame, and the second run must see the same answer.
    const skip = !onCube || !cubeZoomArmed() || detectTier() === "mobile" || prefersReducedMotion();
    if (skip) {
      setZoom(0);
      signal.zoomR = 0;
      signal.cover = 0;
      signal.handoff = 0;
      setFocus(null);
      setCloud(0, true);
      setIntensity(1);
      snapPhase("unmanaged");
      return;
    }

    let stage: "in" | "hold" | "fade" | "done" = "in";
    let heldSince = 0;
    let fadeFrom = 0;
    const started = performance.now();
    let raf = 0;

    const cutToCloud = () => {
      // Positions become the cloud before the camera leaves the black.
      signal.cover = 1;
      signal.handoff = 1;
      signal.intensity = 1;
      signal.cloud = 1;
      signal.cloudR = 1;
      signal.zoom = 0;
      signal.zoomR = 0;
      setFocus(null);
      snapPhase("unmanaged");
      // One dive per click on the die.
      disarmCubeZoom();
      signal.invalidate?.();
    };

    const tick = (now: number) => {
      if (stage === "done") return;
      if (now - started > 12000) {
        cutToCloud();
        signal.cover = 0;
        stage = "done";
        return;
      }
      if (stage === "in") {
        // Latch black once the zoom has taken the die out. A later dip in
        // the zoom must not bring the icon back, and must not cancel the cut.
        if (signal.zoomR > 0.9) signal.cover = 1;
        if (signal.cover > 0.999) {
          if (heldSince === 0) heldSince = now;
          // Fully black, and still, before anything is swapped.
          if (now - heldSince > 700) {
            cutToCloud();
            stage = "hold";
            heldSince = now;
          }
        }
      } else if (stage === "hold") {
        // The cloud is already in place, still covered, so the fade
        // cannot reveal the die.
        signal.cover = 1;
        if (now - heldSince > 450) {
          stage = "fade";
          fadeFrom = now;
        }
      } else {
        const t = Math.min(1, (now - fadeFrom) / 1400);
        signal.cover = (1 - t) * (1 - t);
        if (t >= 1) {
          signal.cover = 0;
          stage = "done";
          return;
        }
      }
      signal.invalidate?.();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      signal.cover = 0;
      signal.handoff = 0;
      if (stage !== "done") setIntensity(1);
    };
  }, []);

  return null;
}
