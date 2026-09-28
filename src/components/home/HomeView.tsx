"use client";

import Link from "next/link";
import { SignalBackdrop } from "@/components/signal/SignalBackdrop";
import { SignalChapter } from "@/components/signal/SignalChapter";
import { setFocus, setPhase } from "@/components/signal/store";
import { ChapterRail } from "@/components/layout/ChapterRail";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { PageFade } from "@/components/layout/PageFade";
import { Breath } from "@/components/layout/Sheet";
import { GoldReveal } from "@/components/motion/GoldReveal";
import { Accordion } from "@/components/ui/Accordion";
import { PhaseLink } from "@/components/ui/PhaseLink";
import { industries, services, tiers } from "@/lib/content";
import { site } from "@/lib/site";

export function HomeView() {
  return (
    <>
      <SignalBackdrop phase="unmanaged" />
      <Nav />
      <ChapterRail />
      <PageFade>
        <main id="main" tabIndex={-1} className="relative z-10 outline-none">
          <Hero />
          <Discovery />
          <Ownership />
          <Security />
          <Industries />
          <Response />
          <Strategy />
        </main>
      </PageFade>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <SignalChapter phase="unmanaged" id="chapter-unmanaged">
      <section className="flex min-h-[100svh] flex-col justify-end px-[var(--sheet-inset)] pb-[8vh] pt-[calc(var(--nav-h)+8vh)]">
        <p className="micro text-fg">Fort Wayne · Since {site.founded}</p>
        <h1 className="display mt-6 text-[clamp(3.2rem,10vw,8.4rem)]">
          IT that works
          <br />
          for you.
          <br />
          <span className="text-gold">
            Not the other
            <br />
            way around.
          </span>
        </h1>
        <p className="lede mt-10 max-w-[42ch]">
          Managed IT, cybersecurity, and compliance for Indiana businesses.
          We take ownership of the environment so the team can stay on the work.
        </p>
      </section>
    </SignalChapter>
  );
}

function Discovery() {
  return (
    <>
      <Breath size="md" />
      <SignalChapter phase="discovery" id="chapter-discovery">
        <section className="px-[var(--sheet-inset)] py-10 md:py-14">
          <GoldReveal
            as="h2"
            className="display-wide chapter-display max-w-[22em]"
            text="We account for every device before we manage it."
            marks={["every"]}
          />
          <p className="lede mt-6 max-w-[42ch]">
            Servers, laptops, and the connections between them. Once they are
            named, they can be watched.
          </p>
        </section>
      </SignalChapter>
    </>
  );
}

function Ownership() {
  return (
    <>
      <Breath size="md" />
      <SignalChapter phase="ownership" id="chapter-ownership">
        <section className="px-[var(--sheet-inset)] py-10 md:py-14">
          <GoldReveal
            as="h2"
            className="display-wide chapter-display max-w-[22em]"
            text="CompleteCare is how your IT gets run."
            marks={["CompleteCare"]}
          />
          <p className="lede mt-5 max-w-[46ch]">
            More than a help desk. Proactive management, continuous monitoring,
            and live U.S.-based support, in three levels.
          </p>
          <p className="lede mt-4 max-w-[46ch]">
            Base is the help desk and monitoring. Pro runs the servers, the
            network, backups, and security. Premium adds a roadmap and
            quarterly reviews with leadership.
          </p>
          <div className="mt-10">
            <Accordion
              items={tiers.map((tier) => ({
                id: tier.name,
                title: tier.name,
                statement: tier.statement,
                children: (
                  <ul className="space-y-3">
                    {tier.points.map((p, i) => (
                      <li key={p} className="flex gap-4 text-sm tracking-tight">
                        <span className="micro">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                ),
              }))}
              onChange={(i) => setFocus(i)}
            />
          </div>
          <Link href="/services/completecare" className="micro mt-8 inline-flex text-gold">
            What CompleteCare includes →
          </Link>
        </section>
      </SignalChapter>
    </>
  );
}

function Security() {
  return (
    <>
      <Breath size="md" />
      <SignalChapter phase="security" id="chapter-security">
        <section className="px-[var(--sheet-inset)] py-10 md:py-14">
          <GoldReveal
            as="h2"
            className="display-wide chapter-display max-w-[22em]"
            text="Threats are stopped here, not only reported."
            marks={["stopped"]}
          />
          <p className="lede mt-6 max-w-[42ch]">
            Early detection and real-time monitoring, on the NIST Cybersecurity
            Framework, with support for HIPAA, PCI, and SEC.
          </p>
          <div className="mt-10 max-w-[42ch]">
            <h3 className="display text-[clamp(1.6rem,3vw,2.4rem)]">
              <span className="text-gold">SecureAI</span>
            </h3>
            <p className="lede mt-4">
              Sixty-plus models on one platform, with the data staying yours.
            </p>
            <Link
              href="/secureai"
              className="micro mt-5 inline-flex items-center gap-3 text-gold"
            >
              Read SecureAI <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </SignalChapter>
    </>
  );
}

function Industries() {
  return (
    <>
      <Breath size="md" />
      <SignalChapter phase="industries" id="chapter-industries">
        <section className="px-[var(--sheet-inset)] py-10 md:py-14">
          <p className="lede max-w-[44ch]">
            Six industries we already know. Familiar problems, so fewer
            surprises.
          </p>
          <ol className="mt-10 divide-y divide-hairline border-y border-hairline">
            {industries.map((ind, i) => (
              <li key={ind.slug}>
                <PhaseLink
                  href={`/industries/${ind.slug}`}
                  phase="industries"
                  focus={i}
                  className="group flex items-baseline gap-[3vw] py-4 transition-colors hover:text-gold"
                >
                  <span className="micro w-8 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-[clamp(1.4rem,2.8vw,2.2rem)]">
                    {ind.title}
                  </span>
                </PhaseLink>
              </li>
            ))}
          </ol>
        </section>
      </SignalChapter>
    </>
  );
}

function Response() {
  return (
    <>
      <Breath size="md" />
      <SignalChapter phase="response" id="chapter-response">
        <section className="px-[var(--sheet-inset)] py-10 md:py-14">
          <GoldReveal
            as="h2"
            className="display-wide chapter-display max-w-[22em]"
            text="Most issues are fixed before they reach you."
            marks={["before"]}
          />
          <p className="lede mt-6 max-w-[42ch]">
            Continuous monitoring. Live U.S.-based support. Eyes On Site
            when the work still needs someone in the room. Existing client
            with an issue — the help desk picks it up.
          </p>
          <div className="mt-8 flex flex-wrap gap-8">
            <Link href="/support" className="micro text-gold">
              Request support →
            </Link>
                <Link href="/contact" className="micro hover:text-gold">
              New client →
            </Link>
          </div>
        </section>
      </SignalChapter>
    </>
  );
}

function Strategy() {
  return (
    <>
      <Breath size="md" />
      <SignalChapter phase="strategy" id="chapter-strategy">
      <section className="px-[var(--sheet-inset)] pb-12">
        <h2 className="display-wide chapter-display max-w-[22em]">
          A partner, <span className="text-gold">not a vendor.</span>
        </h2>
        <p className="lede mt-6 max-w-[42ch]">
          Founded in Fort Wayne in {site.founded}. Largest Dell reseller in
          Northeast Indiana. One family of companies: 4EOS, Midwest VoIP,
          SafeHouse DataCenter. One number to call.
        </p>
        <Link href="/why-4eos" className="micro mt-8 inline-flex text-gold">
          Why 4EOS →
        </Link>
        <div className="mt-12">
          <Accordion
            items={services.map((s, i) => ({
              id: s.slug,
              index: String(i + 1).padStart(2, "0"),
              title: s.title,
              statement: s.statement,
              children: (
                <>
                  <p className="body-sm">{s.lede}</p>
                  <Link
                    href={`/services/${s.slug}`}
                    className="micro mt-6 inline-flex text-gold"
                  >
                    Read →
                  </Link>
                </>
              ),
            }))}
            onChange={(i) => setPhase(services[i].phase)}
          />
        </div>
      </section>
      </SignalChapter>
    </>
  );
}
