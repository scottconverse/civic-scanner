# Release Notes — civic-scanner skill

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
