import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DIR = path.join(process.cwd(), "data", "analytics");
const FILE = path.join(DIR, "analytics.db");
const BACKUP_DIR = path.join(DIR, "backups");
const STAMP = path.join(DIR, "maintenance.json");

const MIGRATION = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  entry_path TEXT NOT NULL,
  exit_path TEXT NOT NULL,
  trail TEXT NOT NULL,
  source_class TEXT NOT NULL,
  source_label TEXT NOT NULL,
  referrer_host TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  screen TEXT,
  connection TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  isp TEXT,
  page_count INTEGER NOT NULL DEFAULT 0,
  engagement_ms INTEGER NOT NULL DEFAULT 0,
  max_scroll INTEGER NOT NULL DEFAULT 0,
  lead INTEGER NOT NULL DEFAULT 0,
  kind TEXT NOT NULL DEFAULT 'visitor'
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  session_id TEXT,
  visitor_id TEXT,
  name TEXT NOT NULL,
  path TEXT,
  detail TEXT,
  kind TEXT NOT NULL DEFAULT 'visitor'
);
CREATE TABLE IF NOT EXISTS companies (
  org_name TEXT PRIMARY KEY,
  location TEXT,
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  visits INTEGER NOT NULL,
  pages TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_seen ON sessions (last_seen);
CREATE INDEX IF NOT EXISTS sessions_started ON sessions (started_at);
CREATE INDEX IF NOT EXISTS events_at ON events (at);
`;

const MIGRATION_003 = `
CREATE TABLE IF NOT EXISTS quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  session_id TEXT,
  visitor_id TEXT,
  score INTEGER NOT NULL,
  category TEXT NOT NULL,
  areas TEXT,
  lead INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS quiz_results_at ON quiz_results (at);
CREATE INDEX IF NOT EXISTS quiz_results_session ON quiz_results (session_id);
`;

let db: DatabaseSync | null = null;

export function analyticsDb() {
  if (db) return db;
  mkdirSync(DIR, { recursive: true });
  db = new DatabaseSync(FILE);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(MIGRATION);
  const done = db.prepare("SELECT id FROM schema_migrations WHERE id = ?").get("001") as
    | { id: string }
    | undefined;
  if (!done) {
    db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run("001", Date.now());
  }
  const columns = db.prepare("PRAGMA table_info(sessions)").all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("lat")) db.exec("ALTER TABLE sessions ADD COLUMN lat REAL");
  if (!names.has("lon")) db.exec("ALTER TABLE sessions ADD COLUMN lon REAL");
  const placed = db.prepare("SELECT id FROM schema_migrations WHERE id = ?").get("002") as { id: string } | undefined;
  if (!placed) {
    db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run("002", Date.now());
  }
  db.exec(MIGRATION_003);
  const quiz = db.prepare("SELECT id FROM schema_migrations WHERE id = ?").get("003") as { id: string } | undefined;
  if (!quiz) {
    db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run("003", Date.now());
  }
  maintain(db);
  return db;
}

export function retentionDays() {
  const parsed = Number(process.env.ANALYTICS_RETENTION_DAYS ?? "400");
  if (!Number.isFinite(parsed) || parsed < 7) return 400;
  return Math.min(Math.floor(parsed), 3650);
}

function maintain(database: DatabaseSync) {
  const today = new Date().toISOString().slice(0, 10);
  let stamp = "";
  if (existsSync(STAMP)) {
    try {
      stamp = JSON.parse(readStamp()).day as string;
    } catch {
      stamp = "";
    }
  }
  if (stamp === today) return;
  const cutoff = Date.now() - retentionDays() * 86_400_000;
  database.prepare("DELETE FROM events WHERE at < ?").run(cutoff);
  database.prepare("DELETE FROM sessions WHERE last_seen < ?").run(cutoff);
  database.prepare("DELETE FROM visitors WHERE last_seen < ?").run(cutoff);
  database.prepare("DELETE FROM companies WHERE last_seen < ?").run(cutoff);
  database.prepare("DELETE FROM quiz_results WHERE at < ?").run(cutoff);
  mkdirSync(BACKUP_DIR, { recursive: true });
  const dest = path.join(BACKUP_DIR, `analytics-${today}.db`);
  if (!existsSync(dest)) {
    database.exec("PRAGMA wal_checkpoint(TRUNCATE);");
    copyFileSync(FILE, dest);
  }
  const files = readdirSync(BACKUP_DIR)
    .filter((name) => name.startsWith("analytics-") && name.endsWith(".db"))
    .map((name) => ({ name, mtime: statSync(path.join(BACKUP_DIR, name)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  for (const extra of files.slice(14)) unlinkSync(path.join(BACKUP_DIR, extra.name));
  writeStamp(today);
}

function readStamp() {
  return readFileSync(STAMP, "utf8");
}

function writeStamp(day: string) {
  writeFileSync(STAMP, JSON.stringify({ day }));
}
