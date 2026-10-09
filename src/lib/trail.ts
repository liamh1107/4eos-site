const KEY = "4eos-trail";

const CHAPTERS: Record<string, string> = {
  unmanaged: "Home",
  discovery: "Discovery",
  ownership: "Ownership",
  security: "Security",
  industries: "Industries",
  response: "Response",
  strategy: "Strategy",
  "strategy-services": "Strategy",
};

export type Spot = { href: string; label: string };

function read(): Spot[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Spot[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(spots: Spot[]) {
  sessionStorage.setItem(KEY, JSON.stringify(spots.slice(-12)));
}

/** The screen the reader is on, including which story chapter is in view. */
export function currentSpot(): Spot {
  const path = window.location.pathname || "/";
  if (path === "/") {
    let best: HTMLElement | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const el of document.querySelectorAll<HTMLElement>("[data-phase]")) {
      const dist = Math.abs(el.getBoundingClientRect().top);
      if (dist < bestDist) {
        bestDist = dist;
        best = el;
      }
    }
    const id = best?.id ?? "";
    const chapter = id.replace(/^chapter-/, "");
    if (best && chapter && CHAPTERS[chapter] && bestDist < window.innerHeight * 0.5) {
      return { href: `/#${id}`, label: CHAPTERS[chapter] };
    }
    return { href: "/", label: "Home" };
  }

  let label = document.title.replace(/\s+\|\s+4EOS$/, "");
  if (!label || label.startsWith("4EOS")) label = "Home";
  return { href: path, label };
}

/** Call just before leaving a page through an ordinary link. */
export function rememberLeave() {
  const here = currentSpot();
  const spots = read();
  const top = spots[spots.length - 1];
  if (top?.href === here.href) return;
  spots.push(here);
  write(spots);
}

/** The page this one was opened from. Skips a spot that is the current page. */
export function previousSpot(): Spot | null {
  const here = `${window.location.pathname}${window.location.hash}`;
  const spots = read();
  for (let i = spots.length - 1; i >= 0; i -= 1) {
    if (spots[i].href !== here && spots[i].href !== window.location.pathname) {
      return spots[i];
    }
  }
  return null;
}

/** The back control is taking us to the page we came from. Drop that spot. */
export function leaveViaBack() {
  const spots = read();
  spots.pop();
  write(spots);
}
