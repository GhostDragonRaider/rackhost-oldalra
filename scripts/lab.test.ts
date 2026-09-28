import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  measuredReal,
  measuredUnavailable,
  PROVENANCE_LABELS,
} from "../lib/lab/integrity";
import { LAB_MODULES, getLabModule, listLabModulesByCategory } from "../lib/lab/registry";
import {
  evaluateCalculator,
  getCalculator,
  LAB_CALCULATORS,
} from "../lib/lab/calculator-engine";
import { runSecurityCenterChecks } from "../lib/lab/security-checks";
import { collectVpsSnapshot } from "../lib/lab/vps-metrics";
import { sanitizeForLog } from "../lib/lab/audit-log";
import {
  getLabFlagsState,
  resolveModuleFlags,
  setLabKillSwitch,
} from "../lib/lab/flags-store";

describe("lab integrity", () => {
  it("never treats unavailable as a numeric pass score", () => {
    const m = measuredUnavailable<number>("no data", "test");
    assert.equal(m.value, null);
    assert.equal(m.provenance, "unavailable");
    assert.equal(m.measurementStatus, "unavailable");
    assert.ok(PROVENANCE_LABELS.unavailable);
  });

  it("records real measurements with source", () => {
    const m = measuredReal(42, "unit-test");
    assert.equal(m.value, 42);
    assert.equal(m.provenance, "real");
    assert.equal(m.source, "unit-test");
  });
});

describe("lab registry", () => {
  it("has overview, monitor and settings always present", () => {
    assert.ok(getLabModule("overview"));
    assert.ok(getLabModule("monitor"));
    assert.ok(getLabModule("settings"));
    assert.ok(getLabModule("vps-monitor"));
    assert.ok(getLabModule("website-audit"));
    assert.equal(getLabModule("website-audit")?.href, "/admin/website-audit");
    assert.equal(getLabModule("monitor")?.href, "/admin");
    assert.ok(LAB_MODULES.length >= 10);
  });

  it("defaults modules to non-public admin-only", () => {
    for (const m of LAB_MODULES) {
      assert.equal(m.flags.public, false);
      assert.equal(m.flags.adminOnly, true);
    }
  });

  it("groups categories without dumping all into admin root nav", () => {
    const groups = listLabModulesByCategory();
    assert.ok(groups.some((g) => g.category === "monitor"));
    assert.ok(groups.some((g) => g.category === "seo-lab"));
    assert.ok(groups.every((g) => g.modules.length > 0));
  });
});

describe("lab flags kill switch", () => {
  it("disables non-core modules when kill switch is on", () => {
    const before = getLabFlagsState().killSwitch;
    setLabKillSwitch(true);
    const vps = getLabModule("vps-monitor");
    assert.ok(vps);
    const flags = resolveModuleFlags(vps);
    assert.equal(flags.enabled, false);
    assert.equal(flags.maintenanceMode, true);
    const overview = getLabModule("overview");
    assert.ok(overview);
    assert.equal(resolveModuleFlags(overview).enabled, true);
    const monitor = getLabModule("monitor");
    assert.ok(monitor);
    assert.equal(resolveModuleFlags(monitor).enabled, true);
    const audit = getLabModule("website-audit");
    assert.ok(audit);
    assert.equal(resolveModuleFlags(audit).enabled, true);
    setLabKillSwitch(before);
  });
});

describe("calculator engine", () => {
  it("marks results as estimated never as real market quotes", () => {
    const def = getCalculator("website-quote");
    assert.ok(def);
    const result = evaluateCalculator(def, {
      pages: 5,
      cms: true,
      complexity: "standard",
    });
    assert.equal(result.provenance, "estimated");
    assert.ok(result.estimateNote.length > 10);
    assert.ok(result.total > def.baseAmount);
    assert.equal(LAB_CALCULATORS.length >= 2, true);
  });
});

describe("security center", () => {
  it("returns only real check results and a derived score", () => {
    const report = runSecurityCenterChecks();
    assert.ok(report.checks.length >= 3);
    assert.ok(
      report.score.provenance === "real" ||
        report.score.provenance === "unavailable"
    );
    if (report.score.measurementStatus === "ok") {
      assert.equal(typeof report.score.value, "number");
      assert.ok((report.score.value as number) >= 0);
      assert.ok((report.score.value as number) <= 100);
    } else {
      assert.equal(report.score.value, null);
    }
  });
});

describe("vps metrics", () => {
  it("returns structured snapshot without inventing CPU when unmeasurable", () => {
    const snap = collectVpsSnapshot();
    assert.ok(snap.measuredAt);
    assert.ok(snap.hostname.provenance === "real");
    // CPU may be unavailable on first sample — must not fake a percent
    if (snap.cpu.utilizationPercent.measurementStatus !== "ok") {
      assert.equal(snap.cpu.utilizationPercent.value, null);
    }
  });
});

describe("audit log sanitize", () => {
  it("redacts secret-like keys", () => {
    const cleaned = sanitizeForLog({
      password: "super-secret",
      token: "abc",
      ok: true,
    }) as Record<string, unknown>;
    assert.equal(cleaned.password, "[redacted]");
    assert.equal(cleaned.token, "[redacted]");
    assert.equal(cleaned.ok, true);
  });
});
