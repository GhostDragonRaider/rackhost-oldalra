import fs from "fs";
import os from "os";
import { measuredError, measuredReal, measuredUnavailable, type MeasuredValue } from "./integrity";

export type VpsSnapshot = {
  measuredAt: string;
  hostname: MeasuredValue<string>;
  platform: MeasuredValue<string>;
  uptimeSec: MeasuredValue<number>;
  cpu: {
    utilizationPercent: MeasuredValue<number>;
    loadAverage: MeasuredValue<[number, number, number]>;
    cores: MeasuredValue<number>;
  };
  memory: {
    totalBytes: MeasuredValue<number>;
    usedBytes: MeasuredValue<number>;
    availableBytes: MeasuredValue<number>;
    usedPercent: MeasuredValue<number>;
    swapTotalBytes: MeasuredValue<number>;
    swapUsedBytes: MeasuredValue<number>;
  };
  disk: {
    mounts: MeasuredValue<
      Array<{
        mount: string;
        totalBytes: number;
        usedBytes: number;
        availableBytes: number;
        usedPercent: number;
      }>
    >;
  };
  network: {
    interfaces: MeasuredValue<
      Array<{
        name: string;
        rxBytes: number;
        txBytes: number;
      }>
    >;
  };
  processes: {
    count: MeasuredValue<number>;
    topCpu: MeasuredValue<Array<{ pid: number; cpu: number; command: string }>>;
  };
};

function readFileSafe(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function parseMeminfo(raw: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^(\w+):\s+(\d+)/);
    if (m) out[m[1]] = Number(m[2]) * 1024; // kB → bytes
  }
  return out;
}

function cpuTimes(): { idle: number; total: number } | null {
  const raw = readFileSafe("/proc/stat");
  if (!raw) return null;
  const line = raw.split("\n").find((l) => l.startsWith("cpu "));
  if (!line) return null;
  const parts = line.trim().split(/\s+/).slice(1).map(Number);
  if (parts.length < 4) return null;
  const idle = parts[3] + (parts[4] || 0);
  const total = parts.reduce((a, b) => a + b, 0);
  return { idle, total };
}

let lastCpu: { idle: number; total: number; at: number } | null = null;

function sampleCpuPercent(): MeasuredValue<number> {
  const now = cpuTimes();
  if (!now) {
    // Fallback: os.loadavg is real but not % — mark estimated if we only have load
    return measuredUnavailable(
      "CPU % nem elérhető (/proc/stat hiányzik ezen a gazdán).",
      "/proc/stat"
    );
  }
  const at = Date.now();
  if (!lastCpu) {
    lastCpu = { ...now, at };
    return measuredUnavailable(
      "CPU % első mintavétel — várj ~1s-ot a következő pollra.",
      "/proc/stat"
    );
  }
  const idleDelta = now.idle - lastCpu.idle;
  const totalDelta = now.total - lastCpu.total;
  lastCpu = { ...now, at };
  if (totalDelta <= 0) {
    return measuredUnavailable("CPU delta érvénytelen.", "/proc/stat");
  }
  const used = 1 - idleDelta / totalDelta;
  const pct = Math.max(0, Math.min(100, used * 100));
  return measuredReal(Number(pct.toFixed(1)), "/proc/stat");
}

function readDiskMounts(): MeasuredValue<
  Array<{
    mount: string;
    totalBytes: number;
    usedBytes: number;
    availableBytes: number;
    usedPercent: number;
  }>
> {
  try {
    // Use Node fs.statfs when available (Node 18.15+ / 19+)
    const statfs = (fs as unknown as {
      statfsSync?: (path: string) => {
        type: number;
        bsize: number;
        blocks: number;
        bfree: number;
        bavail: number;
      };
    }).statfsSync;
    if (!statfs) {
      return measuredUnavailable(
        "Disk metrika: fs.statfsSync nem elérhető ezen a Node verzión.",
        "fs.statfsSync"
      );
    }
    const roots = ["/", "/workspace", "/var"].filter((p) => {
      try {
        fs.accessSync(p);
        return true;
      } catch {
        return false;
      }
    });
    const seen = new Set<string>();
    const mounts = [];
    for (const mount of roots) {
      const s = statfs(mount);
      const key = `${s.type}:${s.blocks}:${s.bsize}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const total = s.blocks * s.bsize;
      const available = s.bavail * s.bsize;
      const used = Math.max(0, total - s.bfree * s.bsize);
      if (total <= 0) continue;
      mounts.push({
        mount,
        totalBytes: total,
        usedBytes: used,
        availableBytes: available,
        usedPercent: Number(((used / total) * 100).toFixed(1)),
      });
    }
    if (!mounts.length) {
      return measuredUnavailable("Nem sikerült mount pontot mérni.", "fs.statfsSync");
    }
    return measuredReal(mounts, "fs.statfsSync");
  } catch (e) {
    return measuredError(
      e instanceof Error ? e.message : "Disk mérés sikertelen",
      "fs.statfsSync"
    );
  }
}

function readNetwork(): MeasuredValue<
  Array<{ name: string; rxBytes: number; txBytes: number }>
> {
  const raw = readFileSafe("/proc/net/dev");
  if (!raw) {
    return measuredUnavailable("/proc/net/dev nem elérhető.", "/proc/net/dev");
  }
  const lines = raw.split("\n").slice(2);
  const ifaces = [];
  for (const line of lines) {
    const m = line.trim().match(/^([^:]+):\s*(.+)$/);
    if (!m) continue;
    const name = m[1].trim();
    if (name === "lo") continue;
    const cols = m[2].trim().split(/\s+/).map(Number);
    ifaces.push({
      name,
      rxBytes: cols[0] || 0,
      txBytes: cols[8] || 0,
    });
  }
  return measuredReal(ifaces, "/proc/net/dev");
}

/** Mask sensitive argv fragments in process listings. */
function maskCommand(cmd: string): string {
  return cmd
    .replace(/(--?(?:password|passwd|token|secret|key|auth)[=\s]+)(\S+)/gi, "$1***")
    .replace(/([A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|KEY)=)(\S+)/gi, "$1***")
    .slice(0, 120);
}

function topProcesses(): MeasuredValue<
  Array<{ pid: number; cpu: number; command: string }>
> {
  try {
    const procDirs = fs
      .readdirSync("/proc")
      .filter((d) => /^\d+$/.test(d))
      .slice(0, 400);
    const rows: Array<{ pid: number; cpu: number; command: string }> = [];
    for (const dir of procDirs) {
      const stat = readFileSafe(`/proc/${dir}/stat`);
      const cmdline = readFileSafe(`/proc/${dir}/cmdline`);
      if (!stat) continue;
      const parts = stat.split(" ");
      // fields 14,15 = utime stime (approx activity signal, not true %)
      const utime = Number(parts[13] || 0);
      const stime = Number(parts[14] || 0);
      const cmd =
        cmdline && cmdline.replace(/\0/g, " ").trim()
          ? maskCommand(cmdline.replace(/\0/g, " ").trim())
          : maskCommand((parts[1] || "").replace(/[()]/g, ""));
      rows.push({
        pid: Number(dir),
        cpu: utime + stime,
        command: cmd || `(pid ${dir})`,
      });
    }
    rows.sort((a, b) => b.cpu - a.cpu);
    // Mark as estimated because tick counters ≠ instantaneous CPU %
    const top = rows.slice(0, 8).map((r, i) => ({
      ...r,
      cpu: Number((r.cpu / Math.max(1, rows[0].cpu) * (8 - i)).toFixed(1)),
    }));
    return {
      value: top,
      provenance: "estimated",
      source: "/proc/[pid]/stat (utime+stime rank)",
      measuredAt: new Date().toISOString(),
      measurementStatus: "ok",
      error: null,
      lastSuccessfulMeasurement: new Date().toISOString(),
      confidence: 0.4,
    };
  } catch (e) {
    return measuredError(
      e instanceof Error ? e.message : "Process lista sikertelen",
      "/proc"
    );
  }
}

export function collectVpsSnapshot(): VpsSnapshot {
  const measuredAt = new Date().toISOString();
  const memRaw = readFileSafe("/proc/meminfo");
  const mem = memRaw ? parseMeminfo(memRaw) : null;

  const totalMem = mem?.MemTotal ?? null;
  const availMem = mem?.MemAvailable ?? null;
  const usedMem =
    totalMem != null && availMem != null ? totalMem - availMem : null;
  const swapTotal = mem?.SwapTotal ?? null;
  const swapFree = mem?.SwapFree ?? null;

  let processCount: MeasuredValue<number>;
  try {
    const n = fs.readdirSync("/proc").filter((d) => /^\d+$/.test(d)).length;
    processCount = measuredReal(n, "/proc");
  } catch (e) {
    processCount = measuredError(
      e instanceof Error ? e.message : "process count fail",
      "/proc"
    );
  }

  return {
    measuredAt,
    hostname: measuredReal(os.hostname(), "os.hostname()"),
    platform: measuredReal(`${os.type()} ${os.release()}`, "os.type/release"),
    uptimeSec: measuredReal(Math.floor(os.uptime()), "os.uptime()"),
    cpu: {
      utilizationPercent: sampleCpuPercent(),
      loadAverage: measuredReal(os.loadavg() as [number, number, number], "os.loadavg()"),
      cores: measuredReal(os.cpus().length, "os.cpus()"),
    },
    memory: {
      totalBytes: totalMem != null
        ? measuredReal(totalMem, "/proc/meminfo")
        : measuredUnavailable("MemTotal hiányzik", "/proc/meminfo"),
      usedBytes: usedMem != null
        ? measuredReal(usedMem, "/proc/meminfo")
        : measuredUnavailable("used nem számolható", "/proc/meminfo"),
      availableBytes: availMem != null
        ? measuredReal(availMem, "/proc/meminfo")
        : measuredUnavailable("MemAvailable hiányzik", "/proc/meminfo"),
      usedPercent:
        totalMem && usedMem != null
          ? measuredReal(Number(((usedMem / totalMem) * 100).toFixed(1)), "/proc/meminfo")
          : measuredUnavailable("Mem % nem számolható", "/proc/meminfo"),
      swapTotalBytes: swapTotal != null
        ? measuredReal(swapTotal, "/proc/meminfo")
        : measuredUnavailable("SwapTotal hiányzik", "/proc/meminfo"),
      swapUsedBytes:
        swapTotal != null && swapFree != null
          ? measuredReal(swapTotal - swapFree, "/proc/meminfo")
          : measuredUnavailable("Swap used nem számolható", "/proc/meminfo"),
    },
    disk: { mounts: readDiskMounts() },
    network: { interfaces: readNetwork() },
    processes: {
      count: processCount,
      topCpu: topProcesses(),
    },
  };
}
