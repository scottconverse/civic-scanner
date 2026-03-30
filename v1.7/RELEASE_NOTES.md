# Release Notes — civic-scanner skill

## v1.7.0 — 2026-03-29

### Distribution Packager

New Agent 7.5 generates platform-ready distribution assets for each publishable
story, inserted between Plain-Language Translator and Source Hygiene.

### What It Produces (Per Story)

- **SEO Package:** headline (60 chars), meta description (155 chars), 5-8 keywords,
  URL slug
- **Social Media Headlines:** Twitter/X (280 chars + hashtags), Facebook (2-3
  sentences with CTA), LinkedIn (professional/policy framing), Nextdoor
  (neighborhood-level "what this means for you" angle)
- **Newsletter Brief:** 50-75 word standalone summary that works in email without
  clicking through, ending with a "What to watch" forward-looking hook
- **Email Subject Lines:** 3 variations — informational, curiosity, action

### Rules

- Every claim in distribution copy must appear in the verified story (no fabrication for engagement)
- Social headlines must be defensible — no clickbait, no misleading framing
- SEO keywords reflect actual content, not aspirational traffic
- Newsletter briefs must stand alone — reader who only sees the brief understands correctly
- De-escalation controls (Section 4) apply to all distribution copy

### Why This Matters

A 1-3 person newsroom doesn't just need verified stories — they need those stories
formatted for every channel they publish on. The distribution packager eliminates
the 30-60 minutes of reformatting work per story for SEO, social, newsletters,
and email campaigns.

### Remaining v1.x Roadmap

| Version | Feature |
|---------|---------|
| v1.8 | Visual/photo direction formalization |
| v1.9 | Community engagement framework |
| v1.10 | External plagiarism check API |
| v2.0 | All features integrated, architecture review |

---

## v1.6.0 — 2026-03-29

### Beat Memory Across Runs

Persistent story thread tracking so the pipeline knows what it saw before,
how stories evolved, and when suppression triggers are met.

### Architecture

**Memory-first, file-as-backup.** Beat memory is loaded into working context
at Agent 1, carried through all agents during the pipeline run, updated by
Agent 8, and written to disk at the end. The JSON file persists between
sessions as durable storage.

- Auto-save after every run (unless `--no-memory` flag)
- 90-day retention: inactive threads archived to `{city}-beat-memory-archive.json`
- File: `references/{city}-beat-memory.json` (next to source registries)

### What Gets Tracked

**Per story thread:** headline, firstSeen, lastSeen, appearances count,
statusHistory (status + score per run), severityHistory, keyChanges
(human-readable changelog between runs), suppression status + reopenTrigger.

**Per source:** leadsGenerated, storiesAdvanced, lastSeen — builds a picture
of which Tier A sources consistently produce actionable leads vs noise.

### Pipeline Integration

- **Agent 1:** Loads beat memory, produces Beat Context Brief (run number,
  active threads, threads to watch, suppression trigger check results).
  Each lead flagged as NEW or RECURRING with appearance count and score trend.
- **Agent 2.5:** Score trend displayed alongside current score. Novelty score
  DECREASES for recurring stories unless new facts emerged. Flat/falling score
  trends trigger scrutiny — is this still news?
- **Agent 4:** Loads prior run's counter-narrative for recurring threads. Notes
  whether the adversarial case has evolved. Prevents re-discovering the same
  counter-evidence without acknowledging it was already found.
- **Agent 8:** Writes updated beat memory to disk. Creates/updates threads,
  appends status/score/severity history, logs key changes, updates source
  performance counters, archives 90-day inactive threads.

### Output Changes

- Pipeline stats now include Beat Context (run number, recurring vs new count,
  suppression trigger status)
- Each publishable story shows: Beat field (NEW or RECURRING with trends)
- Report Section A (Editorial Dashboard) includes Beat Context section with
  thread watch list and suppression trigger status

### Thread Matching Rules

- Match on normalized headline keywords (strip articles, prepositions)
- Also match on Tier A source URLs — same government document = same thread
- If uncertain, create new thread rather than false-matching

### Remaining v1.x Roadmap

| Version | Feature |
|---------|---------|
| v1.7 | Distribution layer (SEO, social, newsletter) |
| v1.8 | Visual/photo direction formalization |
| v1.9 | Community engagement framework |
| v1.10 | External plagiarism check API |
| v2.0 | All features integrated, architecture review |

---

## v1.5.0 — 2026-03-29

### Blocked Source Intelligence + City Discovery

Two features that address the biggest practical limitations: blocked sources
crippling the pipeline, and new-city adoption requiring manual registry creation.

### Changes

**1. Blocked Source Intelligence Protocol (Mandatory Control Section 7) — NEW**
- When web searches return results from crawl-blocked domains (newspapers, Reddit,
  Facebook, Nextdoor), the pipeline now **extracts lead intelligence** from the
  metadata: article titles, URLs, snippets, publication dates
- Blocked headlines become **targeted follow-up searches** run without domain
  restriction — if the Times-Call published something, search for that claim
  through accessible sources
- Blocked source leads are **fed to Agent 3 (Black Desk)** as speculative signals
  and to **Agent 4 (Adversarial Challenge)** as mandatory adverse search targets
- Every blocked source with relevant civic coverage goes into the **Reporter Task
  Memo** "Missing" and "Calls" fields
- **Rules**: never quote snippets as full articles, never cite blocked sources as
  Tier B corroboration, never assume conclusions from titles alone — a title is
  a LEAD, not a FACT
- Scan Steps 3 and 4 rewritten to apply this protocol when domains are blocked
- Source Access Warning banner replaced with "Source Access Limitations + Blocked
  Source Intelligence Extracted" section showing what was found and where it was fed

**2. City Discovery Mode (Mode 6) — NEW**
- New mode: `/civic-scanner discover {city}, {state}`
- Automatically builds a complete source registry by searching for:
  - Agenda portal system (PrimeGov, Granicus, Legistar, Municode, custom)
  - Official YouTube channel with transcript availability
  - City clerk / public records portal
  - Budget documents, building permits, planning & zoning
  - Municipal code host
  - School district board meetings
  - County government agendas
  - Special districts (water, transit, fire, library)
  - Local and regional newspapers
  - Statewide investigative outlets and public radio
  - Chamber of commerce, economic development office
  - Reddit, Nextdoor, Facebook community groups, local hashtags
  - Meeting calendar for all government bodies
  - State open records law (statute, deadlines, fees, exemptions, appeal process)
- Outputs a populated `references/{city-name}-sources.md` ready for scanning
- Discovery gotchas documented: small towns without portals, consolidated
  city-county governments, Virginia independent cities, PA township/borough
  systems, multiple school districts, Spanish-language sources, dead URLs
- City Configuration section updated to recommend discover mode as the
  primary path for new cities

**3. Usage Updated**
- 6 modes now listed (added `discover`)
- Trigger phrases expanded: "set up a new city", "discover sources"
- First-time-city guidance added

### What This Means

The pipeline is now **self-configuring for any US municipality** and **uses
blocked search results as intelligence instead of discarding them**. A new user
can go from zero to a functioning civic scanner in one command.

### Remaining v1.x Roadmap (before v2.0)

| Version | Feature |
|---------|---------|
| v1.6 | Beat memory across runs |
| v1.7 | Distribution layer (SEO, social, newsletter) |
| v1.8 | Visual/photo direction formalization |
| v1.9 | Community engagement framework |
| v1.10 | External plagiarism check API |
| v2.0 | All features integrated, architecture review |

---

## v1.4.0 — 2026-03-29

### Pipeline Architecture Tightening

Addresses Tier 2 improvements from the editor review analysis. Tightens agent
boundaries, restructures report output, adds severity coding, and declares
product identity.

### Changes

**1. Product Identity Declaration — NEW**
- Added "Product Identity" section at top of skill
- Explicitly states: Agent 2 = research scaffolding, Agent 7 = newsletter/social
  summaries, Reporter Task Memos = most actionable output
- "Neither Agent 2 nor Agent 7 output is the published story"
- Addresses 3 of 4 editors asking which version is the "real" output

**2. Agent 4/5/8 Boundary Tightening — REWRITTEN**
- Agent 4 renamed "Adversarial Challenge" — ONE job: find reasons NOT to publish.
  Kill condition: counter-narrative more compelling = SUPPRESS
- Agent 5 renamed "Completeness Auditor" — ONE job: is the story complete and
  attributed? Kill condition: unattributable factual claim = KILL
- Agent 8 renamed "Source Hygiene + Headline Audit" — ONE job: no contaminated
  sources, no packaging errors. Kill condition: Tier C in attribution = KILL
- Each agent explicitly told NOT to re-check another agent's domain
- Addresses Editor 3: "three neighboring desks doing partial versions of the same job"

**3. Report Restructured — Section A + Section B**
- Section A: Editorial Dashboard (2-3 pages) — verdicts, memos, holds, signals.
  What the editor reads at the morning meeting.
- Section B: Verification Appendix — full agent output for reference when questioned.
  Complete counter-narratives, gate tables, audits, drafts, rewrites.
- Editors consume information in editorial order, not pipeline execution order

**4. Severity Coding — NEW**
- GREEN: clean pass, no caveats
- AMBER: passed with caveats (contested, corrected, missing voices)
- RED: killed (counter-narrative wins, unattributable, Tier C contamination)
- GRAY: held (awaiting documents, below threshold)
- Applied throughout pipeline output and report
- A contested story gets AMBER, not green — the report shows the editorial decision

**5. Kill Counter Visibility — ENHANCED**
- Pipeline stats now include: scanned / advanced / killed / held / suppressed
- Killed stories listed with which agent killed them and why
- Addresses Editor 1's verification theater concern

**6. Agent 6 Honesty Requirement — UPDATED**
- First Amendment Counsel told NOT to rubber-stamp every story as "LOW — fair
  report privilege." If the story synthesizes patterns or implies motivations
  beyond what the filing says, the legal risk rises. Be honest.
- Addresses Editors 1 and 3: legal analysis "too uniformly LOW"

### v1.4 Architecture Summary

| Agent | Role | Kill Condition |
|-------|------|---------------|
| Agent 4 | Adversarial challenge | Counter-narrative more compelling |
| Agent 5 | Completeness audit | Unattributable claim |
| Agent 8 | Source hygiene + headlines | Tier C contamination |

No overlap. Each agent has one crisp editorial purpose and one explicit kill condition.

---

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
