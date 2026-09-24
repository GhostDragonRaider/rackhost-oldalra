import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CV_CONTENT } from "../lib/cv/content";
import {
  createDraftRecord,
  validateApplicationDraft,
} from "../lib/cv/applications";

describe("cv content integrity", () => {
  it("keeps required personal fields from source CV", () => {
    const p = CV_CONTENT.personal;
    assert.equal(p.fullName, "Milei Sándor Antal");
    assert.equal(p.email, "sancii5427@gmail.com");
    assert.equal(p.phone, "+36 30 485 5517");
    assert.equal(p.location, "Kenézlő");
    assert.equal(p.websiteLabel, "anticode.hu");
    assert.equal(p.birthYear, "1992");
    assert.match(p.photoSrc, /\/api\/admin\/cv\/photo$/);
  });

  it("has HU and EN profile / experience / education", () => {
    assert.ok(CV_CONTENT.profile.hu.includes("IT üzemeltetés"));
    assert.ok(CV_CONTENT.profile.en.toLowerCase().includes("it operations"));
    assert.equal(CV_CONTENT.experience.length, 2);
    assert.equal(
      CV_CONTENT.experience[0].organization,
      "Sátoraljaújhelyi Fegyház és Börtön"
    );
    assert.equal(CV_CONTENT.experience[1].organization, "MÁV Zrt.");
    assert.equal(CV_CONTENT.education[0].institution, "Cisco Networking Academy");
    assert.equal(CV_CONTENT.skills.length, 7);
  });

  it("uses expected PDF filenames", () => {
    assert.equal(CV_CONTENT.pdfFileName.hu, "Milei_Sandor_Antal_CV_HU.pdf");
    assert.equal(CV_CONTENT.pdfFileName.en, "Milei_Sandor_Antal_CV_EN.pdf");
  });

  it("does not invent extra experience entries", () => {
    assert.deepEqual(
      CV_CONTENT.experience.map((e) => e.start),
      ["2022-11", "2017-07"]
    );
  });

  it("includes anticode.hu portfolio entry", () => {
    assert.equal(CV_CONTENT.portfolio.length, 1);
    assert.equal(CV_CONTENT.portfolio[0].urlLabel, "anticode.hu");
    assert.equal(CV_CONTENT.portfolio[0].url, "https://anticode.hu");
    assert.equal(CV_CONTENT.labels.portfolio.hu, "Portfólió");
    assert.equal(CV_CONTENT.labels.portfolio.en, "Portfolio");
  });
});
describe("cv application stub", () => {
  it("validates draft fields", () => {
    const bad = validateApplicationDraft({ locale: "hu" });
    assert.equal(bad.ok, false);
    const ok = validateApplicationDraft({
      toEmail: "hr@example.com",
      companyName: "Example Kft.",
      positionTitle: "Junior IT",
      locale: "en",
      subject: "Application",
      coverLetter: "I am applying for the junior IT position at your company.",
    });
    assert.equal(ok.ok, true);
    if (ok.ok) {
      const rec = createDraftRecord(ok.draft);
      assert.equal(rec.status, "draft");
      assert.equal(rec.locale, "en");
    }
  });
});
