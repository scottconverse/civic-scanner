# Civic Source Scanner

## Overview

A Claude Code skill that produces **verified research scaffolding** for civic newsrooms — not publishable journalism, but the reporter-guiding intelligence that makes publication possible. Scans public records, generates verified story leads, runs adversarial verification, and produces reporter task memos with calls to make, documents to pull, and what would kill each story.

## Product Identity

This system produces **research scaffolding, not published stories.** Agent 2 drafts are reporter backbones. Agent 7 rewrites are newsletter/social summaries. Reporter Task Memos are the most actionable output. Publication requires human reporting on top: quotes, scene, voice, and editorial judgment.

## 5 Modes

| Mode | What It Does | When to Use |
|------|-------------|-------------|
| `daily-scan` | Scan sources, produce prioritized lead list | Every morning |
| `full-pipeline` | 9+ agent pipeline with task memos | Producing verified story packages |
| `verify-only` | Adversarial verification of a claim | Fact-checking a specific story |
| `research` | Deep-dive on a topic | Investigating a lead |
| `legal-threat` | First Amendment counsel triage | Records denial, legal threats |

## Agent Pipeline (Full Mode)

1. **News Aggregator** — scan sources, 15-25 raw leads
2. **Story Expansion** — draft leads into 400-800 word research scaffolding
2.5. **Newsworthiness Gate** — score Immediacy/Impact/Conflict/Novelty; can KILL or DEMOTE; produces Reporter Task Memos
3. **Black Desk** — speculative signal hunting (low confidence OK)
4. **Adversarial Challenge** — 4-gate verification; one job: find reasons NOT to publish. Kill condition: counter-narrative more compelling = SUPPRESS
5. **Completeness Auditor** — attribution, balance, harm, legal flag. Kill condition: unattributable claim = KILL
6. **First Amendment Counsel** — honest legal risk, not rubber-stamped LOW
7. **Plain-Language Translator** — 8th grade summaries for newsletters/social
8. **Source Hygiene + Headline Audit** — Tier C contamination check + status verb validation. Kill condition: Tier C in attribution = KILL
9. **Story Research & Writing** — standalone deep-dive

## Core Controls

- **Hard-No-Bluff Rule** — no Tier A source = no publication, period
- **3-Tier Source Classification** — A (official records), B (leads only), C (signals, never cite)
- **4-Gate Adversarial Verification** — contestation, adverse search, counter-narrative, self-referential warning
- **Newsworthiness Gate** — scores 4 dimensions (1-5 each); threshold 10/20; can kill editorially thin stories
- **Reporter Task Memo** — Confirmed, Missing, Calls, Documents, Falsify, Visuals
- **Headline/Status Audit** — validates headline verbs against body status
- **Source Access Warning** — red banner when Tier B/C sources blocked
- **Suppression Ledger** — dead stories with reopen triggers
- **De-Escalation** — calibrated language
- **Dynamic Search Filtering** — tier-specific allowed_domains, keep/discard criteria
- **Severity Coding** — GREEN (clean pass), AMBER (contested/corrected), RED (killed), GRAY (held)

## Agent Boundaries (v1.4)

Each verification agent has ONE job and ONE kill condition:

| Agent | Job | Kill Condition |
|-------|-----|---------------|
| Agent 4 | Adversarial challenge — find reasons NOT to publish | Counter-narrative more compelling = SUPPRESS |
| Agent 5 | Completeness audit — attribution, balance, harm | Unattributable factual claim = KILL |
| Agent 8 | Source hygiene — contamination, plagiarism, headlines | Tier C in attribution = KILL |

No overlap. No re-checking another agent's domain.

## Report Structure (v1.4)

**Section A: Editorial Dashboard (2-3 pages)** — What the editor reads at the morning meeting. Verdicts, memos, holds, signals. Fast decisions.

**Section B: Verification Appendix** — Full agent output for reference when questioned. Complete counter-narratives, gate tables, audit results, story drafts, plain-language rewrites.

## Files

```
civic-scanner/
  SKILL.md                              Main skill (5 modes, 9+ agents)
  references/longmont-sources.md        Pre-loaded Longmont source registry
  references/source-template.md         Blank template for any city
  civic-scanner.md                      This file
  RELEASE_NOTES.md                      Version history
  civic-scannerv1.0/                    Archived v1.0
  v1.2/                                 Archived v1.2
  v1.3/                                 Archived v1.3
```

## Key Gotchas

1. **Hard-No-Bluff is absolute** — no Tier A = no publish
2. **Adversarial completeness required** — finding evidence AGAINST is the value
3. **Self-referential warning** — AI/journalism/tech stories trigger confirmation bias
4. **YouTube transcripts have errors** — Tier A for content, verify individual quotes
5. **Astroturf detection** — manufactured pressure looks organic at Tier C
6. **SLAPP suit risk** — development/land use stories may trigger strategic lawsuits
7. **Source laundering** — Tier C through Tier B doesn't become Tier B
8. **Meeting packet chunking** — large agendas must be split
9. **Headline state-drift** — packaging can convert "proposed" to "approved"
10. **Newsworthiness ≠ sourcing** — well-sourced can still be editorially thin
11. **Verification theater** — if everything always passes, the gates may be rubber stamps
12. **This is scaffolding, not journalism** — publication requires human reporting on top
