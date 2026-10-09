"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { MidwestLogo } from "@/components/brand/MidwestLogo";
import { SocialMarks } from "@/components/layout/SocialMarks";
import { addressLine, headerNav, site } from "@/lib/site";
import { setMenuOpen } from "@/lib/menu";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import { snapToEl } from "@/lib/snap";

/** Both wordmarks need the row this wide before Services and the social icons keep their padding. */
const FULL_BAR = "(min-width: 1440px)";

const menuNav = [
  ...headerNav,
  { label: "About", href: "/about" },
  { label: "Journal", href: "/blog" },
] as const;

function isCurrent(href: string, pathname: string) {
  if (href === "/services/completecare") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (href === "/services") {
    return (
      pathname === "/services" ||
      (pathname.startsWith("/services/") &&
        !pathname.startsWith("/services/completecare"))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The live 4eos.com bar — wordmark, primary links, the phone, Request
 * Support, Free IT Assessment — set in the site's ink glass so it belongs
 * on the field. The word Menu only appears once that row no longer fits.
 */
export function Nav({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  // Publish after commit. Calling the store from the setOpen updater runs
  // during Nav's render and updates ChapterRail in the same pass.
  useEffect(() => {
    setMenuOpen(open);
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia(FULL_BAR);
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;

    lockScroll();
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      // Keep focus inside the overlay while it is up.
      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlockScroll();
      (previous ?? toggle.current)?.focus();
    };
  }, [open]);

  const ink = tone === "dark";

  return (
    <>
      <header
        className={`site-bar fixed inset-x-0 top-0 z-50 ${ink ? "site-bar-bone" : ""}`}
      >
        <div className="flex h-[var(--nav-h)] items-center gap-[clamp(0.75rem,1.5vw,1.75rem)] px-[var(--sheet-inset)]">
          <div className="brand-pair flex shrink-0 items-center gap-[clamp(0.7rem,1.15vw,1.15rem)]">
            <Link
              href="/#chapter-unmanaged"
              aria-label="4EOS home"
              className="inline-flex items-center transition-opacity hover:opacity-80"
              onClick={(event) => {
                if (pathname !== "/") return;
                event.preventDefault();
                if (window.location.hash !== "#chapter-unmanaged") {
                  window.location.hash = "chapter-unmanaged";
                  return;
                }
                const chapter = document.getElementById("chapter-unmanaged");
                if (chapter) snapToEl(chapter);
              }}
            >
              <Logo />
            </Link>
            <Link
              href="/services/voip"
              aria-label="Midwest VoIP"
              className="inline-flex items-center text-inherit transition-opacity hover:opacity-80"
            >
              <MidwestLogo />
            </Link>
          </div>

          <nav
            aria-label="Primary"
            className="hidden min-w-0 min-[1440px]:flex min-[1440px]:flex-1 min-[1440px]:justify-center"
          >
            <ul className="flex items-center gap-[clamp(0.35rem,calc(2.2vw-1.15rem),1.35rem)]">
              {headerNav.map((item) => {
                const current = isCurrent(item.href, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className="bar-link inline-flex py-2"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-[clamp(0.5rem,1vw,0.9rem)]">
            <SocialMarks className="ml-4 hidden min-[1440px]:flex" />
            <a
              href={site.phoneHref}
              className="bar-link hidden py-2 opacity-80 hover:opacity-100 min-[760px]:inline-flex"
            >
              {site.phone}
            </a>
            <Link
              href="/support"
              className="bar-btn bar-btn-line hidden min-[1120px]:inline-flex"
            >
              Request Support
            </Link>
            <Link
              href="/assessment"
              className="bar-btn bar-btn-line hidden min-[900px]:inline-flex"
            >
              Free IT Assessment
            </Link>
            <button
              ref={toggle}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="bar-btn bar-btn-line inline-flex min-[1440px]:hidden"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        ref={panel}
        hidden={!open}
        className="menu-glass fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto px-[var(--sheet-inset)] pt-[calc(var(--nav-h)+4vh)] pb-[var(--sheet-inset)] text-fg"
      >
        <nav aria-label="Main">
          <ul>
            {menuNav.map((item, i) => (
              <li key={item.href} className="border-t border-hairline">
                <Link
                  href={item.href}
                  className="group flex items-baseline gap-[3vw] py-[1.4vh] transition-colors hover:text-gold"
                >
                  <span className="micro w-8 shrink-0 transition-colors group-hover:text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-[clamp(2.2rem,6.5vw,5.5rem)]">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-8 border-t border-hairline pt-6">
          <ul className="flex gap-8">
            <li>
              <Link href="/support" className="micro transition-colors hover:text-gold">
                Request Support
              </Link>
            </li>
            <li>
              <Link href="/assessment" className="micro transition-colors hover:text-gold">
                Free IT Assessment
              </Link>
            </li>
          </ul>
          <address className="micro not-italic text-fg-muted">
            <a href={site.phoneHref} className="hover:text-gold">
              {site.phone}
            </a>
            <span className="px-2 text-fg-faint">/</span>
            <a href={`mailto:${site.helpdesk}`} className="hover:text-gold">
              {site.helpdesk}
            </a>
            <span className="hidden px-2 text-fg-faint sm:inline">/</span>
            <span className="hidden sm:inline">{addressLine}</span>
          </address>
        </div>
      </div>
    </>
  );
}
