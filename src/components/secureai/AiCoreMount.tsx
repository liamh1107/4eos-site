"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { detectTier, prefersReducedMotion, REDUCED_MOTION_QUERY, type DeviceTier } from "@/lib/env";
import { AiCorePoster } from "./AiCorePoster";

// Three is already in the page through the field, but the scene itself is
// only wanted here, so it stays out of the shared bundle.
const AiCore = dynamic(() => import("./AiCore"), { ssr: false });

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function serverStill() {
  return false;
}

/**
 * The SecureAI centerpiece with its still poster underneath. The poster is
 * the no-JS and pre-WebGL frame; the canvas fades over it once it has drawn.
 * Off screen it renders on demand only, and a hidden tab stops it.
 */
export function AiCoreMount({ caption }: { caption?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [visible, setVisible] = useState(true);
  const [awake, setAwake] = useState(true);
  const [live, setLive] = useState(false);
  const still = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, serverStill);

  useEffect(() => {
    const id = window.setTimeout(() => setTier(detectTier()), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setAwake(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const canvas = tier !== null && tier !== "none";
  const frameloop = !awake ? "never" : still || !visible ? "demand" : "always";

  return (
      <figure className="ai-core-figure m-0 h-full w-full">
      <div ref={host} className="ai-core" data-live={live ? "true" : "false"} aria-hidden="true">
        <AiCorePoster className="ai-core-poster" />
        {canvas ? (
          <div className="ai-core-canvas">
            <AiCore tier={tier} still={still} frameloop={frameloop} onReady={() => setLive(true)} />
          </div>
        ) : null}
      </div>
      {caption ? <figcaption className="micro mt-5 text-fg-muted">{caption}</figcaption> : null}
    </figure>
  );
}
