"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UsMap } from "./UsMap";

type RangeKey = "day" | "week" | "month" | "quarter" | "year";
type Mode = "executive" | "advanced";
type Pair = { label: string; count: number };
type Topic = { label: string; views: number; avgEngagementMs: number; conversion: number; returnRate: number };
type Report = {
  overview: {
    visitors: number;
    unique: number;
    returning: number;
    avgSessionMs: number;
    pagesPerSession: number;
    engagementRate: number;
    activeNow: number;
    leads: number;
    conversion: number;
    visitorsChange: number | null;
    leadsChange: number | null;
  };
  places: {
    cities: { label: string; count: number }[];
    states: Pair[];
    networks: Pair[];
  };
  leadSources: Pair[];
  pages: { path: string; views: number; entries: number; exits: number; avgEngagementMs: number; avgScroll: number }[];
  services: Topic[];
  industries: Topic[];
  journeys: { place: string; steps: string[] }[];
  support: { visits: number; unique: number; repeat: number; tickets: number; avgEngagementMs: number; sources: Pair[]; actions: Pair[] };
  leads: { total: number };
  funnels: { name: string; steps: { label: string; count: number }[] }[];
  ai: {
    referrals: Pair[];
    crawlers: { label: string; count: number; firstSeen: number; lastSeen: number }[];
    pages: { path: string | null; count: number }[];
  };
  companies: { org_name: string; location: string | null; last_seen: number; visits: number }[];
  companyLookup: boolean;
  devices: Pair[];
  browsers: Pair[];
  systems: Pair[];
  screens: Pair[];
  score: { topIndustry: string | null; topService: string | null; bestSource: string | null };
  engagement: { score: number; label: string };
  repeats: { label: string; count: number }[];
  trending: { label: string; views: number; change: number | null }[];
};
type LiveHere = {
  path: string;
  page: string;
  where: string | null;
  region: string | null;
  engagementMs: number;
  scroll: number;
  interest: string;
};
type Live = { active: number; feed: { at: number; path: string | null; name: string; detail: string | null }[]; here: LiveHere[] };

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
];

export function CommandRoom() {
  const router = useRouter();
  const [range, setRange] = useState<RangeKey>("month");
  const [mode, setMode] = useState<Mode>("executive");
  const [report, setReport] = useState<Report | null>(null);
  const [reportRange, setReportRange] = useState<RangeKey | null>(null);
  const [failedRange, setFailedRange] = useState<RangeKey | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [live, setLive] = useState<Live | null>(null);
  const [liveError, setLiveError] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let stop = false;
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch(`/api/analytics/report?range=${range}`, { signal: controller.signal });
        if (!res.ok) throw new Error("report");
        const data = (await res.json()) as Report;
        if (stop) return;
        if (!data?.overview) throw new Error("shape");
        setReport(data);
        setReportRange(range);
        setFailedRange(null);
      } catch (error) {
        if (stop || (error instanceof DOMException && error.name === "AbortError")) return;
        setFailedRange(range);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => {
      stop = true;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [range, attempt]);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const res = await fetch("/api/analytics/live");
        if (!res.ok) throw new Error("live");
        const data = (await res.json()) as Live;
        if (stop) return;
        if (!data?.feed) throw new Error("shape");
        setLive(data);
        setLiveError(false);
      } catch {
        if (!stop) setLiveError(true);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 8_000);
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, []);

  async function logout() {
    setSigningOut(true);
    try {
      await fetch("/api/analytics/logout", { method: "POST" });
    } finally {
      router.push("/analytics/login");
      router.refresh();
    }
  }

  const current = report && reportRange === range ? report : null;
  const failed = failedRange === range;
  const rangeLabel = RANGES.find((item) => item.key === range)?.label ?? range;

  if (!current && failed) {
    return (
      <div className="command">
        <RoomHeader
          mode={mode}
          range={range}
          signingOut={signingOut}
          onMode={setMode}
          onRange={setRange}
          onLogout={logout}
        />
        <div className="command-status" role="alert">
          <p className="command-kicker">Report unavailable</p>
          <p>The {rangeLabel.toLowerCase()} report did not load.</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="command" aria-busy="true">
        <RoomHeader
          mode={mode}
          range={range}
          signingOut={signingOut}
          onMode={setMode}
          onRange={setRange}
          onLogout={logout}
        />
        <p className="command-kicker" role="status">
          Reading the record
        </p>
        <p className="command-quiet">Pulling the {rangeLabel.toLowerCase()} report.</p>
      </div>
    );
  }

  const o = current.overview;
  const leads = current.leads.total;
  const aiHits =
    current.ai.referrals.reduce((sum, row) => sum + row.count, 0) +
    current.ai.crawlers.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="command">
      <RoomHeader
        mode={mode}
        range={range}
        signingOut={signingOut}
        onMode={setMode}
        onRange={setRange}
        onLogout={logout}
      />

      {failed ? (
        <p className="command-banner" role="alert">
          The latest {rangeLabel.toLowerCase()} refresh failed. Figures below are the last successful read.
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </p>
      ) : null}

      {mode === "executive" ? (
        <>
          <section className="command-metrics" aria-label="Overview">
            <Metric label="Visitors" value={String(o.visitors)} detail={<Delta value={o.visitorsChange} />} />
            <Metric label="Unique" value={String(o.unique)} />
            <Metric label="Returning" value={String(o.returning)} />
            <Metric label="Session" value={clock(o.avgSessionMs)} />
            <Metric label="Pages / session" value={String(o.pagesPerSession)} />
            <Metric label="Engagement rate" value={`${o.engagementRate}%`} />
            <Metric label="Engagement" value={`${current.engagement.score}/100`} detail={current.engagement.label} />
            <Metric
              label="Leads"
              value={String(leads)}
              detail={
                leads > 0 ? (
                  <>
                    <Delta value={o.leadsChange} /> {o.conversion}% conversion
                  </>
                ) : (
                  "None in this period"
                )
              }
            />
            <Metric label="Active now" value={String(live?.active ?? o.activeNow)} />
          </section>

          <section className="command-split">
            <article className="command-panel command-summary">
              <h2>{range === "day" ? "Today" : `This ${range}`}</h2>
              <dl>
                <div><dt>Top industry</dt><dd>{current.score.topIndustry ?? "—"}</dd></div>
                <div><dt>Top service</dt><dd>{current.score.topService ?? "—"}</dd></div>
                <div><dt>Top source</dt><dd>{current.score.bestSource ?? "—"}</dd></div>
                <div><dt>Most viewed</dt><dd>{pageLabel(current.pages[0]?.path)}</dd></div>
              </dl>
            </article>
            <article className="command-panel">
              <h2>Live activity</h2>
              {liveError ? (
                <p className="command-quiet" role="status">
                  {live ? "Live activity did not refresh. The last reading is still shown." : "Live activity is unavailable."}
                </p>
              ) : null}
              {(live?.here ?? []).length ? (
                <ul className="command-live">
                  {live!.here.slice(0, 5).map((row, index) => (
                    <li key={index}>
                      <strong>{row.where || "Visitor"}</strong>
                      <span>Viewing {row.page}</span>
                      <span>Time on site {clock(row.engagementMs)}</span>
                      <span>{row.scroll}% scroll</span>
                      <em>{row.interest}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="command-quiet">Nobody is on the site in the last five minutes.</p>
              )}
            </article>
          </section>

          <Panel title="Recent journeys">
            {current.journeys.length ? (
              <div className="command-journeys">
                {current.journeys.map((journey, index) => (
                  <article key={index}>
                    <h3>{journey.place}</h3>
                    <ol>
                      {journey.steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  </article>
                ))}
              </div>
            ) : (
              <p className="command-quiet">Journey tracking is on. A path appears after a second page.</p>
            )}
          </Panel>

          <section className="command-split">
            <Panel title="United States">
              {current.places.states.length ? (
                <UsMap
                  states={current.places.states}
                  liveRegions={(live?.here ?? []).map((row) => row.region).filter((row): row is string => Boolean(row))}
                />
              ) : (
                <p className="command-quiet">Location tracking is on. No state has been recorded in this period.</p>
              )}
            </Panel>
            <Panel title="Repeat visitors">
              {current.repeats.length ? (
                <Bars rows={current.repeats.map((row) => ({ label: row.label, count: row.count }))} />
              ) : (
                <p className="command-quiet">No city has a second visit in this period.</p>
              )}
            </Panel>
          </section>

          <section className="command-split">
            <Panel title="Industries">
              <Ranks rows={current.industries} empty="No industry page has been opened in this period." />
            </Panel>
            <Panel title="Services">
              <Ranks rows={current.services} empty="No service page has been opened in this period." />
            </Panel>
          </section>

          {current.trending.some((row) => row.change != null) ? (
            <Panel title="Trending">
              <ul className="command-trend-list">
                {current.trending.filter((row) => row.change != null).map((row) => (
                  <li key={row.label}>
                    <span>{row.change! > 0 ? "↑" : row.change! < 0 ? "↓" : "·"} {row.label}</span>
                    <b>{row.change! > 0 ? "+" : ""}{row.change}%</b>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          {current.support.visits > 0 ? (
            <Panel title="Support">
              <dl>
                <div><dt>Visits</dt><dd>{current.support.visits}</dd></div>
                <div><dt>Unique</dt><dd>{current.support.unique}</dd></div>
                <div><dt>Time</dt><dd>{clock(current.support.avgEngagementMs)}</dd></div>
                <div><dt>Tickets</dt><dd>{current.support.tickets}</dd></div>
                <div><dt>Returning</dt><dd>{current.support.repeat}</dd></div>
              </dl>
              {current.support.sources.length ? <Bars rows={current.support.sources} /> : null}
            </Panel>
          ) : (
            <p className="command-note">Support tracking is on. No support visits in this period.</p>
          )}

          {leads > 0 ? (
            <Panel title="Lead sources">
              <Bars rows={current.leadSources} empty="No lead source recorded in this period." />
            </Panel>
          ) : (
            <p className="command-note">Lead tracking is on. No leads in this period.</p>
          )}

          {aiHits > 0 ? (
            <Panel title="AI activity">
              <Bars rows={current.ai.referrals.filter((row) => row.count > 0)} empty="No AI referrals in this period." />
            </Panel>
          ) : (
            <p className="command-note">AI tracking is on. No AI referrals in this period.</p>
          )}
        </>
      ) : (
        <>
          <section className="command-split">
            <Panel title="Browsers"><Bars rows={current.browsers} empty="No browser recorded in this period." /></Panel>
            <Panel title="Systems"><Bars rows={current.systems} empty="No system recorded in this period." /></Panel>
            <Panel title="Screens"><Bars rows={current.screens} empty="No screen size recorded in this period." /></Panel>
            <Panel title="Devices"><Bars rows={current.devices} empty="No device recorded in this period." /></Panel>
          </section>
          <Panel title="Networks">
            <Bars rows={current.places.networks} empty="No network name recorded in this period." />
          </Panel>
          <Panel title="Crawlers and AI">
            {current.ai.crawlers.length ? (
              <div className="command-table-wrap">
                <table>
                  <thead><tr><th>Crawler</th><th>Hits</th><th>First</th><th>Last</th></tr></thead>
                  <tbody>
                    {current.ai.crawlers.map((row) => (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td>{row.count}</td>
                        <td>{new Date(row.firstSeen).toLocaleString()}</td>
                        <td>{new Date(row.lastSeen).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="command-quiet">No known AI crawler in this period.</p>
            )}
            <Bars rows={current.ai.pages.map((row) => ({ label: row.path || "/", count: row.count }))} empty="No AI page hits in this period." />
          </Panel>
          <Panel title="Event log">
            {(live?.feed ?? []).length ? (
              <ul className="command-feed">
                {live!.feed.map((row, index) => (
                  <li key={`${row.at}-${index}`}>
                    <span>{new Date(row.at).toLocaleTimeString()}</span>
                    <strong>{row.path}</strong>
                    <em>{row.detail || row.name}</em>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="command-quiet">{liveError ? "The event log is unavailable." : "No events in the live window."}</p>
            )}
          </Panel>
          <Panel title="Pages">
            {current.pages.length ? (
              <div className="command-table-wrap">
                <table>
                  <thead><tr><th>Page</th><th>Views</th><th>Entry</th><th>Exit</th><th>Time</th><th>Scroll</th></tr></thead>
                  <tbody>
                    {current.pages.map((row) => (
                      <tr key={row.path}>
                        <td>{row.path}</td><td>{row.views}</td><td>{row.entries}</td><td>{row.exits}</td>
                        <td>{clock(row.avgEngagementMs)}</td><td>{row.avgScroll}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="command-quiet">No page views in this period.</p>
            )}
          </Panel>
          <Panel title="Funnels">
            {current.funnels.length ? (
              current.funnels.map((funnel) => (
                <Funnel key={funnel.name} name={funnel.name} steps={funnel.steps} />
              ))
            ) : (
              <p className="command-quiet">No funnel steps in this period.</p>
            )}
          </Panel>
          {current.companyLookup ? (
            <Panel title="Organizations">
              {current.companies.length ? (
                <div className="command-table-wrap">
                  <table>
                    <thead><tr><th>Organization</th><th>Visits</th><th>Location</th></tr></thead>
                    <tbody>
                      {current.companies.map((row) => (
                        <tr key={row.org_name}><td>{row.org_name}</td><td>{row.visits}</td><td>{row.location || "—"}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="command-quiet">The lookup key is set. No organization has been returned.</p>}
            </Panel>
          ) : null}
        </>
      )}
    </div>
  );
}

function RoomHeader({
  mode,
  range,
  signingOut,
  onMode,
  onRange,
  onLogout,
}: {
  mode: Mode;
  range: RangeKey;
  signingOut: boolean;
  onMode: (mode: Mode) => void;
  onRange: (range: RangeKey) => void;
  onLogout: () => void;
}) {
  return (
    <header className="command-top">
      <div>
        <p className="command-kicker">4EOS analytics</p>
        <h1>{mode === "executive" ? "Executive summary" : "Advanced detail"}</h1>
      </div>
      <div className="command-controls">
        <div className="command-ranges" role="group" aria-label="View">
          <button type="button" aria-pressed={mode === "executive"} className={mode === "executive" ? "is-on" : ""} onClick={() => onMode("executive")}>
            Executive
          </button>
          <button type="button" aria-pressed={mode === "advanced"} className={mode === "advanced" ? "is-on" : ""} onClick={() => onMode("advanced")}>
            Advanced
          </button>
        </div>
        <div className="command-ranges" role="group" aria-label="Date range">
          {RANGES.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={item.key === range}
              className={item.key === range ? "is-on" : ""}
              onClick={() => onRange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button type="button" className="command-signout" onClick={onLogout} disabled={signingOut}>
          {signingOut ? "Signing out" : "Sign out"}
        </button>
      </div>
    </header>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: ReactNode }) {
  return (
    <article className="command-metric">
      <p>{label}</p>
      <strong>{value}</strong>
      {detail ? <span>{detail}</span> : null}
    </article>
  );
}

function Delta({ value }: { value: number | null }) {
  if (value == null) return null;
  const dir = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const word = dir === "up" ? "up" : dir === "down" ? "down" : "unchanged";
  const sign = value > 0 ? "+" : "";
  return (
    <small className="command-delta" data-dir={dir}>
      <span className="sr-only">{word} </span>
      {sign}
      {value}%
    </small>
  );
}

function pageLabel(path: string | undefined) {
  if (!path) return "—";
  const names: Record<string, string> = {
    "/": "Homepage",
    "/services/completecare": "CompleteCare",
    "/services/cybersecurity": "Cybersecurity",
    "/secureai": "SecureAI",
    "/support": "Support",
    "/contact": "Contact",
  };
  return names[path] ?? path;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="command-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Bars({ rows, empty = "Nothing recorded in this period." }: { rows: Pair[]; empty?: string }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  if (!rows.length) return <p className="command-quiet">{empty}</p>;
  return (
    <ul className="command-bars">
      {rows.map((row, index) => (
        <li key={`${row.label}-${index}`}>
          <span>{row.label}</span>
          <i style={{ width: `${Math.max(row.count ? 6 : 0, (row.count / max) * 100)}%` }} />
          <b>{row.count}</b>
        </li>
      ))}
    </ul>
  );
}

function Ranks({ rows, empty }: { rows: Topic[]; empty: string }) {
  if (!rows.length) return <p className="command-quiet">{empty}</p>;
  return (
    <ol className="command-ranks">
      {rows.map((row, index) => (
        <li key={row.label}>
          <strong>#{index + 1} {row.label}</strong>
          <span>{row.views} {row.views === 1 ? "visitor" : "visitors"}</span>
          <span>{clock(row.avgEngagementMs)} avg engagement</span>
        </li>
      ))}
    </ol>
  );
}

function Funnel({ name, steps }: { name: string; steps: { label: string; count: number }[] }) {
  const max = Math.max(1, ...steps.map((step) => step.count));
  return (
    <div className="command-funnel">
      <h3>{name}</h3>
      <ol>
        {steps.map((step) => (
          <li key={step.label}>
            <span>{step.label}</span>
            <i style={{ width: `${Math.max(18, (step.count / max) * 100)}%` }} />
            <strong>{step.count}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}

function clock(ms: number) {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes <= 0) return `${rest}s`;
  return `${minutes}m ${rest}s`;
}
