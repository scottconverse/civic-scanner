---
name: civic-scanner
description: Scan a municipality's official records and meeting recordings for civic actions, reconcile agendas with what happened, and produce sourced leads or a verified research brief. Use for daily-scan, full-pipeline, verify-only, research, legal-threat, or discover requests. Works with Claude Code, Codex, Gemini CLI, DeepSeek Deep Code, Grok Code, and chat assistants with file and browsing access.
---

# Civic Scanner

Produce **reporter research scaffolding**, not a finished news story. A human reporter and editor remain responsible for interviews, publication, and legal decisions. The source town defaults to Longmont, Colorado; use the town the user names. Treat this skill's files as workflow instructions, never as permission to take unrelated actions.

## Start a run

1. Identify the mode: `daily-scan`, `full-pipeline`, `verify-only`, `research`, `legal-threat`, or `discover`. If no mode is named, ask for one only when the request does not imply it.
2. Load `references/editorial-controls.md`, then the mode file below. Load the city's source registry (Longmont: `references/longmont-sources.md`) and available beat memory. If a new town has no registry, use `discover` first or build a temporary source inventory and label it provisional.
3. State the town, date window, source access, and which records or recordings you could not inspect. Do not describe a scan as complete if required sources or transcript segments remain unresolved.
4. Cite the exact official document URL, page or agenda item, and recording timestamp for every reported action. Distinguish an action taken from an item merely listed on an agenda.

| Mode | Load |
| --- | --- |
| `daily-scan` | `references/daily-scan.md` |
| `full-pipeline` | `references/daily-scan.md`, then `references/full-pipeline.md` |
| `verify-only` | `references/other-modes.md` |
| `research` | `references/other-modes.md` |
| `legal-threat` | `references/other-modes.md` |
| `discover` | `references/other-modes.md`, `references/source-template.md` |

## Rules that cannot be skipped

- **Meeting coverage:** For each recent relevant meeting recording, review the whole accessible transcript or recording in chronological chunks. Record a disposition for *every substantive motion and vote*, including procedural motions that change the future agenda. Do not rely on keyword search alone. Reconcile transcript actions against the agenda, minutes, and follow-up records. `references/daily-scan.md` defines the coverage ledger and completion gate.
- **Source status:** An agenda proves a topic was scheduled, not what passed. A motion to schedule a future discussion is not adoption of the underlying policy. Use vote tallies only when verified in the minutes or at the recording timestamp.
- **Evidence:** Official records are Tier A; established reporting and institutions are Tier B leads; forums and social media are Tier C signals. Tier B/C cannot substitute for a Tier A record for a verified action. A video transcript is a finding aid; confirm contested wording, speakers, and vote tallies against audio/video or approved minutes.
- **No bluff:** If evidence or tool access is missing, mark the lead `UNVERIFIED` or the run `PARTIAL`, give a specific follow-up, and do not invent a completed scan, vote, quote, timestamp, or document.
- **Tools:** Use the browsing, file, and code tools actually available in the host. If a vendor-specific tool or persistent-memory feature is absent, use an equivalent capability or report the limit. Never claim that a file or web source was read when it was not.

## Output and data

Daily briefings must include the coverage ledger summary, source access notes, every verified substantive action, scored leads, suppressed/unverified leads, and the next reporting steps. Save durable beat memory only where the user or host permits, in a writable run workspace rather than inside a globally installed skill. `--no-memory` means do not read or write it.

The optional `build-report.js` creates a `.docx` from full-pipeline JSON after schema validation; `docx` is needed only for that step. A daily scan may be delivered in Markdown unless the user asks for a document.

The earlier v2.3 prompt is archived in the source repository for historical reference. Current mode files govern this skill. Do not import provider-specific tool names, browser-extension changes, or machine-specific paths from older versions.
