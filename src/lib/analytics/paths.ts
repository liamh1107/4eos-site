/** Paths that must never enter visitor totals. */
export function isIgnoredPath(path: string) {
  return (
    path.startsWith("/analytics") ||
    path.startsWith("/signal-lab") ||
    path.startsWith("/api/")
  );
}

export type ContentKind = "service" | "industry" | "support" | "contact" | "assessment" | "page";

const SERVICES: Record<string, string> = {
  "/services/completecare": "CompleteCare",
  "/services/cybersecurity": "Cybersecurity",
  "/services/cloud": "Cloud",
  "/services/voip": "VoIP",
  "/services/datacenter": "Datacenter",
  "/services/hardware": "Hardware",
  "/secureai": "SecureAI",
};

const INDUSTRIES: Record<string, string> = {
  "/industries/legal": "Legal",
  "/industries/insurance": "Insurance",
  "/industries/healthcare": "Healthcare",
  "/industries/construction": "Construction",
  "/industries/manufacturing": "Manufacturing",
  "/industries/private-equity": "Private Equity",
};

export function contentOf(path: string): { kind: ContentKind; label: string } | null {
  if (SERVICES[path]) return { kind: "service", label: SERVICES[path] };
  if (INDUSTRIES[path]) return { kind: "industry", label: INDUSTRIES[path] };
  if (path === "/services") return { kind: "service", label: "Services" };
  if (path === "/industries") return { kind: "industry", label: "Industries" };
  if (path === "/support" || path.startsWith("/support/")) return { kind: "support", label: "Support" };
  if (path === "/contact") return { kind: "contact", label: "Contact" };
  if (path === "/assessment") return { kind: "assessment", label: "Risk quiz" };
  return null;
}

export function cleanPath(value: unknown) {
  if (typeof value !== "string") return null;
  const path = value.split("?")[0]?.trim() ?? "";
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 180) return null;
  if (path.includes("..")) return null;
  return path;
}
