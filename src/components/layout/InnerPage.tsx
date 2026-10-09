import type { ReactNode } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { ServiceTitle } from "@/components/ui/ServiceTitle";
import { Page } from "./Page";
import { Sheet } from "./Sheet";
import type { Phase } from "@/components/signal/formations";

export function InnerPage({
  phase,
  kicker,
  brand,
  title,
  lede,
  children,
  tone = "light",
  focus,
  zoom = false,
  scene,
  settleFromCube = false,
  backHref,
  backLabel,
  visual,
  note,
}: {
  phase: Phase;
  kicker?: string;
  /** A brand mark in place of the kicker line. */
  brand?: ReactNode;
  title: string;
  lede?: string;
  children?: ReactNode;
  tone?: "light" | "dark";
  focus?: number;
  zoom?: boolean;
  scene?: number | null;
  settleFromCube?: boolean;
  backHref?: string;
  backLabel?: string;
  /** A centerpiece beside the hero copy. Stacks under it on a phone. */
  visual?: ReactNode;
  /** A short line under the lede, kept with the copy rather than the visual. */
  note?: string;
}) {
  const copy = (
    <>
      {brand ? (
        <div className="mt-6 text-fg">{brand}</div>
      ) : kicker ? (
        <p className="micro mt-6">
          <span className="field-copy">{kicker}</span>
        </p>
      ) : null}
      <h1 className="display page-display mt-5 max-w-[18ch]">
        <ServiceTitle title={title} />
      </h1>
      {lede ? (
        <p className="lede mt-6 max-w-[46ch]">
          <span className="field-copy">{lede}</span>
        </p>
      ) : null}
      {note ? <p className="micro mt-6 text-fg-muted">{note}</p> : null}
    </>
  );
  return (
    <Page
      phase={phase}
      tone={tone}
      focus={focus}
      zoom={zoom}
      scene={scene}
      settleFromCube={settleFromCube}
    >
      <section className={`px-[var(--sheet-inset)] pt-[6vh] ${visual ? "pb-8" : "pb-10"}`}>
        <BackLink href={backHref ?? "/"} label={backLabel ?? "Home"} />
        {visual ? (
          <>
            <div className="lg:grid lg:grid-cols-[minmax(0,max-content)_minmax(0,1fr)] lg:items-center">
              <div className="max-w-[40rem]">{copy}</div>
              {/* Centered in the open field beside the copy. */}
              <div className="mt-8 flex w-full max-w-[16rem] lg:mt-0 lg:max-w-none lg:justify-center">
                <div className="aspect-square w-full lg:w-[min(24rem,80%)]">{visual}</div>
              </div>
            </div>
          </>
        ) : (
          copy
        )}
      </section>
      {children ? (
        <Sheet tone="ink">
          <div className="sheet-pad sheet-y">{children}</div>
        </Sheet>
      ) : null}
    </Page>
  );
}
