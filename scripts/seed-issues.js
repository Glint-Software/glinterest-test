#!/usr/bin/env node
// Creates GitHub issues from issues.json for the glinterest repo.
// Usage: node scripts/seed-issues.js
// Requires: gh CLI authenticated
//
// Options:
//   --dry-run    Print what would be created without actually creating
//   --start=N    Start from issue index N (for resuming after errors)

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = 'Glint-Software/glinterest';

const dryRun = process.argv.includes('--dry-run');
const startArg = process.argv.find(a => a.startsWith('--start='));
const startIndex = startArg ? parseInt(startArg.split('=')[1]) : 0;

// Load issues data
const issues = JSON.parse(readFileSync(join(__dirname, 'data', 'issues.json'), 'utf-8'));
console.log(`Loaded ${issues.length} issues from data file`);

// Map milestone numbers to titles (created by seed-milestones.js)
// We need to look up milestone numbers from the GitHub API
async function getMilestoneMap() {
  try {
    const result = execSync(`gh api repos/${REPO}/milestones --jq '.[].title'`, { encoding: 'utf-8' });
    const titles = result.trim().split('\n');
    const map = {};
    // Milestones are returned in order of creation
    const milestoneIds = JSON.parse(
      execSync(`gh api repos/${REPO}/milestones --jq '[.[].number]'`, { encoding: 'utf-8' })
    );
    const milestoneTitles = JSON.parse(
      execSync(`gh api repos/${REPO}/milestones --jq '[.[].title]'`, { encoding: 'utf-8' })
    );
    for (let i = 0; i < milestoneIds.length; i++) {
      map[i + 1] = milestoneIds[i]; // Our data uses 1-indexed milestone references
    }
    return map;
  } catch {
    console.warn('Could not fetch milestones. Milestone assignment will be skipped.');
    return {};
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createIssues() {
  const milestoneMap = await getMilestoneMap();

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
      // Build the gh issue create command
      let cmd = `gh issue create --repo ${REPO}`;
      cmd += ` --title "${issue.title.replace(/"/g, '\\"')}"`;
      cmd += ` --body "${issue.body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;

      if (issue.labels && issue.labels.length > 0) {
        cmd += ` --label "${issue.labels.join(',')}"`;
      }

      if (issue.milestone && milestoneMap[issue.milestone]) {
        cmd += ` --milestone "${milestoneMap[issue.milestone]}"`;
      }

      if (issue.assignee) {
        cmd += ` --assignee "${issue.assignee}"`;
      }

      const result = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
      const issueUrl = result.trim();
      const issueNumber = issueUrl.match(/\/(\d+)$/)?.[1];
      console.log(`  Created: #${issueNumber}`);

      // Add comments if any
      if (issue.comments && issue.comments.length > 0) {
        for (const comment of issue.comments) {
          await sleep(500); // Rate limiting
          execSync(
            `gh issue comment ${issueNumber} --repo ${REPO} --body "${comment.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
            { stdio: 'pipe' }
          );
          console.log(`  Added comment`);
        }
      }

      // Close issue if needed
      if (issue.state === 'closed') {
        await sleep(300);
        execSync(`gh issue close ${issueNumber} --repo ${REPO}`, { stdio: 'pipe' });
        console.log(`  Closed`);
      }

      // Rate limiting - be gentle with the API
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
