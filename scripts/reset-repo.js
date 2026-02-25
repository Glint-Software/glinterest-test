#!/usr/bin/env node
// Fully resets a Glinterest GitHub repo and re-seeds all data.
//
// This script:
//   1. Deletes the target GitHub repo
//   2. Recreates it with the same name, description, and license
//   3. Pushes all local branches (main + 15 feature branches)
//   4. Re-invites collaborators
//   5. Runs seed-labels.js, seed-milestones.js, seed-issues.js, seed-prs.js
//
// Usage:
//   node scripts/reset-repo.js                                    # Reset marketing repo (interactive)
//   node scripts/reset-repo.js --repo glinterest-test-jordan      # Reset a tester's repo
//   node scripts/reset-repo.js --repo glinterest-test-jordan --confirm   # Skip confirmation
//   node scripts/reset-repo.js --repo glinterest-test-jordan --dry-run   # Preview only
//
// The --repo flag accepts:
//   - A short name: "glinterest-test-jordan" → Glint-Software/glinterest-test-jordan
//   - A full path: "Glint-Software/glinterest-test-jordan"
//
// Requires: gh CLI authenticated with delete_repo scope

import { execSync } from 'child_process';
import { createInterface } from 'readline';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const ORG = 'Glint-Software';
const DEFAULT_REPO = `${ORG}/glinterest`;
const DESCRIPTION = 'A Pinterest-inspired image bookmarking app';

const COLLABORATORS = [
  'alice-chen-dev',
  'bob-martinez-dev',
  'carol-park-ux',
  'dave-wilson-qa',
];

// Parse --repo flag
function getTargetRepo() {
  const idx = process.argv.indexOf('--repo');
  if (idx === -1 || idx + 1 >= process.argv.length) {
    return DEFAULT_REPO;
  }
  const value = process.argv[idx + 1];
  // If it contains a slash, treat as full owner/name; otherwise prefix with org
  return value.includes('/') ? value : `${ORG}/${value}`;
}

const REPO = getTargetRepo();
const REPO_NAME = REPO.split('/')[1];
const isMarketingRepo = REPO === DEFAULT_REPO;

const dryRun = process.argv.includes('--dry-run');
const skipConfirm = process.argv.includes('--confirm');

function run(cmd, opts = {}) {
  const label = opts.label || cmd;
  if (dryRun) {
    console.log(`  [dry-run] ${label}`);
    return '';
  }
  try {
    const result = execSync(cmd, {
      encoding: 'utf-8',
      cwd: ROOT,
      stdio: opts.stdio || ['pipe', 'pipe', 'pipe'],
      timeout: opts.timeout || 120000,
      env: { ...process.env, ...opts.env },
    });
    return result.trim();
  } catch (e) {
    if (opts.ignoreError) {
      console.log(`  (ignored error: ${e.stderr?.trim() || e.message})`);
      return '';
    }
    throw e;
  }
}

function runScript(scriptName, timeout = 300000) {
  const label = `node scripts/${scriptName}`;
  if (dryRun) {
    console.log(`  [dry-run] ${label}`);
    return;
  }
  try {
    execSync(`node scripts/${scriptName}`, {
      encoding: 'utf-8',
      cwd: ROOT,
      stdio: 'inherit',
      timeout,
      // Pass target repo via env var so sub-scripts use the right repo
      env: { ...process.env, GLINTEREST_REPO: REPO },
    });
  } catch (e) {
    console.error(`  ERROR running ${scriptName}: ${e.message}`);
    throw e;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function askConfirmation(question) {
  if (skipConfirm) return true;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
}

async function main() {
  console.log('========================================');
  console.log('  Glinterest Repo Reset');
  console.log('========================================');
  console.log(`  Target: ${REPO}`);
  console.log(`  Type:   ${isMarketingRepo ? 'MARKETING (pristine)' : 'TEST'}`);
  console.log(`  Mode:   ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('========================================\n');

  if (!dryRun) {
    let warning = `This will DELETE ${REPO} and recreate it from scratch.\n`;
    warning += '   All issues, PRs, comments, and GitHub-side data will be destroyed.\n';
    warning += '   Local git history and branches will be preserved and re-pushed.\n';
    if (isMarketingRepo) {
      warning += '\n   *** WARNING: You are resetting the MARKETING repo! ***\n';
      warning += '   *** Use --repo <name> to target a test repo instead. ***\n';
    }
    warning += '\n   Continue? (y/N) ';

    const confirmed = await askConfirmation(warning);
    if (!confirmed) {
      console.log('\nAborted.');
      process.exit(0);
    }
    console.log();
  }

  // Step 1: Delete the remote repo
  console.log('Step 1/6: Deleting remote repo...');
  // Unarchive first if needed (archived repos can't be deleted)
  run(`gh api repos/${REPO} -X PATCH -f archived=false`, {
    label: `Unarchive ${REPO}`,
    ignoreError: true,
  });
  run(`gh repo delete ${REPO} --yes`, {
    label: `gh repo delete ${REPO}`,
    ignoreError: true,
  });
  console.log('  Done.\n');

  // Brief pause to let GitHub process the deletion
  if (!dryRun) {
    console.log('  Waiting for GitHub to process deletion...');
    await sleep(5000);
  }

  // Step 2: Recreate the repo
  console.log('Step 2/6: Creating repo...');
  run(
    `gh repo create ${REPO} --public --description "${DESCRIPTION}"`,
    { label: `gh repo create ${REPO}` }
  );
  console.log('  Done.\n');

  if (!dryRun) {
    // Wait for repo to be fully ready
    console.log('  Waiting for repo to initialize...');
    await sleep(5000);
  }

  // Step 3: Push all branches
  console.log('Step 3/6: Pushing all branches...');

  // For test repos, we need to add a temporary remote pointing to the target
  const remoteName = isMarketingRepo ? 'origin' : 'reset-target';
  if (!isMarketingRepo) {
    run(`git remote remove ${remoteName}`, { ignoreError: true, label: `Remove old ${remoteName} remote` });
    run(`git remote add ${remoteName} https://github.com/${REPO}.git`, {
      label: `Add remote ${remoteName} → ${REPO}`,
    });
  }

  // Force push main first (repo may have an initial commit)
  run(`git push ${remoteName} main --force`, {
    label: `git push ${remoteName} main --force`,
  });
  console.log('  Pushed main');

  // Push all feature branches
  const branches = run('git branch --list', { label: 'git branch --list' })
    .split('\n')
    .map(b => b.replace(/^[* ]+/, '').trim())
    .filter(b => b && b !== 'main');

  for (const branch of branches) {
    run(`git push ${remoteName} ${branch}`, {
      label: `git push ${remoteName} ${branch}`,
      ignoreError: true,
    });
    console.log(`  Pushed ${branch}`);
  }
  console.log(`  Pushed ${branches.length + 1} branches total.`);

  // Clean up temporary remote
  if (!isMarketingRepo && !dryRun) {
    run(`git remote remove ${remoteName}`, { ignoreError: true, label: `Remove ${remoteName} remote` });
    console.log(`  Cleaned up temporary remote.`);
  }
  console.log();

  // Step 4: Invite collaborators
  console.log('Step 4/6: Inviting collaborators...');
  for (const user of COLLABORATORS) {
    run(
      `gh api repos/${REPO}/collaborators/${user} -X PUT -f permission=push`,
      { label: `Invite ${user}`, ignoreError: true }
    );
    console.log(`  Invited ${user}`);
  }
  console.log('  Done.\n');

  if (!dryRun) {
    // Let GitHub settle before creating issues
    await sleep(3000);
  }

  // Step 5: Seed GitHub metadata
  console.log('Step 5/6: Seeding labels, milestones, and issues...');
  console.log('\n--- Labels ---');
  runScript('seed-labels.js');
  console.log('\n--- Milestones ---');
  runScript('seed-milestones.js');

  if (!dryRun) await sleep(2000);

  console.log('\n--- Issues (112) ---');
  runScript('seed-issues.js', 600000); // 10 min timeout for 112 issues
  console.log();

  // Step 6: Seed PRs
  console.log('Step 6/6: Creating pull requests...');
  runScript('seed-prs.js', 600000); // 10 min timeout for 15 PRs with merges
  console.log();

  // Re-archive the marketing repo to protect it
  if (isMarketingRepo) {
    console.log('Archiving marketing repo...');
    run(`gh api repos/${REPO} -X PATCH -f archived=true`, {
      label: `Archive ${REPO}`,
      ignoreError: true,
    });
    console.log('  Done.\n');
  }

  // Summary
  console.log('========================================');
  console.log('  Reset complete!');
  console.log('========================================');
  console.log(`  Repo:          https://github.com/${REPO}`);
  console.log(`  Branches:      ${branches.length + 1}`);
  console.log(`  Collaborators: ${COLLABORATORS.length}`);
  console.log(`  Issues:        112`);
  console.log(`  PRs:           15`);
  if (isMarketingRepo) {
    console.log(`  Archived:      yes`);
  }
  console.log('========================================');
}

main().catch(e => {
  console.error(`\nFATAL: ${e.message}`);
  process.exit(1);
});
