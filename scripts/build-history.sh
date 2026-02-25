#!/bin/bash
# build-history.sh — Replays commits across multiple authors to create
# an organic-looking git history. Run this AFTER the app code is complete.
#
# This script:
# 1. Initializes a fresh git repo
# 2. Makes commits in phases, each attributed to a different "author"
# 3. Creates feature branches that are ahead of main
#
# IMPORTANT: Edit the email addresses below to use your actual Gmail aliases
# before running this script.
#
# Usage: cd glinterest && bash scripts/build-history.sh

set -e

# ── Author Identities ──────────────────────────────────────────────
# Replace "you" with your actual Gmail username
GMAIL_USER="jtbourke"

declare -A AUTHORS
AUTHORS[maintainer_name]="JT Bourke"
AUTHORS[maintainer_email]="${GMAIL_USER}@gmail.com"
AUTHORS[alice_name]="Alice Chen"
AUTHORS[alice_email]="${GMAIL_USER}+alicechen@gmail.com"
AUTHORS[bob_name]="Bob Martinez"
AUTHORS[bob_email]="${GMAIL_USER}+bobmartinez@gmail.com"
AUTHORS[carol_name]="Carol Park"
AUTHORS[carol_email]="${GMAIL_USER}+carolpark@gmail.com"
AUTHORS[dave_name]="Dave Wilson"
AUTHORS[dave_email]="${GMAIL_USER}+davewilson@gmail.com"

commit_as() {
  local persona=$1
  shift
  local message="$*"

  local name_key="${persona}_name"
  local email_key="${persona}_email"

  GIT_AUTHOR_NAME="${AUTHORS[$name_key]}" \
  GIT_AUTHOR_EMAIL="${AUTHORS[$email_key]}" \
  GIT_COMMITTER_NAME="${AUTHORS[$name_key]}" \
  GIT_COMMITTER_EMAIL="${AUTHORS[$email_key]}" \
  git commit -m "$message"
}

echo "=== Building organic commit history ==="
echo ""

# ── Phase 1: Initial Scaffold (Maintainer) ─────────────────────────
echo "Phase 1: Initial scaffold..."
git add package.json .gitignore LICENSE README.md
commit_as maintainer "Initial project setup"

git add client/package.json client/vite.config.js client/index.html client/public/
commit_as maintainer "Add Vite + React client scaffold"

git add server/package.json server/index.js
commit_as maintainer "Add Express server entry point"

git add .github/
commit_as maintainer "Add issue and PR templates"

# ── Phase 2: DB Schema + Auth (Bob) ────────────────────────────────
echo "Phase 2: Database and auth..."
git add server/db/schema.sql server/db/index.js
commit_as bob "Add SQLite database schema and connection"

git add server/middleware/
commit_as bob "Add JWT auth middleware"

git add server/routes/auth.js
commit_as bob "Implement auth routes (register, login)"

# ── Phase 3: Core Components (Alice) ───────────────────────────────
echo "Phase 3: Core UI components..."
git add client/src/main.jsx client/src/App.jsx
commit_as alice "Set up React app with router"

git add client/src/context/
commit_as alice "Add auth context provider"

git add client/src/utils/
commit_as alice "Add API client utility"

git add client/src/components/Layout/
commit_as alice "Add Layout component with outlet"

git add client/src/components/Header/
commit_as alice "Add Header with logo, nav, and auth buttons"

git add client/src/components/SearchBar/
commit_as alice "Add SearchBar component"

git add client/src/components/PinCard/
commit_as alice "Add PinCard with like button overlay"

git add client/src/components/PinGrid/
commit_as alice "Add masonry PinGrid layout"

git add client/src/components/BoardCard/
commit_as alice "Add BoardCard component"

git add client/src/components/Modal/
commit_as alice "Add reusable Modal component"

# ── Phase 4: Pages + Routing (Alice) ───────────────────────────────
echo "Phase 4: Pages..."
git add client/src/pages/Home/
commit_as alice "Add Home page with pin feed"

git add client/src/pages/Pin/
commit_as alice "Add Pin detail page with comments"

git add client/src/pages/Board/
commit_as alice "Add Board detail page"

git add client/src/pages/Profile/
commit_as alice "Add Profile page with tabs for pins and boards"

git add client/src/pages/Auth/
commit_as alice "Add Login and Register pages"

git add client/src/pages/Create/
commit_as alice "Add Create Pin and Create Board pages"

git add client/src/pages/Search/
commit_as alice "Add Search results page with tag pills"

git add client/src/hooks/
commit_as alice "Add useFetch custom hook"

# ── Phase 5: API Routes (Bob) ──────────────────────────────────────
echo "Phase 5: API routes..."
git add server/routes/pins.js
commit_as bob "Implement pins CRUD with likes and saves"

git add server/routes/boards.js
commit_as bob "Implement boards CRUD with pin listing"

git add server/routes/users.js
commit_as bob "Implement user profiles and follow system"

git add server/routes/comments.js
commit_as bob "Implement comments API"

git add server/routes/search.js
commit_as bob "Implement search by title, description, and tags"

git add server/middleware/errorHandler.js
commit_as bob "Add global error handler middleware"

# ── Phase 6: Styling + Theme (Carol) ───────────────────────────────
echo "Phase 6: Styling..."
git add client/src/styles/
commit_as carol "Add global styles, CSS variables, and responsive grid"

# ── Phase 7: Seed Data (Dave) ──────────────────────────────────────
echo "Phase 7: Seed data and scripts..."
git add server/db/seed.js
commit_as dave "Add database seed script with sample data"

git add scripts/commit-as.sh scripts/build-history.sh
commit_as dave "Add commit helper and history build scripts"

git add scripts/seed-labels.js scripts/seed-milestones.js
commit_as dave "Add GitHub label and milestone seed scripts"

git add scripts/seed-issues.js scripts/data/
commit_as dave "Add GitHub issue seed script with 100 issues"

git add scripts/seed-prs.js
commit_as dave "Add GitHub PR seed script"

echo ""
echo "=== Main branch history complete ==="
echo ""
echo "Next steps:"
echo "  1. Push main to GitHub"
echo "  2. Create feature branches for open PRs"
echo "  3. Run seed scripts for labels, milestones, issues, and PRs"
