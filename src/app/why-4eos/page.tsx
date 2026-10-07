import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { values } from "@/lib/content";
import { site } from "@/lib/site";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/why-4eos", {
  title: "Why 4EOS",
  description:
    "Founded in Fort Wayne in 2002. A partner, not a vendor. Eyes On Site, one family of companies.",
});

const claims = [
  {
    title: "Eyes On Site",
    lede: "Technology went remote-first, and so did we. Engineers still show up. Regular onsite engagement means we know the office, the team, and the setup in person.",
  },
  {
    title: "Proactive, not reactive",
    lede: "Most issues are resolved before they reach the business. Continuous monitoring, not a wait for someone to arrive.",
  },
  {
    title: "One accountable family",
    lede: "Midwest VoIP and SafeHouse DataCenter are part of the 4EOS family. Phone, data center, and IT work together. One number to call.",
  },
];

export default function WhyPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker={`Fort Wayne · ${site.founded}`}
      title="A partner, not a vendor."
      lede="We do not just manage the IT. We take ownership of it. Local support is not a promise in an ad. It is how the work has been done for over two decades."
    >
      <ul className="divide-y divide-hairline border-y border-hairline">
        {claims.map((c) => (
          <li key={c.title} className="grid gap-4 py-10 md:grid-cols-12">
            <h2 className="display text-[clamp(1.5rem,2.6vw,2.2rem)] md:col-span-5">
              {c.title}
            </h2>
            <p className="lede md:col-span-7">{c.lede}</p>
          </li>
        ))}
      </ul>
      <ul className="mt-16 divide-y divide-hairline border-y border-hairline">
        {values.map((v) => (
          <li key={v.title} className="grid gap-4 py-8 md:grid-cols-12">
            <h3 className="display text-[clamp(1.3rem,2.2vw,1.8rem)] md:col-span-5">
              {v.title}
            </h3>
            <p className="lede md:col-span-7">{v.lede}</p>
          </li>
        ))}
      </ul>
    </InnerPage>
  );
}
