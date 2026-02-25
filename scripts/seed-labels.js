#!/usr/bin/env node
// Creates GitHub labels for the glinterest repo.
// Usage: node scripts/seed-labels.js
// Requires: gh CLI authenticated

import { execSync } from 'child_process';

const REPO = 'Glint-Software/glinterest';

const labels = [
  { name: 'bug', color: 'd73a4a', description: "Something isn't working" },
  { name: 'feature', color: '0075ca', description: 'New feature request' },
  { name: 'enhancement', color: 'a2eeef', description: 'Improvement to existing feature' },
  { name: 'design', color: 'e99695', description: 'UI/UX design work' },
  { name: 'documentation', color: '0075ca', description: 'Documentation updates' },
  { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
  { name: 'help wanted', color: '008672', description: 'Extra attention needed' },
  { name: 'performance', color: 'fbca04', description: 'Performance improvement' },
  { name: 'accessibility', color: 'd4c5f9', description: 'Accessibility improvement' },
  { name: 'mobile', color: 'bfd4f2', description: 'Mobile/responsive issues' },
  { name: 'api', color: 'c5def5', description: 'Backend/API related' },
  { name: 'database', color: 'f9d0c4', description: 'Database related' },
  { name: 'auth', color: 'fef2c0', description: 'Authentication related' },
  { name: 'testing', color: 'bfdadc', description: 'Test coverage' },
  { name: 'devops', color: 'c2e0c6', description: 'CI/CD, build, deploy' },
  { name: 'duplicate', color: 'cfd3d7', description: 'Duplicate issue' },
  { name: 'wontfix', color: 'ffffff', description: 'Will not be fixed' },
  { name: 'priority: high', color: 'b60205', description: 'High priority' },
  { name: 'priority: medium', color: 'fbca04', description: 'Medium priority' },
  { name: 'priority: low', color: '0e8a16', description: 'Low priority' },
];

// Delete default labels first
console.log('Deleting default labels...');
const defaultLabels = ['bug', 'documentation', 'duplicate', 'enhancement', 'good first issue', 'help wanted', 'invalid', 'question', 'wontfix'];
for (const label of defaultLabels) {
  try {
    execSync(`gh label delete "${label}" --repo ${REPO} --yes`, { stdio: 'pipe' });
    console.log(`  Deleted: ${label}`);
  } catch {
    // Label might not exist
  }
}

// Create custom labels
console.log('\nCreating labels...');
for (const label of labels) {
  try {
    execSync(
      `gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --repo ${REPO}`,
      { stdio: 'pipe' }
    );
    console.log(`  Created: ${label.name}`);
  } catch {
    // Label might already exist, try to edit
    try {
      execSync(
        `gh label edit "${label.name}" --color "${label.color}" --description "${label.description}" --repo ${REPO}`,
        { stdio: 'pipe' }
      );
      console.log(`  Updated: ${label.name}`);
    } catch (e) {
      console.error(`  Failed: ${label.name} - ${e.message}`);
    }
  }
}

console.log('\nDone! Labels created.');
