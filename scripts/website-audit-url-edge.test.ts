import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAuditUrlInput } from "../lib/website-audit/ssrf";

describe("invalid URL edge cases", () => {
  it("rejects malformed schemes", () => {
    const r = validateAuditUrlInput("ht!tp://bad");
    assert.equal(r.ok, false);
  });

  it("rejects spaces in hostname-like input after normalize attempt", () => {
    const r = validateAuditUrlInput("https://exa mple.com");
    assert.equal(r.ok, false);
  });
});
