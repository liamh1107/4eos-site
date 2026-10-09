import { randomUUID } from "node:crypto";
import { analyticsDb } from "./db";
import { classifyAgent } from "./bots";
import { classifySource } from "./classify";
import { lookupOrganization } from "./enrich";
import { cleanPath, isIgnoredPath } from "./paths";
import { placeFromAddress } from "./geo";
import { cleanConnection, cleanScreen, parseAgent } from "./ua";
import { isQuizCategory } from "@/lib/quiz";

const SESSION_MS = 30 * 60 * 1000;
const VISITOR_COOKIE = "eos_vid";
const SESSION_COOKIE = "eos_sid";

export type SignalBody = {
  name?: string;
  path?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  screen?: string;
  connection?: string;
  engagementMs?: number;
  scroll?: number;
  detail?: string;
  /** Risk quiz score, 0..100, sent with quiz_complete. */
  score?: number;
};

export type LeadKind = "assessment" | "support" | "quiz";

const CLICKS = new Set(["tel", "mailto", "cta", "support"]);
const FORMS = new Set<string>(["assessment", "support", "quiz"]);
const EVENTS = new Set(["page_view", "heartbeat", "scroll", "click", "form_submit", "quiz_start", "quiz_complete"]);
const LEAD_PATH: Record<LeadKind, string> = { assessment: "/contact", support: "/support", quiz: "/assessment" };

export function readIds(cookieHeader: string | null) {
  const jar = parseCookies(cookieHeader);
  return { visitorId: jar[VISITOR_COOKIE] ?? null, sessionId: jar[SESSION_COOKIE] ?? null };
}

export async function recordSignal(input: {
  body: SignalBody;
  userAgent: string | null;
  cookieHeader: string | null;
  address?: string | null;
  now?: number;
}) {
  const path = cleanPath(input.body.path);
  if (!path || isIgnoredPath(path)) return { ignored: true as const };

  const agent = classifyAgent(input.userAgent);
  const now = input.now ?? Date.now();
  const db = analyticsDb();

  if (agent.kind === "bot") return { ignored: true as const };

  if (agent.kind === "crawler") {
    db.prepare(
      "INSERT INTO events (at, session_id, visitor_id, name, path, detail, kind) VALUES (?, NULL, NULL, 'crawl', ?, ?, 'crawler')",
    ).run(now, path, agent.name);
    return { ignored: false as const, setCookies: [] as string[] };
  }

  const name = input.body.name;
  if (!name || !EVENTS.has(name)) {
    return { ignored: true as const };
  }

  const ids = readIds(input.cookieHeader);
  const visitorId = validId(ids.visitorId) ?? randomUUID();
  let sessionId = validId(ids.sessionId);
  const source = classifySource({
    referrer: input.body.referrer,
    utmSource: input.body.utmSource,
    utmMedium: input.body.utmMedium,
    utmCampaign: input.body.utmCampaign,
  });
  const parsed = parseAgent(input.userAgent);
  const screen = cleanScreen(input.body.screen);
  const connection = cleanConnection(input.body.connection);
  const existing = sessionId
    ? (db.prepare("SELECT id, last_seen, trail, page_count, city, region FROM sessions WHERE id = ? AND kind = 'visitor'").get(sessionId) as
        | { id: string; last_seen: number; trail: string; page_count: number; city: string | null; region: string | null }
        | undefined)
    : undefined;

  const expired = !existing || now - existing.last_seen > SESSION_MS;
  const place = !existing || expired || (!existing.city && !existing.region) ? await placeFromAddress(input.address ?? null) : null;

  if (!existing || expired) {
    sessionId = randomUUID();
    db.prepare(
      `INSERT INTO sessions (
        id, visitor_id, started_at, last_seen, entry_path, exit_path, trail,
        source_class, source_label, referrer_host, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        device, browser, os, screen, connection, country, region, city, lat, lon, isp, page_count, engagement_ms, max_scroll, lead, kind
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 'visitor')`,
    ).run(
      sessionId,
      visitorId,
      now,
      now,
      path,
      path,
      path,
      source.class,
      source.label,
      source.host,
      clip(input.body.utmSource),
      clip(input.body.utmMedium),
      clip(input.body.utmCampaign),
      clip(input.body.utmTerm),
      clip(input.body.utmContent),
      parsed.device,
      parsed.browser,
      parsed.os,
      screen,
      connection,
      place?.country || null,
      place?.region || null,
      place?.city || null,
      place?.lat ?? null,
      place?.lon ?? null,
      place?.isp || null,
    );
    db.prepare(
      `INSERT INTO visitors (id, first_seen, last_seen) VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET last_seen = excluded.last_seen`,
    ).run(visitorId, now, now);
  } else {
    sessionId = existing.id;
    if (place?.country || place?.region || place?.city) {
      db.prepare(
        `UPDATE sessions SET country = COALESCE(?, country), region = COALESCE(?, region), city = COALESCE(?, city),
          lat = COALESCE(?, lat), lon = COALESCE(?, lon), isp = COALESCE(?, isp) WHERE id = ?`,
      ).run(
        place.country || null,
        place.region || null,
        place.city || null,
        place.lat,
        place.lon,
        place.isp || null,
        sessionId,
      );
    }
  }

  const detail = cleanDetail(name, input.body.detail);
  const scroll = clamp(input.body.scroll, 0, 100);
  const engagement = name === "heartbeat" ? clamp(input.body.engagementMs, 0, 20_000) : 0;

  if (name === "page_view") {
    const row = db.prepare("SELECT trail FROM sessions WHERE id = ?").get(sessionId) as { trail: string };
    const parts = row.trail.split("|").filter(Boolean);
    const nextTrail = parts[parts.length - 1] === path ? parts : [...parts, path].slice(-12);
    db.prepare(
      "UPDATE sessions SET last_seen = ?, exit_path = ?, trail = ?, page_count = page_count + 1 WHERE id = ?",
    ).run(now, path, nextTrail.join("|"), sessionId);
  } else {
    db.prepare(
      `UPDATE sessions SET last_seen = ?, engagement_ms = engagement_ms + ?, max_scroll = MAX(max_scroll, ?),
        lead = CASE WHEN ? = 'form_submit' OR ? IN ('tel', 'mailto') THEN 1 ELSE lead END
       WHERE id = ?`,
    ).run(now, engagement, scroll ?? 0, name, detail ?? "", sessionId);
  }

  if (name !== "heartbeat") {
    db.prepare(
      "INSERT INTO events (at, session_id, visitor_id, name, path, detail, kind) VALUES (?, ?, ?, ?, ?, ?, 'visitor')",
    ).run(now, sessionId, visitorId, name, path, detail);
  }

  if (name === "quiz_complete" && detail) {
    const score = clamp(input.body.score, 0, 100);
    db.prepare(
      "INSERT INTO quiz_results (at, session_id, visitor_id, score, category, areas, lead) VALUES (?, ?, ?, ?, ?, NULL, 0)",
    ).run(now, sessionId, visitorId, score, detail);
  }

  db.prepare("UPDATE visitors SET last_seen = ? WHERE id = ?").run(now, visitorId);

  if (name === "page_view") void rememberCompany(visitorId, path, now);

  return {
    ignored: false as const,
    setCookies: [
      cookie(VISITOR_COOKIE, visitorId, 400 * 24 * 3600),
      cookie(SESSION_COOKIE, sessionId!, 30 * 60),
    ],
  };
}

export function recordFormLead(kind: LeadKind, cookieHeader: string | null) {
  const ids = readIds(cookieHeader);
  if (!validId(ids.visitorId) || !validId(ids.sessionId)) return;
  const now = Date.now();
  const db = analyticsDb();
  const session = db.prepare("SELECT id FROM sessions WHERE id = ? AND kind = 'visitor'").get(ids.sessionId) as
    | { id: string }
    | undefined;
  if (!session) return;
  db.prepare("UPDATE sessions SET lead = 1, last_seen = ? WHERE id = ?").run(now, ids.sessionId);
  db.prepare(
    "INSERT INTO events (at, session_id, visitor_id, name, path, detail, kind) VALUES (?, ?, ?, 'form_submit', ?, ?, 'visitor')",
  ).run(now, ids.sessionId, ids.visitorId, LEAD_PATH[kind], kind);
  if (kind === "quiz") {
    // The most recent result in this session is the one the request came from.
    db.prepare(
      `UPDATE quiz_results SET lead = 1 WHERE id = (
        SELECT id FROM quiz_results WHERE session_id = ? ORDER BY at DESC LIMIT 1
      )`,
    ).run(ids.sessionId);
  }
}

async function rememberCompany(_visitorId: string, page: string, now: number) {
  const org = await lookupOrganization();
  if (!org?.name) return;
  const db = analyticsDb();
  const name = org.name.slice(0, 120);
  const location = org.location?.slice(0, 120) ?? null;
  const row = db.prepare("SELECT pages, visits FROM companies WHERE org_name = ?").get(name) as
    | { pages: string; visits: number }
    | undefined;
  const pages = row ? Array.from(new Set([...row.pages.split("|"), page])).slice(-40).join("|") : page;
  if (!row) {
    db.prepare(
      "INSERT INTO companies (org_name, location, first_seen, last_seen, visits, pages) VALUES (?, ?, ?, ?, 1, ?)",
    ).run(name, location, now, now, pages);
  } else {
    db.prepare("UPDATE companies SET location = COALESCE(?, location), last_seen = ?, visits = visits + 1, pages = ? WHERE org_name = ?").run(
      location,
      now,
      pages,
      name,
    );
  }
}

function cleanDetail(name: string, detail: string | undefined) {
  if (!detail) return null;
  if (name === "click" && CLICKS.has(detail)) return detail;
  if (name === "form_submit" && FORMS.has(detail)) return detail;
  if (name === "quiz_complete" && isQuizCategory(detail)) return detail;
  if (name === "crawl") return detail.slice(0, 40);
  return null;
}

function clip(value: string | undefined) {
  const text = value?.trim();
  if (!text) return null;
  return text.slice(0, 80);
}

function clamp(value: unknown, min: number, max: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function validId(value: string | null) {
  return value && /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}

function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

function parseCookies(header: string | null) {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key) out[key] = rest.join("=");
  }
  return out;
}
