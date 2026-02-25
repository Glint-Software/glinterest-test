#!/usr/bin/env node
// Creates GitHub milestones for the glinterest repo.
// Usage: node scripts/seed-milestones.js
// Requires: gh CLI authenticated

import { execSync } from 'child_process';

const REPO = 'Glint-Software/glinterest';

const milestones = [
  { title: 'v0.1 — Core', due_on: '2026-03-15', description: 'Basic pins, boards, auth' },
  { title: 'v0.2 — Social', due_on: '2026-04-15', description: 'Likes, comments, following' },
  { title: 'v0.3 — Discovery', due_on: '2026-05-15', description: 'Search, tags, trending' },
  { title: 'v1.0 — Launch', due_on: '2026-06-30', description: 'Polish, performance, mobile' },
];

console.log('Creating milestones...');
for (const ms of milestones) {
  try {
    const cmd = `gh api repos/${REPO}/milestones -f title="${ms.title}" -f description="${ms.description}" -f due_on="${ms.due_on}T08:00:00Z" -f state="open"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`  Created: ${ms.title}`);
  } catch (e) {
    console.error(`  Failed: ${ms.title} - ${e.message}`);
  }
}

console.log('\nDone! Milestones created.');
