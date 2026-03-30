# Release Notes — civic-scanner skill

## v1.3.0 — 2026-03-29

### Managing Editor Review Response

Addresses all Tier 1 critical gaps identified by 4 independent managing editor
reviews of the v1.2 pipeline output. Scores improved from ~6/10 publishable
journalism to targeting ~8/10 reporter-guiding intelligence.

### Changes

**1. Newsworthiness Gate (Agent 2.5) — NEW**
- Inserted between Story Expansion and Black Desk
- Scores every story on 4 dimensions: Immediacy, Impact, Conflict, Novelty (1-5 each)
- Threshold: 10/20 to advance, 7-9 to hold, ≤6 demoted to monitoring note
- **Can KILL or DEMOTE well-sourced but editorially thin stories**
- Addresses the #1 editor criticism: "the system surfaces official activity
  but doesn't assess whether it's actually news today"
- The building code story and council retreat scheduling would have been
  caught by this gate in the v1.2 run

**2. Reporter Task Memo — NEW**
- Every advancing story produces: Confirmed / Missing / Calls to Make /
  Documents to Pull / Falsification Criteria / Visual Needs
- Transforms output from "polished copy" to "reporter-guiding intelligence"
- Travels with the story through the entire pipeline and appears in the report
- Addresses Editor 3: "I would want every serious lead to produce a reporting
  memo with five fields"

**3. Headline/Status Audit — NEW**
- Added to Agent 8 (Civic Grounding) as a mandatory final check
- Validates every headline verb against the story body's actual status
- Catches state-change drift: "proposed" → "approved", "under review" → "annexed"
- Addresses Editor 3's critical bug: final package said "Annexed" when body
  said "under review" — a stop-the-presses factual error

**4. Source Access Warning Banner — NEW**
- Red warning banner at top of scan/pipeline output when Tier B/C sources
  are blocked by crawl policies
- Includes manual review checklist: which newspapers to check, which forums
  to review manually
- Addresses 3 of 4 editors flagging that blocked sources were buried in footnotes

**5. Pipeline Stats Counter — NEW**
- Report header now shows: Stories advanced / killed / held / suppressed
- Makes the newsworthiness gate's kill decisions visible
- Addresses Editor 1's verification theater concern

**6. Report Generation Updated**
- Includes Agent 2.5 scoring tables and reporter task memos
- Source access warning section added to report structure
- Final package includes "Stories Killed by Newsworthiness Gate" section
- Plain-language rewrites noted as "public-facing summaries for newsletters/
  social" not primary story output

### What the Editors Validated (unchanged)

- Hard-No-Bluff Rule — keep absolute
- Source tier classification (A/B/C) — keep strict
- 4-gate adversarial verification — keep, with tighter agent boundaries (v1.4)
- Suppression ledger — keep, it's an editorial innovation
- Source laundering warning — keep
- Black Desk / publishable firewall — keep the separation
- De-escalation controls — keep
- Dynamic Search Filtering — keep

### Editor Scores on v1.2 Output

| Editor | Prompt Architecture | Output as Internal Tool | Output as Publishable |
|--------|--------------------|-----------------------|----------------------|
| Ed 1   | ~8.5/10            | ~8/10                 | ~6/10                |
| Ed 2   | 9/10               | 8.5/10                | ~7/10 (with edit)    |
| Ed 3   | 8.5/10             | 8/10                  | 5.5-6/10             |
| Ed 4   | Strong             | Very good             | ~6/10                |

### Next (v1.4 Targets)

- Tighten Agent 4/5/8 boundaries (reduce verification overlap)
- Restructure report output (Editorial Dashboard + Verification Appendix)
- Add severity color coding (green/amber/red/gray verdicts)
- Declare product identity explicitly (research scaffolding, not published copy)
- Add kill counter visibility

---

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
