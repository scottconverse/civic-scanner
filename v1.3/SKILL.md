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

### 6. Dynamic Search Filtering Protocol

All web searches MUST use dynamic filtering to pre-filter results before they
enter the context window. This reduces token waste and improves source accuracy
across every mode.

**How it works:** The `web_search_20260209` tool version automatically enables
dynamic filtering — Claude writes and executes code to post-process search results,
keeping only relevant civic data and discarding noise before results load into context.

**Required for every search:**

1. **Domain restriction** — Use `allowed_domains` to constrain searches to known
   source domains from the active source registry. Build the domain list from:
   - Tier A searches: government portal domains only
   - Tier B searches: newspaper/institutional domains only
   - Tier C searches: community platform domains only
   - Verification searches: no domain restriction (cast wide net for counter-evidence)

2. **Location context** — Use `user_location` with the target city's location to
   localize results. Load city, region, country, and timezone from the source registry.

3. **Tier-specific filtering criteria:**

   TIER A SEARCHES (government portals, official records):
   - Keep: agenda items, ordinance text, budget figures, permit details, meeting
     dates, vote tallies, resolution numbers, staff reports, public hearing notices
   - Discard: site navigation, footers, cookie banners, unrelated department pages,
     job postings, general city marketing content, archived agendas older than 90 days
     unless specifically investigating historical context

   TIER B SEARCHES (newspapers, institutional sources):
   - Keep: article headlines, bylines, publication dates, quoted officials,
     referenced government documents, specific claims with attribution
   - Discard: ads, subscription prompts, comment sections, related article
     sidebars, social share widgets, newsletter signup forms, wire copy that
     duplicates a Tier A source already found

   TIER C SEARCHES (community signals):
   - Keep: post titles, timestamps, vote/engagement counts, substantive claims
     about city government, referenced documents or meetings
   - Discard: memes, off-topic threads, personal grievances unrelated to civic
     policy, commercial spam, bot-generated content

   VERIFICATION SEARCHES (adversarial, fact-checking):
   - Keep: contradictory evidence, dissenting opinions, alternative interpretations,
     historical context, related policy outcomes from other jurisdictions
   - Discard: opinion pieces without sourcing, SEO content farms, AI-generated
     summaries, syndicated wire copy that duplicates a source already found

4. **Extraction format** — For each result that passes filtering, extract:
   - Source URL
   - Title/headline
   - Publication/posting date
   - Key civic data points (names, figures, dates, official actions)
   - Source tier classification (A/B/C)
   - Relevance tag (DIRECT / CONTEXTUAL / SIGNAL)

---

## Mode 1: Daily Scan

The most common mode. Run it every morning to see what's new.

### Step 1: Load Source Registry

Read the source registry for the target city:
- Default: `references/longmont-sources.md`
- Override: user-provided path or `references/source-template.md` for new cities

### Step 2: Scan Tier A Sources

For each Tier A source in priority order. Apply Dynamic Search Filtering
Protocol (Section 6): use `allowed_domains` built from the Tier A domain list
in the source registry, and set `user_location` to the target city.

1. **City Council Portal** — search for recent agendas, minutes, or posted documents
   - Search: `{city} council agenda OR minutes OR ordinance` (recent date range)
   - `allowed_domains`: portal domain(s) from source registry (e.g., `longmont.primegov.com`)
   - Filter for: agenda items, ordinance readings, budget amendments, public hearings,
     vote tallies, resolution numbers, staff report titles
   - Discard: site chrome, navigation menus, archived items older than 90 days

2. **Official YouTube** — search for recent meeting recordings
   - Search: `{city} council meeting {current month}`
   - `allowed_domains`: `["youtube.com"]`
   - Filter for: video titles, upload dates, channel verification (official city channel)
   - Discard: unrelated videos, comment threads, suggested videos

3. **School Board** — search for recent agendas
   - Search: `{school district} board meeting agenda`
   - `allowed_domains`: school district domain(s) from source registry
   - Filter for: board agenda items, enrollment data, budget actions

4. **County Government** — search for recent agendas
   - Search: `{county} commissioners agenda`
   - `allowed_domains`: county domain(s) from source registry
   - Filter for: agenda items affecting the target city's jurisdiction

### Step 3: Scan Tier B Sources (Leads Only)

For each Tier B source. Apply Dynamic Search Filtering Protocol (Section 6):
use `allowed_domains` built from the Tier B domain list in the source registry.

- Search local newspaper for recent city government coverage
- `allowed_domains`: newspaper/institutional domains from source registry
- Filter for: articles about city government, quoted officials, referenced
  government documents, specific policy claims with attribution
- Discard: ads, subscription walls, comment sections, opinion columns without sourcing
- Flag any story that doesn't already have a Tier A source attached
- Mark as "LEAD — needs Tier A corroboration"

### Step 4: Scan Tier C Sources (Signals Only)

For each Tier C source. Apply Dynamic Search Filtering Protocol (Section 6):
use `allowed_domains` built from the Tier C domain list in the source registry.

- Search Reddit/community forums for recent civic discussion
- `allowed_domains`: community platform domains from source registry
- Filter for: posts about city government, referenced meetings or documents,
  substantive policy complaints, engagement metrics (upvotes/comments)
- Discard: memes, off-topic threads, personal grievances unrelated to civic policy,
  commercial spam, bot-generated content
- Mark as "SIGNAL — needs verification, never cite"

### Step 5: Compile Lead List

Produce the daily scan report:

```
=== Civic Source Scan: {City, State} ===
Date: {today}
Sources Checked: {N Tier A} / {N Tier B} / {N Tier C}

*** SOURCE ACCESS WARNING ***
{If ANY Tier B or C sources were blocked by crawl policies, display this banner:}
WARNING: {N} Tier B and/or {N} Tier C sources were inaccessible due to
crawl policies. Blocked: {list of blocked domains}. This report may be
built primarily from government records. Manual review of local media
and community sources is REQUIRED before publication decisions.

MANUAL REVIEW CHECKLIST:
  - [ ] Check {newspaper} for coverage of leads listed below
  - [ ] Check {community forum} for community reaction
  - [ ] {additional manual checks per blocked source}
*** END WARNING ***

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
Scanner: Civic Source Scanner v1.3
```

---

## Mode 2: Full Pipeline

Runs all agents sequentially (9 core + Newsworthiness Gate). Use for producing
complete, verified story packages with reporter task memos.

### Agent 1: News Aggregator
- Run the daily-scan process (Mode 1, Steps 1-5) with Dynamic Search Filtering
  Protocol (Section 6) applied to all searches
- Output: 15-25 raw leads with tier classifications and filtered extraction data

### Agent 2: Story Expansion
For each Tier A lead (priority order):
- Draft a 400-800 word story from the source material
- Structure: lede (who/what/when/where) → context → details → impact → next steps
- Attribute every claim to its source document
- Flag any sentence that lacks Tier A attribution

### Agent 2.5: Newsworthiness Gate

**This gate can KILL or DEMOTE stories.** A well-sourced story that fails the
newsworthiness test does not advance to verification. It goes to the hold list
or suppression ledger.

For each expanded story, score on four dimensions (1-5 each):

1. **Immediacy** — Why now? What changed this week? A routine procedural update
   with no deadline pressure scores 1. A vote happening Tuesday scores 5.
   - KILL if score = 1 AND no other dimension scores above 3

2. **Impact** — Who gets hit? How many people? How much money? A schedule posting
   scores 1. A $520M budget adoption scores 5. A zoning change affecting 58 acres
   of housing scores 4.
   - KILL if score = 1

3. **Conflict** — Is there a fight? Opposing sides? Contested votes? A unanimous
   consent item scores 1. A contested annexation with neighborhood opposition scores 5.
   - Stories scoring 1 may still publish if Impact ≥ 4

4. **Novelty** — Is this new, or a routine recurrence? First-ever RCV discussion
   scores 5. Annual code update scores 2. Regular meeting schedule posting scores 1.
   - KILL if score = 1 AND Immediacy = 1

**Threshold:** Total score ≥ 10 = advance to verification. Score 7-9 = HOLD with
note on what would elevate it. Score ≤ 6 = DEMOTE to monitoring note, not a story.

**Output per story:**
```
NEWSWORTHINESS: {ADVANCE / HOLD / DEMOTE}
  Immediacy: {1-5} — {one-line justification}
  Impact:    {1-5} — {one-line justification}
  Conflict:  {1-5} — {one-line justification}
  Novelty:   {1-5} — {one-line justification}
  Total:     {4-20}
  Decision:  {why this advances, holds, or gets demoted}
```

**Reporter Task Memo** — For every story that scores ADVANCE, produce:
```
REPORTER TASK MEMO:
  Confirmed: {what Tier A grounding exists — specific documents}
  Missing:   {gaps that prevent publication-ready status}
  Calls:     {who needs to be called — names, titles, organizations}
  Documents: {specific CORA requests or records to pull}
  Falsify:   {what evidence would kill this story}
  Visuals:   {map needed? photo? explainer graphic? what should it show?}
```

The Reporter Task Memo travels with the story through the entire pipeline and
appears in the final report. It transforms the output from polished copy into
reporter-guiding intelligence.

### Agent 3: Black Desk (Speculative Signals)
- Review Tier B and C signals from the scan
- Accept LOW confidence signals (0.1-0.5) — cast a wide net
- When searching for speculative connections, use Dynamic Search Filtering
  Protocol (Section 6) with BROADER criteria: keep tangential civic connections,
  policy precedents from other jurisdictions, historical parallels — but still
  discard non-civic noise (ads, SEO content, bot-generated summaries)
- Generate speculative leads: "what if this signal means..."
- Output: speculative story angles for verification
- NOTE: Black Desk output is NEVER publishable. It feeds the Dark Signal Desk.

### Agent 4: Dark Signal Desk (Adversarial Verification)
For each Black Desk signal AND each expanded story:
- Run the 4-gate adversarial verification (see Mandatory Controls above)
- For Gates 1-2 (Contestation + Adverse Search): use Dynamic Search Filtering
  Protocol (Section 6) with VERIFICATION criteria — no domain restriction
  (cast wide net for counter-evidence), keep contradictory evidence and
  dissenting viewpoints, discard SEO farms and AI-generated summaries
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

### Agent 8: Civic Grounding (Anti-Plagiarism + Headline Audit)
Final source verification and packaging safety check:
- Verify every claim traces to a named Tier A source
- Check that no Tier C sources leaked into attribution
- Verify the story doesn't closely paraphrase any single source (plagiarism check)
- Confirm the suppression ledger is updated for any killed stories

**Headline/Status Audit (MANDATORY):**
- For every story headline and summary line, check that the **status verb** matches
  the story body's actual status. This prevents state-change drift in packaging.
- Specifically check for these dangerous verb upgrades:
  - "proposed" → "approved" or "adopted"
  - "under review" → "annexed" or "completed"
  - "considering" → "implementing" or "launching"
  - "scheduled to" → "will" or "has"
  - "study session" → "voted" or "passed"
- If a headline states an action as completed when the body describes it as pending
  or under review, this is a **STOP-THE-PRESSES error**. Fix the headline immediately.
- Apply the same check to the Final Package summary table headlines.

### Agent 9: Story Research & Writing
For stories needing additional research:
- Standalone deep-dive agent
- Web search for additional context, historical background, related policies
- Apply Dynamic Search Filtering Protocol (Section 6): use Tier A domain
  restriction for primary sourcing, unrestricted domains for contextual research,
  and extract civic data points per the standard extraction format
- All new sources must be tier-classified before use
- Output: enriched story package ready for publication

### Full Pipeline Output:

```
=== Civic Reporting Package: {City} ===
Date: {today}
Pipeline: Full (9+ agents)

PIPELINE STATS:
  Stories advanced:  {N}
  Stories killed:    {N} (by Newsworthiness Gate)
  Stories held:      {N}
  Stories suppressed: {N}

*** SOURCE ACCESS WARNING ***
{If ANY sources were blocked, display warning banner with manual review
checklist — same format as daily-scan output above.}
*** END WARNING ***

PUBLISHABLE STORIES:
  1. {headline}
     Newsworthiness: {score}/20 — {1-line justification}
     Word count: {N}
     Sources: {N Tier A, N Tier B context}
     Verification: PASSED (4-gate + integrity)
     Headline audit: PASSED (status verbs match body)
     Legal risk: LOW
     [Full story text]
     [Reporter Task Memo]

  2. {headline}
     ...

STORIES KILLED BY NEWSWORTHINESS GATE:
  - {headline}: Score {N}/20 — {reason for kill}

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
2. Run 4-gate adversarial verification — apply Dynamic Search Filtering Protocol
   (Section 6) with VERIFICATION criteria for all searches: no domain restriction
   (cast wide for counter-evidence), filter for contradictory evidence, dissenting
   opinions, alternative data sources, and policy outcomes from comparable jurisdictions
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
1. Web search for relevant public records, news coverage, and context — apply
   Dynamic Search Filtering Protocol (Section 6): use Tier A domain restriction
   for primary sourcing searches, unrestricted domains for contextual/background
   research, and set `user_location` to the target city for localized results
2. Classify all sources by tier
3. Build a research brief with sourced findings using the standard extraction format
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

---

## Report Generation

After any pipeline run (daily-scan or full-pipeline), generate a formatted .docx
report file that captures the COMPLETE output of every agent that executed.

### When to Generate

- **Always** after `full-pipeline` mode (all 9 agents)
- **On request** after `daily-scan`, `verify-only`, or `research` modes
- Save to the working directory as `CivicScanner-Pipeline-Report-{YYYY-MM-DD}.docx`

### What to Include

The report MUST contain the COMPLETE, unabridged output of every agent. Nothing
is summarized or truncated. A managing editor reviewing this document should see
exactly what the pipeline produced.

**Title Page:**
- "CIVIC SOURCE SCANNER — Full Pipeline Report"
- City name, date, pipeline mode
- Pipeline stats: stories advanced / killed / held / suppressed
- Sources checked per tier
- Dynamic filtering protocol note

**Source Access Warning (if applicable):**
- Red-banner warning listing any blocked Tier B/C domains
- Manual review checklist with specific actions per blocked source
- This appears immediately after the title page, before any content

**Agent 1 (News Aggregator):**
- Every lead with full detail: tier tag, headline, source, URL, confidence, action
- Unverified leads with Tier A needed and action items
- Tier C signals (or note if blocked)
- Suppression ledger updates
- Upcoming meetings calendar table

**Agent 2 (Story Expansion):**
- Complete 400-800 word draft of each expanded story
- Full attribution chains — every claim traced to its source document
- Context, impact, and next steps sections
- Source citation line for each story

**Agent 2.5 (Newsworthiness Gate):**
- Scoring table for each story: Immediacy, Impact, Conflict, Novelty (1-5 each)
- Total score, threshold decision (ADVANCE / HOLD / DEMOTE)
- Stories killed or demoted with full reasoning
- Reporter Task Memo for each advancing story (Confirmed, Missing, Calls,
  Documents, Falsify, Visuals)

**Agent 3 (Black Desk):**
- Each speculative signal with full context
- Confidence rating, speculative angle, and investigation questions
- Note that Black Desk output is never publishable

**Agent 4 (Dark Signal Desk):**
- Complete 4-gate verification for each story:
  - Gate 1: Contestation details with specific opposing viewpoints found
  - Gate 2: Full adverse search results — what counter-evidence was found
  - Gate 3: Complete counter-narrative written out (the strongest opposing argument)
  - Gate 4: Self-referential flag status
- Verdict per story with reasoning

**Agent 5 (Integrity Checker):**
- Individual 5-part audit for each story (source, attribution, balance, harm, legal)
- Detailed notes for each audit item
- PUBLISH / REVISE / HOLD / KILL verdict per story

**Agent 6 (First Amendment Counsel):**
- Threat analysis: defamation, SLAPP, prior restraint, source protection
- Risk assessment per story
- Recommendation and disclaimer

**Agent 7 (Plain-Language Translator):**
- Complete plain-language rewrite of each publishable story
- Full text at 8th grade reading level
- Note: These are public-facing summaries for newsletters/social, not the
  primary story output. Agent 2 drafts are reporter research scaffolding.

**Agent 8 (Civic Grounding + Headline Audit):**
- Anti-plagiarism audit results per story
- Tier C contamination check
- Headline/status audit results — every headline verb validated against body
- Any state-change drift errors flagged and corrected
- Suppression ledger status

**Agent 9 (Story Research & Writing):**
- Additional research findings if any, or note that no deep-dive was needed
- Leads held for future scans

**Final Package:**
- Pipeline stats banner (advanced / killed / held / suppressed)
- Publishable stories summary table (headline, newsworthiness score, word count,
  verification, headline audit, legal risk, verdict)
- Reporter Task Memo for each publishable story
- Stories killed by Newsworthiness Gate with scores and reasoning
- Stories on hold with reasons and what's needed
- Suppression ledger entries
- Signals under investigation with action items
- Dynamic search filtering notes (which domains worked, which were blocked, fallbacks)
- Pipeline footer with version number

### Formatting Requirements

- US Letter page size (8.5" x 11"), 1" margins
- Header: skill name, version, city, date
- Footer: page numbers, "CONFIDENTIAL — For Editorial Review Only"
- Headings for each agent section with page breaks between major sections
- Tables with alternating row shading for readability
- Color-coded verdicts: green for PASS/PUBLISH, amber for CONTESTED/HOLD, red for FAIL/KILL
- Bullet lists using proper list formatting (not unicode characters)
- Source citations in italic gray below each story
- Use `docx` npm package (install locally if needed) via a Node.js build script

### Build Process

1. Generate a temporary Node.js script that builds the .docx using the `docx` package
2. Run the script to produce the report file
3. Delete the build script after successful generation
4. Confirm file size and location to the user
