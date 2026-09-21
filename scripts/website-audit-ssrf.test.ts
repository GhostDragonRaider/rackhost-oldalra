/**
 * Website Audit SSRF unit tests.
 * Run: npm run test:website-audit
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isBlockedIp,
  validateAuditUrlInput,
} from "../lib/website-audit/ssrf";

describe("isBlockedIp", () => {
  it("blocks loopback and private IPv4", () => {
    assert.equal(isBlockedIp("127.0.0.1"), true);
    assert.equal(isBlockedIp("10.0.0.1"), true);
    assert.equal(isBlockedIp("192.168.1.1"), true);
    assert.equal(isBlockedIp("172.16.5.1"), true);
    assert.equal(isBlockedIp("169.254.169.254"), true);
    assert.equal(isBlockedIp("100.64.0.1"), true);
  });

  it("blocks IPv6 loopback / ULA / link-local", () => {
    assert.equal(isBlockedIp("::1"), true);
    assert.equal(isBlockedIp("fc00::1"), true);
    assert.equal(isBlockedIp("fe80::1"), true);
  });

  it("allows public IPv4", () => {
    assert.equal(isBlockedIp("8.8.8.8"), false);
    assert.equal(isBlockedIp("1.1.1.1"), false);
  });
});

describe("validateAuditUrlInput", () => {
  it("rejects empty / invalid", () => {
    assert.equal(validateAuditUrlInput("").ok, false);
    assert.equal(validateAuditUrlInput("not a url :::").ok, false);
  });

  it("rejects file/ftp/data protocols", () => {
    assert.equal(validateAuditUrlInput("file:///etc/passwd").ok, false);
    assert.equal(validateAuditUrlInput("ftp://example.com/a").ok, false);
    assert.equal(validateAuditUrlInput("data:text/plain,hi").ok, false);
  });

  it("rejects localhost and metadata hostnames", () => {
    assert.equal(validateAuditUrlInput("http://localhost").ok, false);
    assert.equal(validateAuditUrlInput("http://127.0.0.1").ok, false);
    const v6 = ["http://", String.fromCharCode(91), "::1", String.fromCharCode(93)].join("");
    assert.equal(validateAuditUrlInput(v6).ok, false);
    assert.equal(
      validateAuditUrlInput("http://metadata.google.internal").ok,
      false
    );
    assert.equal(validateAuditUrlInput("http://169.254.169.254").ok, false);
    assert.equal(validateAuditUrlInput("http://192.168.0.10").ok, false);
  });

  it("rejects userinfo and .local hosts", () => {
    assert.equal(
      validateAuditUrlInput("https://user:pass@example.com").ok,
      false
    );
    assert.equal(validateAuditUrlInput("http://printer.local").ok, false);
  });

  it("accepts public https URLs", () => {
    const r = validateAuditUrlInput("https://example.com/path?q=1");
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.url.hostname, "example.com");
      assert.match(r.normalized, /^https:\/\/example\.com\/path\?q=1/);
    }
  });

  it("auto-prefixes https when scheme missing", () => {
    const r = validateAuditUrlInput("example.com");
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.url.protocol, "https:");
  });
});
