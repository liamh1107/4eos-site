import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { BackLink } from "@/components/ui/BackLink";
import { Breath, Sheet } from "@/components/layout/Sheet";
import { PhaseLink } from "@/components/ui/PhaseLink";
import { services } from "@/lib/content";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/services", {
  title: "Services",
  description:
    "CompleteCare managed IT, cybersecurity, cloud, VoIP, data center, and hardware procurement.",
});

export default function ServicesPage() {
  return (
    <Page phase="unmanaged">
      <section className="px-[var(--sheet-inset)] pb-10 pt-[6vh]">
        <BackLink href="/" label="Home" />
        <p className="micro mt-6 text-fg-muted">
          <span className="field-copy">Practice</span>
        </p>
        <h1 className="display page-display mt-5 [text-wrap:wrap]">
          IT, phones,
          <br />
          and the data center.
        </h1>
      </section>
      <Breath size="md" />
      <Sheet tone="ink">
        <ol className="sheet-pad divide-y divide-hairline py-4">
          {services.map((s, i) => (
            <li key={s.slug}>
              <PhaseLink
                href={`/services/${s.slug}`}
                phase={s.phase}
                className="group grid gap-4 py-7 md:grid-cols-12"
              >
                <span className="micro text-fg-faint md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display text-[clamp(1.4rem,2.6vw,2rem)] md:col-span-5 group-hover:text-gold">
                  {s.title}
                </span>
                <span className="lede md:col-span-6">{s.statement}</span>
              </PhaseLink>
            </li>
          ))}
        </ol>
      </Sheet>
    </Page>
  );
}
