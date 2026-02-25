#!/usr/bin/env node
// Creates GitHub issues from issues.json for the glinterest repo.
// Usage: node scripts/seed-issues.js
// Requires: gh CLI authenticated
//
// Options:
//   --dry-run    Print what would be created without actually creating
//   --start=N    Start from issue index N (for resuming after errors)

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync, mkdtempSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = process.env.GLINTEREST_REPO || 'Glint-Software/glinterest';

const dryRun = process.argv.includes('--dry-run');
const startArg = process.argv.find(a => a.startsWith('--start='));
const startIndex = startArg ? parseInt(startArg.split('=')[1]) : 0;

// Create a temp directory for body files
const tmpDir = mkdtempSync(join(tmpdir(), 'glinterest-'));

// Load issues data
const issues = JSON.parse(readFileSync(join(__dirname, 'data', 'issues.json'), 'utf-8'));
console.log(`Loaded ${issues.length} issues from data file`);

// Fetch milestones from GitHub API
function getMilestoneMap() {
  try {
    const result = execSync(`gh api repos/${REPO}/milestones`, { encoding: 'utf-8' });
    const milestones = JSON.parse(result);
    const map = {};
    for (let i = 0; i < milestones.length; i++) {
      map[i + 1] = milestones[i].title;
    }
    console.log(`Found ${milestones.length} milestones:`, milestones.map(m => m.title).join(', '));
    return map;
  } catch {
    console.warn('Could not fetch milestones. Milestone assignment will be skipped.');
    return {};
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Write content to temp file, execute gh command with --body-file, then clean up
function ghWithBodyFile(args, body) {
  const tmpFile = join(tmpDir, `body-${Date.now()}.md`);
  writeFileSync(tmpFile, body, 'utf-8');
  try {
    const result = execSync(`${args} --body-file "${tmpFile}"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    return result.trim();
  } finally {
    try { unlinkSync(tmpFile); } catch {}
  }
}

async function createIssues() {
  const milestoneMap = getMilestoneMap();

  for (let i = startIndex; i < issues.length; i++) {
    const issue = issues[i];
    console.log(`\n[${i + 1}/${issues.length}] ${issue.title}`);

    if (dryRun) {
      console.log(`  Labels: ${issue.labels?.join(', ') || 'none'}`);
      console.log(`  Milestone: ${issue.milestone || 'none'}`);
      console.log(`  Assignee: ${issue.assignee || 'none'}`);
      console.log(`  State: ${issue.state}`);
      console.log(`  Comments: ${issue.comments?.length || 0}`);
      continue;
    }

    try {
      // Build the gh issue create command (without --body)
      let cmd = `gh issue create --repo ${REPO}`;
      cmd += ` --title "${issue.title.replace(/"/g, '\\"')}"`;

      if (issue.labels && issue.labels.length > 0) {
        cmd += ` --label "${issue.labels.join(',')}"`;
      }

      if (issue.milestone && milestoneMap[issue.milestone]) {
        cmd += ` --milestone "${milestoneMap[issue.milestone]}"`;
      }

      if (issue.assignee) {
        cmd += ` --assignee "${issue.assignee}"`;
      }

      // Use body file to avoid shell escaping issues
      let issueUrl;
      try {
        issueUrl = ghWithBodyFile(cmd, issue.body);
      } catch (e) {
        // If assignee fails (not a collaborator yet), retry without assignee
        if (issue.assignee && e.message.includes('not found')) {
          console.log(`  Assignee "${issue.assignee}" not available, creating without assignee...`);
          let retryCmd = cmd.replace(` --assignee "${issue.assignee}"`, '');
          issueUrl = ghWithBodyFile(retryCmd, issue.body);
        } else {
          throw e;
        }
      }
      const issueNumber = issueUrl.match(/\/(\d+)$/)?.[1];
      console.log(`  Created: #${issueNumber}`);

      // Add comments if any
      if (issue.comments && issue.comments.length > 0) {
        for (const comment of issue.comments) {
          await sleep(500);
          ghWithBodyFile(`gh issue comment ${issueNumber} --repo ${REPO}`, comment);
          console.log(`  Added comment`);
        }
      }

      // Close issue if needed
      if (issue.state === 'closed') {
        await sleep(300);
        execSync(`gh issue close ${issueNumber} --repo ${REPO}`, { stdio: 'pipe' });
        console.log(`  Closed`);
      }

      // Rate limiting
      await sleep(1000);

    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      console.error(`  You can resume from this point with: node scripts/seed-issues.js --start=${i}`);
      process.exit(1);
    }
  }

  console.log(`\nDone! Created ${issues.length - startIndex} issues.`);
}

createIssues();
