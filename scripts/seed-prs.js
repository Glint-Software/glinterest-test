#!/usr/bin/env node
// Creates GitHub PRs for the glinterest repo.
// Usage: node scripts/seed-prs.js
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

const REPO = 'Glint-Software/glinterest';

const prs = [
  // Merged PRs
  {
    branch: 'feature/auth',
    title: 'Add JWT authentication with login and registration',
    body: `## Summary\n\n- Implement JWT-based auth system\n- Add register and login API endpoints\n- Add auth middleware for protected routes\n- Create login and registration UI pages\n\nCloses #2\n\n## Test plan\n\n- [x] Register new user\n- [x] Login with valid credentials\n- [x] Reject invalid credentials\n- [x] Protected routes require auth token`,
    labels: ['auth', 'api'],
    reviewers: ['alice-chen-dev'],
    state: 'merged',
  },
  {
    branch: 'feature/pin-grid',
    title: 'Implement masonry grid layout for pin feed',
    body: `## Summary\n\n- Add PinCard component with hover effects\n- Implement CSS masonry grid layout\n- Add lazy loading for images\n- Responsive breakpoints for mobile/tablet/desktop\n\nCloses #5\nRelated to #8\n\n## Test plan\n\n- [x] Grid renders correctly at all breakpoints\n- [x] Images lazy load on scroll\n- [x] Hover overlay shows like button`,
    labels: ['feature', 'design'],
    reviewers: ['carol-park-ux'],
    state: 'merged',
  },
  {
    branch: 'feature/search',
    title: 'Add search by title, description, and tags',
    body: `## Summary\n\n- Add search API endpoint with LIKE queries\n- Add tag-based search\n- Create search results page with tag pills\n- Show popular tags\n\nCloses #15\n\n## Test plan\n\n- [x] Search by title returns results\n- [x] Search by tag returns filtered results\n- [x] Empty query shows helpful state`,
    labels: ['feature', 'api'],
    reviewers: ['alice-chen-dev'],
    state: 'merged',
  },
  {
    branch: 'feature/comments',
    title: 'Add comment system for pins',
    body: `## Summary\n\n- Comments API with CRUD endpoints\n- Comment list on pin detail page\n- Add comment form for authenticated users\n\nCloses #22\n\n## Test plan\n\n- [x] Add comment to pin\n- [x] View comments on pin detail\n- [x] Delete own comment\n- [x] Anonymous users see comments but can't post`,
    labels: ['feature', 'api'],
    reviewers: ['dave-wilson-qa'],
    state: 'merged',
  },
  {
    branch: 'feature/boards-api',
    title: 'Implement boards CRUD and board detail page',
    body: `## Summary\n\n- Boards API: create, read, update, delete\n- Board detail page showing board pins\n- Save pins to boards\n- Private board support\n\nCloses #10\n\n## Test plan\n\n- [x] Create new board\n- [x] View board with pins\n- [x] Save pin to board\n- [x] Private boards hidden from other users`,
    labels: ['feature', 'api'],
    reviewers: ['alice-chen-dev'],
    state: 'merged',
  },
  {
    branch: 'feature/user-profiles',
    title: 'Add user profile pages with stats',
    body: `## Summary\n\n- User profile page with avatar, bio, stats\n- Tabs for pins and boards\n- Follow/unfollow button\n- Follower and following counts\n\nCloses #18\n\n## Test plan\n\n- [x] View own profile\n- [x] View other user's profile\n- [x] Follow/unfollow works\n- [x] Stats update correctly`,
    labels: ['feature', 'design'],
    reviewers: ['carol-park-ux'],
    state: 'merged',
  },
  {
    branch: 'feature/likes-saves',
    title: 'Add like and save functionality',
    body: `## Summary\n\n- Toggle like on pins\n- Save pins to boards\n- Like count display on cards\n- Liked state persists across page loads\n\nCloses #25\n\n## Test plan\n\n- [x] Like/unlike pins\n- [x] Like count updates in real-time\n- [x] Save pin to board\n- [x] Heart icon shows liked state`,
    labels: ['feature'],
    reviewers: ['bob-martinez-dev'],
    state: 'merged',
  },
  {
    branch: 'feature/responsive-layout',
    title: 'Make layout fully responsive for mobile',
    body: `## Summary\n\n- Responsive header with collapsible navigation\n- Mobile-friendly masonry grid (2 columns)\n- Touch-friendly buttons and tap targets\n- Pin detail page stacks vertically on mobile\n\nCloses #30\nRelated to #35\n\n## Test plan\n\n- [x] Test on 375px viewport (iPhone SE)\n- [x] Test on 768px viewport (iPad)\n- [x] Test on 1440px viewport (desktop)\n- [x] No horizontal scroll at any breakpoint`,
    labels: ['design', 'mobile'],
    reviewers: ['carol-park-ux'],
    state: 'merged',
  },

  // Open PRs (ready for review)
  {
    branch: 'feature/tag-filtering',
    title: 'Add tag filtering to home feed',
    body: `## Summary\n\n- Add tag filter bar above the pin grid\n- Filter pins by clicking tag pills\n- Multiple tag selection support\n- Clear all filters button\n\nRelated to #15, #42\n\n## Test plan\n\n- [ ] Click tag to filter pins\n- [ ] Multiple tags narrow results\n- [ ] Clear filters shows all pins\n- [ ] URL updates with tag params`,
    labels: ['feature', 'enhancement'],
    reviewers: ['bob-martinez-dev'],
    state: 'open',
  },
  {
    branch: 'feature/notifications',
    title: 'Add notification system for likes and comments',
    body: `## Summary\n\n- Notifications table in SQLite\n- API endpoint for fetching user notifications\n- Bell icon in header with unread count\n- Mark notifications as read\n\nRelated to #55\n\n## Test plan\n\n- [ ] Receive notification when pin is liked\n- [ ] Receive notification when pin gets a comment\n- [ ] Unread count shows in header\n- [ ] Mark all as read works`,
    labels: ['feature', 'api'],
    reviewers: ['alice-chen-dev'],
    state: 'open',
  },
  {
    branch: 'feature/dark-mode',
    title: 'Implement dark mode theme',
    body: `## Summary\n\n- CSS custom properties for dark theme\n- Toggle in header/settings\n- Persist preference in localStorage\n- Respect system preference via prefers-color-scheme\n\nRelated to #48\n\n## Test plan\n\n- [ ] Toggle between light and dark mode\n- [ ] Preference persists across sessions\n- [ ] All components render correctly in dark mode\n- [ ] No contrast issues (WCAG AA)`,
    labels: ['feature', 'design', 'accessibility'],
    reviewers: ['carol-park-ux'],
    state: 'open',
  },

  // Draft PRs
  {
    branch: 'feature/image-upload',
    title: '[WIP] Add image upload with drag and drop',
    body: `## Summary\n\nWork in progress - adding direct image upload support.\n\n- [ ] Drag and drop zone component\n- [ ] File validation (type, size)\n- [ ] Upload to local storage (S3 later)\n- [ ] Preview before saving\n- [ ] Progress indicator\n\nRelated to #60\n\n## Notes\n\nStill deciding between local file storage and jumping straight to S3. Need to figure out the deployment story first.`,
    labels: ['feature', 'enhancement'],
    reviewers: [],
    state: 'draft',
  },
  {
    branch: 'feature/admin-panel',
    title: '[WIP] Admin panel for content moderation',
    body: `## Summary\n\nEarly work on an admin panel.\n\n- [ ] Admin role in users table\n- [ ] Admin dashboard page\n- [ ] Report pin/comment functionality\n- [ ] Ban user capability\n- [ ] Content moderation queue\n\nRelated to #70\n\n## Notes\n\nJust scaffolding for now. Need to discuss admin role implementation with the team.`,
    labels: ['feature', 'api'],
    reviewers: [],
    state: 'draft',
  },

  // Closed (not merged)
  {
    branch: 'feature/graphql-api',
    title: 'Replace REST API with GraphQL',
    body: `## Summary\n\nProposed migration to GraphQL for the API layer.\n\n- Apollo Server setup\n- Type definitions for all models\n- Resolvers for queries and mutations\n\n## Discussion\n\nAfter team discussion, we decided REST is fine for our use case. GraphQL adds complexity we don't need at this scale.\n\nClosing in favor of keeping REST.`,
    labels: ['api'],
    reviewers: [],
    state: 'closed',
    close_comment: "Decided to stick with REST for now. The API is simple enough that GraphQL's benefits don't outweigh the added complexity. We can revisit if query patterns get more complex.",
  },
  {
    branch: 'feature/redis-caching',
    title: 'Add Redis caching layer for popular pins',
    body: `## Summary\n\n- Redis cache for pin feed\n- Cache invalidation on pin creation/deletion\n- TTL-based expiration\n\n## Discussion\n\nSQLite with WAL mode is fast enough for our current traffic. Premature optimization.\n\nClosing — we'll add caching if we actually hit performance issues.`,
    labels: ['performance', 'api'],
    reviewers: [],
    state: 'closed',
    close_comment: "Closing this — SQLite WAL mode handles our read volume just fine. Let's wait until we have actual performance data before adding infrastructure complexity.",
  },
];

const dryRun = process.argv.includes('--dry-run');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createPRs() {
  for (let i = 0; i < prs.length; i++) {
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
      cmd += ` --body "${pr.body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;

      if (pr.labels.length > 0) {
        cmd += ` --label "${pr.labels.join(',')}"`;
      }

      if (pr.reviewers && pr.reviewers.length > 0) {
        cmd += ` --reviewer "${pr.reviewers.join(',')}"`;
      }

      if (pr.state === 'draft') {
        cmd += ' --draft';
      }

      const result = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
      const prUrl = result.trim();
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
          execSync(
            `gh pr comment ${prNumber} --repo ${REPO} --body "${pr.close_comment.replace(/"/g, '\\"')}"`,
            { stdio: 'pipe' }
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

  console.log(`\nDone! Created ${prs.length} PRs.`);
}

createPRs();
