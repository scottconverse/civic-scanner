# Civic Source Scanner

## Overview

A Claude Code skill that produces **verified research scaffolding** for civic newsrooms. Scans public records, generates verified story leads, runs adversarial verification, and produces reporter task memos. Self-configuring for any US municipality via discovery mode.

## Product Identity

This system produces **research scaffolding, not published stories.** Publication requires human reporting on top: quotes, scene, voice, and editorial judgment.

## 6 Modes

| Mode | What It Does | When to Use |
|------|-------------|-------------|
| `daily-scan` | Scan sources, produce prioritized lead list | Every morning |
| `full-pipeline` | 9+ agent pipeline with task memos | Producing verified story packages |
| `verify-only` | Adversarial verification of a claim | Fact-checking a specific story |
| `research` | Deep-dive on a topic | Investigating a lead |
| `legal-threat` | First Amendment counsel triage | Records denial, legal threats |
| `discover` | Build source registry for any US city | First time in a new city |

## Agent Pipeline (Full Mode)

1. **News Aggregator** — scan sources, 15-25 raw leads
2. **Story Expansion** — draft leads into 400-800 word research scaffolding
2.5. **Newsworthiness Gate** — score Immediacy/Impact/Conflict/Novelty; can KILL/DEMOTE; produces Reporter Task Memos
3. **Black Desk** — speculative signal hunting (low confidence OK)
4. **Adversarial Challenge** — 4-gate verification; kill condition: counter-narrative more compelling
5. **Completeness Auditor** — attribution, balance, harm; kill condition: unattributable claim
6. **First Amendment Counsel** — honest legal risk assessment
7. **Plain-Language Translator** — 8th grade summaries for newsletters/social
7.5. **Distribution Packager** — SEO, social media headlines, newsletter briefs, email subjects per story
8. **Source Hygiene + Headline Audit** — contamination check + status verb validation; kill condition: Tier C in attribution
9. **Story Research & Writing** — standalone deep-dive

## Core Controls

- **Hard-No-Bluff Rule** — no Tier A source = no publication
- **3-Tier Source Classification** — A (official records), B (leads only), C (signals, never cite)
- **4-Gate Adversarial Verification** — contestation, adverse search, counter-narrative, self-referential
- **Newsworthiness Gate** — 4 dimensions, threshold 10/20, can kill editorially thin stories
- **Reporter Task Memo** — Confirmed, Missing, Calls, Documents, Falsify, Visuals
- **Beat Memory** — persistent story thread tracking across runs with score trends, status history, and suppression trigger monitoring (90-day retention, auto-save, file-backed)
- **Blocked Source Intelligence** — blocked search results become leads, not dead ends
- **City Discovery** — auto-builds source registry for any US municipality
- **Headline/Status Audit** — validates headline verbs against body status
- **Severity Coding** — GREEN/AMBER/RED/GRAY throughout pipeline and report
- **Suppression Ledger** — dead stories with reopen triggers
- **Dynamic Search Filtering** — tier-specific allowed_domains, keep/discard criteria

## Recent Features

### v1.8: Visual Direction Briefs + AI Generation Prompts
Structured visual specifications per story: MAP (area, overlays, GIS source), PHOTO (subject, location, timing, backup option), CHART (type, data with sources, key comparison), INFOGRAPHIC (concept, elements, audience), DIAGRAM (process flow, decision tree), DOCUMENT (screenshot/excerpt with highlight). Every visual cites a verifiable data source. Backup options provided for newsrooms without photographers. Each visual includes a **Generation Prompt** — ready-to-paste prompts for AI tools (Claude Artifacts, DALL-E, Midjourney, matplotlib/plotly, Canva AI) in both simple and detailed versions. AI-generated visuals always labeled as illustrations, never presented as photographs.

### v1.7: Distribution Packager (Agent 7.5)
Per-story distribution assets: SEO package (headline, meta description, keywords, URL slug), social media headlines for Twitter/X, Facebook, LinkedIn, and Nextdoor, newsletter brief (50-75 words standalone), and 3 email subject line variations. All copy verified against story facts — no clickbait, de-escalation controls enforced.

### v1.6: Beat Memory (Section 8)
Persistent story thread tracking across runs. Loaded into working context at pipeline start, updated and saved to disk at end. Tracks per-thread: headline, appearances, status/score/severity history, key changes, suppression triggers. Per-source: leads generated, stories advanced. 90-day retention with archival. Auto-save with `--no-memory` opt-out. Agents 2.5 and 4 reference prior run data for score trends and counter-narrative evolution.

### v1.5: Blocked Source Intelligence (Section 7)
Blocked search results become leads, not dead ends. Titles/snippets/dates extracted and fed to Black Desk and Adversarial Challenge as targeted follow-up searches.

### v1.5: City Discovery Mode (Mode 6)
`/civic-scanner discover {city}, {state}` auto-builds a source registry for any US municipality.

## Report Structure

**Section A: Editorial Dashboard** (2-3 pages) — verdicts, memos, holds, signals. Fast decisions.

**Section B: Verification Appendix** — full agent output for reference. Complete counter-narratives, gate tables, audit results, story drafts, plain-language rewrites.

## Files

```
civic-scanner/
  SKILL.md                              Main skill (6 modes, 9+ agents)
  references/longmont-sources.md        Pre-loaded Longmont source registry
  references/source-template.md         Blank template for any city
  civic-scanner.md                      This file
  RELEASE_NOTES.md                      Version history
  references/{city}-beat-memory.json    Beat memory (created at runtime)
  civic-scannerv1.0/ v1.2-v1.5/         Archived versions
```

## Key Gotchas

1. **Hard-No-Bluff is absolute** — no Tier A = no publish
2. **Adversarial completeness required** — finding evidence AGAINST is the value
3. **Self-referential warning** — AI/journalism/tech stories trigger confirmation bias
4. **YouTube transcripts have errors** — Tier A for content, verify individual quotes
5. **Astroturf detection** — manufactured pressure looks organic at Tier C
6. **SLAPP suit risk** — development/land use stories may trigger strategic lawsuits
7. **Source laundering** — Tier C through Tier B doesn't become Tier B
8. **Headline state-drift** — packaging can convert "proposed" to "approved"
9. **Newsworthiness ≠ sourcing** — well-sourced can still be editorially thin
10. **Blocked ≠ absent** — blocked search results contain lead intelligence in titles/snippets
11. **Discovery ≠ verification** — discovered URLs must be verified as current and active
12. **This is scaffolding, not journalism** — publication requires human reporting
13. **Recurring ≠ still newsworthy** — a story appearing for the 4th time with no new facts should lose Novelty score
14. **Beat memory is context, not commitment** — thread matching can be wrong; create new threads rather than false-matching
