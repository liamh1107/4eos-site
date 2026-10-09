import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Page } from "@/components/layout/Page";
import { BackLink } from "@/components/ui/BackLink";
import { Sheet } from "@/components/layout/Sheet";
import { industries } from "@/lib/content";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/industries", {
  title: "Industries",
  description:
    "Legal, insurance, healthcare, construction, manufacturing, and private equity.",
});

/**
 * The standalone index. Plain links on purpose: the dive through the die
 * belongs to the homepage chapter, and this page should read like a list.
 */
export default function IndustriesPage() {
  return (
    <Page phase="discovery">
      <section className="px-[var(--sheet-inset)] pb-8 pt-[6vh]">
        <BackLink href="/" label="Home" />
        <p className="micro mt-6 text-fg-muted">
          <span className="field-copy">Industries</span>
        </p>
        <h1 className="display page-display mt-5 [text-wrap:wrap]">
          We have seen
          <br />
          your problems
          <br />
          before.
        </h1>
      </section>
      <Sheet tone="ink">
        <ol className="reveal-rows sheet-pad flex flex-col items-start gap-8 py-8">
          {industries.map((ind, i) => (
            <li key={ind.slug} className="max-w-[62ch]" style={{ "--row": i } as CSSProperties}>
              <Link
                href={`/industries/${ind.slug}`}
                className="inline-flex w-fit items-baseline gap-4 border-b border-hairline py-3 transition-colors hover:text-gold"
              >
                <span className="micro text-fg-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display text-[clamp(1.4rem,2.6vw,2rem)]">
                  {ind.title}
                </span>
              </Link>
              <p className="lede mt-3">{ind.lede}</p>
            </li>
          ))}
        </ol>
      </Sheet>
    </Page>
  );
}
