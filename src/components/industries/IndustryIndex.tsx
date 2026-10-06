"use client";

import { useState } from "react";
import Link from "next/link";
import { clusterCenter } from "@/components/signal/formations";
import { setFocus, setLook } from "@/components/signal/store";
import { industries } from "@/lib/content";

/**
 * The industries index is a split instrument: the numbered list on the left
 * drives a preview on the right AND lights the matching cluster in the live
 * field, so the empty gutter reads as part of the Signal rather than as dead
 * space. The preview never empties — it defaults to the first practice and
 * follows whichever row the pointer or keyboard is on.
 */
export function IndustryIndex() {
  const [active, setActive] = useState(0);

  // Light the cluster and aim the camera at it, the same wiring PhaseLink
  // uses. Leaving the list only drops the field focus; the panel holds.
  const enter = (i: number) => {
    setActive(i);
    const [x, y] = clusterCenter(i);
    setFocus(i);
    setLook(x, y);
  };
  const leave = () => setFocus(null);

  const current = industries[active];

  return (
    <div
      className="grid gap-y-12 md:grid-cols-12 md:gap-x-10"
      onPointerLeave={leave}
    >
      <ol className="flex flex-col items-stretch md:col-span-7">
        {industries.map((ind, i) => {
          const on = i === active;
          return (
            <li
              key={ind.slug}
              className="border-b border-hairline first:border-t"
            >
              <Link
                href={`/industries/${ind.slug}`}
                onPointerEnter={() => enter(i)}
                onFocus={() => enter(i)}
                onBlur={leave}
                className={`group flex w-full items-baseline gap-[3vw] py-[clamp(0.6rem,1.6vh,1.15rem)] transition-colors ${
                  on ? "text-gold" : "hover:text-gold"
                }`}
              >
                <span
                  className={`micro w-8 shrink-0 transition-colors ${
                    on ? "text-gold" : "text-fg-faint"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="display row-display">{ind.title}</span>
                <span
                  aria-hidden
                  className={`micro ml-auto self-center transition-opacity ${
                    on ? "opacity-100 text-gold" : "opacity-0"
                  }`}
                >
                  →
                </span>
              </Link>
              {/* On phones the split collapses, so the copy rides under its row. */}
              <p className="lede mb-6 mt-3 md:hidden">{ind.lede}</p>
            </li>
          );
        })}
      </ol>

      <div className="hidden md:col-span-5 md:block">
        <div className="sticky top-[calc(var(--nav-h)+2rem)] border-l border-hairline pl-8 lg:pl-10">
          <div key={current.slug} className="page-fade">
            <p className="micro text-fg-faint">
              Industry {String(active + 1).padStart(2, "0")} / {String(industries.length).padStart(2, "0")}
            </p>
            <h2 className="display mt-5 text-[clamp(1.5rem,2.4vw,2.1rem)] leading-[1.05]">
              {current.statement}
            </h2>
            <p className="micro mt-9 text-fg-faint">How it shows up</p>
            <ul className="mt-4 space-y-3">
              {current.how.map((item, i) => (
                <li
                  key={item}
                  className="flex gap-4 border-t border-hairline pt-3 text-[15px] tracking-tight"
                >
                  <span className="micro text-fg-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={`/industries/${current.slug}`}
              className="micro mt-9 inline-flex text-gold"
            >
              Enter {current.title} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
