"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { SignalBackdrop } from "@/components/signal/SignalBackdrop";
import { SignalChapter } from "@/components/signal/SignalChapter";
import { PHASE_INDEX } from "@/components/signal/formations";
import {
  getChapterIndex,
  getFocus,
  releasePhaseHold,
  setCloud,
  setFocus,
  setIntensity,
  setZoom,
  setPhase,
  signal,
  setScene,
  subscribeChapter,
  subscribeFocus,
} from "@/components/signal/store";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { PageFade } from "@/components/layout/PageFade";
import { GoldReveal } from "@/components/motion/GoldReveal";
import { SnapTarget } from "@/components/motion/SnapTarget";
import { registerSnapEl } from "@/lib/snap";
import { Accordion } from "@/components/ui/Accordion";
import { PhaseLink } from "@/components/ui/PhaseLink";
import { industries, services, tiers } from "@/lib/content";
import { site } from "@/lib/site";

/** One full viewport. The heading clears the nav; the cue clears the bottom. */
const CHAPTER =
  "px-[var(--sheet-inset)] pt-[var(--chapter-top)] pb-[var(--chapter-bottom)]";

export function HomeView() {
  useEffect(() => {
    releasePhaseHold();
    setCloud(0, true);
    setZoom(0);
    signal.zoomR = 0;
    signal.cover = 0;
    signal.handoff = 0;
    setIntensity(1);
    const id = window.location.hash.slice(1);
    const named = id ? document.getElementById(id) : null;
    const fallback = id === "chapter-strategy-services"
      ? document.getElementById("chapter-strategy")
      : null;
    const el = named ?? fallback ?? document.getElementById("chapter-unmanaged");
    const phase = Number(el?.dataset.phase ?? 0);
    signal.rendered = Number.isFinite(phase) ? phase : 0;
    signal.phaseVel = 0;
    setPhase(signal.rendered);
  }, []);

  return (
    <>
      <SignalBackdrop phase="unmanaged" />
      <Nav />
      <PageFade>
        <div className="mobile-glass">
          <main id="main" tabIndex={-1} className="story relative z-10 outline-none">
            <Hero />
            <Discovery />
            <Ownership />
            <Security />
            <Industries />
            <Response />
            <Strategy />
          </main>
          <SnapTarget className="flex h-dvh flex-col justify-end overflow-hidden pb-24">
            <Footer />
          </SnapTarget>
        </div>
      </PageFade>
    </>
  );
}

function Hero() {
  return (
    <SignalChapter phase="unmanaged" id="chapter-unmanaged">
      <section className="flex h-full flex-col justify-end px-[var(--sheet-inset)] pt-[var(--hero-top)] pb-[var(--chapter-bottom)]">
        <p className="micro text-fg">
          <span className="field-copy">Fort Wayne · Since {site.founded}</span>
        </p>
        <h1 className="display hero-display mt-[clamp(0.75rem,2vh,1.5rem)]">
          Modern IT
          <br />
          leadership
          <br />
          <span className="text-gold">
            for growing
            <br />
            businesses
          </span>
        </h1>
        <p className="lede mt-[clamp(1rem,3vh,2.5rem)] max-w-[42ch]">
          <span className="field-copy">
            Managed IT, cybersecurity, and compliance for Indiana businesses.
            We take ownership of the environment so the team can stay on the work.
          </span>
        </p>
      </section>
    </SignalChapter>
  );
}

function Discovery() {
  return (
    <SignalChapter phase="discovery" id="chapter-discovery">
      <section className={CHAPTER}>
          <GoldReveal
            as="h2"
            className="display-wide chapter-display max-w-[18ch]"
            text="An unmanaged environment is a field of endpoints nobody is watching."
            marks={["unmanaged", "nobody"]}
          />
          <p className="lede mt-6 max-w-[42ch]">
            <span className="field-copy">
              We start by seeing what is actually there. Then the field resolves
              onto a lattice — the same endpoints, finally accounted for.
            </span>
          </p>
      </section>
    </SignalChapter>
  );
}

function Ownership() {
  const [tier, setTier] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-height: 560px)");
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Light the open tier only while this chapter is the one on screen.
  // Doing it on mount would also light industry cluster 0.
  useEffect(() => {
    const apply = () => {
      if (getChapterIndex() === PHASE_INDEX.ownership) setFocus(tier);
      else setFocus(null);
    };
    apply();
    return subscribeChapter(apply);
  }, [tier]);

  return (
    <SignalChapter phase="ownership" id="chapter-ownership">
      <section className={`${CHAPTER} flex h-full flex-col`}>
        <div className="chapter-copy-tight flex min-h-0 flex-1 flex-col">
          <h2 className="display chapter-display shrink-0 [text-wrap:wrap]">
            CompleteCare
            <br />
            is how your IT
            <br />
            gets run.
          </h2>
          <p className="lede mt-4 shrink-0">
            <span className="field-copy">
              More than a help desk. Proactive management, continuous
              monitoring, and live U.S.-based support, in three levels.
            </span>
          </p>
          <div className="phone-list-glass mt-6 min-h-0">
            <Accordion
              key={collapsed ? "collapsed" : "open"}
              className="ownership-tiers"
              compact
              stacked
              defaultOpen={collapsed ? -1 : 0}
              items={tiers.map((tier) => ({
                id: tier.name,
                title: tier.name,
                statement: <span className="field-copy">{tier.statement}</span>,
                children: (
                  <ul className="space-y-1">
                    {tier.points.map((p, i) => (
                      <li key={p} className="flex gap-4 text-sm tracking-tight">
                        <span className="micro">
                          <span className="field-copy">{String(i + 1).padStart(2, "0")}</span>
                        </span>
                        <span className="field-copy">{p}</span>
                      </li>
                    ))}
                  </ul>
                ),
              }))}
              onChange={(i) => setTier(i)}
            />
          </div>
          <Link href="/services/completecare" className="bar-btn bar-btn-line mt-3 inline-flex shrink-0 self-start">
            What CompleteCare includes <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </SignalChapter>
  );
}

function Security() {
  return (
    <SignalChapter phase="security" id="chapter-security">
      <section className={`${CHAPTER} chapter-phone-flow`}>
          <GoldReveal
            as="h2"
            className="display chapter-display [text-wrap:wrap]"
            text={"Threats are stopped.\nNot only reported."}
            marks={["stopped"]}
          />
          <p className="lede mt-6 max-w-[42ch]">
            <span className="field-copy">
              Early detection and real-time monitoring, on the NIST Cybersecurity
              Framework, with support for HIPAA, PCI, and SEC.
            </span>
          </p>
          <div className="mt-10 max-w-[42ch]">
            <h3 className="display text-[clamp(1.35rem,min(3vw,4vh),2.4rem)]">
              <span className="text-gold">SecureAI</span>
            </h3>
            <p className="lede mt-4">
              <span className="field-copy">
                Sixty-plus models on one platform, with the data staying yours.
              </span>
            </p>
          </div>
          <Link href="/secureai" className="chapter-phone-actions bar-btn bar-btn-line mt-5 inline-flex">
            Read SecureAI <span aria-hidden>→</span>
          </Link>
      </section>
    </SignalChapter>
  );
}

function Industries() {
  const [focus, setShown] = useState(-1);
  useEffect(() => {
    const apply = () => {
      const onChapter = getChapterIndex() === PHASE_INDEX.industries;
      setShown(onChapter ? getFocus() : -1);
    };
    apply();
    const offFocus = subscribeFocus(apply);
    const offChapter = subscribeChapter(apply);
    return () => {
      offFocus();
      offChapter();
    };
  }, []);
  const note = focus >= 0 && focus < industries.length ? industries[focus].note : "";

  return (
    <SignalChapter phase="industries" id="chapter-industries">
      <section className={`${CHAPTER} flex h-full flex-col`}>
        <div className="chapter-copy flex min-h-0 flex-1 flex-col">
          <GoldReveal
            as="h2"
            className="display chapter-display shrink-0 [text-wrap:wrap]"
            text={"We have seen\nyour problems\nbefore."}
            marks={["before"]}
          />
          <div className="phone-list-glass mt-6 min-h-0 flex-1 max-md:mt-8">
            <ol className="grid min-h-0 flex-1 grid-rows-6 max-md:flex max-md:h-auto max-md:flex-none max-md:flex-col">
              {industries.map((ind, i) => (
                <li key={ind.slug} className="flex min-h-0 w-full items-center border-b border-hairline first:border-t max-md:w-full max-md:flex-none">
                  <PhaseLink
                    href={`/industries/${ind.slug}`}
                    phase="industries"
                    focus={i}
                    className="flex h-full w-full flex-col justify-center py-[clamp(0.2rem,0.6vh,0.45rem)] transition-colors hover:text-gold"
                  >
                    <span className="flex items-baseline gap-[3vw]">
                      <span className="micro w-8 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="display row-display">
                        {ind.title}
                      </span>
                    </span>
                    <span className="industry-offer">{ind.offer}</span>
                  </PhaseLink>
                </li>
              ))}
            </ol>
          </div>
          <p className="industry-note lede mt-5 min-h-[4.5em] shrink-0" aria-live="polite">
            {note ? <span className="field-copy">{note}</span> : null}
          </p>
        </div>
      </section>
    </SignalChapter>
  );
}

function Response() {
  return (
    <SignalChapter phase="response" id="chapter-response">
      <section className={`${CHAPTER} chapter-phone-flow`}>
          <GoldReveal
            as="h2"
            className="display chapter-display [text-wrap:wrap]"
            text={"A pulse travels out.\nMost issues never\nreach the inbox."}
            marks={["never"]}
          />
          <p className="lede mt-6 max-w-[42ch]">
            <span className="field-copy">
              Continuous monitoring. Live U.S.-based support. Eyes On Site
              when the work still needs someone in the room. Existing client
              with an issue — the help desk picks it up.
            </span>
          </p>
          <div className="chapter-phone-actions mt-8 flex flex-wrap gap-8">
            <Link href="/support" className="bar-btn bar-btn-line inline-flex">
              Request support <span aria-hidden>→</span>
            </Link>
            <Link href="/contact" className="bar-btn bar-btn-line inline-flex">
              New client <span aria-hidden>→</span>
            </Link>
          </div>
      </section>
    </SignalChapter>
  );
}

function Strategy() {
  // A phone, and any very short viewport, starts with every service row
  // closed so the list stays above the Scroll control. A tap still opens one.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(
      "(max-height: 560px), ((pointer: coarse) and (max-width: 899px))",
    );
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // The strategy chapter keeps the unmanaged cloud. Opening a row does not
  // swap in a separate picture.
  useEffect(() => {
    const apply = () => {
      if (getChapterIndex() === PHASE_INDEX.strategy) setScene(null, true);
    };
    apply();
    return subscribeChapter(apply);
  }, []);

  useEffect(() => () => setScene(null, true), []);

  const list = (
    <Accordion
      key={collapsed ? "collapsed" : "open"}
      compact
      defaultOpen={collapsed ? -1 : 0}
      items={services.map((s, i) => ({
        id: s.slug,
        index: String(i + 1).padStart(2, "0"),
        title: s.title,
        statement: s.statement,
        children: (
          <>
            <p className="body-sm">{s.lede}</p>
            <Link href={`/services/${s.slug}`} className="bar-btn bar-btn-line mt-6 inline-flex">
              Read <span aria-hidden>→</span>
            </Link>
          </>
        ),
      }))}
    />
  );

  return (
    <>
      <SignalChapter phase="strategy" id="chapter-strategy">
        <section className={CHAPTER}>
          <h2 className="display chapter-display [text-wrap:wrap]">
            A partner,
            <br />
            <span className="text-gold">not a vendor.</span>
          </h2>
          <p className="lede mt-[clamp(0.85rem,2.4vh,1.5rem)] max-w-[42ch]">
            <span className="field-copy">
              Founded in Fort Wayne in {site.founded}. Largest Dell reseller in
              Northeast Indiana. One family of companies: 4EOS, Midwest VoIP,
              SafeHouse DataCenter. One number to call.
            </span>
          </p>
          <Link href="/why-4eos" className="bar-btn bar-btn-line mt-[clamp(0.75rem,2.2vh,2rem)] inline-flex">
            Why 4EOS <span aria-hidden>→</span>
          </Link>
          {collapsed ? null : (
            <div className="sheet-ink-glass relative mt-[clamp(0.75rem,2.2vh,2rem)] overflow-hidden rounded-[var(--radius-sheet)] px-[clamp(1rem,2.5vw,2rem)]">
              {list}
            </div>
          )}
        </section>
      </SignalChapter>
      {collapsed ? <StrategyServices>{list}</StrategyServices> : null}
    </>
  );
}

function StrategyServices({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerSnapEl(el);
  }, []);

  return (
    <div
      ref={ref}
      id="chapter-strategy-services"
      data-snap
      data-phase={PHASE_INDEX.strategy}
      className="h-dvh overflow-hidden"
    >
      <section className={`${CHAPTER} strategy-phone-list`}>
        <div className="sheet-ink-glass relative overflow-hidden rounded-[var(--radius-sheet)] px-[clamp(1rem,2.5vw,2rem)]">
          {children}
        </div>
      </section>
    </div>
  );
}
