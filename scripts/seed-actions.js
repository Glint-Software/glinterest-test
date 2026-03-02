#!/usr/bin/env node
// Triggers GitHub Actions workflow runs for the glinterest repo.
// Usage: node scripts/seed-actions.js
// Requires: gh CLI authenticated
//
// Triggers workflows to produce runs in various states:
//   - CI (Pass): success run on main
//   - CI (Fail): failed run
//   - Multi-Job Pipeline: multi-job success
//   - Build Artifacts: run with artifacts
//   - Long Running: triggered then cancelled for "cancelled" state
//   - Nightly Maintenance: manual trigger of scheduled workflow
//
// Also triggers CI on open PR branches to produce check runs on PRs.

import { execSync } from 'child_process';

const REPO = process.env.GLINTEREST_REPO || 'Glint-Software/glinterest';
const dryRun = process.argv.includes('--dry-run');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function run(cmd, opts = {}) {
  if (dryRun) {
    console.log(`  [dry-run] ${cmd}`);
    return '';
  }
  try {
    const result = execSync(cmd, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: opts.timeout || 30000,
    });
    return result.trim();
  } catch (e) {
    if (opts.ignoreError) {
      console.log(`  (ignored: ${e.stderr?.trim()?.split('\n')[0] || e.message.split('\n')[0]})`);
      return '';
    }
    throw e;
  }
}

async function main() {
  console.log(`Triggering workflow runs for ${REPO}...\n`);

  // 1. Trigger CI (Pass) on main — produces a successful run
  console.log('1. CI (Pass) — triggering on main...');
  run(`gh workflow run "CI (Pass)" --repo ${REPO} --ref main`, { ignoreError: true });
  console.log('  Triggered.\n');
  await sleep(2000);

  // 2. Trigger CI (Fail) — produces a failed run
  console.log('2. CI (Fail) — triggering...');
  run(`gh workflow run "CI (Fail)" --repo ${REPO} --ref main`, { ignoreError: true });
  console.log('  Triggered.\n');
  await sleep(2000);

  // 3. Multi-Job Pipeline — produces a multi-job run
  console.log('3. Multi-Job Pipeline — triggering...');
  run(`gh workflow run "Multi-Job Pipeline" --repo ${REPO} --ref main`, { ignoreError: true });
  console.log('  Triggered.\n');
  await sleep(2000);

  // 4. Build Artifacts — produces a run with downloadable artifacts
  console.log('4. Build Artifacts — triggering...');
  run(`gh workflow run "Build Artifacts" --repo ${REPO} --ref main`, { ignoreError: true });
  console.log('  Triggered.\n');
  await sleep(2000);

  // 5. Nightly Maintenance — manual trigger of scheduled workflow
  console.log('5. Nightly Maintenance — triggering...');
  run(`gh workflow run "Nightly Maintenance" --repo ${REPO} --ref main`, { ignoreError: true });
  console.log('  Triggered.\n');
  await sleep(2000);

  // 6. Long Running — trigger then cancel for "cancelled" state
  console.log('6. Long Running — triggering (will cancel after start)...');
  run(`gh workflow run "Long Running" --repo ${REPO} --ref main`, { ignoreError: true });
  console.log('  Triggered. Waiting for run to start...');

  if (!dryRun) {
    // Wait for the run to appear and start
    await sleep(8000);

    // Find and cancel the long-running workflow
    try {
      const runsJson = execSync(
        `gh run list --repo ${REPO} --workflow "Long Running" --status in_progress --limit 1 --json databaseId`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const runs = JSON.parse(runsJson);
      if (runs.length > 0) {
        const runId = runs[0].databaseId;
        execSync(`gh run cancel ${runId} --repo ${REPO}`, { stdio: 'pipe' });
        console.log(`  Cancelled run #${runId}.\n`);
      } else {
        // Might be queued, try again
        await sleep(5000);
        const retryJson = execSync(
          `gh run list --repo ${REPO} --workflow "Long Running" --limit 1 --json databaseId,status`,
          { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
        );
        const retryRuns = JSON.parse(retryJson);
        if (retryRuns.length > 0 && retryRuns[0].status !== 'completed') {
          execSync(`gh run cancel ${retryRuns[0].databaseId} --repo ${REPO}`, { stdio: 'pipe' });
          console.log(`  Cancelled run #${retryRuns[0].databaseId}.\n`);
        } else {
          console.log('  Could not find in-progress run to cancel.\n');
        }
      }
    } catch (e) {
      console.log(`  Could not cancel: ${e.message.split('\n')[0]}\n`);
    }
  }

  // 7. Trigger CI on open PR branches to get check runs on PRs
  console.log('7. Triggering CI on open PR branches for check runs...');
  const prsJson = run(
    `gh pr list --repo ${REPO} --state open --json headRefName,number`,
    { ignoreError: true }
  );

  if (prsJson) {
    const prs = JSON.parse(prsJson);
    for (const pr of prs) {
      console.log(`  PR #${pr.number} (${pr.headRefName})...`);
      run(
        `gh workflow run "CI (Pass)" --repo ${REPO} --ref "${pr.headRefName}"`,
        { ignoreError: true }
      );
      await sleep(1500);
    }
    console.log(`  Triggered CI on ${prs.length} PR branches.\n`);
  }

  // Summary
  console.log('========================================');
  console.log('  Workflow runs triggered!');
  console.log('========================================');
  console.log('  Expected results after ~2 minutes:');
  console.log('    CI (Pass)           → success');
  console.log('    CI (Fail)           → failure');
  console.log('    Multi-Job Pipeline  → success');
  console.log('    Build Artifacts     → success (with artifacts)');
  console.log('    Nightly Maintenance → success');
  console.log('    Long Running        → cancelled');
  console.log('    PR checks           → success on open PRs');
  console.log('========================================');
}

main().catch(e => {
  console.error(`\nFATAL: ${e.message}`);
  process.exit(1);
});
