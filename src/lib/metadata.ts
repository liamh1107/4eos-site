import type { Metadata } from "next";
import { site } from "@/lib/site";

/**
 * Canonical URL for a public route. Next drops a trailing slash on the
 * homepage, so that URL is the bare origin. Analytics and the signal lab
 * stay noindex and do not use this helper.
 */
export function withCanonical(path: string, metadata: Metadata = {}): Metadata {
  const canonical = path === "/" ? site.url : `${site.url}${path}`;
  return {
    ...metadata,
    alternates: { canonical },
  };
}
