import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { InnerPage } from "@/components/layout/InnerPage";
import { FaqList } from "@/components/seo/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { industries } from "@/lib/content";
import { withCanonical } from "@/lib/metadata";
import { breadcrumbSchema, faqSchema, graphSchema, industryPageSchema } from "@/lib/schema";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) return {};
  return withCanonical(`/industries/${industry.slug}`, { title: industry.title, description: industry.lede });
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) notFound();
  const index = industries.findIndex((i) => i.slug === slug);

  return (
    <InnerPage
      phase="unmanaged"
      kicker="Industry"
      title={industry.statement}
      lede={industry.lede}
      focus={index}
      zoom
      settleFromCube
      backHref="/#chapter-industries"
      backLabel="Industries"
    >
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="micro text-fg-faint">How it shows up</p>
          <ul className="mt-5 space-y-4">
            {industry.how.map((item, i) => (
              <li
                key={item}
                className="flex gap-4 border-t border-hairline pt-4 text-[15px] tracking-tight"
              >
                <span className="micro text-fg-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-6">
          <p className="micro text-fg-faint">{industry.title}</p>
          <p className="lede mt-5">{industry.note}</p>
        </div>
      </div>
      <ul className="mt-12 flex flex-wrap gap-6 border-t border-hairline pt-8">
        {industry.related.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="bar-btn bar-btn-line inline-flex">
              {item.label} <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/contact" className="bar-btn bar-btn-line mt-10 inline-flex">
        Request an assessment <span aria-hidden>→</span>
      </Link>
      <JsonLd
        data={graphSchema([
          industryPageSchema(industry),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Industries", path: "/industries" },
            { name: industry.title, path: `/industries/${industry.slug}` },
          ]),
          faqSchema(industry.faqs),
        ])}
      />
      <div className="mt-16">
        <FaqList items={industry.faqs} />
      </div>
    </InnerPage>
  );
}
