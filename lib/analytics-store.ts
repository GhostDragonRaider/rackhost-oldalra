import crypto from "crypto";
import fs from "fs";
import path from "path";

export type DayStats = {
  views: number;
  visitors: string[]; // hashed visitor ids for the day
  /** Hourly view counts keyed by "00".."23" (local server time). */
  hours?: Record<string, number>;
};

type Store = {
  days: Record<string, DayStats>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "analytics.json");
const DETAIL_DAYS = 30;

function visitorSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "anticode-analytics"
  );
}

function ensureStore(): Store {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const empty: Store = { days: {} };
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty), "utf8");
    return empty;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || typeof parsed !== "object" || !parsed.days) {
      return { days: {} };
    }
    return parsed;
  } catch {
    return { days: {} };
  }
}

function writeStore(store: Store) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}

function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hourKey(d = new Date()): string {
  return String(d.getHours()).padStart(2, "0");
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** ISO week label: 2026-W12 */
function isoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function normalizeHours(hours?: Record<string, number>): Array<{
  hour: string;
  label: string;
  views: number;
}> {
  const out: Array<{ hour: string; label: string; views: number }> = [];
  for (let h = 0; h < 24; h++) {
    const key = String(h).padStart(2, "0");
    const views = Math.max(0, Math.floor(Number(hours?.[key] || 0)));
    out.push({
      hour: key,
      label: `${key}:00`,
      views,
    });
  }
  return out;
}

export function hashVisitor(ip: string, ua: string): string {
  return crypto
    .createHmac("sha256", visitorSecret())
    .update(`${ip}|${ua}`)
    .digest("hex")
    .slice(0, 24);
}

export function recordPageview(input: {
  ip: string;
  userAgent: string;
  path?: string;
}): void {
  const page = String(input.path || "/").slice(0, 200);
  if (
    page.startsWith("/admin") ||
    page.startsWith("/api/") ||
    page.startsWith("/_next/")
  ) {
    return;
  }

  const now = new Date();
  const store = ensureStore();
  const key = dayKey(now);
  const hour = hourKey(now);
  const visitor = hashVisitor(input.ip, input.userAgent || "unknown");
  const day = store.days[key] || { views: 0, visitors: [], hours: {} };
  day.views += 1;
  day.hours = day.hours || {};
  day.hours[hour] = (day.hours[hour] || 0) + 1;
  if (!day.visitors.includes(visitor)) {
    day.visitors.push(visitor);
    // cap stored visitor ids per day to keep file small
    if (day.visitors.length > 20000) {
      day.visitors = day.visitors.slice(-15000);
    }
  }
  store.days[key] = day;

  // prune older than ~400 days
  const cutoff = startOfLocalDay(new Date());
  cutoff.setDate(cutoff.getDate() - 400);
  const cutoffKey = dayKey(cutoff);
  for (const k of Object.keys(store.days)) {
    if (k < cutoffKey) delete store.days[k];
  }

  writeStore(store);
}

function sumRange(store: Store, fromKey: string, toKey: string) {
  let views = 0;
  const visitors = new Set<string>();
  for (const [k, day] of Object.entries(store.days)) {
    if (k < fromKey || k > toKey) continue;
    views += day.views;
    for (const v of day.visitors) visitors.add(v);
  }
  return { views, visitors: visitors.size };
}

export type DayHourBucket = {
  hour: string;
  label: string;
  views: number;
};

export type DayDetail = {
  date: string;
  views: number;
  visitors: number;
  hours: DayHourBucket[];
  /** Only hours that had traffic — handy for compact lists. */
  activeHours: DayHourBucket[];
};

export type AnalyticsSummary = {
  today: { views: number; visitors: number };
  week: { views: number; visitors: number };
  month: { views: number; visitors: number };
  weeks: Array<{
    week: string;
    label: string;
    views: number;
    visitors: number;
  }>;
  last7Days: Array<{ date: string; views: number; visitors: number }>;
  /** Last 30 days with hourly breakdown (local time). */
  dayDetails: DayDetail[];
};

export function getAnalyticsSummary(): AnalyticsSummary {
  const store = ensureStore();
  const today = startOfLocalDay(new Date());
  const todayKey = dayKey(today);

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(today);
  monthStart.setDate(monthStart.getDate() - 29);

  const todayDay = store.days[todayKey] || { views: 0, visitors: [] };

  const last7Days: AnalyticsSummary["last7Days"] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const row = store.days[key] || { views: 0, visitors: [] };
    last7Days.push({
      date: key,
      views: row.views,
      visitors: row.visitors.length,
    });
  }

  const dayDetails: DayDetail[] = [];
  for (let i = DETAIL_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const row = store.days[key] || { views: 0, visitors: [], hours: {} };
    const hours = normalizeHours(row.hours);
    dayDetails.push({
      date: key,
      views: row.views,
      visitors: row.visitors.length,
      hours,
      activeHours: hours.filter((h) => h.views > 0),
    });
  }

  // Last 12 ISO weeks (including current)
  const weekMap = new Map<string, { views: number; visitors: Set<string>; start: Date }>();
  for (let i = 0; i < 84; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const wk = isoWeekKey(d);
    const key = dayKey(d);
    const row = store.days[key];
    if (!weekMap.has(wk)) {
      weekMap.set(wk, { views: 0, visitors: new Set(), start: d });
    }
    const bucket = weekMap.get(wk)!;
    if (row) {
      bucket.views += row.views;
      for (const v of row.visitors) bucket.visitors.add(v);
    }
    // keep earliest day as start for sorting (we're iterating newest first, so update carefully)
    if (d < bucket.start) bucket.start = d;
  }

  const weeks = [...weekMap.entries()]
    .map(([week, data]) => ({
      week,
      label: week.replace("-W", " W"),
      views: data.views,
      visitors: data.visitors.size,
      start: data.start.getTime(),
    }))
    .sort((a, b) => a.start - b.start)
    .slice(-12)
    .map(({ week, label, views, visitors }) => ({ week, label, views, visitors }));

  return {
    today: { views: todayDay.views, visitors: todayDay.visitors.length },
    week: sumRange(store, dayKey(weekStart), todayKey),
    month: sumRange(store, dayKey(monthStart), todayKey),
    weeks,
    last7Days,
    dayDetails,
  };
}
