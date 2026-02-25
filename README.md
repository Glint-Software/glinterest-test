# Glinterest

A Pinterest-inspired image bookmarking app built with React and Express.

## Features

- **Pins** — Save and share images with titles, descriptions, and tags
- **Boards** — Organize pins into themed collections
- **Masonry Grid** — Beautiful responsive layout for browsing pins
- **Search** — Find pins by title, description, or tags
- **Social** — Follow users, like and save pins, comment on pins
- **Auth** — Secure JWT-based authentication

## Purpose

This repo is a **test and marketing asset for [Glint](https://github.com/Glint-Software/glint)**, our Tauri-based GitHub desktop client. It provides a realistic, fully-populated GitHub repository that showcases Glint's features:

- **112 GitHub issues** with labels, milestones, assignees, and comment threads
- **15 pull requests** in various states (merged, open, draft, closed)
- **20 labels** and **4 milestones**
- **Organic git history** with 38 commits across 5 contributors
- **15 branches** (feature branches in various lifecycle stages)

### Repo variants

| Repo | Purpose | Who touches it |
|------|---------|----------------|
| `Glint-Software/glinterest` | Marketing — screenshots, videos, tutorials. **Never modify.** | Nobody (read-only showcase) |
| `Glint-Software/glinterest-test-<name>` | QA testing — each tester gets their own copy to freely trash. | Individual testers |

Testers should **never test against the marketing repo**. Use the reset script to create or rebuild your personal test repo (see [Scripts](#scripts) below).

## Tech Stack

- **Frontend:** React 18 + Vite + React Router
- **Backend:** Express.js + better-sqlite3
- **Auth:** JWT (JSON Web Tokens)
- **Images:** Unsplash URLs (no file upload required)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repo
git clone https://github.com/Glint-Software/glinterest.git
cd glinterest

# Install dependencies
npm install

# Seed the database
npm run seed

# Start development servers
npm run dev
```

The client runs on `http://localhost:5173` and the API on `http://localhost:3001`.

### Demo Accounts

After seeding, you can log in with:

| Email | Password |
|-------|----------|
| alice@example.com | password123 |
| bob@example.com | password123 |
| carol@example.com | password123 |
| dave@example.com | password123 |

## Project Structure

```
glinterest/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── scripts/         # Seed & automation scripts
└── .github/         # Issue/PR templates
```

## Scripts

All scripts live in `scripts/` and use the `gh` CLI. They must be run from the repo root.

### `reset-repo.js` — Full repo reset

Deletes the target GitHub repo and recreates it from scratch with all branches, collaborators, labels, milestones, issues, and PRs. This is the main script testers will use.

```bash
# Reset the marketing repo (you probably shouldn't do this)
node scripts/reset-repo.js

# Reset your personal test repo
node scripts/reset-repo.js --repo glinterest-test-jordan

# Skip the confirmation prompt
node scripts/reset-repo.js --repo glinterest-test-jordan --confirm

# Preview what would happen without doing anything
node scripts/reset-repo.js --repo glinterest-test-jordan --dry-run
```

The `--repo` flag accepts either a short name (e.g. `glinterest-test-jordan`) which is resolved under the `Glint-Software` org, or a full `owner/name` path.

### `seed-labels.js` — Create GitHub labels

Deletes default labels and creates 20 custom ones (bug, feature, enhancement, design, api, priority levels, etc.). Idempotent — safe to re-run.

### `seed-milestones.js` — Create milestones

Creates 4 milestones: v0.1 Core, v0.2 Social, v0.3 Discovery, v1.0 Launch.

### `seed-issues.js` — Create 112 issues

Creates all issues from `scripts/data/issues.json` with labels, milestones, assignees, comments, and open/closed states. Supports `--dry-run` and `--start=N` for resuming after errors.

### `seed-prs.js` — Create 15 pull requests

Creates PRs in various states: 8 merged (squash), 3 open with reviewers, 2 drafts, 2 closed with comments. Supports `--dry-run` and `--start N`.

### `build-history.sh` — Replay git commit history

Replays 38 commits across 5 authors to build an organic-looking git history. Only needed if rebuilding the repo from scratch (the reset script pushes existing local history).

### `create-branches.sh` — Create feature branches

Creates the 7 non-merged feature branches (tag-filtering, notifications, dark-mode, image-upload, admin-panel, graphql-api, redis-caching) with real code changes.

## Tester Quick Start

1. Clone this repo locally (one-time):
   ```bash
   git clone https://github.com/Glint-Software/glinterest.git
   cd glinterest
   npm install
   ```

2. Create or reset your personal test repo:
   ```bash
   node scripts/reset-repo.js --repo glinterest-test-yourname --confirm
   ```

3. Open `Glint-Software/glinterest-test-yourname` in Glint and start testing.

4. When you've trashed it, reset again:
   ```bash
   node scripts/reset-repo.js --repo glinterest-test-yourname --confirm
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| GET | /api/pins | List pins (paginated) |
| POST | /api/pins | Create pin |
| GET | /api/pins/:id | Pin detail |
| DELETE | /api/pins/:id | Delete pin |
| POST | /api/pins/:id/like | Like/unlike pin |
| POST | /api/pins/:id/save | Save pin to board |
| GET | /api/boards | List boards |
| POST | /api/boards | Create board |
| GET | /api/boards/:id | Board detail with pins |
| GET | /api/users/:id | User profile |
| POST | /api/users/:id/follow | Follow/unfollow |
| GET | /api/search | Search pins |
| GET | /api/comments/:pinId | Get comments |
| POST | /api/comments/:pinId | Add comment |

## License

MIT — see [LICENSE](LICENSE) for details.
