# Release Notes — civic-scanner skill

## v1.2.0 — 2026-03-29

### Report Generation

Added automated .docx report generation that captures the complete, unabridged
output of every pipeline agent into a formatted Word document for editorial review.

### Changes

- **New Section: Report Generation** — appended after City Configuration
- Generates a formatted .docx after every full-pipeline run (on request for other modes)
- Includes complete output from all 9 agents with no summarization or truncation
- Title page with summary stats, headers/footers, page breaks between agents
- Tables with alternating row shading, color-coded verdicts (green/amber/red)
- Full counter-narratives, complete story drafts, detailed audit tables
- Uses `docx` npm package via temporary Node.js build script
- File saved as `CivicScanner-Pipeline-Report-{YYYY-MM-DD}.docx`

### Why This Matters

A managing editor reviewing the pipeline output needs to see exactly what each
agent produced — not a summary. The report captures the full adversarial
verification (including the strongest opposing arguments), complete story drafts
with attribution chains, and detailed audit results. This makes the pipeline
output reviewable, archivable, and defensible.

---

## v1.1.0 — 2026-03-29

### Dynamic Search Filtering

Integrates the `web_search_20260209` dynamic filtering capability across all
5 modes. Claude now writes and executes code to pre-filter search results
before they enter the context window, keeping only civic-relevant data and
discarding noise (ads, navigation, SEO content, bot-generated summaries).

### Changes

- **New Mandatory Control (Section 6):** Dynamic Search Filtering Protocol —
  tier-specific keep/discard criteria, `allowed_domains` from source registry,
  `user_location` for localized results, standardized extraction format
- **Mode 1 (Daily Scan):** Steps 2-4 updated with per-tier domain restriction,
  filtering criteria, and extraction instructions
- **Mode 2 (Full Pipeline):** Agents 1, 3, 4, 9 updated with filtering references —
  Agent 3 (Black Desk) uses broader criteria, Agent 4 (Dark Signal Desk) uses
  verification criteria with no domain restriction for counter-evidence
- **Mode 3 (Verify Only):** Adversarial verification searches use verification
  filtering criteria with unrestricted domains
- **Mode 4 (Research):** Primary sourcing uses Tier A domain restriction,
  contextual research uses unrestricted domains with `user_location`
- **Version bump:** Scanner output now shows v1.1

### Why This Matters

Web search is token-intensive. The civic scanner runs 10-30+ searches per
pipeline execution. Dynamic filtering reduces token consumption by discarding
irrelevant HTML (navigation, ads, footers) before it enters context, while
`allowed_domains` constrains Tier A/B/C searches to known source domains from
the registry. The result: more accurate sourcing with lower cost.

---

## v1.0.0 — 2026-03-29

### Initial Release

First version of the Civic Source Scanner, consolidating 30+ prompt variants
from LNN, CIOS, civic-newsroom, and signal desk systems.

### What's Included

- **SKILL.md** — 5-mode civic scanning skill with 9-agent pipeline
- **references/longmont-sources.md** — Complete Longmont, CO source registry (3 tiers)
- **references/source-template.md** — Blank template for any city
- **civic-scanner.md** — Human-readable reference documentation

### 5 Modes

1. **daily-scan** — morning source scan, prioritized lead list
2. **full-pipeline** — 9-agent end-to-end reporting with verification gates
3. **verify-only** — adversarial verification of a specific claim
4. **research** — standalone deep-dive on a topic
5. **legal-threat** — First Amendment counsel triage

### Mandatory Controls

- Hard-No-Bluff Rule (no Tier A = no publish)
- 3-tier source classification (A/B/C)
- 4-gate adversarial verification (contestation, adverse search, counter-narrative, self-referential)
- 5-part integrity audit (source, attribution, balance, harm, legal)
- Suppression ledger with reopen triggers
- De-escalation language controls

### Longmont Source Registry

- 15+ Tier A sources (PrimeGov portal, YouTube, county, school district, special districts)
- 8+ Tier B sources (Times-Call, regional papers, institutional)
- 5+ Tier C sources (Reddit, Nextdoor, Facebook, YouTube comments)
- Meeting calendar with recurring schedules
- CORA (Colorado Open Records Act) reference

### Gotchas Documented

- Hard-No-Bluff absolutism
- Adversarial completeness requirement
- Self-referential AI bias warning
- YouTube transcript errors
- Astroturf detection
- SLAPP suit risk
- Source laundering
- Meeting packet chunking
- Model differences (Claude vs ChatGPT vs Gemini)
- Tier C source laundering through Tier B

### Built From

- 30+ LNN/civic-newsroom prompt variants
- civic-newsroom open-source project (9-agent pipeline)
- CIOS/SmartNewsNetwork meeting packet processor
- Dark Signal Desk, Dark County Signal Desk variants
- First Amendment counsel module
- Civic Grounding Protocol (anti-plagiarism)
- Skill #4 in the prioritized 8-skill roadmap

### Next Skills in Roadmap

5. Stress Test Aggregator
6. Opinion Piece Publisher
7. Windows Dev Environment Doctor
8. Patent Prior Art Tracker
