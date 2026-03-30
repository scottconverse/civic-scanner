# Civic Source Scanner

## Overview

A Claude Code skill that consolidates 30+ civic newsroom prompt variants into one modular, city-agnostic pipeline. Scans public records, generates verified story leads, and produces publishable civic reporting with adversarial verification gates, anti-hallucination controls, and a suppression ledger.

## 5 Modes

| Mode | What It Does | When to Use |
|------|-------------|-------------|
| `daily-scan` | Scan sources, produce prioritized lead list | Every morning |
| `full-pipeline` | 9-agent end-to-end reporting | Producing publishable stories |
| `verify-only` | Adversarial verification of a claim | Fact-checking a specific story |
| `research` | Deep-dive on a topic | Investigating a lead |
| `legal-threat` | First Amendment counsel triage | Records denial, legal threats |

## 9-Agent Pipeline (Full Mode)

1. **News Aggregator** — scan sources, 15-25 raw leads
2. **Story Expansion** — draft leads into 400-800 word stories
3. **Black Desk** — speculative signal hunting (low confidence OK)
4. **Dark Signal Desk** — 4-gate adversarial verification
5. **Integrity Checker** — 5-part post-production audit
6. **First Amendment Counsel** — legal threat triage
7. **Plain-Language Translator** — 8th grade reading level rewrite
8. **Civic Grounding** — anti-plagiarism enforcement
9. **Story Research & Writing** — standalone deep-dive

## Core Controls

- **Hard-No-Bluff Rule** — no Tier A source = no publication, period
- **3-Tier Source Classification** — A (official records), B (leads only), C (signals, never cite)
- **4-Gate Adversarial Verification** — contestation, adverse search, counter-narrative, self-referential warning
- **Suppression Ledger** — dead stories documented with reopen triggers
- **De-Escalation** — calibrated language, fact/interpretation/allegation separation

## City Configuration

Default: Longmont, Colorado (full source registry included).
Adapt to any city using the blank `source-template.md`.

## Files

```
civic-scanner/
  SKILL.md                              Main skill (5 modes, 9 agents)
  references/longmont-sources.md        Pre-loaded Longmont source registry
  references/source-template.md         Blank template for any city
  civic-scanner.md                      This file
  RELEASE_NOTES.md                      Version history
```

## Key Gotchas

1. **Hard-No-Bluff is absolute** — AI confidently hallucinates civic facts; no Tier A = no publish
2. **Adversarial completeness required** — finding evidence FOR is easy; the value is finding evidence AGAINST
3. **Self-referential warning** — AI/journalism/tech stories trigger confirmation bias in AI
4. **YouTube transcripts have errors** — Tier A for content, verify individual quotes
5. **Astroturf detection** — manufactured pressure looks organic at Tier C
6. **SLAPP suit risk** — development/land use stories may trigger strategic lawsuits
7. **Source laundering** — Tier C rumors picked up by Tier B don't become Tier B
8. **Meeting packet chunking** — large agendas must be split for processing
