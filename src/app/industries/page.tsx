import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { Breath, Sheet } from "@/components/layout/Sheet";
import { PhaseLink } from "@/components/ui/PhaseLink";
import { industries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Legal, insurance, healthcare, construction, manufacturing, and private equity.",
};

export default function IndustriesPage() {
  return (
    <Page phase="industries">
      <section className="px-[var(--sheet-inset)] pb-10 pt-[6vh]">
        <p className="micro text-fg-muted">Industries</p>
        <h1 className="display-wide page-display mt-5 max-w-[22em]">
          We have seen these problems before.
        </h1>
      </section>
      <Breath size="md" />
      <Sheet tone="ink">
        <ol className="sheet-pad divide-y divide-hairline py-4">
          {industries.map((ind, i) => (
            <li key={ind.slug}>
              <PhaseLink
                href={`/industries/${ind.slug}`}
                phase="industries"
                focus={i}
                className="group grid gap-4 py-7 md:grid-cols-12"
              >
                <span className="micro text-fg-faint md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display text-[clamp(1.4rem,2.6vw,2rem)] md:col-span-4 group-hover:text-gold">
                  {ind.title}
                </span>
                <span className="lede md:col-span-7">{ind.lede}</span>
              </PhaseLink>
            </li>
          ))}
        </ol>
      </Sheet>
    </Page>
  );
}
