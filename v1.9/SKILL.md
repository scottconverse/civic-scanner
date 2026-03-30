---
name: civic-scanner
description: |
  Civic source scanner and reporting pipeline. Scans public records, city
  agendas, meeting recordings, and community signals to produce verified
  story leads and publishable civic reporting.

  6 modes: daily-scan, full-pipeline, verify-only, research, legal-threat, discover.

  Trigger when: user says "scan sources", "civic scan", "check city agendas",
  "what happened at council", "news scan", "daily scan", "run the newsroom",
  "check Longmont", "civic news", "story leads", "verify this claim",
  "is this story publishable", "set up a new city", "discover sources",
  or any variation of civic journalism tasks.

  City-agnostic with Longmont, Colorado as default. Override with any city
  by specifying a source registry or providing portal URLs.
---

# Civic Source Scanner

Scan public records, generate story leads, verify through adversarial gates,
and produce reporter-guiding intelligence. Built from the LNN/civic-newsroom
system with 30+ battle-tested prompt variants consolidated into one skill.

## Product Identity

**This system produces verified research scaffolding, not publishable journalism.**

The distinction matters. The pipeline output is:
- **Agent 2 drafts** = research scaffolding for reporters (facts, attribution
  chains, source documents, context). A reporter uses these as the backbone
  of their reporting — then adds quotes, scene, voice, and human stakes.
- **Agent 7 rewrites** = public-facing summaries for newsletters, social media,
  and community briefs. Simplified for accessibility, not for publication as
  standalone news stories.
- **Reporter Task Memos** = the most actionable output. Tells the reporter
  exactly what's confirmed, what's missing, who to call, what to file, and
  what would kill the story.

**Neither Agent 2 nor Agent 7 output is "the published story."** Publication
requires human reporting layered on top: phone calls to sources, attendance
at meetings, quotes from residents, scene-setting, and editorial voice.

The pipeline's value is saving a 1-3 person newsroom 4-10 hours of morning
scan/research/triage work so reporters can focus on the human reporting that
makes civic journalism compelling.

## Usage

```
/civic-scanner daily-scan              Morning scan — prioritized lead list
/civic-scanner full-pipeline           All 9 agents — end-to-end reporting
/civic-scanner verify-only {claim}     Adversarial verification of a specific claim
/civic-scanner research {topic}        Deep-dive research on a topic
/civic-scanner legal-threat {situation} First Amendment counsel triage
/civic-scanner discover {city, state}  Build source registry for any US city
/civic-scanner                         Prompts for mode selection
```

**City override:** Add `--city {name}` or specify source registry path.
Default: Longmont, CO (see `references/longmont-sources.md`).

**First time in a new city?** Run `discover` first — it builds the source registry
automatically so you can scan immediately.

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

### 7. Blocked Source Intelligence Protocol

When a web search returns results from a domain that is blocked by crawl policies
(the search API returns titles, URLs, and snippets but cannot access full content),
**do NOT simply discard those results or log them as a passive warning.**

Blocked search results are **lead intelligence**. Treat them as pointers:

**What to extract from blocked results:**
- Article/post **title** — often contains the key claim or angle
- **URL** — preserves the source for manual follow-up
- **Snippet/description** — search engines show 1-2 sentences of context
- **Publication date** — establishes timeliness
- **Author/byline** if visible in the snippet

**How to use blocked source intelligence:**

1. **Feed Agent 3 (Black Desk):** Blocked Tier B headlines become speculative
   signals. If the Times-Call published "Longmont Council Delays Annexation Vote"
   but the content is blocked, that title alone tells the Black Desk to investigate
   whether a delay occurred — search for the same claim in Tier A sources (council
   minutes, agenda updates).

2. **Feed Agent 4 (Adversarial Challenge):** Blocked results that suggest
   opposition, controversy, or counter-evidence become mandatory adverse search
   targets. If a blocked Longmont Leader headline says "Residents Push Back on
   Water Rate Hike," Agent 4 must search for that pushback through accessible
   sources — council meeting public comment records, official minutes, other
   news coverage.

3. **Generate targeted follow-up searches:** For each blocked result that
   contains a substantive civic claim, run an unrestricted search for that
   specific claim WITHOUT domain restriction. The claim may appear in other
   accessible sources, press releases, or official records.

4. **Add to Reporter Task Memo:** Every blocked source that contained relevant
   civic coverage goes into the "Missing" and "Calls" fields of the Reporter
   Task Memo: "Times-Call appears to have covered this (blocked). Check print
   edition or website directly."

**What NOT to do with blocked sources:**
- Never quote or paraphrase the snippet as if you read the full article
- Never cite a blocked source as Tier B corroboration
- Never assume the article's conclusion from its title alone
- The title is a LEAD, not a FACT — it tells you what to look for, not what's true

**Output format for blocked source leads:**
```
BLOCKED SOURCE INTELLIGENCE:
  {domain} — {N} results found but content inaccessible
  Lead extractions:
    - "{article title}" ({date}) — suggests: {what to investigate}
      Follow-up: {targeted search or CORA request}
    - "{article title}" ({date}) — suggests: {what to investigate}
      Follow-up: {targeted search or CORA request}
  Fed to: Agent 3 (Black Desk), Agent 4 (Adversarial Challenge)
```

### 8. Beat Memory Protocol

The pipeline maintains **persistent memory across runs** so it can track story
threads, detect evolution, monitor suppression triggers, and identify patterns
over time.

**Architecture: Memory-first, file-as-backup.**
Beat memory is loaded into working context at the start of each run and carried
through all agents. At the end of the run, it is written to disk as durable
backup. The next run loads it back into working context.

**File location:** `references/{city}-beat-memory.json`
**Auto-save:** Written after every `full-pipeline` and `daily-scan` run.
**Opt-out:** Add `--no-memory` to skip reading and writing beat memory.
**Retention:** Threads with no activity for 90 days are archived to
`references/{city}-beat-memory-archive.json`.

**What gets tracked per story thread:**

```json
{
  "threadId": "beauprez-farms-annexation",
  "headline": "Developer Proposes Annexing 58 Acres of Farmland",
  "firstSeen": "2026-03-15",
  "lastSeen": "2026-03-29",
  "appearances": 3,
  "statusHistory": [
    {"date": "2026-03-15", "status": "lead", "score": 10},
    {"date": "2026-03-22", "status": "advanced", "score": 13},
    {"date": "2026-03-29", "status": "advanced", "score": 14}
  ],
  "severityHistory": ["GREEN", "GREEN", "AMBER"],
  "keyChanges": [
    "2026-03-22: Neighborhood meeting feedback surfaced",
    "2026-03-29: Planning Commission review date announced"
  ],
  "suppressed": false,
  "reopenTrigger": null
}
```

**What gets tracked per source:**

```json
{
  "sourcePerformance": {
    "longmont.primegov.com": {"leadsGenerated": 12, "storiesAdvanced": 4, "lastSeen": "2026-03-29"},
    "longmontcolorado.gov": {"leadsGenerated": 18, "storiesAdvanced": 6, "lastSeen": "2026-03-29"}
  }
}
```

**Thread matching rules:**
- Match on normalized headline keywords (strip articles, prepositions)
- Also match on Tier A source URLs — if the same government document appears
  in a new lead, it's the same thread even if the headline changed
- If uncertain, create a new thread rather than false-matching

**Suppression trigger monitoring:**
- Each suppressed story has a `reopenTrigger` field (plain text condition)
- At the start of each run, after scanning, check each suppressed story's
  trigger against the new scan results
- If the trigger condition appears to be met, flag it:
  `"SUPPRESSION TRIGGER MAY BE MET: {story} — {what was found}"`
- The story does NOT automatically reopen — flag for editor review

---

## Mode 1: Daily Scan

The most common mode. Run it every morning to see what's new.

### Step 1: Load Source Registry + Beat Memory

Read the source registry for the target city:
- Default: `references/longmont-sources.md`
- Override: user-provided path or `references/source-template.md` for new cities

Load beat memory (unless `--no-memory` flag):
- Check for `references/{city}-beat-memory.json`
- If found, load into working context and produce a **Beat Context Brief:**
  ```
  BEAT CONTEXT:
    Run #{N} for {city}. Last run: {date}. Active threads: {N}.
    Threads to watch:
      - {thread headline} — {N} appearances, score trend {12→13→14}, last: {status}
      - {thread headline} — {N} appearances, severity trend {GREEN→AMBER}
    Suppression check:
      - {suppressed headline}: trigger = "{condition}" — checking against today's scan
  ```
- If not found (first run), note: "First run for {city}. Beat memory will be
  created after this pipeline completes."

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

For each Tier B source. First attempt with `allowed_domains` from the source registry.
If a domain is blocked by crawl policies, apply Blocked Source Intelligence Protocol
(Section 7): extract lead intelligence from titles/snippets/dates, then run
unrestricted follow-up searches for the specific claims found.

- Search local newspaper for recent city government coverage
- `allowed_domains`: newspaper/institutional domains from source registry
- **If blocked:** extract titles, dates, and snippets from search results.
  Each title becomes a targeted follow-up search WITHOUT domain restriction.
  Feed relevant titles to Agent 3 (Black Desk) and Agent 4 (Adversarial Challenge).
- Filter for: articles about city government, quoted officials, referenced
  government documents, specific policy claims with attribution
- Discard: ads, subscription walls, comment sections, opinion columns without sourcing
- Flag any story that doesn't already have a Tier A source attached
- Mark as "LEAD — needs Tier A corroboration"

### Step 4: Scan Tier C Sources (Signals Only)

For each Tier C source. First attempt with `allowed_domains` from the source registry.
If a domain is blocked, apply Blocked Source Intelligence Protocol (Section 7):
extract signal intelligence from titles/snippets, then search for those claims
through accessible channels.

- Search Reddit/community forums for recent civic discussion
- `allowed_domains`: community platform domains from source registry
- **If blocked:** extract post titles and snippets from search results.
  Each substantive civic claim becomes a follow-up search target. Feed to
  Agent 3 (Black Desk) as signal intelligence.
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

*** SOURCE ACCESS LIMITATIONS ***
{If ANY Tier B or C sources were blocked by crawl policies:}
WARNING: {N} Tier B and/or {N} Tier C sources had content blocked by
crawl policies. Blocked: {list of blocked domains}.

BLOCKED SOURCE INTELLIGENCE EXTRACTED:
{For each blocked domain that returned search results with titles/snippets:}
  {domain}: {N} results found — titles and dates extracted as lead intelligence
  - "{title}" ({date}) → fed to Agent 3/4 as {lead type}
  - "{title}" ({date}) → follow-up search: {unrestricted query run}

MANUAL REVIEW STILL REQUIRED:
  - [ ] Check {newspaper} for full text of blocked headlines above
  - [ ] Check {community forum} for community reaction
  - [ ] Cross-reference blocked source claims against Tier A findings
  - [ ] Flag any story where blocked sources are the primary coverage provider
*** END LIMITATIONS ***

PRIORITY LEADS (Tier A grounded):
  1. [A] {headline}
     Source: {specific document/meeting}
     URL: {link}
     Confidence: HIGH
     Beat: {NEW | RECURRING — appearance #{N}, last seen {date}, score trend {X→Y}}
     Action: Ready for expansion

  2. [A] {headline}
     Source: {specific document/meeting}
     URL: {link}
     Confidence: HIGH
     Beat: {NEW | RECURRING — ...}
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
Scanner: Civic Source Scanner v1.9
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
  Beat:      {NEW | RECURRING — appearance #{N}, score trend: {12→13→14}}
  Decision:  {why this advances, holds, or gets demoted}
```

**Beat memory influence on scoring:**
- A RECURRING story with a rising score trend gets a brief note on what changed
- A RECURRING story with a flat or falling score trend should be scrutinized —
  is this still news, or is the pipeline just re-surfacing old leads?
- Novelty score should DECREASE for recurring stories unless new facts emerged
  (a story that was novel 4 runs ago is no longer novel unless something changed)

**Reporter Task Memo** — For every story that scores ADVANCE, produce:
```
REPORTER TASK MEMO:
  Confirmed: {what Tier A grounding exists — specific documents}
  Missing:   {gaps that prevent publication-ready status}
  Calls:     {who needs to be called — names, titles, organizations}
  Documents: {specific CORA requests or records to pull}
  Falsify:   {what evidence would kill this story}
```

**Visual Direction Brief** — For every advancing story, produce a structured
specification that a photographer, graphic designer, or map-maker can execute:

```
VISUAL DIRECTION:
  Primary visual: {MAP | PHOTO | CHART | INFOGRAPHIC | DIAGRAM | DOCUMENT}

  If MAP:
    Area: {geographic bounds — e.g., "Longmont northern corridor along Hwy 66"}
    Show: {what to highlight — parcels, zones, infrastructure, project sites}
    Overlay: {data layers — zoning colors, affected properties, transit routes}
    Source for boundaries: {GIS portal URL, parcel data, city maps}

  If PHOTO:
    Subject: {what to photograph — building, site, meeting, person, infrastructure}
    Location: {specific address or intersection}
    Timing: {time of day, season, before/after construction, during meeting}
    What it should convey: {scale, condition, activity, contrast}
    Backup: {Google Street View screenshot, aerial via city GIS, file photo option}

  If CHART:
    Type: {bar, line, comparison table, timeline, pie}
    Data: {specific numbers with sources — e.g., "water rates 2022-2028 from rate schedule"}
    X-axis: {time, categories, jurisdictions}
    Y-axis: {dollars, units, percentages}
    Key comparison: {what the viewer should see — trend, gap, spike, contrast}

  If INFOGRAPHIC:
    Concept: {what the graphic explains — e.g., "how ranked choice voting works"}
    Key elements: {numbered steps, before/after, funding breakdown, process flow}
    Data points: {specific numbers to include with sources}
    Target audience: {general public, policy wonks, neighborhood residents}

  If DIAGRAM:
    Subject: {process flow, organizational structure, timeline, decision tree}
    Elements: {boxes, arrows, decision points, milestones}
    Key message: {what the diagram makes clear that text alone doesn't}

  If DOCUMENT:
    What: {screenshot or excerpt of a specific official document}
    Source: {exact URL or CORA request reference}
    Highlight: {which section, figure, or paragraph to call attention to}

  Secondary visuals: {additional visual assets if the story warrants more than one}

  Mobile considerations: {will this render on a phone screen? simplify if needed}

  Generation Prompt: {ready-to-paste prompt for AI visual generation tools}
    For CHART/INFOGRAPHIC/DIAGRAM: a prompt for Claude Artifacts, Canva AI,
      or a charting library (Python matplotlib/plotly, D3.js) that includes
      the exact data, labels, colors, and layout specifications
    For MAP: a prompt describing the geographic view, overlays, labels, and
      style — usable with Mapbox, Google Maps styling, or AI map generators
    For PHOTO: a prompt for DALL-E/Midjourney describing the scene, angle,
      lighting, and mood — clearly labeled as "AI-generated illustration,
      not a photograph" (never present AI images as real photos)
    For DOCUMENT: not applicable — use the actual document screenshot

  **Generation Prompt rules:**
  - Always label AI-generated visuals as illustrations, not photographs
  - Charts/infographics must use the exact data from the story — never
    approximate or fabricate numbers for the visual
  - Map prompts should specify a clean, journalistic style — no decorative
    elements, clear labels, high contrast
  - Photo-style prompts must include "editorial illustration" or "conceptual
    illustration" in the prompt — never generate images that could be mistaken
    for real photojournalism
  - Include both a "simple" version (for quick generation) and a "detailed"
    version (for higher-quality output) when practical
```

**Rules for visual direction:**
- Every visual must reference a specific, verifiable source for its data
- Maps must cite the GIS portal or data source for boundary/parcel information
- Charts must include the exact numbers and their Tier A source
- Photos should suggest both an ideal shot and a backup option (Street View,
  aerial, file photo) for newsrooms without a photographer
- Never suggest staging, re-enacting, or fabricating a visual
- Flag if the visual requires access to a location (private property, restricted area)

The Reporter Task Memo and Visual Direction Brief travel with the story through
the entire pipeline and appear in the final report. They transform the output
from polished copy into reporter-guiding intelligence.

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

### Agent 4: Dark Signal Desk (Adversarial Challenge)

**One job: Find reasons NOT to publish. One kill condition: If the counter-narrative
is more compelling than the story, SUPPRESS it.**

Agent 4 ONLY does adversarial challenge. It does NOT check attribution, balance,
sourcing completeness, or plagiarism — those belong to Agents 5 and 8.

For each advancing story AND each Black Desk signal:
- If beat memory contains a prior run's verification for this thread, load it:
  "Last run's severity was {AMBER}. Counter-narrative was: {text}. Has anything
  changed that strengthens or weakens the counter-narrative?"
- Run the 4-gate adversarial verification (see Mandatory Controls above)
- For Gates 1-2 (Contestation + Adverse Search): use Dynamic Search Filtering
  Protocol (Section 6) with VERIFICATION criteria — no domain restriction
  (cast wide net for counter-evidence), keep contradictory evidence and
  dissenting viewpoints, discard SEO farms and AI-generated summaries
- Gate 3: Write the strongest possible counter-narrative. If this is a recurring
  thread, note whether the counter-narrative has evolved since last run.
- Gate 4: Flag self-referential stories for extra scrutiny

**Output per story — use severity coding:**
- **VERIFIED** (green) — counter-narrative exists but story withstands it
- **CONTESTED** (amber) — counter-narrative is substantial; both sides MUST appear
- **UNVERIFIABLE** (gray) — insufficient evidence to confirm or deny; HOLD
- **SUPPRESSED** (red) — counter-narrative is more compelling; KILL

**Kill condition:** If Gate 3 counter-narrative is more compelling than the story
AND the story cannot be reframed to account for it → SUPPRESS (red).

Contested stories get AMBER severity — not green. A contested story that passes
is still contested; the report must show that.

### Agent 5: Completeness Auditor

**One job: Is the story complete, balanced, and properly attributed? One kill
condition: If any factual claim has no Tier A source, KILL it.**

Agent 5 ONLY checks completeness. It does NOT re-challenge the story (that was
Agent 4) or check plagiarism/source hygiene (that's Agent 8).

For each story passing Agent 4:

1. **Attribution completeness** — Every factual claim attributed to a specific
   document? Any orphaned sentences making claims without a source?
   - KILL if any factual claim has zero Tier A attribution
2. **Balance check** — Are opposing viewpoints included where Agent 4 found
   contestation? Missing perspectives noted?
3. **Harm assessment** — Could this story cause undue harm? Privacy concerns?
   Name any private individuals who might be affected.
4. **Legal risk flag** — Defamation exposure? SLAPP potential? Flag for Agent 6
   if risk is MEDIUM or above.

**Output per story — use severity coding:**
- **PUBLISH** (green) — all checks pass, no gaps
- **REVISE** (amber) — fixable gaps: missing attribution, incomplete balance
- **HOLD** (gray) — structural problem: key facts unattributable, major perspective missing
- **KILL** (red) — unfixable: orphaned claims, harm risk, legal exposure

**Kill condition:** Any factual claim with zero Tier A attribution → KILL.

### Agent 6: First Amendment Counsel
For stories flagged with legal risk (MEDIUM+) by Agent 5:
- Classify the threat type (prior restraint, defamation, SLAPP, public records denial)
- Apply relevant doctrine (fair report privilege, actual malice standard, anti-SLAPP statutes)
- Provide risk assessment: LOW / MEDIUM / HIGH
- Recommend: proceed / modify / consult attorney / CORA request
- NOTE: This is guidance, NOT legal advice. Always consult a real attorney for high-risk stories.

For stories with LOW legal risk: brief confirmation of applicable doctrine.
Do NOT simply rubber-stamp every story as "LOW — fair report privilege."
If the story synthesizes patterns, implies motivations, or extrapolates political
consequences beyond what the filing says, the legal risk rises. Be honest.

### Agent 7: Plain-Language Translator
For stories passing Agent 5:
- Rewrite government jargon into plain language
- Target reading level: 8th grade
- Preserve accuracy — simplify language, not content
- Flag any simplification that might distort meaning
- NOTE: These are public-facing summaries for newsletters and social media.
  They are NOT the primary story output. See Product Identity section above.

### Agent 7.5: Distribution Packager

For each publishable story, generate platform-ready distribution assets.
These are formatted outputs ready for direct use — not additional reporting.

**Per story, produce:**

1. **SEO Package**
   - SEO headline (60 chars max, front-loaded with keywords)
   - Meta description (155 chars max, includes city name and key fact)
   - 5-8 SEO keywords (comma-separated, mix of specific and category terms)
   - Suggested URL slug (lowercase, hyphens, no stop words)

2. **Social Media Headlines** (one per platform)
   - **Twitter/X** (280 chars max): punchy, conversational, includes the hook.
     No hashtags in the text — list 3-5 hashtags separately.
   - **Facebook** (2-3 sentences): slightly longer, context-setting, question
     or call-to-action at the end
   - **LinkedIn** (professional tone): policy-focused framing, implications
     for business/civic professionals
   - **Nextdoor** (neighborhood tone): "Here's what this means for your
     neighborhood" framing, hyperlocal angle

3. **Newsletter Brief** (50-75 words)
   - Standalone summary that works in an email newsletter without clicking
     through. Includes: what happened, why it matters, what's next.
   - Ends with a one-line "What to watch" forward-looking hook.

4. **Email Subject Line Options** (3 variations)
   - Informational: "{City}: {what happened}"
   - Curiosity: "Why {surprising fact} matters for {city}"
   - Action: "{What residents should know} about {topic}"

**Output format per story:**
```
DISTRIBUTION PACKAGE: {story headline}

SEO:
  Headline: {60 chars}
  Meta: {155 chars}
  Keywords: {keyword1, keyword2, keyword3, ...}
  Slug: {url-slug}

SOCIAL:
  Twitter/X: {280 chars}
  Hashtags: #{City} #{Topic} #{State} ...
  Facebook: {2-3 sentences}
  LinkedIn: {professional framing}
  Nextdoor: {neighborhood framing}

NEWSLETTER:
  {50-75 word standalone summary + "What to watch" hook}

EMAIL SUBJECTS:
  1. {informational}
  2. {curiosity}
  3. {action}
```

**Rules:**
- Never fabricate facts for engagement — every claim in distribution copy
  must appear in the verified story
- Social headlines must be defensible — no clickbait, no misleading framing
- SEO keywords must reflect actual story content, not aspirational traffic
- Newsletter briefs must stand alone — a reader who only sees the brief
  should understand the story correctly
- De-escalation controls (Section 4) apply to all distribution copy

### Agent 8: Source Hygiene + Headline Audit

**One job: Ensure no contaminated sources and no packaging errors. One kill
condition: If Tier C content leaked into attribution, KILL the story.**

Agent 8 ONLY checks source hygiene and packaging safety. It does NOT re-verify
the adversarial challenge (Agent 4) or re-audit completeness (Agent 5).

**Source hygiene:**
- Verify no Tier C sources leaked into attribution (source laundering check)
- Verify the story doesn't closely paraphrase any single source (plagiarism check)
- Confirm the suppression ledger is updated for any killed/held stories

**Kill condition:** If Tier C content is cited, quoted, or attributed → KILL.

**Beat Memory Update (unless --no-memory):**
After all stories have been processed, update the beat memory:
1. For each story in this run, find or create a thread in the memory
2. Update: lastSeen, appearances count, statusHistory (append this run's status
   and score), severityHistory (append this run's severity)
3. Add keyChanges entry if the story's facts changed since the prior run
4. For suppressed stories: add to suppressionLedger with reopenTrigger
5. For reopened stories: mark `reopened: true` with the date and reason
6. Update sourcePerformance counters for each Tier A source used
7. Archive any threads with no activity for 90+ days to
   `references/{city}-beat-memory-archive.json`
8. Write updated memory to `references/{city}-beat-memory.json`

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

### Full Pipeline Output

The output is structured in two sections for editorial consumption:

**SECTION A: EDITORIAL DASHBOARD (2-3 pages)**
What the editor reads at the morning meeting.

```
=== Civic Reporting Package: {City} ===
Date: {today}
Pipeline: Full (9+ agents) | Scanner: v1.4

PIPELINE STATS:
  Stories scanned:   {N}
  Stories advanced:  {N}  ← passed Newsworthiness Gate (≥10/20)
  Stories killed:    {N}  ← killed by Gate or Agents 4/5/8
  Stories held:      {N}  ← below threshold or awaiting documents
  Stories suppressed: {N}  ← counter-narrative more compelling (Agent 4)

BEAT CONTEXT:
  Run #{N} for {city}. Last run: {date}. Active threads: {N}.
  Recurring stories: {N} | New stories: {N}
  Suppression triggers checked: {N} ({N} still closed, {N} may be met)

*** SOURCE ACCESS LIMITATIONS ***
{If ANY sources were blocked, display warning banner with manual review
checklist — same format as daily-scan output above.}
*** END WARNING ***

PUBLISHABLE STORIES:
  1. {headline}
     Severity: {GREEN / AMBER}
     Newsworthiness: {score}/20
     Beat: {NEW | RECURRING — appearance #{N}, score trend {X→Y→Z}, severity trend}
     Sources: {N Tier A, N Tier B context}
     Headline audit: {PASSED / CORRECTED}
     Legal risk: {LOW / MEDIUM / HIGH}
     [Reporter Task Memo — Confirmed / Missing / Calls / Docs / Falsify]
     [Visual Direction Brief — primary visual type + specifications]
     [Distribution Package — SEO / Social / Newsletter / Email Subjects]

  2. {headline}
     ...

STORIES KILLED:
  - {headline}: {which agent killed it} — {reason}
    Score: {N}/20 | Severity: RED

STORIES ON HOLD:
  - {headline}: {reason} | Severity: GRAY
    What would elevate: {specific trigger}

SUPPRESSION LEDGER:
  - {entry per suppressed story} | Severity: RED

SIGNALS UNDER INVESTIGATION:
  - {active signal with investigation status}
```

**SECTION B: VERIFICATION APPENDIX (remaining pages)**
What the editor references when questioned. Contains the full, unabridged
output of every agent — complete story drafts, gate tables with full
counter-narratives, audit results, plain-language rewrites.

**Severity Coding (used throughout):**
- **GREEN** — clean pass, no caveats, ready for reporter follow-up
- **AMBER** — passed with caveats: contested (both sides required), framing
  adjusted, status verb corrected, or missing voices noted
- **RED** — killed: counter-narrative more compelling (Agent 4), unattributable
  claims (Agent 5), Tier C contamination (Agent 8), or newsworthiness below 7/20
- **GRAY** — held: insufficient sourcing, awaiting documents, below newsworthiness
  threshold (7-9/20), or pending Tier A records

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

## Mode 6: Discover

Automatically build a source registry for any US municipality. Run this before
your first scan in a new city.

### Input
User provides: `{city name}, {state}` (e.g., "Boulder, Colorado" or "Asheville, North Carolina")

### Process

**Step 1: Identify Government Structure**
Search for the city's official government website and determine:
- Government type (council-manager, mayor-council, commission, etc.)
- Council/board size and structure (wards, at-large, districts)
- County jurisdiction(s)
- Population (approximate)
- State open records law name (CORA, FOIA, OPRA, etc.)

**Step 2: Find Tier A Sources**
Search systematically for each category:

1. **Agenda portal** — search: `"{city}" council agenda site:.gov OR site:primegov.com
   OR site:granicus.com OR site:legistar.com OR site:municode.com`
   - Identify the portal system (PrimeGov, Granicus, Legistar, Municode, custom)
   - Record the URL and meeting schedule

2. **Official YouTube/video** — search: `"{city}" city council meeting site:youtube.com`
   - Find the official government channel
   - Note if auto-transcripts are available

3. **City clerk / public records** — search: `"{city}" city clerk public records request`
   - Find the records request portal or contact

4. **Budget documents** — search: `"{city}" adopted budget {current year} site:.gov`

5. **Building permits / planning** — search: `"{city}" building permits planning
   development applications site:.gov`

6. **Municipal code** — search: `"{city}" municipal code site:municode.com
   OR site:codepublishing.com OR site:ecode360.com`

7. **School district** — search: `"{city}" school district board of education meetings`
   - Identify the district name, board meeting schedule, and agenda URL

8. **County government** — search: `"{county}" county commissioners board supervisors
   agenda site:.gov`

9. **Special districts** — search: `"{city}" water district transit authority
   fire district library district`

**Step 3: Find Tier B Sources**
Search for institutional news coverage:

1. **Local newspaper** — search: `"{city}" local newspaper daily weekly`
   - Identify the primary and secondary local papers
   - Check if they have a government/city hall beat

2. **Regional newspaper** — search: `"{city}" "{state}" regional newspaper`

3. **Statewide investigative** — search: `"{state}" investigative journalism nonprofit`

4. **Local public radio** — search: `"{city}" public radio NPR affiliate`

5. **Chamber of commerce** — search: `"{city}" chamber of commerce`

6. **Economic development** — search: `"{city}" economic development office`

**Step 4: Find Tier C Sources**
Search for community signal platforms:

1. **Reddit** — search: `site:reddit.com r/{city}` or `site:reddit.com "{city}" "{state}"`
2. **Nextdoor** — note: typically `nextdoor.com/city/{city}--{state}`
3. **Facebook groups** — search: `"{city}" community group site:facebook.com`
4. **Local hashtags** — identify: `#{CityName}` `#{CityName}{State abbreviation}`

**Step 5: Build Meeting Calendar**
For each government body found, record:
- Body name
- Meeting day and time
- Frequency (weekly, bimonthly, monthly, etc.)
- Location

**Step 6: Identify Open Records Law**
Search for the state's public records act:
- Statute citation
- Response deadline
- Fee structure
- Common exemptions
- Appeal process

### Output

Generate a complete source registry file in the same format as
`references/longmont-sources.md`. Save as `references/{city-name}-sources.md`.

```
=== City Discovery Report: {City, State} ===

Government Structure:
  Type: {council-manager / mayor-council / etc.}
  Council: {size, structure}
  County: {name(s)}
  Population: {approximate}

Source Registry Generated:
  Tier A: {N} sources found
  Tier B: {N} sources found
  Tier C: {N} sources found
  Meeting bodies: {N} calendars mapped

Registry saved to: references/{city-name}-sources.md

Ready to scan. Run:
  /civic-scanner daily-scan --city {city-name}
```

### Discovery Gotchas

- **Small towns** may not have PrimeGov/Granicus portals. Look for PDF agendas
  posted on the city website. Some post agendas only to Facebook.
- **Consolidated city-county governments** (Nashville, Jacksonville, etc.) have
  different structures. Adjust the registry accordingly.
- **Independent cities** (Virginia) are not in counties. Skip county sources.
- **Township/borough systems** (Pennsylvania, New Jersey) have different
  terminology. Search for "township committee" or "borough council."
- **Multiple school districts** may serve one city. Map all that overlap.
- **Spanish-language sources** may be relevant in some communities. Check for
  Spanish-language community forums, newspapers, and radio.
- **Verify every URL** found during discovery by checking that it loads and
  contains current (not archived) content. Dead URLs are common for small
  government sites.

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

**To scan a new city (recommended):**
1. Run `/civic-scanner discover {city}, {state}`
2. The discover mode automatically builds a source registry
3. Review and verify the generated `references/{city-name}-sources.md`
4. Run `/civic-scanner daily-scan --city {city-name}`

**Manual setup (alternative):**
1. Copy `references/source-template.md`
2. Fill in your city's sources, portal URLs, meeting schedules
3. Save as `references/{city-name}-sources.md`
4. Invoke: `/civic-scanner daily-scan --city {city-name}`

Or provide sources inline when prompted.

---

## Community Engagement Framework

The pipeline doesn't just produce stories — it maintains a feedback loop with
the community it serves. This framework structures how the newsroom receives
input, handles corrections, and builds trust over time.

### Reader Tip Intake

Every published story and newsletter should include a structured tip pathway.
The pipeline generates a **tip prompt** per story:

```
TIP PROMPT: {story headline}
  "Know more about this story? Have documents, meeting notes, or
  firsthand experience? Contact us:
    Email: {newsroom tip email}
    Signal: {encrypted channel if available}
    Anonymous: {anonymous tip form URL}
  What we're looking for:
    - {specific gap from Reporter Task Memo "Missing" field}
    - {specific document from "Documents" field}
    - {specific perspective from "Calls" field that wasn't reached}
  Your tips are confidential. We verify everything independently."
```

The tip prompt is generated from the Reporter Task Memo — it tells readers
exactly what the newsroom still needs, not just a generic "send us tips."

### Correction Mechanism

When a published story requires correction:

```
CORRECTION ENTRY:
  Story: {headline}
  Date Published: {date}
  Date Corrected: {date}
  Error: {what was wrong — specific claim}
  Correction: {what the correct information is}
  Source: {Tier A source for the correction}
  How Caught: {reader tip | editor review | subsequent scan | source update}
  Impact: {did this change the story's conclusion or severity?}
  Beat Memory Update: {thread ID updated with correction note}
```

Corrections are:
- Logged in `references/{city}-corrections.json` (persistent across runs)
- Noted in the beat memory thread for the affected story
- Flagged in the next pipeline run's Beat Context Brief:
  "CORRECTION ISSUED: {story} on {date} — {what changed}"

### Trust Indicators

Each pipeline report includes a **Trust Dashboard** at the bottom of Section A:

```
TRUST DASHBOARD:
  Total stories published (all runs): {N}
  Corrections issued: {N} ({percentage})
  Stories killed by pipeline: {N}
  Stories suppressed (counter-narrative won): {N}
  Suppression triggers reopened: {N}
  Average newsworthiness score of published stories: {X}/20
  Tier A source coverage: {percentage of claims with Tier A grounding}
```

The trust dashboard demonstrates the pipeline's editorial rigor to readers,
sources, and stakeholders. A newsroom that publishes its correction rate and
kill count builds credibility.

### Community Feedback Loop

After each pipeline run, the framework generates a **Community Pulse Check**
based on what was found in Tier C signals (or blocked source intelligence):

```
COMMUNITY PULSE:
  Topics the community is discussing (from Tier C signals):
    - {topic 1} — {engagement level: high/medium/low}
    - {topic 2} — {engagement level}
  Topics we're covering that the community ISN'T discussing:
    - {story with no Tier C signal} — consider: is this actually relevant
      to residents, or only to government insiders?
  Topics the community IS discussing that we're NOT covering:
    - {Tier C signal with no matching Tier A lead} — investigate or explain
      why this isn't a story
  Gap analysis: {are we covering what matters to residents, or what
    government publishes?}
```

The community pulse check prevents the pipeline from becoming an echo chamber
of government press releases. It forces the question: "Is what we're covering
what residents actually care about?"

### Engagement Rules

- Never reveal Tier C sources or platforms by name in published content
- Tip prompts must include an anonymous option
- Corrections are published with the same prominence as the original error
- The trust dashboard is public — don't hide the kill count or correction rate
- Community pulse topics from Tier C are SIGNALS, not stories — they follow
  all existing Tier C handling rules (never cited, never quoted)

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

The report is structured in two sections:

### SECTION A: Editorial Dashboard (first 2-3 pages)

What the editor reads at the morning meeting. Quick decisions, no scrolling.

**Title Page:**
- "CIVIC SOURCE SCANNER — Full Pipeline Report"
- City name, date, pipeline mode, version number
- Pipeline stats banner: stories scanned / advanced / killed / held / suppressed
- Sources checked per tier
- Dynamic filtering protocol note

**Beat Context (if beat memory loaded):**
- Run number, last run date, active thread count
- Recurring vs new story counts
- Thread watch list: stories with rising/falling score trends
- Suppression trigger status: which suppressed stories had triggers checked,
  which triggers may have been met
- Source performance summary: top-producing Tier A sources

**Source Access Limitations + Blocked Source Intelligence (if applicable):**
- Red-bordered section listing blocked Tier B/C domains
- Blocked source intelligence extracted: titles, dates, lead type, follow-up actions
- Which agents received the lead intelligence (Agent 3, Agent 4)
- Manual review checklist for items requiring human follow-up
- This appears immediately after the title page

**Dashboard: Publishable Stories**
- Each story includes Beat field: NEW or RECURRING with appearance count and
  score/severity trends
- Summary table: headline, severity (GREEN/AMBER), newsworthiness score,
  sources, headline audit status, legal risk, verdict
- Reporter Task Memo for each story (Confirmed / Missing / Calls / Docs / Falsify)
- Visual Direction Brief for each story (primary visual type, specifications,
  data sources, mobile considerations) — this is the most actionable section
- Severity coding applied: GREEN = clean pass, AMBER = contested or corrected

**Dashboard: Killed Stories**
- Table: headline, which agent killed it, reason, severity RED

**Dashboard: Holds**
- Table: headline, reason, what would elevate, severity GRAY

**Dashboard: Signals Under Investigation**
- Bulleted list with investigation questions and action items

**Dashboard: Community Engagement**
- Tip prompts per story (generated from Reporter Task Memo gaps)
- Community Pulse Check (what community discusses vs what we cover)
- Trust Dashboard (total published, corrections, kills, average score)

### SECTION B: Verification Appendix (remaining pages)

Full details for editorial reference. Page breaks between major sections.

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

**Agent 3 (Black Desk):**
- Each speculative signal with full context
- Confidence rating, speculative angle, and investigation questions
- Note that Black Desk output is never publishable

**Agent 4 (Adversarial Challenge):**
- Complete 4-gate verification for each story:
  - Gate 1: Contestation details with specific opposing viewpoints found
  - Gate 2: Full adverse search results — what counter-evidence was found
  - Gate 3: Complete counter-narrative written out (the strongest opposing argument)
  - Gate 4: Self-referential flag status
- Severity-coded verdict per story (GREEN/AMBER/RED/GRAY)

**Agent 5 (Completeness Auditor):**
- Individual audit for each story (attribution, balance, harm, legal flag)
- Detailed notes for each audit item
- Severity-coded verdict: PUBLISH (green) / REVISE (amber) / HOLD (gray) / KILL (red)

**Agent 6 (First Amendment Counsel):**
- Threat analysis: defamation, SLAPP, prior restraint, source protection
- Risk assessment per story — honest, not rubber-stamped
- Recommendation and disclaimer

**Agent 7 (Plain-Language Translator):**
- Complete plain-language rewrite of each publishable story
- Full text at 8th grade reading level
- Note: Public-facing summaries for newsletters/social, not primary output

**Agent 7.5 (Distribution Packager):**
- Per story: SEO package (headline, meta, keywords, slug), social media
  headlines (Twitter/X, Facebook, LinkedIn, Nextdoor), newsletter brief
  (50-75 words standalone), email subject line options (3 variations)
- All distribution copy verified against story facts — no clickbait

**Agent 8 (Source Hygiene + Headline Audit):**
- Source hygiene: Tier C contamination check, plagiarism check
- Headline/status audit: every headline verb validated against body
- Any state-change drift errors flagged and corrected
- Suppression ledger status

**Agent 9 (Story Research & Writing):**
- Additional research findings if any, or note that no deep-dive was needed
- Leads held for future scans

**Suppression Ledger:**
- Full entries for any killed/held stories with reopen triggers

**Dynamic Search Filtering Notes:**
- Which domains worked, which were blocked, fallbacks applied

### Formatting Requirements

- US Letter page size (8.5" x 11"), 1" margins
- Header: skill name, version, city, date
- Footer: page numbers, "CONFIDENTIAL — For Editorial Review Only"
- Section A: compact, table-heavy, designed for fast scanning
- Section B: detailed, page breaks between agents
- Tables with alternating row shading for readability
- **Severity color coding throughout:**
  - GREEN (#2E7D32) — PASS / PUBLISH / ADVANCE / VERIFIED
  - AMBER (#D4760A) — CONTESTED / REVISE / HOLD (7-9) / CORRECTED
  - RED (#C62828) — KILL / SUPPRESS / FAIL
  - GRAY (#757575) — HOLD (awaiting docs) / UNVERIFIABLE
- Bullet lists using proper list formatting (not unicode characters)
- Source citations in italic gray below each story
- Use `docx` npm package (install locally if needed) via a Node.js build script

### Build Process

1. Generate a temporary Node.js script that builds the .docx using the `docx` package
2. Run the script to produce the report file
3. Delete the build script after successful generation
4. Confirm file size and location to the user
