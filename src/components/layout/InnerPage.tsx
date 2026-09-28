import type { ReactNode } from "react";
import Link from "next/link";
import { Page } from "./Page";
import { Breath, Sheet } from "./Sheet";
import type { Phase } from "@/components/signal/formations";

export function InnerPage({
  phase,
  kicker,
  title,
  lede,
  children,
  tone = "light",
  focus,
  zoom = false,
  backHref,
  backLabel,
}: {
  phase: Phase;
  kicker?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
  tone?: "light" | "dark";
  focus?: number;
  zoom?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <Page phase={phase} tone={tone} focus={focus} zoom={zoom}>
      <section className="px-[var(--sheet-inset)] pb-10 pt-[6vh]">
        {backHref && backLabel ? (
          <Link href={backHref} className="micro inline-flex text-gold">
            ← {backLabel}
          </Link>
        ) : null}
        {kicker ? (
          <p className={`micro ${backHref ? "mt-6" : ""}`}>{kicker}</p>
        ) : null}
        <h1 className="display-wide page-display mt-5 max-w-[22em]">{title}</h1>
        {lede ? <p className="lede mt-6 max-w-[46ch]">{lede}</p> : null}
      </section>
      {children ? (
        <>
          <Breath size="md" />
          <Sheet tone="ink">
            <div className="sheet-pad sheet-y">{children}</div>
          </Sheet>
        </>
      ) : null}
    </Page>
  );
}
