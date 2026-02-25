#!/usr/bin/env node
// Creates GitHub PRs for the glinterest repo.
// Usage: node scripts/seed-prs.js [--dry-run] [--start N]
// Requires: gh CLI authenticated, branches must exist and be pushed
//
// This script expects the following branches to exist (created during the
// organic commit history phase):
//   - feature/auth (merged)
//   - feature/pin-grid (merged)
//   - feature/search (merged)
//   - feature/comments (merged)
//   - feature/boards-api (merged)
//   - feature/user-profiles (merged)
//   - feature/likes-saves (merged)
//   - feature/responsive-layout (merged)
//   - feature/tag-filtering (open, ready for review)
//   - feature/notifications (open, ready for review)
//   - feature/dark-mode (open, ready for review)
//   - feature/image-upload (draft)
//   - feature/admin-panel (draft)
//   - feature/graphql-api (closed, not merged)
//   - feature/redis-caching (closed, not merged)

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REPO = process.env.GLINTEREST_REPO || 'Glint-Software/glinterest';
const tmpDir = join(tmpdir(), 'glinterest-seed-prs');
mkdirSync(tmpDir, { recursive: true });

const prs = [
  // Merged PRs
  {
    branch: 'feature/auth',
    title: 'Add JWT authentication with login and registration',
    body: `## Summary

- Implement JWT-based auth system
- Add register and login API endpoints
- Add auth middleware for protected routes
- Create login and registration UI pages

Closes #2

## Test plan

- [x] Register new user
- [x] Login with valid credentials
- [x] Reject invalid credentials
- [x] Protected routes require auth token`,
    labels: ['auth', 'api'],
    reviewers: ['alice-chen-dev'],
    state: 'merged',
  },
  {
    branch: 'feature/pin-grid',
    title: 'Implement masonry grid layout for pin feed',
    body: `## Summary

- Add PinCard component with hover effects
- Implement CSS masonry grid layout
- Add lazy loading for images
- Responsive breakpoints for mobile/tablet/desktop

Closes #5
Related to #8

## Test plan

- [x] Grid renders correctly at all breakpoints
- [x] Images lazy load on scroll
- [x] Hover overlay shows like button`,
    labels: ['feature', 'design'],
    reviewers: ['carol-park-ux'],
    state: 'merged',
  },
  {
    branch: 'feature/search',
    title: 'Add search by title, description, and tags',
    body: `## Summary

- Add search API endpoint with LIKE queries
- Add tag-based search
- Create search results page with tag pills
- Show popular tags

Closes #15

## Test plan

- [x] Search by title returns results
- [x] Search by tag returns filtered results
- [x] Empty query shows helpful state`,
    labels: ['feature', 'api'],
    reviewers: ['alice-chen-dev'],
    state: 'merged',
  },
  {
    branch: 'feature/comments',
    title: 'Add comment system for pins',
    body: `## Summary

- Comments API with CRUD endpoints
- Comment list on pin detail page
- Add comment form for authenticated users

Closes #22

## Test plan

- [x] Add comment to pin
- [x] View comments on pin detail
- [x] Delete own comment
- [x] Anonymous users see comments but can't post`,
    labels: ['feature', 'api'],
    reviewers: ['dave-wilson-qa'],
    state: 'merged',
  },
  {
    branch: 'feature/boards-api',
    title: 'Implement boards CRUD and board detail page',
    body: `## Summary

- Boards API: create, read, update, delete
- Board detail page showing board pins
- Save pins to boards
- Private board support

Closes #10

## Test plan

- [x] Create new board
- [x] View board with pins
- [x] Save pin to board
- [x] Private boards hidden from other users`,
    labels: ['feature', 'api'],
    reviewers: ['alice-chen-dev'],
    state: 'merged',
  },
  {
    branch: 'feature/user-profiles',
    title: 'Add user profile pages with stats',
    body: `## Summary

- User profile page with avatar, bio, stats
- Tabs for pins and boards
- Follow/unfollow button
- Follower and following counts

Closes #18

## Test plan

- [x] View own profile
- [x] View other user's profile
- [x] Follow/unfollow works
- [x] Stats update correctly`,
    labels: ['feature', 'design'],
    reviewers: ['carol-park-ux'],
    state: 'merged',
  },
  {
    branch: 'feature/likes-saves',
    title: 'Add like and save functionality',
    body: `## Summary

- Toggle like on pins
- Save pins to boards
- Like count display on cards
- Liked state persists across page loads

Closes #25

## Test plan

- [x] Like/unlike pins
- [x] Like count updates in real-time
- [x] Save pin to board
- [x] Heart icon shows liked state`,
    labels: ['feature'],
    reviewers: ['bob-martinez-dev'],
    state: 'merged',
  },
  {
    branch: 'feature/responsive-layout',
    title: 'Make layout fully responsive for mobile',
    body: `## Summary

- Responsive header with collapsible navigation
- Mobile-friendly masonry grid (2 columns)
- Touch-friendly buttons and tap targets
- Pin detail page stacks vertically on mobile

Closes #30
Related to #35

## Test plan

- [x] Test on 375px viewport (iPhone SE)
- [x] Test on 768px viewport (iPad)
- [x] Test on 1440px viewport (desktop)
- [x] No horizontal scroll at any breakpoint`,
    labels: ['design', 'mobile'],
    reviewers: ['carol-park-ux'],
    state: 'merged',
  },

  // Open PRs (ready for review)
  {
    branch: 'feature/tag-filtering',
    title: 'Add tag filtering to home feed',
    body: `## Summary

- Add tag filter bar above the pin grid
- Filter pins by clicking tag pills
- Multiple tag selection support
- Clear all filters button

Related to #15, #42

## Test plan

- [ ] Click tag to filter pins
- [ ] Multiple tags narrow results
- [ ] Clear filters shows all pins
- [ ] URL updates with tag params`,
    labels: ['feature', 'enhancement'],
    reviewers: ['bob-martinez-dev'],
    state: 'open',
  },
  {
    branch: 'feature/notifications',
    title: 'Add notification system for likes and comments',
    body: `## Summary

- Notifications table in SQLite
- API endpoint for fetching user notifications
- Bell icon in header with unread count
- Mark notifications as read

Related to #55

## Test plan

- [ ] Receive notification when pin is liked
- [ ] Receive notification when pin gets a comment
- [ ] Unread count shows in header
- [ ] Mark all as read works`,
    labels: ['feature', 'api'],
    reviewers: ['alice-chen-dev'],
    state: 'open',
  },
  {
    branch: 'feature/dark-mode',
    title: 'Implement dark mode theme',
    body: `## Summary

- CSS custom properties for dark theme
- Toggle in header/settings
- Persist preference in localStorage
- Respect system preference via prefers-color-scheme

Related to #48

## Test plan

- [ ] Toggle between light and dark mode
- [ ] Preference persists across sessions
- [ ] All components render correctly in dark mode
- [ ] No contrast issues (WCAG AA)`,
    labels: ['feature', 'design', 'accessibility'],
    reviewers: ['carol-park-ux'],
    state: 'open',
  },

  // Draft PRs
  {
    branch: 'feature/image-upload',
    title: '[WIP] Add image upload with drag and drop',
    body: `## Summary

Work in progress - adding direct image upload support.

- [ ] Drag and drop zone component
- [ ] File validation (type, size)
- [ ] Upload to local storage (S3 later)
- [ ] Preview before saving
- [ ] Progress indicator

Related to #60

## Notes

Still deciding between local file storage and jumping straight to S3. Need to figure out the deployment story first.`,
    labels: ['feature', 'enhancement'],
    reviewers: [],
    state: 'draft',
  },
  {
    branch: 'feature/admin-panel',
    title: '[WIP] Admin panel for content moderation',
    body: `## Summary

Early work on an admin panel.

- [ ] Admin role in users table
- [ ] Admin dashboard page
- [ ] Report pin/comment functionality
- [ ] Ban user capability
- [ ] Content moderation queue

Related to #70

## Notes

Just scaffolding for now. Need to discuss admin role implementation with the team.`,
    labels: ['feature', 'api'],
    reviewers: [],
    state: 'draft',
  },

  // Closed (not merged)
  {
    branch: 'feature/graphql-api',
    title: 'Replace REST API with GraphQL',
    body: `## Summary

Proposed migration to GraphQL for the API layer.

- Apollo Server setup
- Type definitions for all models
- Resolvers for queries and mutations

## Discussion

After team discussion, we decided REST is fine for our use case. GraphQL adds complexity we don't need at this scale.

Closing in favor of keeping REST.`,
    labels: ['api'],
    reviewers: [],
    state: 'closed',
    close_comment: "Decided to stick with REST for now. The API is simple enough that GraphQL's benefits don't outweigh the added complexity. We can revisit if query patterns get more complex.",
  },
  {
    branch: 'feature/redis-caching',
    title: 'Add Redis caching layer for popular pins',
    body: `## Summary

- Redis cache for pin feed
- Cache invalidation on pin creation/deletion
- TTL-based expiration

## Discussion

SQLite with WAL mode is fast enough for our current traffic. Premature optimization.

Closing - we'll add caching if we actually hit performance issues.`,
    labels: ['performance', 'api'],
    reviewers: [],
    state: 'closed',
    close_comment: "Closing this - SQLite WAL mode handles our read volume just fine. Let's wait until we have actual performance data before adding infrastructure complexity.",
  },
];

const dryRun = process.argv.includes('--dry-run');
const startArg = process.argv.indexOf('--start');
const startFrom = startArg !== -1 ? parseInt(process.argv[startArg + 1]) - 1 : 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Write body to temp file and run gh command with --body-file */
function ghWithBodyFile(cmd, body) {
  const tmpFile = join(tmpDir, `body-${Date.now()}-${Math.random().toString(36).slice(2)}.md`);
  writeFileSync(tmpFile, body, 'utf-8');
  try {
    const result = execSync(`${cmd} --body-file "${tmpFile}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim();
  } finally {
    try { unlinkSync(tmpFile); } catch {}
  }
}

async function createPRs() {
  for (let i = startFrom; i < prs.length; i++) {
    const pr = prs[i];
    console.log(`\n[${i + 1}/${prs.length}] ${pr.title}`);

    if (dryRun) {
      console.log(`  Branch: ${pr.branch}`);
      console.log(`  State: ${pr.state}`);
      console.log(`  Labels: ${pr.labels.join(', ')}`);
      continue;
    }

    try {
      let cmd = `gh pr create --repo ${REPO}`;
      cmd += ` --head "${pr.branch}"`;
      cmd += ` --title "${pr.title.replace(/"/g, '\\"')}"`;

      if (pr.labels.length > 0) {
        cmd += ` --label "${pr.labels.join(',')}"`;
      }

      if (pr.reviewers && pr.reviewers.length > 0) {
        cmd += ` --reviewer "${pr.reviewers.join(',')}"`;
      }

      if (pr.state === 'draft') {
        cmd += ' --draft';
      }

      let prUrl;
      try {
        prUrl = ghWithBodyFile(cmd, pr.body);
      } catch (e) {
        // If reviewer fails (not a collaborator yet), retry without reviewer
        if (pr.reviewers?.length > 0 && e.message.includes('not found')) {
          console.log(`  Reviewers not available, creating without reviewers...`);
          let retryCmd = cmd.replace(` --reviewer "${pr.reviewers.join(',')}"`, '');
          prUrl = ghWithBodyFile(retryCmd, pr.body);
        } else {
          throw e;
        }
      }
      const prNumber = prUrl.match(/\/(\d+)$/)?.[1];
      console.log(`  Created: #${prNumber}`);

      // Handle post-creation state
      if (pr.state === 'merged') {
        await sleep(1000);
        execSync(`gh pr merge ${prNumber} --repo ${REPO} --squash --admin`, { stdio: 'pipe' });
        console.log(`  Merged`);
      } else if (pr.state === 'closed') {
        if (pr.close_comment) {
          await sleep(500);
          ghWithBodyFile(
            `gh pr comment ${prNumber} --repo ${REPO}`,
            pr.close_comment
          );
          console.log(`  Added close comment`);
        }
        await sleep(500);
        execSync(`gh pr close ${prNumber} --repo ${REPO}`, { stdio: 'pipe' });
        console.log(`  Closed`);
      }

      await sleep(1500);

    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
  }

  console.log(`\nDone! Created ${prs.length - startFrom} PRs.`);
}

createPRs();
