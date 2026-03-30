#!/usr/bin/env node
/**
 * Civic Scanner — Permanent Report Build Script
 *
 * Reads a JSON pipeline data file and generates a complete .docx report.
 * Every agent's FULL output is included inline. No summaries. No "see above."
 *
 * Usage:
 *   node build-report.js <pipeline-data.json> [output-dir]
 *
 * Default output-dir: C:\Users\scott\OneDrive\Desktop\CivicScanner\
 * Pipeline JSON data files are also saved there.
 *
 * The JSON file must conform to the schema in report-schema.json.
 * If validation fails, the script exits with an error listing what's missing.
 *
 * DO NOT MODIFY THIS FILE UNLESS THE REPORT SPEC CHANGES.
 * This script is the single source of truth for report generation.
 */

const fs = require("fs");
const path = require("path");

// Resolve docx module — check common install locations
let docxPath;
const candidates = [
  path.join(__dirname, "node_modules", "docx"),
  path.join(process.cwd(), "node_modules", "docx"),
  "C:\\Users\\scott\\OneDrive\\Desktop\\Claude\\node_modules\\docx",
  "docx", // global fallback
];
for (const c of candidates) {
  try { require.resolve(c); docxPath = c; break; } catch {}
}
if (!docxPath) {
  console.error("ERROR: Cannot find 'docx' module. Run: npm install docx");
  process.exit(1);
}
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageBreak, Footer, Header
} = require(docxPath);

// ─── Color constants ────────────────────────────────────────────────
const GREEN = "2E7D32";
const AMBER = "D4760A";
const RED   = "C62828";
const GRAY  = "757575";

// ─── CLI args ───────────────────────────────────────────────────────
const os = require("os");
const jsonPath = process.argv[2];
const DEFAULT_OUTPUT_DIR = path.join(os.homedir(), "Desktop", "CivicScanner");
const outputDir = process.argv[3] || DEFAULT_OUTPUT_DIR;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}`);
}

if (!jsonPath) {
  console.error("Usage: node build-report.js <pipeline-data.json> [output-dir]");
  process.exit(1);
}

if (!fs.existsSync(jsonPath)) {
  console.error(`ERROR: File not found: ${jsonPath}`);
  process.exit(1);
}

// ─── Load and parse JSON ────────────────────────────────────────────
let data;
try {
  data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
} catch (e) {
  console.error(`ERROR: Invalid JSON in ${jsonPath}: ${e.message}`);
  process.exit(1);
}

// ─── Validation ─────────────────────────────────────────────────────
const errors = [];

function requireField(obj, field, label) {
  if (!obj || obj[field] === undefined || obj[field] === null || obj[field] === "") {
    errors.push(`Missing: ${label}.${field}`);
  }
}

function requireArray(obj, field, label, minLen = 1) {
  if (!obj || !Array.isArray(obj[field]) || obj[field].length < minLen) {
    errors.push(`Missing or empty array: ${label}.${field} (need >= ${minLen})`);
  }
}

// Meta
requireField(data, "meta", "root");
if (data.meta) {
  ["city", "state", "date", "runNumber", "version"].forEach(f => requireField(data.meta, f, "meta"));
}

// Stats
requireField(data, "stats", "root");

// Agent 1 leads
requireArray(data, "agent1_leads", "root");
if (data.agent1_leads) {
  data.agent1_leads.forEach((lead, i) => {
    requireField(lead, "headline", `agent1_leads[${i}]`);
    requireField(lead, "tier", `agent1_leads[${i}]`);
    requireField(lead, "details", `agent1_leads[${i}]`);
  });
}

// Agent 2 stories
requireArray(data, "agent2_stories", "root");
if (data.agent2_stories) {
  data.agent2_stories.forEach((story, i) => {
    requireField(story, "headline", `agent2_stories[${i}]`);
    requireField(story, "draft", `agent2_stories[${i}]`);
    if (story.draft && story.draft.length < 400) {
      errors.push(`agent2_stories[${i}].draft is too short (${story.draft.length} chars, need >= 400): "${story.headline}"`);
    }
  });
}

// Agent 2.5 gate
requireArray(data, "agent25_gate", "root");
if (data.agent25_gate) {
  data.agent25_gate.forEach((g, i) => {
    requireField(g, "headline", `agent25_gate[${i}]`);
    requireField(g, "total", `agent25_gate[${i}]`);
    requireField(g, "decision", `agent25_gate[${i}]`);
  });
}

// Agent 3 black desk
requireArray(data, "agent3_blackDesk", "root");

// Agent 4 adversarial
requireArray(data, "agent4_adversarial", "root");
if (data.agent4_adversarial) {
  data.agent4_adversarial.forEach((a, i) => {
    requireField(a, "headline", `agent4_adversarial[${i}]`);
    requireField(a, "gate1", `agent4_adversarial[${i}]`);
    requireField(a, "gate2", `agent4_adversarial[${i}]`);
    requireField(a, "gate3_counterNarrative", `agent4_adversarial[${i}]`);
    if (a.gate3_counterNarrative && a.gate3_counterNarrative.length < 100) {
      errors.push(`agent4_adversarial[${i}].gate3_counterNarrative too short (${a.gate3_counterNarrative.length} chars): "${a.headline}"`);
    }
  });
}

// Agent 5
requireArray(data, "agent5_completeness", "root");

// Agent 6
requireArray(data, "agent6_legal", "root");
if (data.agent6_legal) {
  data.agent6_legal.forEach((l, i) => {
    requireField(l, "analysis", `agent6_legal[${i}]`);
  });
}

// Agent 7
requireArray(data, "agent7_plainLanguage", "root");
if (data.agent7_plainLanguage) {
  data.agent7_plainLanguage.forEach((p, i) => {
    requireField(p, "rewrite", `agent7_plainLanguage[${i}]`);
    if (p.rewrite && p.rewrite.length < 150) {
      errors.push(`agent7_plainLanguage[${i}].rewrite too short (${p.rewrite.length} chars): "${p.headline}"`);
    }
  });
}

// Agent 7.5
requireArray(data, "agent75_distribution", "root");
if (data.agent75_distribution) {
  data.agent75_distribution.forEach((d, i) => {
    ["seo", "twitter", "facebook", "linkedin", "nextdoor", "newsletter", "emailSubjects"].forEach(f => {
      requireField(d, f, `agent75_distribution[${i}]`);
    });
  });
}

// Agent 8
requireField(data, "agent8_hygiene", "root");

// Held stories (can be empty array)
if (!Array.isArray(data.heldStories)) {
  errors.push("Missing: heldStories (must be array, can be empty)");
}

// Trust dashboard
requireField(data, "trustDashboard", "root");

if (errors.length > 0) {
  console.error("═══ VALIDATION FAILED ═══");
  errors.forEach(e => console.error("  ✗ " + e));
  console.error(`\n${errors.length} error(s). Fix the JSON data file and re-run.`);
  process.exit(1);
}

// ─── Helper functions ───────────────────────────────────────────────

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 150 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } });
}
function h3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text, font: "Calibri", size: 22, ...opts })],
  });
}

function boldPara(label, value) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: label, bold: true, font: "Calibri", size: 22 }),
      new TextRun({ text: value, font: "Calibri", size: 22 }),
    ],
  });
}

function colorLabel(label, color, text) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: label + ": ", bold: true, font: "Calibri", size: 22 }),
      new TextRun({ text, bold: true, color, font: "Calibri", size: 22 }),
    ],
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: "Calibri", size: 22 })],
  });
}

function longText(text) {
  // Split long text into paragraphs on double newline, or treat as single block
  const blocks = text.split(/\n\n+/);
  return blocks.map(block =>
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: block.replace(/\n/g, " ").trim(), font: "Calibri", size: 22 })],
    })
  );
}

function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}

function severityColor(sev) {
  const s = (sev || "").toUpperCase();
  if (s.includes("GREEN") || s.includes("VERIFIED") || s.includes("PUBLISH") || s.includes("PASS")) return GREEN;
  if (s.includes("AMBER") || s.includes("CONTEST") || s.includes("REVISE") || s.includes("CORRECT")) return AMBER;
  if (s.includes("RED") || s.includes("KILL") || s.includes("SUPPRESS") || s.includes("FAIL")) return RED;
  return GRAY;
}

// ─── Build document ─────────────────────────────────────────────────
const m = data.meta;
const s = data.stats;
const children = [];

// ── TITLE PAGE ──────────────────────────────────────────────────────
children.push(new Paragraph({ spacing: { before: 2000 } }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [
  new TextRun({ text: "CIVIC SOURCE SCANNER", font: "Calibri", size: 48, bold: true }),
]}));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [
  new TextRun({ text: "Full Pipeline Report", font: "Calibri", size: 36, color: GRAY }),
]}));
children.push(new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [
  new TextRun({ text: `${m.city}, ${m.state}`, font: "Calibri", size: 28, bold: true }),
]}));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [
  new TextRun({ text: m.date, font: "Calibri", size: 24, color: GRAY }),
]}));
children.push(new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER, children: [
  new TextRun({ text: `Pipeline: Full (9+ agents) | Scanner: ${m.version} | Run #${m.runNumber}`, font: "Calibri", size: 20 }),
]}));
children.push(new Paragraph({ spacing: { before: 100 }, alignment: AlignmentType.CENTER, children: [
  new TextRun({ text: `Stories scanned: ${s.scanned} | Advanced: ${s.advanced} | Held: ${s.held} | Killed: ${s.killed} | Suppressed: ${s.suppressed}`, font: "Calibri", size: 20, bold: true }),
]}));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [
  new TextRun({ text: `Sources checked: ${s.tierACounts} Tier A / ${s.tierBCounts} Tier B / ${s.tierCCounts} Tier C`, font: "Calibri", size: 20 }),
]}));

// ══════════════════════════════════════════════════════════════════════
// SECTION A: EDITORIAL DASHBOARD
// ══════════════════════════════════════════════════════════════════════
children.push(pb());
children.push(h1("SECTION A: EDITORIAL DASHBOARD"));

// Beat Context
if (data.beatContext && data.beatContext.text) {
  children.push(h2("Beat Context"));
  children.push(para(data.beatContext.text));
}

// Source Access Limitations
if (data.sourceAccessLimitations) {
  children.push(h2("Source Access Limitations"));
  if (data.sourceAccessLimitations.blockedDomains) {
    children.push(para(`WARNING: ${data.sourceAccessLimitations.blockedDomains}`));
  }
  if (data.sourceAccessLimitations.manualReviewItems) {
    data.sourceAccessLimitations.manualReviewItems.forEach(item => children.push(bullet(item)));
  }
}

// ── Dashboard: Publishable Stories ──────────────────────────────────
children.push(h2("Publishable Stories"));
const advancing = data.agent25_gate.filter(g => g.decision === "ADVANCE");
advancing.forEach((gate, idx) => {
  const story = data.agent2_stories.find(st => st.id === gate.id);
  const adv = data.agent4_adversarial.find(a => a.id === gate.id);
  children.push(h3(`${idx + 1}. ${gate.headline}`));
  children.push(colorLabel("Severity", severityColor(adv ? adv.severity : ""), adv ? adv.severity : "N/A"));
  children.push(boldPara("Newsworthiness: ", `${gate.total}/20 (Immediacy ${gate.immediacy}, Impact ${gate.impact}, Conflict ${gate.conflict}, Novelty ${gate.novelty})`));
  children.push(boldPara("Beat: ", gate.beat || "NEW"));
  children.push(boldPara("Headline audit: ", gate.headlineAudit || "PASSED"));
  children.push(boldPara("Legal risk: ", gate.legalRisk || "LOW"));
  if (gate.reporterTaskMemo) {
    children.push(para(gate.reporterTaskMemo, { italics: true }));
  }
});

// ── Dashboard: Held Stories ─────────────────────────────────────────
if (data.heldStories && data.heldStories.length > 0) {
  children.push(h2("Stories on Hold"));
  data.heldStories.forEach(held => {
    children.push(h3(held.headline));
    children.push(colorLabel("Severity", GRAY, "HOLD"));
    if (held.source) children.push(boldPara("Source: ", held.source));
    if (held.details) children.push(para(held.details));
    if (held.scoring) children.push(para(held.scoring));
    children.push(boldPara("Why held: ", held.reason || "Below threshold"));
    children.push(boldPara("What would elevate: ", held.elevate || "N/A"));
  });
}

// ── Dashboard: Tier B Leads ─────────────────────────────────────────
const tierBLeads = (data.agent1_leads || []).filter(l => l.tier === "B");
if (tierBLeads.length > 0) {
  children.push(h2("Tier B Leads (Need Tier A Corroboration)"));
  tierBLeads.forEach(lead => {
    children.push(h3(`[B] ${lead.headline}`));
    children.push(boldPara("Source: ", lead.source || "N/A"));
    if (lead.url) children.push(boldPara("URL: ", lead.url));
    children.push(para(lead.details));
    if (lead.action) children.push(boldPara("Action: ", lead.action));
  });
}

// ── Dashboard: Tier C Signals ───────────────────────────────────────
const tierCSignals = (data.agent1_leads || []).filter(l => l.tier === "C");
if (tierCSignals.length > 0) {
  children.push(h2("Tier C Signals (Investigation Needed)"));
  tierCSignals.forEach(sig => {
    children.push(h3(`[C] ${sig.headline}`));
    children.push(para(sig.details));
    if (sig.action) children.push(boldPara("Action: ", sig.action));
  });
}

// ── Upcoming Meetings ───────────────────────────────────────────────
if (data.upcomingMeetings && data.upcomingMeetings.length > 0) {
  children.push(h2("Upcoming Meetings"));
  data.upcomingMeetings.forEach(mtg => children.push(bullet(mtg)));
}

// ── Trust Dashboard ─────────────────────────────────────────────────
if (data.trustDashboard) {
  children.push(h2("Trust Dashboard"));
  const td = data.trustDashboard;
  Object.entries(td).forEach(([k, v]) => {
    children.push(boldPara(`${k}: `, String(v)));
  });
}

// ══════════════════════════════════════════════════════════════════════
// SECTION B: VERIFICATION APPENDIX
// ══════════════════════════════════════════════════════════════════════
children.push(pb());
children.push(h1("SECTION B: VERIFICATION APPENDIX"));

// ── Agent 1: Full Lead List ─────────────────────────────────────────
children.push(pb());
children.push(h2("Agent 1: News Aggregator — Full Lead List"));
(data.agent1_leads || []).forEach((lead, i) => {
  children.push(h3(`${i + 1}. [${lead.tier}] ${lead.headline}`));
  if (lead.source) children.push(boldPara("Source: ", lead.source));
  if (lead.url) children.push(boldPara("URL: ", lead.url));
  if (lead.confidence) children.push(boldPara("Confidence: ", lead.confidence));
  if (lead.beat) children.push(boldPara("Beat: ", lead.beat));
  children.push(para(lead.details));
  if (lead.action) children.push(boldPara("Action: ", lead.action));
});

// ── Agent 2: Full Story Drafts ──────────────────────────────────────
children.push(pb());
children.push(h2("Agent 2: Story Expansion — Full Drafts"));
(data.agent2_stories || []).forEach(story => {
  children.push(h3(story.headline));
  children.push(...longText(story.draft));
  if (story.sources) {
    children.push(new Paragraph({
      spacing: { before: 80, after: 160 },
      children: [new TextRun({ text: `Sources: ${story.sources}`, font: "Calibri", size: 20, italics: true, color: GRAY })],
    }));
  }
});

// ── Agent 2.5: Newsworthiness Gate ──────────────────────────────────
children.push(pb());
children.push(h2("Agent 2.5: Newsworthiness Gate — Full Scoring"));
children.push(para("Scoring key: Each story scored on 4 dimensions (1-5 each, total 4-20). Threshold to advance: 10/20. Score 7-9 = HOLD. Score ≤6 = DEMOTE."));
(data.agent25_gate || []).forEach(g => {
  children.push(h3(`${g.headline} — ${g.decision}`));
  children.push(boldPara("Immediacy: ", `${g.immediacy}/5 — ${g.immediacyReason || ""}`));
  children.push(boldPara("Impact: ", `${g.impact}/5 — ${g.impactReason || ""}`));
  children.push(boldPara("Conflict: ", `${g.conflict}/5 — ${g.conflictReason || ""}`));
  children.push(boldPara("Novelty: ", `${g.novelty}/5 — ${g.noveltyReason || ""}`));
  children.push(boldPara("Total: ", `${g.total}/20`));
  children.push(boldPara("Beat: ", g.beat || "NEW"));
  children.push(boldPara("Decision: ", g.reasoning || g.decision));
  if (g.reporterTaskMemo) {
    children.push(h3("Reporter Task Memo"));
    children.push(para(g.reporterTaskMemo));
  }
  if (g.visualDirection) {
    children.push(h3("Visual Direction Brief"));
    children.push(...longText(g.visualDirection));
  }
});

// ── Agent 3: Black Desk ─────────────────────────────────────────────
children.push(pb());
children.push(h2("Agent 3: Black Desk — Speculative Signals"));
children.push(para("NOTE: Black Desk output is NEVER publishable. It feeds the adversarial desk and reporter investigation."));
(data.agent3_blackDesk || []).forEach((sig, i) => {
  children.push(h3(`Signal ${i + 1}: ${sig.title} (Confidence: ${sig.confidence})`));
  children.push(boldPara("Speculative Angle: ", sig.speculativeAngle));
  if (sig.connections) children.push(boldPara("Connections: ", sig.connections));
  children.push(boldPara("Investigation Question: ", sig.investigationQuestion));
});

// ── Agent 4: Adversarial Challenge ──────────────────────────────────
children.push(pb());
children.push(h2("Agent 4: Adversarial Challenge — Full 4-Gate Verification"));
(data.agent4_adversarial || []).forEach(adv => {
  children.push(h3(`${adv.headline}`));
  children.push(colorLabel("Verdict", severityColor(adv.severity), `${adv.severity} — ${adv.verdict}`));
  children.push(boldPara("Gate 1 — Contestation Check: ", adv.gate1));
  children.push(boldPara("Gate 2 — Mandatory Adverse Search: ", adv.gate2));
  children.push(h3("Gate 3 — Counter-Narrative (Full Text)"));
  children.push(...longText(adv.gate3_counterNarrative));
  children.push(boldPara("Gate 4 — Self-Referential Warning: ", adv.gate4 || "N/A"));
});

// ── Agent 5: Completeness Auditor ───────────────────────────────────
children.push(pb());
children.push(h2("Agent 5: Completeness Auditor"));
(data.agent5_completeness || []).forEach(audit => {
  children.push(h3(audit.headline));
  children.push(colorLabel("Verdict", severityColor(audit.verdict), audit.verdict));
  children.push(boldPara("Attribution: ", audit.attribution));
  children.push(boldPara("Balance: ", audit.balance));
  children.push(boldPara("Harm Assessment: ", audit.harm));
  children.push(boldPara("Legal Risk Flag: ", audit.legalFlag));
  if (audit.notes) children.push(para(audit.notes));
});

// ── Agent 6: First Amendment Counsel ────────────────────────────────
children.push(pb());
children.push(h2("Agent 6: First Amendment Counsel"));
(data.agent6_legal || []).forEach(legal => {
  children.push(h3(legal.headline));
  children.push(boldPara("Threat Classification: ", legal.threatType || "None identified"));
  children.push(boldPara("Applicable Doctrine: ", legal.doctrine || "Fair report privilege"));
  children.push(boldPara("Risk Assessment: ", legal.riskLevel || "LOW"));
  children.push(h3("Analysis"));
  children.push(...longText(legal.analysis));
  children.push(boldPara("Recommendation: ", legal.recommendation || "Proceed"));
});
children.push(para("DISCLAIMER: This is editorial guidance, NOT legal advice. For situations assessed as MEDIUM or HIGH risk, consult a media law attorney.", { italics: true }));

// ── Agent 7: Plain-Language Rewrites ────────────────────────────────
children.push(pb());
children.push(h2("Agent 7: Plain-Language Translator — Full Rewrites"));
children.push(para("Target reading level: 8th grade. Public-facing summaries for newsletters and social media."));
(data.agent7_plainLanguage || []).forEach(pl => {
  children.push(h3(pl.headline));
  children.push(...longText(pl.rewrite));
});

// ── Agent 7.5: Distribution Packages ────────────────────────────────
children.push(pb());
children.push(h2("Agent 7.5: Distribution Packager — Full Packages"));
(data.agent75_distribution || []).forEach(dist => {
  children.push(h3(`Distribution Package: ${dist.headline}`));

  children.push(boldPara("SEO: ", ""));
  children.push(para(dist.seo));

  children.push(boldPara("Twitter/X: ", ""));
  children.push(para(dist.twitter));
  if (dist.hashtags) children.push(boldPara("Hashtags: ", dist.hashtags));

  children.push(boldPara("Facebook: ", ""));
  children.push(para(dist.facebook));

  children.push(boldPara("LinkedIn: ", ""));
  children.push(para(dist.linkedin));

  children.push(boldPara("Nextdoor: ", ""));
  children.push(para(dist.nextdoor));

  children.push(boldPara("Newsletter Brief: ", ""));
  children.push(para(dist.newsletter));

  children.push(boldPara("Email Subject Lines: ", ""));
  if (Array.isArray(dist.emailSubjects)) {
    dist.emailSubjects.forEach((subj, i) => children.push(bullet(`${i + 1}. ${subj}`)));
  } else {
    children.push(para(dist.emailSubjects));
  }
});

// ── Agent 8: Source Hygiene + Headline Audit ────────────────────────
children.push(pb());
children.push(h2("Agent 8: Source Hygiene + Headline Audit"));
const hyg = data.agent8_hygiene;
if (hyg.sourceChecks) {
  children.push(h3("Source Hygiene Checks"));
  children.push(...longText(hyg.sourceChecks));
}
if (hyg.headlineAudit) {
  children.push(h3("Headline / Status Audit"));
  children.push(...longText(hyg.headlineAudit));
}
if (hyg.originalityCheck) {
  children.push(h3("Originality Verification"));
  children.push(...longText(hyg.originalityCheck));
}

// ── Agent 9: Additional Research ────────────────────────────────────
if (data.agent9_research && data.agent9_research.text) {
  children.push(pb());
  children.push(h2("Agent 9: Story Research & Writing"));
  children.push(...longText(data.agent9_research.text));
}

// ── Suppression Ledger ──────────────────────────────────────────────
children.push(pb());
children.push(h2("Suppression Ledger"));
if (data.suppressionLedger && data.suppressionLedger.length > 0) {
  data.suppressionLedger.forEach(entry => {
    children.push(h3(entry.headline));
    children.push(boldPara("Date: ", entry.date || "N/A"));
    children.push(boldPara("Reason: ", entry.reason));
    children.push(boldPara("Reopen Trigger: ", entry.reopenTrigger || "N/A"));
  });
} else {
  children.push(para("No stories suppressed this run."));
}
if (data.heldStories && data.heldStories.length > 0) {
  data.heldStories.forEach(held => {
    children.push(boldPara("HELD — ", `${held.headline}: ${held.reason}. Reopen trigger: ${held.elevate || "N/A"}`));
  });
}

// ── Build the document ──────────────────────────────────────────────
const doc = new Document({
  sections: [{
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({
            text: `CIVIC SOURCE SCANNER ${m.version} | ${m.city}, ${m.state} | ${m.date}`,
            font: "Calibri", size: 18, color: GRAY, italics: true,
          })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: "CONFIDENTIAL — For Editorial Review Only",
            font: "Calibri", size: 16, color: GRAY, italics: true,
          })],
        })],
      }),
    },
    children,
  }],
});

// ── Write file ──────────────────────────────────────────────────────
const now = new Date();
const timeStr = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0");
const citySlug = m.city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const outFile = path.join(outputDir, `CivicScanner-Pipeline-Report-${citySlug}-${m.date}-${timeStr}.docx`);

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outFile, buffer);

  // ── Post-generation validation ──────────────────────────────────
  // Quick content size check by counting total text in the JSON
  let totalText = "";
  (data.agent2_stories || []).forEach(s => totalText += s.draft);
  (data.agent4_adversarial || []).forEach(a => totalText += a.gate3_counterNarrative);
  (data.agent7_plainLanguage || []).forEach(p => totalText += p.rewrite);
  (data.agent75_distribution || []).forEach(d => totalText += d.twitter + d.facebook + d.linkedin + d.nextdoor + d.newsletter);

  const charCount = totalText.length;
  const storyCount = data.agent2_stories.length;

  console.log("═══ REPORT GENERATED ═══");
  console.log(`  File: ${outFile}`);
  console.log(`  Size: ${buffer.length} bytes`);
  console.log(`  Stories: ${storyCount}`);
  console.log(`  Core content: ${charCount} characters`);

  if (charCount < 15000) {
    console.warn(`  ⚠ WARNING: Core content is ${charCount} chars (expected >= 15,000). Report may be incomplete.`);
  } else {
    console.log(`  ✓ Content validation passed (${charCount} >= 15,000 chars)`);
  }

  console.log("═══════════════════════");
}).catch(err => {
  console.error("ERROR building .docx:", err);
  process.exit(1);
});
