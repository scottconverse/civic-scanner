# Full pipeline

Start with the complete `daily-scan.md` action and source inventory. Run the editorial stages below in order for the leads that pass intake. Each stage may hold or suppress a story. Preserve its evidence and decision, including why a story stopped.

1. **Aggregation:** Normalize leads, merge true duplicates, and retain separate council actions even when they concern the same topic. Preserve the all-actions ledger.
2. **Research expansion:** For each advancing lead, draft 400–800 words of sourced background and a Reporter Task Memo with `Confirmed`, `Missing`, `Calls`, `Documents`, `Falsify`, and `Visuals`. Build a story packet with its own `claims` and `sourceList`: every consequential factual claim gets a status and source IDs; each source has a public URL and locator, or an honest offline record reference. Label drafts as research scaffolding.
3. **Newsworthiness:** Score immediacy, local impact, conflict, and novelty (1–5 each). Apply the thresholds in `editorial-controls.md`; explain holds and demotions.
4. **Black Desk (Agent 3):** Turn weak Tier B/C signals and unexplained primary-source anomalies into testable hypotheses. Record why each is weak and the exact evidence or search that could disprove it. Do not promote a hypothesis into a reported fact. If no plausible signal exists, record an empty list rather than inventing one.
5. **Adversarial challenge (Agent 4, the Dark Signal Desk):** Take each advancing story **and each Black Desk handoff**. Start by attacking its named vulnerability and running its `agent4Target` check. Then run the four checks in `editorial-controls.md`. Search specifically for records that would falsify each advancing claim, then steel-man the subject's best defense. Count independent Tier A records supporting the lead and the strongest counter-account (the **Grounding Delta**). Suppress if the counter-account has stronger Tier A support or a material falsification target remains unresolved. Do not count repeated coverage of one document as multiple records.
6. **Completeness audit:** Check attribution for every factual sentence, meaningful opposing views, affected people, potential harm, meeting/action coverage, and unanswered reporter calls. Hold unsupported factual claims.
7. **Legal risk triage:** Flag defamation, privacy, access, fair-report, and legal-threat issues for qualified counsel. For a threatened private-party plaintiff, flag possible SLAPP risk and verify the precise official record chain before invoking fair-report privilege. Do not give a definitive legal clearance. Use `other-modes.md` for a dedicated legal-threat request.
8. **Plain-language and distribution:** Provide clear summaries and optional headline, newsletter, and social copy. Each public-facing version must preserve status verbs and include **Receipts**: the specific primary evidence title, date, URL and page/item/timestamp, or attributable firsthand reporting notes, that support its central claims. Do not present drafts as ready to publish without editor review.
9. **Source hygiene and originality:** For each consequential claim, trace (a) where it first appeared, (b) the original evidence supposedly behind it, and (c) whether that evidence really supports the wording. Reject a Tier C attribution or a Tier B claim laundered as primary. Run a **state-drift check**: `scheduled` cannot become `approved`; `study session` cannot become `voted`; `first reading` cannot become `adopted`; a motion to add a topic to a future agenda cannot become a vote on that policy. Check for copied wording if comparison tools and source text are available; otherwise mark originality unchecked.
10. **Further research:** Identify the best next record request, interview, site visit, or data check. Record suppression reopen triggers and update writable beat memory when authorized by the run.

## Black Desk handoff

Run this stage in `full-pipeline`, after the broad scan and initial scoring. The daily scan collects weak signals but does not present them as verified leads. Black Desk hypotheses can connect beats—for example, housing complaints, an employer announcement, and a transit change—but a connection is only a question until evidence supports it.

For every Black Desk signal, record `signalId`, title, original source and tier, confidence (0.1–0.5), `speculativeAngle`, `connections`, `investigationQuestion`, one or more `vulnerabilityTypes`, `vulnerabilityDetail`, and an actionable `agent4Target`. Use these vulnerability types where they fit: `single-source-anonymous`, `conflict-of-interest`, `no-primary-record`, `temporal-mismatch`, `amplification-pattern`, `hearsay-chain`, `missing-counterparty`, `jurisdiction-mismatch`, `numerical-uncertainty`, or `unsupported-inference`. Name the particular document, interview, data check, or counterparty needed. If the signal alleges a government action, seek its official record.

Agent 4 must include a review row whose `id` matches the Black Desk `signalId` and whose `targetCheck` records whether the named check confirmed, contradicted, or failed to resolve the hypothesis. Only a separately verified claim can enter the normal story gates. Give the Black Desk its own **Possible Stories to Investigate (Unverified)** section in the editorial dashboard, showing each hypothesis, source, confidence, evidence problem, next check, and Agent 4 disposition. If no hypotheses were generated, say so in that section. Keep the full signal and its disposition in the verification appendix. Black Desk output is never publication copy and cannot substitute for the separate all-actions meeting ledger.

Output an editorial dashboard followed by a verification appendix: source inventory, meeting/action ledger, score and gate decisions, research scaffolding, Reporter Task Memos, counterevidence, source links, gaps, and next steps. Label the run `PARTIAL` if the daily-scan coverage gate failed, even if downstream research is strong.

Keep each story packet keyed by its stable `id` through scoring, Black Desk connections, adversarial review, hold/suppression, and report generation. The claim ledger and source list belong next to that story in the report. If verification changes a claim, update its status and supporting source IDs before the report is built. A global source appendix may supplement the packets but cannot replace them.

An entry in `heldStories` must carry `storyId` pointing to its packet, so the hold dashboard can show its sources and the appendix can show its claims. Keep an unexpanded, weak item as a lead or Black Desk signal rather than calling it a story packet.

The optional report builder takes a completed pipeline JSON matching `report-schema.json`:

```sh
node build-report.js --validate-only path/to/pipeline-data.json
node build-report.js path/to/pipeline-data.json
```

Install `docx` only if generating the `.docx`: `npm install docx` in the working project. The report builder does not search sources or certify the coverage gate; the agent must do that before creating report data.
