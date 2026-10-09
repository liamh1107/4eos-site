"use client";

import { useEffect } from "react";
import { type Phase } from "@/components/signal/formations";
import { cubeZoomArmed, signal, snapPhase } from "@/components/signal/store";

/** Pins the persistent field to this page's formation on mount and change. */
export function PhasePin({
  phase,
  settleFromCube = false,
}: {
  phase: Phase;
  /** Leave the die in place when a zoom through it is still running. */
  settleFromCube?: boolean;
}) {
  useEffect(() => {
    const onCube = signal.rendered > 3.4 && signal.rendered < 4.6;
    if (settleFromCube && onCube && cubeZoomArmed()) return;
    snapPhase(phase);
  }, [phase, settleFromCube]);

  return null;
}
