import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { scaffold } from '../scripts/transcript-ledger.mjs';
import { checkCoverage } from '../scripts/check-coverage.mjs';
import { install } from '../scripts/install-skill.mjs';
import { packagePlugin } from '../scripts/package-plugin.mjs';

const transcript = `00:10:00 Chair: We will take the dispensary annexation item first.
00:12:10 Member A: I move to approve the dispensary annexation.
00:13:00 Chair: The vote is four to three and the motion passes.
00:45:00 Member B: I move to put marijuana hospitality rules on a future agenda.
00:46:00 Chair: The vote is four to three and the motion passes.
00:50:00 Chair: The meeting is adjourned.`;

test('transcript scaffold exposes separate annexation and future agenda actions', () => {
  const ledger = scaffold(transcript, { chunkLines: 3, meeting: 'Longmont Council' });
  assert.equal(ledger.chunks.length, 2);
  assert.ok(ledger.cues.some((cue) => cue.excerpt.includes('dispensary annexation')));
  assert.ok(ledger.cues.some((cue) => cue.excerpt.includes('marijuana hospitality rules on a future agenda')));
  assert.equal(checkCoverage(ledger).readyForEditorialReview, false);
  assert.ok(checkCoverage(ledger).gaps.some((gap) => gap.includes('unreviewed')));
});

test('transcript scaffold also flags conversational vote outcomes', () => {
  const ledger = scaffold('00:20:00 Chair: All opposed? Seeing none, that carries.\n00:25:00 Chair: Without objection, we will add this to the future agenda.');
  assert.equal(ledger.cues.length, 2);
  assert.ok(ledger.cues.every((cue) => cue.disposition === 'unresolved'));
});

test('coverage gate requires resolved cues, action rows, reconciliation, and attestation', () => {
  const ledger = scaffold(transcript, { chunkLines: 3 });
  ledger.chunks.forEach((chunk) => { chunk.reviewed = true; });
  ledger.cues.forEach((cue) => { cue.disposition = 'not-action'; });
  const annexationCue = ledger.cues.find((cue) => cue.excerpt.includes('I move to approve'));
  const hospitalityCue = ledger.cues.find((cue) => cue.excerpt.includes('I move to put'));
  annexationCue.disposition = 'action';
  annexationCue.actionId = 'annexation';
  hospitalityCue.disposition = 'action';
  hospitalityCue.actionId = 'hospitality-agenda';
  const action = (id, stage, timestamp) => ({ action_id: id, timestamp, agenda_item: 'item 4', motion_or_action: id, outcome: 'passed', vote: '4-3', policy_stage: stage, evidence: `official recording ${timestamp}`, disposition: 'lead' });
  ledger.actions = [action('annexation', 'final adoption', '00:12:10')];
  ledger.reconciliation = { agendaCompared: true, minutesStatus: 'not posted', unexplainedMismatches: [] };
  ledger.reviewerAttestation = { fullChronologicalReview: true, allSubstantiveActionsLogged: true };
  assert.ok(checkCoverage(ledger).gaps.some((gap) => gap.includes('hospitality-agenda') || gap.includes(`${hospitalityCue.id}: action row missing`)));
  ledger.actions.push(action('hospitality-agenda', 'future discussion directed', '00:45:00'));
  assert.equal(checkCoverage(ledger).readyForEditorialReview, true);
});

test('installer copies the skill bundle and leaves historical beat memory out', () => {
  const parent = mkdtempSync(join(tmpdir(), 'civic-scanner-install-'));
  try {
    const { destination } = install({ target: 'codex', dest: parent });
    assert.ok(existsSync(join(destination, 'SKILL.md')));
    assert.ok(existsSync(join(destination, 'references', 'daily-scan.md')));
    assert.ok(existsSync(join(destination, 'references', 'reddit-intake.md')));
    assert.ok(existsSync(join(destination, 'references', 'reddit-access-and-schema.md')));
    assert.ok(existsSync(join(destination, 'scripts', 'check-coverage.mjs')));
    assert.ok(existsSync(join(destination, 'scripts', 'reddit_extract.py')));
    assert.ok(existsSync(join(destination, 'scripts', 'reddit_extract.LICENSE')));
    assert.equal(existsSync(join(destination, 'references', 'longmont-beat-memory.json')), false);
    assert.match(readFileSync(join(destination, 'SKILL.md'), 'utf8'), /every substantive motion and vote/i);
    assert.throws(() => install({ target: 'codex', dest: parent }), /already exists/);
    writeFileSync(join(destination, 'local-note.txt'), 'keep me');
    install({ target: 'codex', dest: parent, force: true });
    const backupName = readdirSync(parent).find((name) => name.startsWith('civic-scanner.backup-'));
    assert.ok(backupName);
    assert.equal(readFileSync(join(parent, backupName, 'local-note.txt'), 'utf8'), 'keep me');
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test('ChatGPT/Codex plugin package has a discoverable skill and local marketplace', () => {
  const parent = mkdtempSync(join(tmpdir(), 'civic-scanner-package-'));
  const out = join(parent, 'package');
  try {
    packagePlugin(out);
    const plugin = join(out, 'plugins', 'civic-scanner');
    const manifest = JSON.parse(readFileSync(join(plugin, 'plugin.json'), 'utf8'));
    const marketplace = JSON.parse(readFileSync(join(out, '.agents', 'plugins', 'marketplace.json'), 'utf8'));
    assert.equal(manifest.name, 'civic-scanner');
    assert.equal(manifest.version, '2.6.0');
    assert.equal(marketplace.plugins[0].source.path, './plugins/civic-scanner');
    assert.ok(existsSync(join(plugin, 'skills', 'civic-scanner', 'references', 'daily-scan.md')));
    assert.ok(existsSync(join(plugin, 'skills', 'civic-scanner', 'scripts', 'reddit_extract.py')));
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});

test('report validation runs without docx and rejects missing meeting coverage', () => {
  const parent = mkdtempSync(join(tmpdir(), 'civic-scanner-report-'));
  const reportPath = join(parent, 'pipeline.json');
  const builder = fileURLToPath(new URL('../build-report.js', import.meta.url));
  const data = {
    meta: { city: 'Longmont', state: 'CO', date: '2026-09-25', runNumber: 1, version: '2.6.0' },
    stats: { scanned: 1, advanced: 1, held: 0, killed: 0, suppressed: 0, tierACounts: 1, tierBCounts: 0, tierCCounts: 0 },
    meetingCoverage: { status: 'COMPLETE', sourceInventory: 'Council portal and recording checked', meetings: [{ body: 'City Council', date: '2026-09-22', coverageStatus: 'complete' }], actions: [{ actionId: 'future-agenda', timestamp: '00:45:00', motionOrAction: 'Put marijuana hospitality rules on a future agenda', outcome: 'passed', vote: '4-3', policyStage: 'future discussion directed', evidence: 'official recording at 00:45:00', disposition: 'lead' }], agendaReconciliation: 'Agenda and recording matched', unresolvedGaps: [] },
    agent1_leads: [{ id: 'future-agenda', tier: 'A', headline: 'Council requests future discussion', details: 'Official meeting action documented in the recording.' }],
    agent2_stories: [{ id: 'future-agenda', headline: 'Council requests future discussion', draft: 'Evidence. '.repeat(50), claims: [{ id: 'c1', text: 'Council requested a future discussion', status: 'VERIFIED', sourceIds: ['s1'] }], sourceList: [{ id: 's1', title: 'Council meeting recording', tier: 'A', url: 'https://example.org/council-recording', locator: '00:45:00' }] }],
    agent25_gate: [{ id: 'future-agenda', headline: 'Council requests future discussion', immediacy: 3, impact: 3, conflict: 2, novelty: 2, total: 10, decision: 'ADVANCE', editorialTier: 1, editorRecommendation: 'EDIT', whatCannotSay: 'The rules were adopted', aiNextStep: 'Complete', reportingNotes: 'Confirmed in the recording; no human reporting required for this action.' }],
    agent3_blackDesk: [],
    agent4_adversarial: [{ id: 'future-agenda', headline: 'Council requests future discussion', gate1: 'checked', gate2: 'checked', gate3_counterNarrative: 'Counterevidence reviewed. '.repeat(6) }],
    agent5_completeness: [{}],
    agent6_legal: [{ analysis: 'Review with counsel if needed.' }],
    agent7_plainLanguage: [{ headline: 'Council requests future discussion', rewrite: 'The council asked for a future discussion. '.repeat(5) }],
    agent75_distribution: [{ seo: 'a', twitter: 'a', facebook: 'a', linkedin: 'a', nextdoor: 'a', newsletter: 'a', emailSubjects: 'a' }],
    agent8_hygiene: { sourceChecks: 'checked', headlineAudit: 'checked', originalityCheck: 'checked' },
    heldStories: [], trustDashboard: {},
  };
  try {
    writeFileSync(reportPath, JSON.stringify(data));
    const pass = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(pass.status, 0, pass.stderr);
    delete data.agent25_gate[0].editorialTier;
    writeFileSync(reportPath, JSON.stringify(data));
    const missingTier = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(missingTier.status, 1);
    assert.match(missingTier.stderr, /editorialTier/);
    data.agent25_gate[0].editorialTier = 1;
    data.heldStories = [{ storyId: 'missing-packet', headline: 'Held lead' }];
    writeFileSync(reportPath, JSON.stringify(data));
    const detachedHold = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(detachedHold.status, 1);
    assert.match(detachedHold.stderr, /story packet missing/);
    data.heldStories = [];
    data.agent2_stories[0].id = 'wrong-story';
    writeFileSync(reportPath, JSON.stringify(data));
    const detachedStory = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(detachedStory.status, 1);
    assert.match(detachedStory.stderr, /no story packet with claims and sources/);
    data.agent2_stories[0].id = 'future-agenda';
    data.agent2_stories[0].claims[0].sourceIds = ['missing-source'];
    writeFileSync(reportPath, JSON.stringify(data));
    const brokenClaim = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(brokenClaim.status, 1);
    assert.match(brokenClaim.stderr, /unknown source ID/);
    data.agent2_stories[0].claims[0].sourceIds = ['s1'];
    delete data.agent2_stories[0].sourceList[0].url;
    writeFileSync(reportPath, JSON.stringify(data));
    const missingUrl = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(missingUrl.status, 1);
    assert.match(missingUrl.stderr, /URL or offline recordRef required/);
    data.agent2_stories[0].sourceList[0].url = 'https://example.org/council-recording';
    data.agent3_blackDesk = [{ signalId: 's1', source: 'local report', sourceTier: 'B', confidence: 0.3, title: 'Possible linked changes', speculativeAngle: 'This may link two local developments that need independent verification.', investigationQuestion: 'Are they connected?', vulnerabilityTypes: ['no-primary-record'], vulnerabilityDetail: 'No original document found' }];
    writeFileSync(reportPath, JSON.stringify(data));
    const missingHandoff = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(missingHandoff.status, 1);
    assert.match(missingHandoff.stderr, /agent4Target/);
    data.agent3_blackDesk[0].agent4Target = 'Find the original announcement and a counterparty response';
    writeFileSync(reportPath, JSON.stringify(data));
    const missingReview = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(missingReview.status, 1);
    assert.match(missingReview.stderr, /Agent 4 disposition missing/);
    data.agent4_adversarial.push({ id: 's1', headline: 'Possible linked changes', gate1: 'checked', gate2: 'checked', gate3_counterNarrative: 'Alternative explanation reviewed. '.repeat(6), targetCheck: 'Original announcement found; link remains unverified', severity: 'UNVERIFIABLE', verdict: 'HOLD' });
    delete data.agent4_adversarial.at(-1).verdict;
    writeFileSync(reportPath, JSON.stringify(data));
    const missingDisposition = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(missingDisposition.status, 1);
    assert.match(missingDisposition.stderr, /verdict/);
    data.agent4_adversarial.at(-1).verdict = 'HOLD';
    writeFileSync(reportPath, JSON.stringify(data));
    const handoffPass = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(handoffPass.status, 0, handoffPass.stderr);
    const blackDeskOnly = structuredClone(data);
    blackDeskOnly.stats.advanced = 0;
    blackDeskOnly.agent1_leads = [{ id: 's1', tier: 'C', headline: 'Possible linked changes', details: 'A community signal needs independent verification.' }];
    blackDeskOnly.agent2_stories = [];
    blackDeskOnly.agent25_gate = [];
    blackDeskOnly.agent4_adversarial = [blackDeskOnly.agent4_adversarial.at(-1)];
    blackDeskOnly.agent5_completeness = [];
    blackDeskOnly.agent6_legal = [];
    blackDeskOnly.agent7_plainLanguage = [];
    blackDeskOnly.agent75_distribution = [];
    writeFileSync(reportPath, JSON.stringify(blackDeskOnly));
    const blackDeskPass = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(blackDeskPass.status, 0, blackDeskPass.stderr);
    data.agent3_blackDesk = [];
    data.meetingCoverage.meetings[0].coverageStatus = 'partial';
    writeFileSync(reportPath, JSON.stringify(data));
    const inconsistent = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(inconsistent.status, 1);
    assert.match(inconsistent.stderr, /partial or unavailable meeting/);
    delete data.meetingCoverage;
    writeFileSync(reportPath, JSON.stringify(data));
    const fail = spawnSync(process.execPath, [builder, '--validate-only', reportPath], { encoding: 'utf8' });
    assert.equal(fail.status, 1);
    assert.match(fail.stderr, /meetingCoverage/);
    assert.doesNotMatch(fail.stderr, /Cannot find 'docx'/);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
});
