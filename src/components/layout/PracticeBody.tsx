import Link from "next/link";
import type { Related } from "@/lib/content";

export function PracticeBody({
  title,
  points,
  how,
  related,
}: {
  title: string;
  points: readonly string[];
  how: readonly string[];
  related?: readonly Related[];
}) {
  return (
    <>
      <h2 className="display text-[clamp(1.4rem,2.6vw,2rem)]">{title}</h2>
      <div className="mt-10 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="micro text-fg-faint">How it shows up</p>
          <ul className="mt-5 space-y-4">
            {how.map((item, i) => (
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
          <p className="micro text-fg-faint">In practice</p>
          <ul className="mt-5 space-y-4">
            {points.map((item, i) => (
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
      </div>
      {related && related.length > 0 ? (
        <ul className="mt-12 flex flex-wrap gap-6 border-t border-hairline pt-8">
          {related.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="bar-btn bar-btn-line inline-flex">
                {item.label} <span aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Link href="/assessment" className="bar-btn bar-btn-line mt-10 inline-flex">
        Request an assessment <span aria-hidden>→</span>
      </Link>
    </>
  );
}
