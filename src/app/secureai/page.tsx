import type { Metadata } from "next";
import Link from "next/link";
import { InnerPage } from "@/components/layout/InnerPage";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/secureai", {
  title: "SecureAI",
  description:
    "Sixty-plus AI models on one secure platform. No per-user fees. The data stays yours.",
});

const plans = [
  { name: "Starter", price: "$500", credits: "100,000 credits monthly" },
  { name: "Small Business", price: "$1,000", credits: "250,000 credits monthly" },
  { name: "Business", price: "$2,250", credits: "750,000 credits monthly" },
];

const points = [
  {
    title: "Multiple models",
    lede: "GPT-4, Claude, and other leading models through a single platform. The right model for the task.",
  },
  {
    title: "The data stays yours",
    lede: "Enterprise-grade access controls. No training on company data. Usage policies leadership can enforce.",
  },
  {
    title: "The whole team",
    lede: "Not just for power users. Easy onboarding, credits that reset monthly, no stacked per-user fees.",
  },
];

export default function SecureAIPage() {
  return (
    <InnerPage
      phase="unmanaged"
      kicker="SecureAI"
      title="Give the whole team AI. Without the risk."
      lede="Sixty-plus models, including GPT-4 and Claude, on one secure platform. No individual subscriptions. No per-user fees stacking up month after month."
    >
      <ul className="divide-y divide-hairline border-y border-hairline">
        {points.map((p) => (
          <li key={p.title} className="grid gap-4 py-8 md:grid-cols-12">
            <h2 className="display text-[clamp(1.4rem,2.4vw,2rem)] md:col-span-5">
              {p.title}
            </h2>
            <p className="lede md:col-span-7">{p.lede}</p>
          </li>
        ))}
      </ul>
      <ol className="mt-16 divide-y divide-hairline border-y border-hairline">
        {plans.map((plan, i) => (
          <li key={plan.name} className="flex items-baseline justify-between gap-8 py-6">
            <span className="micro text-fg-faint">{String(i + 1).padStart(2, "0")}</span>
            <span className="display text-[clamp(1.4rem,2.4vw,2rem)]">{plan.name}</span>
            <span className="ml-auto text-right">
              <span className="display text-[clamp(1.4rem,2.4vw,2rem)]">{plan.price}</span>
              <span className="micro ml-4 text-fg-faint">{plan.credits}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="body-sm mt-8">
        Need more than 1,500,000 credits? Enterprise pricing is sized to the
        organization.
      </p>
      <Link href="/contact" className="bar-btn bar-btn-line mt-10 inline-flex">
        Talk about SecureAI <span aria-hidden>→</span>
      </Link>
    </InnerPage>
  );
}
