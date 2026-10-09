"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Net = { effectiveType?: string };

/** Page context the Beacon learned on mount, shared with page-level events. */
let context: Record<string, unknown> = {};

/** Send a custom event from a page, with the same context as the Beacon's own events. */
export function sendSignal(body: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  send({ ...context, path: window.location.pathname, ...body });
}

function send(body: Record<string, unknown>) {
  const payload = JSON.stringify(body);
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon("/api/signal", blob)) return;
  }
  void fetch("/api/signal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

export function Beacon() {
  const pathname = usePathname();
  const scroll = useRef(0);
  const marks = useRef(new Set<number>());

  useEffect(() => {
    if (pathname.startsWith("/analytics") || pathname.startsWith("/signal-lab")) return;
    const params = new URLSearchParams(window.location.search);
    const stored = sessionStorage.getItem("eos_acq");
    const acq = stored
      ? (JSON.parse(stored) as Record<string, string>)
      : {
          referrer: document.referrer,
          utmSource: params.get("utm_source") ?? "",
          utmMedium: params.get("utm_medium") ?? "",
          utmCampaign: params.get("utm_campaign") ?? "",
          utmTerm: params.get("utm_term") ?? "",
          utmContent: params.get("utm_content") ?? "",
        };
    if (!stored) sessionStorage.setItem("eos_acq", JSON.stringify(acq));

    const connection = (navigator as Navigator & { connection?: Net }).connection?.effectiveType;
    const screen = `${window.screen.width}x${window.screen.height}`;
    const base = { path: pathname, screen, connection, ...acq };
    context = base;

    send({ ...base, name: "page_view" });
    const started = Date.now();
    let sent = 0;

    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const depth = height <= 0 ? 100 : Math.round((window.scrollY / height) * 100);
      scroll.current = Math.max(scroll.current, depth);
      for (const mark of [50, 90]) {
        if (scroll.current >= mark && !marks.current.has(mark)) {
          marks.current.add(mark);
          send({ ...base, name: "scroll", scroll: mark });
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      let detail = "";
      if (href.startsWith("tel:")) detail = "tel";
      else if (href.startsWith("mailto:")) detail = "mailto";
      else if (href === "/contact" || href.startsWith("/contact?")) detail = "cta";
      else if (href === "/assessment" || href.startsWith("/assessment?")) detail = "cta";
      else if (pathname === "/support") detail = "support";
      if (detail) send({ ...base, name: "click", detail });
    };

    const beat = () => {
      if (document.visibilityState !== "visible") return;
      const elapsed = Date.now() - started;
      const delta = Math.min(20_000, elapsed - sent);
      if (delta < 1000) return;
      sent = elapsed;
      send({ ...base, name: "heartbeat", engagementMs: delta, scroll: scroll.current });
    };

    onScroll();
    const timer = window.setInterval(beat, 15_000);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", beat);
    return () => {
      beat();
      window.clearInterval(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [pathname]);

  return null;
}
