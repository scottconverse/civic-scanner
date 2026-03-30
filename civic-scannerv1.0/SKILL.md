---
name: civic-scanner
description: |
  Civic source scanner and reporting pipeline. Scans public records, city
  agendas, meeting recordings, and community signals to produce verified
  story leads and publishable civic reporting.

  5 modes: daily-scan, full-pipeline, verify-only, research, legal-threat.

  Trigger when: user says "scan sources", "civic scan", "check city agendas",
  "what happened at council", "news scan", "daily scan", "run the newsroom",
  "check Longmont", "civic news", "story leads", "verify this claim",
  "is this story publishable", or any variation of civic journalism tasks.

  City-agnostic with Longmont, Colorado as default. Override with any city
  by specifying a source registry or providing portal URLs.
---

# Civic Source Scanner

Scan public records, generate story leads, verify through adversarial gates,
and produce publishable civic reporting. Built from the LNN/civic-newsroom
system with 30+ battle-tested prompt variants consolidated into one skill.

## Usage

```
/civic-scanner daily-scan              Morning scan — prioritized lead list
/civic-scanner full-pipeline           All 9 agents — end-to-end reporting
/civic-scanner verify-only {claim}     Adversarial verification of a specific claim
/civic-scanner research {topic}        Deep-dive research on a topic
/civic-scanner legal-threat {situation} First Amendment counsel triage
/civic-scanner                         Prompts for mode selection
```

**City override:** Add `--city {name}` or specify source registry path.
Default: Longmont, CO (see `references/longmont-sources.md`).

---

## MANDATORY CONTROLS — Apply to ALL Modes

These rules are non-negotiable. They apply to every mode, every story, every claim.

### 1. Hard-No-Bluff Rule

**If you cannot ground a claim in a Tier A source, you do NOT publish it.**

No exceptions. No "likely true." No "sources suggest." Either you have an official
government record (agenda, minutes, budget, permit, meeting recording, press release)
or the story goes to the suppression ledger. Period.

Options when Tier A source is missing:
- Publish as **headline-only** (no body text, flagged as "unverified lead")
- Move to **suppression ledger** with reopen trigger
- Hold for **CORA request** (document what to request and from whom)

### 2. Source Tier Classification

**Tier A — Official Records (Publishable)**
Government agendas, minutes, budgets, permits, official press releases,
meeting recordings, YouTube transcripts from official channels, court filings,
CORA/FOIA responses. These are the ONLY sources that support publication.

**Tier B — Institutional Sources (Leads Only)**
Established newspapers, school district communications, institutional press
releases, official organizational statements. Generate leads but CANNOT be
the sole basis for publication. Must be corroborated by Tier A.

**Tier C — Signal Generators (Never for Publication)**
Reddit, Nextdoor, Facebook groups, YouTube comments, Twitter/X, anonymous tips.
Generate SIGNALS for investigation. Never quoted, cited, or referenced in
published reporting. Never named as sources.

### 3. Adversarial Verification (Dark Signal Desk Protocol)

Before ANY story is escalated from lead to publishable, run these 4 gates:

**Gate 1 — Contestation Check:**
Is this claim contested by anyone? Search for opposing viewpoints, dissenting
council members, community opposition. If contested, document both sides.

**Gate 2 — Mandatory Adverse Search:**
Actively search for evidence that CONTRADICTS the story. Spend at least as
much effort trying to disprove it as you spent building it. If you can't find
counter-evidence, document what you searched and why it's absent.

**Gate 3 — Counter-Narrative Synthesis:**
Write the strongest possible version of the opposing argument. If a reasonable
person could read your counter-narrative and find it more compelling than your
story, the story needs more evidence or a different framing.

**Gate 4 — Self-Referential Warning:**
If the story involves AI, journalism, technology, or media — apply EXTRA
scrutiny. These topics trigger confirmation bias in AI systems. Flag explicitly
and require additional Tier A sourcing.

### 4. De-Escalation Controls

- Use **"scheduled to"** not "will" for future events
- Separate **fact** / **interpretation** / **allegation** explicitly
- Explain policy consequences **if conditions fail** (not just success path)
- No ALL CAPS, no exclamation marks, no editorial adjectives in news copy
- Attribute every claim: "according to the March 15 council agenda" not "the city plans to"
- When reporting on contentious issues, lead with the policy mechanism, not the controversy

### 5. Suppression Ledger

Every killed or held story gets a ledger entry:

```
SUPPRESSION ENTRY:
  Headline: {story headline}
  Date Suppressed: {date}
  Reason: {why it was killed — e.g., "No Tier A source for budget figure"}
  Tier A Needed: {specific document that would make it publishable}
  Reopen Trigger: {what evidence would unlock this story}
  Revision Path: {how to fix and republish if reopened}
  Origin: {which source/tier generated the signal}
```

The suppression ledger is a PIPELINE, not a graveyard. Review it weekly.
Stories reopen when their trigger conditions are met.

---

## Mode 1: Daily Scan

The most common mode. Run it every morning to see what's new.

### Step 1: Load Source Registry

Read the source registry for the target city:
- Default: `references/longmont-sources.md`
- Override: user-provided path or `references/source-template.md` for new cities

### Step 2: Scan Tier A Sources

For each Tier A source in priority order:

1. **City Council Portal** — search the web for recent agendas, minutes, or posted documents
   - Search: `site:{portal_url} agenda OR minutes` (recent date range)
   - Look for: new agenda items, ordinance readings, budget amendments, public hearings

2. **Official YouTube** — search for recent meeting recordings
   - Search: `site:youtube.com {city} council meeting {current month}`
   - Check for: new uploads since last scan

3. **School Board** — search for recent agendas
   - Search: `site:{school_board_url} agenda OR board meeting`

4. **County Government** — search for recent agendas
   - Search: `site:{county_url} commissioners agenda`

### Step 3: Scan Tier B Sources (Leads Only)

For each Tier B source:
- Search local newspaper for recent city government coverage
- Flag any story that doesn't already have a Tier A source attached
- Mark as "LEAD — needs Tier A corroboration"

### Step 4: Scan Tier C Sources (Signals Only)

For each Tier C source:
- Search Reddit/community forums for recent civic discussion
- Look for: complaints, questions, rumors about city government
- Mark as "SIGNAL — needs verification, never cite"

### Step 5: Compile Lead List

Produce the daily scan report:

```
=== Civic Source Scan: {City, State} ===
Date: {today}
Sources Checked: {N Tier A} / {N Tier B} / {N Tier C}

PRIORITY LEADS (Tier A grounded):
  1. [A] {headline}
     Source: {specific document/meeting}
     URL: {link}
     Confidence: HIGH
     Action: Ready for expansion

  2. [A] {headline}
     Source: {specific document/meeting}
     URL: {link}
     Confidence: HIGH
     Action: Ready for expansion

UNVERIFIED LEADS (Tier B, need corroboration):
  3. [B] {headline}
     Source: {newspaper/institutional}
     Tier A needed: {what official record would confirm}
     Action: File CORA request / check next agenda

SIGNALS (Tier C, investigation needed):
  4. [C] {signal description}
     Source: {platform — never named in publication}
     Tier A needed: {what would make this publishable}
     Action: Monitor / investigate

SUPPRESSION LEDGER UPDATES:
  - {previously suppressed story}: {still suppressed / reopened because X}

UPCOMING MEETINGS:
  - {next council meeting}: {date, time}
  - {next school board}: {date, time}

---
Sources scanned: {list of sources checked with timestamps}
Scanner: Civic Source Scanner v1.0
```

---

## Mode 2: Full Pipeline

Runs all 9 agents sequentially. Use for producing complete, publishable story packages.

### Agent 1: News Aggregator
- Run the daily-scan process (Mode 1, Steps 1-5)
- Output: 15-25 raw leads with tier classifications

### Agent 2: Story Expansion
For each Tier A lead (priority order):
- Draft a 400-800 word story from the source material
- Structure: lede (who/what/when/where) → context → details → impact → next steps
- Attribute every claim to its source document
- Flag any sentence that lacks Tier A attribution

### Agent 3: Black Desk (Speculative Signals)
- Review Tier B and C signals from the scan
- Accept LOW confidence signals (0.1-0.5) — cast a wide net
- Generate speculative leads: "what if this signal means..."
- Output: speculative story angles for verification
- NOTE: Black Desk output is NEVER publishable. It feeds the Dark Signal Desk.

### Agent 4: Dark Signal Desk (Adversarial Verification)
For each Black Desk signal AND each expanded story:
- Run the 4-gate adversarial verification (see Mandatory Controls above)
- Output for each story: VERIFIED / CONTESTED / UNVERIFIABLE / SUPPRESSED
- Contested stories must include the counter-narrative
- Unverifiable stories go to suppression ledger with reopen triggers

### Agent 5: Integrity Checker (5-Part Audit)
For each VERIFIED story:

1. **Source Audit** — Every factual claim traced to Tier A source? Any orphaned claims?
2. **Attribution Check** — Every quote and paraphrase properly attributed?
3. **Balance Assessment** — Opposing viewpoints represented? Missing perspectives?
4. **Harm Assessment** — Could this story cause undue harm? Privacy concerns?
5. **Legal Risk** — Defamation exposure? SLAPP suit potential? Fair report privilege applies?

Output: PUBLISH / REVISE / HOLD / KILL for each story

### Agent 6: First Amendment Counsel
For stories flagged with legal risk in Agent 5:
- Classify the threat type (prior restraint, defamation, SLAPP, public records denial)
- Apply relevant doctrine (fair report privilege, actual malice standard, anti-SLAPP statutes)
- Provide risk assessment: LOW / MEDIUM / HIGH
- Recommend: proceed / modify / consult attorney / CORA request
- NOTE: This is guidance, NOT legal advice. Always consult a real attorney for high-risk stories.

### Agent 7: Plain-Language Translator
For stories passing integrity check:
- Rewrite government jargon into plain language
- Target reading level: 8th grade
- Preserve accuracy — simplify language, not content
- Flag any simplification that might distort meaning

### Agent 8: Civic Grounding (Anti-Plagiarism)
Final source verification:
- Verify every claim traces to a named Tier A source
- Check that no Tier C sources leaked into attribution
- Verify the story doesn't closely paraphrase any single source (plagiarism check)
- Confirm the suppression ledger is updated for any killed stories

### Agent 9: Story Research & Writing
For stories needing additional research:
- Standalone deep-dive agent
- Web search for additional context, historical background, related policies
- All new sources must be tier-classified before use
- Output: enriched story package ready for publication

### Full Pipeline Output:

```
=== Civic Reporting Package: {City} ===
Date: {today}
Pipeline: Full (9 agents)

PUBLISHABLE STORIES:
  1. {headline}
     Word count: {N}
     Sources: {N Tier A, N Tier B context}
     Verification: PASSED (4-gate + integrity)
     Legal risk: LOW
     [Full story text]

  2. {headline}
     ...

STORIES ON HOLD:
  - {headline}: {reason for hold, what's needed}

SUPPRESSION LEDGER:
  - {entry per suppressed story}

SIGNALS UNDER INVESTIGATION:
  - {active signal with investigation status}
```

---

## Mode 3: Verify Only

Run the Dark Signal Desk + Integrity Checker on a specific claim or story.

### Input
User provides a claim, story draft, or topic to verify.

### Process
1. Classify the claim's source tier
2. Run 4-gate adversarial verification
3. Run 5-part integrity audit
4. Produce verification report

### Output

```
=== Verification Report ===

Claim: "{the claim being verified}"

Source Classification:
  Primary source: {document/URL} — Tier {A/B/C}
  Supporting sources: {list}

Adversarial Verification:
  Gate 1 (Contestation):    {PASS/CONTESTED — details}
  Gate 2 (Adverse Search):  {PASS/FAIL — what counter-evidence exists}
  Gate 3 (Counter-Narrative): {strongest opposing argument}
  Gate 4 (Self-Referential): {N/A or FLAGGED — extra scrutiny needed}

Integrity Audit:
  Source Audit:      {PASS/FAIL}
  Attribution:       {PASS/FAIL}
  Balance:           {PASS/FAIL}
  Harm Assessment:   {LOW/MEDIUM/HIGH}
  Legal Risk:        {LOW/MEDIUM/HIGH}

Verdict: {VERIFIED / CONTESTED / UNVERIFIABLE / SUPPRESSED}

{If CONTESTED: both narratives presented}
{If UNVERIFIABLE: what Tier A source would resolve it}
{If SUPPRESSED: suppression ledger entry}
```

---

## Mode 4: Research

Standalone deep-dive on a topic. Uses Agent 9 (Story Research & Writing).

### Input
User provides a topic, question, or area of investigation.

### Process
1. Web search for relevant public records, news coverage, and context
2. Classify all sources by tier
3. Build a research brief with sourced findings
4. Identify publishable story angles (if any have Tier A grounding)
5. Identify investigation leads (what CORA requests to file, what meetings to attend)

### Output

```
=== Research Brief: {Topic} ===

Summary: {2-3 sentence overview}

Findings:
  1. {finding} — Source: {Tier A/B/C, specific document}
  2. {finding} — Source: {Tier A/B/C, specific document}
  ...

Publishable Angles:
  - {angle with Tier A grounding}

Investigation Leads:
  - CORA Request: {what to request, from whom}
  - Meeting to Monitor: {which body, next date}
  - Source to Cultivate: {institutional contact, not individual names}

Related Coverage:
  - {existing news articles on this topic}
```

---

## Mode 5: Legal Threat

First Amendment counsel triage for a specific situation.

### Input
User describes a situation: a records denial, a legal threat, a SLAPP concern,
a source protection question, or a prior restraint attempt.

### Process
1. Classify the threat type
2. Apply relevant First Amendment doctrine
3. Check state-specific protections (Colorado default, but ask for state)
4. Provide risk assessment and recommended response

### Output

```
=== First Amendment Threat Assessment ===

Situation: {summary}

Threat Classification: {prior restraint / defamation / SLAPP / records denial /
                         source protection / other}

Applicable Doctrine:
  - {relevant legal principle with citation}
  - {relevant state statute}

Risk Assessment: {LOW / MEDIUM / HIGH}

Recommended Response:
  1. {immediate action}
  2. {documentation to preserve}
  3. {when to consult an attorney}

DISCLAIMER: This is editorial guidance, NOT legal advice. For situations
assessed as MEDIUM or HIGH risk, consult a media law attorney before
proceeding.
```

---

## Gotchas

### Hard-No-Bluff Rule Is Absolute
The single most important rule. AI systems hallucinate civic facts confidently.
A made-up budget number or fabricated council vote is not just wrong — it erodes
public trust in civic journalism. If you cannot point to the specific government
document, you do not publish. No exceptions.

### Adversarial Completeness Is Required
Finding evidence FOR a story is easy. The skill's value is in finding evidence
AGAINST it. Gate 2 (Mandatory Adverse Search) must be genuine — search for
contradictions, opposing council members, community objections, historical
context that complicates the narrative. A story that survives genuine adversarial
testing is worth publishing.

### Self-Referential Warning
Stories about AI, journalism, technology, or media trigger confirmation bias
in AI systems. The scanner will unconsciously favor these stories and produce
more confident-sounding copy. Gate 4 exists specifically for this. When the
scanner flags a self-referential story, require ADDITIONAL Tier A sourcing
beyond what's normally sufficient.

### YouTube Auto-Transcripts Have Errors
YouTube auto-generated transcripts from city meeting recordings are classified
as Tier A for CONTENT (the meeting happened, these topics were discussed) but
individual quotes must be verified against the video. Do not quote council members
from auto-transcript without checking the actual recording at the timestamp.

### Astroturf Detection
Manufactured public pressure (organized comment campaigns, coordinated social media,
astroturfed public comment periods) looks organic at Tier C. Red flags:
- Identical or near-identical language across multiple commenters
- Sudden spike in engagement on a niche policy topic
- Out-of-district commenters on local issues
- Professional-quality materials from "grassroots" organizations
Flag suspected astroturf. Do not amplify it.

### SLAPP Suit Risk
Some public records stories trigger Strategic Lawsuits Against Public Participation.
Higher risk factors: stories about development projects, land use decisions, local
business interests, or wealthy individuals. Colorado has an anti-SLAPP statute
(CRS 13-20-1101). Document your sources meticulously — fair report privilege
protects factual reporting of official government proceedings.

### Meeting Packet Chunking
Large city agendas (100+ pages with attachments) must be processed in chunks.
The CIOS system splits packets into AI-sized pieces. If processing a full agenda
packet, break it into: (1) agenda items list, (2) consent agenda, (3) individual
action items, (4) study session topics. Process each chunk separately.

### Model Differences
The original LNN system has ChatGPT-optimized and Gemini-optimized variants.
This skill is designed for Claude but the pipeline structure works across models.
Key difference: Claude is better at adversarial reasoning (Gates 2-3) but may
be more cautious about publishing (which is correct behavior for civic reporting).

### Tier C Source Laundering
Watch for "source laundering" — where a Tier C signal (Reddit rumor) gets picked
up by a Tier B source (local blog) and presented as if it's independently verified.
Always trace the claim back to its ORIGINAL source. If the chain ends at Tier C,
it's still a Tier C claim regardless of how many Tier B outlets repeated it.

---

## City Configuration

Default city: **Longmont, Colorado**
Source registry: `references/longmont-sources.md`

To use with a different city:
1. Copy `references/source-template.md`
2. Fill in your city's sources, portal URLs, meeting schedules
3. Save as `references/{city-name}-sources.md`
4. Invoke: `/civic-scanner daily-scan --city {city-name}`

Or provide sources inline when prompted.
