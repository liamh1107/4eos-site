"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Phase } from "@/components/signal/formations";
import { clusterCenter } from "@/components/signal/formations";
import { armCubeZoom, holdPhase, setFocus, setLook } from "@/components/signal/store";

export function PhaseLink({
  href,
  phase,
  focus,
  armZoom = false,
  className = "",
  children,
}: {
  href: string;
  phase: Phase;
  focus?: number;
  /** Arm the dive through the die. Only the homepage industry faces set this. */
  armZoom?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const prime = () => {
    // Hold the chapter now. The page scroll resets on navigation and
    // would otherwise step the field back through Security.
    holdPhase(phase);
    if (focus === undefined) return;
    const [x, y] = clusterCenter(focus);
    setFocus(focus);
    setLook(x, y);
    if (armZoom) armCubeZoom();
  };

  return (
    <Link
      href={href}
      className={className}
      onPointerEnter={() => {
        if (focus === undefined) return;
        setFocus(focus);
      }}
      onPointerLeave={() => {
        if (focus === undefined) return;
        setFocus(null);
      }}
      onPointerDown={prime}
      // Keyboard activation never fires pointerdown.
      onClick={prime}
    >
      {children}
    </Link>
  );
}
