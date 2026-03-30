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
8. **Source Hygiene + Headline Audit** — contamination check + status verb validation; kill condition: Tier C in attribution
9. **Story Research & Writing** — standalone deep-dive

## Core Controls

- **Hard-No-Bluff Rule** — no Tier A source = no publication
- **3-Tier Source Classification** — A (official records), B (leads only), C (signals, never cite)
- **4-Gate Adversarial Verification** — contestation, adverse search, counter-narrative, self-referential
- **Newsworthiness Gate** — 4 dimensions, threshold 10/20, can kill editorially thin stories
- **Reporter Task Memo** — Confirmed, Missing, Calls, Documents, Falsify, Visuals
- **Blocked Source Intelligence** — blocked search results become leads, not dead ends
- **City Discovery** — auto-builds source registry for any US municipality
- **Headline/Status Audit** — validates headline verbs against body status
- **Severity Coding** — GREEN/AMBER/RED/GRAY throughout pipeline and report
- **Suppression Ledger** — dead stories with reopen triggers
- **Dynamic Search Filtering** — tier-specific allowed_domains, keep/discard criteria

## v1.5 New Features

### Blocked Source Intelligence (Section 7)
When web searches return results from crawl-blocked domains (e.g., newspapers, Reddit), the pipeline **extracts lead intelligence from titles, URLs, snippets, and dates** instead of discarding them. These become:
- Targeted follow-up searches without domain restriction
- Black Desk signal inputs
- Adversarial Challenge search targets
- Reporter Task Memo "Missing" items

A blocked headline is a LEAD, not a dead end.

### City Discovery Mode (Mode 6)
Run `/civic-scanner discover {city}, {state}` to automatically build a source registry. Searches for agenda portals (PrimeGov/Granicus/Legistar), official YouTube, school districts, county government, local newspapers, community forums, meeting schedules, and open records law references. Outputs a ready-to-scan `references/{city-name}-sources.md`.

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
  civic-scannerv1.0/ v1.2/ v1.3/ v1.4/ Archived versions
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
