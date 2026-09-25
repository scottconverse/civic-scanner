# Civic Scanner

A portable [Agent Skill](https://agentskills.io/specification) for local civic research. It watches the **whole civic landscape** affecting a town: government, schools, housing, business, health, transportation, utilities, environment, culture, neighborhood groups, local reporting, and community discussion. It verifies consequential claims against original evidence and turns developments into ranked reporting leads. For public meetings, it logs substantive actions and reconciles recordings with agendas and minutes. The output is **research scaffolding for a human reporter**, not a published article or legal clearance.

The default source town is Longmont, Colorado. Use `discover` to build a registry for another town. The six modes are `daily-scan`, `full-pipeline`, `verify-only`, `research`, `legal-threat`, and `discover`.

"Whole civic landscape" describes the **range of beats**, not a promise to capture literally every event. Each scan names its date window and source inventory, and marks gaps. Government votes require official records; developments outside government need appropriate primary evidence, such as an organization's original documents or firsthand reporting. Local news and community posts are lead sources, not proof by themselves.

## Install in an agent tool

The same `SKILL.md` and `references/` work across tools that support Agent Skills. The installer uses Node.js built-ins and copies the complete skill bundle to the selected user's skill directory; it never changes model settings. Review an existing installation before replacing it. `--force` saves a backup of the previous skill directory.

```sh
git clone https://github.com/scottconverse/civic-scanner.git
cd civic-scanner
node scripts/install-skill.mjs --target claude --dry-run
node scripts/install-skill.mjs --target claude
```

Choose one target:

| Agent tool | Target | User skill directory |
| --- | --- | --- |
| [Claude Code](https://code.claude.com/docs/en/skills) | `claude` | `~/.claude/skills/civic-scanner` |
| [OpenAI Codex](https://developers.openai.com/plugins/build/skills) | `codex` | `~/.codex/skills/civic-scanner` |
| [Gemini CLI](https://geminicli.com/docs/cli/using-agent-skills/) | `gemini` | `~/.gemini/skills/civic-scanner` |
| [Grok Code / Grok CLI](https://docs.x.ai/build/features/skills-plugins-marketplaces) | `grok` | `~/.grok/skills/civic-scanner` |
| [DeepSeek Deep Code](https://api-docs.deepseek.com/quick_start/agent_integrations/deepcode/) | `deepcode` | `~/.agents/skills/civic-scanner` |

For an isolated or nonstandard install, pass `--dest /absolute/parent/directory`. On Windows, `--dest C:\absolute\parent\directory` also works. This creates `civic-scanner` beneath the parent. Restart or refresh the tool's skills list if needed, then ask: `Use civic-scanner daily-scan for Longmont, CO, covering the past seven days.` If the tool supports slash invocation, `/civic-scanner` also works. The command name and discovery behavior vary by host.

DeepSeek can also run as the model inside Codex using Codex's installed skills. The installer does not configure DeepSeek's API or choose a model.

### ChatGPT and Codex desktop plugin package

To make this a locally installable ChatGPT/Codex plugin, build the portable plugin and a local marketplace catalog:

```sh
node scripts/package-plugin.mjs
codex plugin marketplace add ./dist
```

Restart the ChatGPT desktop app, open its Plugins Directory, select the `Civic Scanner` local marketplace, and install the plugin. The generated package is under `dist/plugins/civic-scanner` and contains the same skill files as the native installer. This local package is for testing or personal use; public directory publication is a separate review and submission step. See the [official plugin packaging and local marketplace guide](https://developers.openai.com/plugins/build/plugins).

### Browser chat products

An ordinary ChatGPT, Claude, Gemini, DeepSeek, or Grok web chat does not share one universal filesystem skill installer. Use [`portable-chat.md`](portable-chat.md) as the custom instructions or opening prompt and attach/paste the relevant skill files and source registry. In [ChatGPT custom GPTs](https://help.openai.com/en/articles/8554397-creating-a-gpt), put the short prompt in Instructions and the relevant files in Knowledge. Check each product's file and browsing capabilities before a scan. If a chat cannot access the full recording or transcript, the run must be labeled `PARTIAL`.

## How to run

```text
Use civic-scanner daily-scan for Longmont, CO, covering the past seven days.
Cover the civic beats in the source registry. Review all available relevant
meeting recording/transcript ranges, log every substantive motion and vote,
reconcile with agenda/minutes, then rank leads from across the town.
```

The daily scan starts with a source inventory and meeting action ledger. The action ledger is kept separate from story ranking, so a low-scoring motion is still visible. It records a vote on dispensary annexation separately from a motion to schedule a discussion of marijuana hospitality rules. It distinguishes a future-agenda action from adoption of a rule.

Every expanded story also carries its own **claims and sources**: a status for each consequential claim, source IDs tied to it, and a source list with public URLs and page/item/timestamp locators. Offline interviews or files use an explicit record reference rather than a fabricated URL. The report builder checks those links and prints the ledger with each story.

In `full-pipeline`, the **Black Desk** takes weak leads and anomalies from that broad scan, labels each hypothesis's evidence problem, and gives the adversarial desk a specific check. The report shows these possible stories in their own **Unverified** dashboard section, with the source, confidence, next check, and adversarial disposition; the verification appendix keeps the full handoff. Its output is never reported as fact. The daily scan collects weak signals but does not run the full Black Desk stage.

Coverage is `COMPLETE` only for the stated source inventory and date window after all available recording ranges, motion/vote cues, and agenda/minutes discrepancies are reviewed. Otherwise the result is `PARTIAL` with exact gaps. Search hits alone never satisfy the coverage gate.

## Optional transcript scaffold

The helper splits a local transcript into chronological line ranges and marks possible motion/vote cues. It **does not read or verify the meeting for you**. Review every range and fill the ledger before claiming coverage.

```sh
node scripts/transcript-ledger.mjs --input meeting.txt --output coverage.json --meeting "City Council, 2026-09-22"
node scripts/check-coverage.mjs coverage.json
```

The checker reports missing fields and unresolved ranges. A passing mechanical check means the ledger is ready for editorial review; it cannot prove semantic completeness.

## Optional `.docx` report

Daily scans can be delivered in Markdown. For the full pipeline, `build-report.js` checks required fields in the JSON structure documented by `report-schema.json` and builds a `.docx`. Install `docx` in the working project only if you need that report:

```sh
npm install docx
node build-report.js --validate-only path/to/pipeline-data.json
node build-report.js path/to/pipeline-data.json
```

## Files and boundaries

- [`SKILL.md`](SKILL.md): concise entry point and mandatory rules.
- [`references/editorial-controls.md`](references/editorial-controls.md): evidence, status, scoring, and adversarial gates.
- [`references/daily-scan.md`](references/daily-scan.md): complete meeting coverage and briefing format.
- [`references/full-pipeline.md`](references/full-pipeline.md): downstream editorial stages.
- [`references/other-modes.md`](references/other-modes.md): verification, research, legal triage, and discovery.
- [`archive/legacy-v2.3.md`](archive/legacy-v2.3.md): historical detailed prompts in the repository, excluded from installation. Current files govern; do not follow old provider-specific commands.

Beat memory belongs in a writable run workspace, not a globally installed skill. The installer excludes the repository's historical Longmont memory file so a new user does not inherit old run state.
