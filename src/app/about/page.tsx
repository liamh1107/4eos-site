import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { site } from "@/lib/site";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/about", {
  title: "About",
  description:
    "Founded in Fort Wayne in 2002. Largest Dell reseller in Northeast Indiana. Microsoft and Cisco partner.",
});

const facts = [
  { label: "Founded", value: String(site.founded) },
  { label: "Home", value: "Fort Wayne, Indiana" },
  { label: "Hardware", value: "Largest Dell reseller, Northeast Indiana" },
  { label: "Partners", value: "Dell, Microsoft, Cisco" },
  { label: "Family", value: "Midwest VoIP · SafeHouse DataCenter" },
  { label: "Framework", value: "NIST Cybersecurity Framework" },
];

export default function AboutPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker="About"
      title="Fort Wayne born. Business first."
      lede={`Founded in ${site.founded} in Fort Wayne, Indiana. Managed IT, cybersecurity, cloud, and data center work, so the business can keep running.`}
    >
      <p className="lede max-w-[52ch]">
        Certified engineers, watching for problems before they stop the work.
        Dell, Microsoft, Cisco, and other providers supply the hardware and
        software, priced for the size of the company.
      </p>
      <dl className="mt-16 divide-y divide-hairline border-y border-hairline">
        {facts.map((f) => (
          <div key={f.label} className="grid gap-2 py-6 md:grid-cols-12">
            <dt className="micro text-fg-faint md:col-span-4">{f.label}</dt>
            <dd className="text-[17px] tracking-tight md:col-span-8">{f.value}</dd>
          </div>
        ))}
      </dl>
    </InnerPage>
  );
}
