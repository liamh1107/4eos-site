"use client";

import { useId, useState, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  index?: string;
  title: ReactNode;
  statement?: ReactNode;
  children: ReactNode;
};

/**
 * Replaces the 3-up card grid. One item open at a time; the Signal reacts
 * through `onChange` so the field and the copy stay on the same claim.
 */
export function Accordion({
  items,
  onChange,
  onHover,
  defaultOpen = 0,
  compact = false,
  stacked = false,
  className = "",
}: {
  items: AccordionItem[];
  onChange?: (index: number) => void;
  onHover?: (index: number | null) => void;
  defaultOpen?: number;
  /** Tighter rows so a chapter list fits in one viewport. */
  compact?: boolean;
  /** Statement above the detail, so a narrow column does not split across the field. */
  stacked?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();

  return (
    <ul className={className} onMouseLeave={() => onHover?.(null)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-panel-${i}`;
        const buttonId = `${uid}-button-${i}`;
        return (
          <li key={item.id} className="border-t border-hairline last:border-b">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onMouseEnter={() => onHover?.(i)}
                onClick={() => {
                  setOpen(i);
                  onChange?.(i);
                }}
                className={`flex w-full items-baseline gap-[3vw] text-left transition-colors hover:text-gold ${
                  compact
                    ? "py-[clamp(0.3rem,0.9vh,0.75rem)]"
                    : "py-[clamp(0.45rem,1.5vh,1.25rem)]"
                }`}
              >
                <span className="micro w-8 shrink-0">
                  {item.index ?? String(i + 1).padStart(2, "0")}
                </span>
                <span className="display row-display">{item.title}</span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className={`accordion-panel grid min-w-0 grid-cols-1 pl-[calc(2rem+3vw)] ${
                stacked ? "" : "md:grid-cols-12"
              } ${compact ? "gap-3 pb-3" : "gap-8 pb-10"}`}
            >
              {item.statement ? (
                <p className={`lede min-w-0 ${stacked ? "" : "md:col-span-5"}`}>
                  {item.statement}
                </p>
              ) : null}
              <div
                className={`min-w-0 ${
                  item.statement && !stacked ? "md:col-span-7" : ""
                }`}
              >
                {item.children}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
