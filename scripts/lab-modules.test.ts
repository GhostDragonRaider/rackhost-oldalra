import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "fs";
import path from "path";
import { visibleFormFields, listLabForms } from "../lib/lab/forms-engine";
import { createLabLead, listLabLeads, updateLabLeadStatus } from "../lib/lab/leads-store";
import { createSocialDryRun } from "../lib/lab/social-hub";
import { runAiDetect, approveAiRecommendation } from "../lib/lab/ai-tools";
import { dryRunAutomation, listAutomationRules } from "../lib/lab/automation-engine";
import { pickExperimentVariant, listExperiments } from "../lib/lab/experiments-store";
import { buildUtmUrl, upsertContentItem } from "../lib/lab/content-store";
import { upsertLabClient, addLabProject } from "../lib/lab/clients-store";

const DATA = path.join(process.cwd(), "data");

describe("lab module engines", () => {
  it("forms conditional visibility toggles on service=Webshop", () => {
    const forms = listLabForms();
    const contact = forms.find((f) => f.id === "contact-flow");
    assert.ok(contact);
    const hidden = visibleFormFields(contact!, { service: "Weboldal" });
    assert.ok(!hidden.some((f) => f.id === "products"));
    const shown = visibleFormFields(contact!, { service: "Webshop" });
    assert.ok(shown.some((f) => f.id === "products"));
  });

  it("leads CRM persists status changes", () => {
    const lead = createLabLead({
      name: "Teszt Elek",
      email: "teszt@example.com",
      service: "SEO",
      message: "Legalább tíz karakteres üzenet.",
      source: "unit-test",
    });
    const updated = updateLabLeadStatus(lead.id, "contacted");
    assert.equal(updated?.status, "contacted");
    assert.ok(listLabLeads().some((l) => l.id === lead.id));
  });

  it("social hub never claims a live publish", () => {
    const draft = createSocialDryRun({
      platform: "meta",
      text: "Hello dry-run",
    });
    assert.equal(draft.dryRun, true);
    assert.ok(
      draft.status === "dry_run_ok" || draft.status === "blocked_no_creds"
    );
    assert.ok(/nem ment ki|Nincs credential/i.test(draft.resultNote));
  });

  it("AI tools require approve and never auto-publish", () => {
    const session = runAiDetect(
      "<html><head></head><body><img src='/a.png'><p>x</p></body></html>"
    );
    assert.ok(session.findings.length >= 1);
    if (session.recommendations[0]) {
      assert.equal(session.recommendations[0].approved, false);
      const after = approveAiRecommendation(
        session.id,
        session.recommendations[0].id
      );
      assert.equal(
        after?.recommendations.find((r) => r.id === session.recommendations[0].id)
          ?.approved,
        true
      );
    }
  });

  it("automation dry-run does not throw and returns evidence", () => {
    const rules = listAutomationRules();
    assert.ok(rules.length >= 1);
    const result = dryRunAutomation(rules[0].id);
    assert.ok(result);
    assert.ok(typeof result!.evidence === "string");
    assert.ok(Array.isArray(result!.wouldDo));
  });

  it("experiments pick a deterministic variant", () => {
    const exps = listExperiments();
    assert.ok(exps.length >= 1);
    const a = pickExperimentVariant(exps[0].id, "visitor-1");
    const b = pickExperimentVariant(exps[0].id, "visitor-1");
    assert.deepEqual(a, b);
  });

  it("content UTM builder appends query params", () => {
    const item = upsertContentItem({
      title: "Teszt",
      slug: "teszt-utm",
      body: "body",
      utmSource: "lab",
      utmMedium: "test",
      utmCampaign: "spring",
    });
    const url = buildUtmUrl("https://anticode.hu/", item);
    assert.ok(url.includes("utm_source=lab"));
    assert.ok(url.includes("utm_medium=test"));
    assert.ok(url.includes("utm_campaign=spring"));
  });

  it("client hub stores projects under a client", () => {
    const client = upsertLabClient({
      name: "Ügyfél Kft",
      email: "ugyfel@example.com",
    });
    const withProj = addLabProject(client.id, { name: "Weboldal", status: "active" });
    assert.ok(withProj?.projects.some((p) => p.name === "Weboldal"));
  });

  it("writes lab data files under data/", () => {
    assert.ok(fs.existsSync(DATA));
  });
});
