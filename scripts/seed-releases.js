#!/usr/bin/env node
// Creates GitHub releases for the glinterest repo.
// Usage: node scripts/seed-releases.js
// Requires: gh CLI authenticated
//
// Creates tags on the main branch and publishes releases in various states:
//   - v0.1.0, v0.1.1, v0.2.0 — published (stable)
//   - v0.3.0-beta.1 — pre-release
//   - v0.3.0 — draft

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const REPO = process.env.GLINTEREST_REPO || 'Glint-Software/glinterest';
const dryRun = process.argv.includes('--dry-run');

const tmpDir = join(tmpdir(), 'glinterest-seed-releases');
mkdirSync(tmpDir, { recursive: true });

const releases = [
  {
    tag: 'v0.1.0',
    title: 'v0.1.0 — Core Features',
    prerelease: false,
    draft: false,
    body: `## What's New

The first release of Glinterest! This includes the core functionality needed to browse, create, and organize pins.

### Features
- JWT-based authentication (register, login, logout)
- Pin creation with title, description, image URL, and tags
- Masonry grid layout for the home feed
- Board creation and management
- Pin detail page with full metadata
- Basic search by title, description, and tags

### Technical
- React 18 + Vite frontend
- Express.js + better-sqlite3 backend
- Responsive CSS layout (mobile, tablet, desktop)
- Database seed script with 64 sample pins across 8 boards

### Contributors
- @alice-chen-dev — Frontend components and pages
- @bob-martinez-dev — Backend API and auth system
- @carol-park-ux — Styling and responsive layout
- @dave-wilson-qa — Seed data and testing

**Full Changelog**: https://github.com/${REPO}/commits/v0.1.0`,
  },
  {
    tag: 'v0.1.1',
    title: 'v0.1.1 — Bug Fixes',
    prerelease: false,
    draft: false,
    body: `## Bug Fixes

- Fix search returning duplicate pins when matching both title and tag (#3)
- Fix login form not showing error for wrong password (#7)
- Fix CORS error when running client and server on different ports (#11)
- Fix database schema missing cascade deletes for saves table (#19)
- Fix register page crash when username contains spaces (#25)

**Full Changelog**: https://github.com/${REPO}/compare/v0.1.0...v0.1.1`,
  },
  {
    tag: 'v0.2.0',
    title: 'v0.2.0 — Social Features',
    prerelease: false,
    draft: false,
    body: `## What's New

Social features are here! Users can now interact with each other's content.

### Features
- **Like/unlike pins** — Heart button on pin cards with like count (#25)
- **Save pins to boards** — Save other users' pins to your own boards
- **Comments** — Add, view, and delete comments on pin detail pages (#22)
- **User profiles** — Profile page with avatar, bio, stats, and tabs for pins/boards (#18)
- **Following** — Follow/unfollow users, follower/following counts
- **Responsive layout** — Fully mobile-friendly with collapsible navigation (#30)

### Improvements
- Pin cards now show like count and comment count
- Board cards show pin count badge (#13)
- Added confirmation dialogs for destructive actions (#40)
- Optimized database queries with proper indexes (#52)

### Bug Fixes
- Fix profile stats not updating after following/unfollowing (#16)
- Fix board detail page showing duplicate pins (#30)
- Fix tags with uppercase letters creating duplicates (#42)

**Full Changelog**: https://github.com/${REPO}/compare/v0.1.1...v0.2.0`,
  },
  {
    tag: 'v0.3.0-beta.1',
    title: 'v0.3.0-beta.1 — Discovery (Preview)',
    prerelease: true,
    draft: false,
    body: `## Pre-release: Discovery Features

> **Note:** This is a beta release for testing. Some features may be incomplete or change before the stable release.

### New Features (Preview)
- **Tag filtering** — Filter the home feed by clicking tag pills
- **Notification system** — Bell icon with unread count for likes and comments
- **Dark mode** — Toggle between light and dark themes with system preference support

### Known Issues
- Tag filter URL params not fully working
- Dark mode has contrast issues on some form inputs
- Notification count may not update in real-time

### Testing
We'd appreciate feedback on these features before the stable v0.3.0 release. Please report issues with the \`v0.3.0\` milestone.

**Full Changelog**: https://github.com/${REPO}/compare/v0.2.0...v0.3.0-beta.1`,
  },
  {
    tag: 'v0.3.0',
    title: 'v0.3.0 — Discovery',
    prerelease: false,
    draft: true,
    body: `## What's New

Discovery and personalization features to help users find content they love.

### Features
- **Tag filtering on home feed** — Filter pins by clicking tag pills, multiple selection support
- **Notifications** — Bell icon in header with unread count for likes and comments
- **Dark mode** — CSS custom properties theme with system preference detection
- **Popular tags** — Tags endpoint showing trending tags by usage count

### Improvements
- Search autocomplete suggestions
- Improved mobile header layout
- Added empty states for all pages
- Toast notifications for user actions

### Bug Fixes
- Fix notification count not updating in real-time
- Fix dark mode contrast issues (WCAG AA compliance)
- Fix tag filter URL params

**Full Changelog**: https://github.com/${REPO}/compare/v0.2.0...v0.3.0`,
  },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ghWithBodyFile(cmd, body) {
  const tmpFile = join(tmpDir, `body-${Date.now()}-${Math.random().toString(36).slice(2)}.md`);
  writeFileSync(tmpFile, body, 'utf-8');
  try {
    const result = execSync(`${cmd} --notes-file "${tmpFile}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim();
  } finally {
    try { unlinkSync(tmpFile); } catch {}
  }
}

async function createReleases() {
  console.log(`Creating releases for ${REPO}...\n`);

  for (let i = 0; i < releases.length; i++) {
    const rel = releases[i];
    console.log(`[${i + 1}/${releases.length}] ${rel.title}`);

    if (dryRun) {
      console.log(`  Tag: ${rel.tag}`);
      console.log(`  Pre-release: ${rel.prerelease}`);
      console.log(`  Draft: ${rel.draft}`);
      continue;
    }

    try {
      let cmd = `gh release create "${rel.tag}" --repo ${REPO}`;
      cmd += ` --title "${rel.title}"`;
      cmd += ' --target main';

      if (rel.prerelease) cmd += ' --prerelease';
      if (rel.draft) cmd += ' --draft';

      const url = ghWithBodyFile(cmd, rel.body);
      console.log(`  Created: ${url}`);

      await sleep(1000);
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
  }

  console.log(`\nDone! Created ${releases.length} releases.`);
}

createReleases();
