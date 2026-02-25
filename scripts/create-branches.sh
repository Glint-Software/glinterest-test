#!/bin/bash
# create-branches.sh — Creates feature branches with small changes
# for use in GitHub PRs. Run AFTER build-history.sh and pushing main.
#
# Usage: cd glinterest && bash scripts/create-branches.sh

set -e

GMAIL_USER="jtbourke"

commit_as() {
  local persona=$1
  shift
  local message="$*"

  case $persona in
    alice) NAME="Alice Chen"; EMAIL="${GMAIL_USER}+alicechen@gmail.com" ;;
    bob)   NAME="Bob Martinez"; EMAIL="${GMAIL_USER}+bobmartinez@gmail.com" ;;
    carol) NAME="Carol Park"; EMAIL="${GMAIL_USER}+carolpark@gmail.com" ;;
    dave)  NAME="Dave Wilson"; EMAIL="${GMAIL_USER}+davewilson@gmail.com" ;;
  esac

  GIT_AUTHOR_NAME="$NAME" GIT_AUTHOR_EMAIL="$EMAIL" \
  GIT_COMMITTER_NAME="$NAME" GIT_COMMITTER_EMAIL="$EMAIL" \
  git commit -m "$message"
}

echo "=== Creating feature branches ==="

# ── feature/tag-filtering (Alice, open) ─────────────────────────────
echo "Creating feature/tag-filtering..."
git checkout -b feature/tag-filtering main

cat >> client/src/components/PinGrid/PinGrid.css << 'EOF'

.tag-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 8px;
}

.tag-filter-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  transition: all 0.15s;
  cursor: pointer;
  border: none;
}

.tag-filter-btn.active {
  background: var(--color-text);
  color: white;
}

.tag-filter-btn:hover:not(.active) {
  background: var(--color-border);
}
EOF

git add -A
commit_as alice "Add tag filter bar styles"

cat > client/src/components/TagFilter/TagFilter.jsx << 'JSXEOF'
import { useState, useEffect } from 'react';
import api from '../../utils/api.js';

export default function TagFilter({ onTagSelect, selectedTags = [] }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    api.get('/api/search/tags').then(setTags).catch(console.error);
  }, []);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagSelect(selectedTags.filter(t => t !== tag));
    } else {
      onTagSelect([...selectedTags, tag]);
    }
  };

  return (
    <div className="tag-filter-bar">
      {tags.slice(0, 12).map(t => (
        <button
          key={t.tag}
          className={`tag-filter-btn ${selectedTags.includes(t.tag) ? 'active' : ''}`}
          onClick={() => toggleTag(t.tag)}
        >
          #{t.tag}
        </button>
      ))}
      {selectedTags.length > 0 && (
        <button className="tag-filter-btn" onClick={() => onTagSelect([])}>
          Clear all
        </button>
      )}
    </div>
  );
}
JSXEOF

mkdir -p client/src/components/TagFilter
git add -A
commit_as alice "Add TagFilter component"

# ── feature/notifications (Bob, open) ───────────────────────────────
echo "Creating feature/notifications..."
git checkout -b feature/notifications main

cat >> server/db/schema.sql << 'EOF'

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    related_pin_id INTEGER,
    related_user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
EOF

git add -A
commit_as bob "Add notifications table schema"

cat > server/routes/notifications.js << 'JSEOF'
import { Router } from 'express';
import db from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, (req, res) => {
  const notifications = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(req.user.id);

  const unreadCount = db.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
  ).get(req.user.id).count;

  res.json({ notifications, unreadCount });
});

router.post('/read', authenticateToken, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'All notifications marked as read' });
});

export default router;
JSEOF

git add -A
commit_as bob "Add notifications API routes"

# ── feature/dark-mode (Carol, open) ─────────────────────────────────
echo "Creating feature/dark-mode..."
git checkout -b feature/dark-mode main

cat > client/src/styles/dark.css << 'EOF'
[data-theme="dark"] {
  --color-primary: #e60023;
  --color-primary-hover: #ff3347;
  --color-bg: #1a1a1a;
  --color-bg-secondary: #2a2a2a;
  --color-text: #e0e0e0;
  --color-text-secondary: #a0a0a0;
  --color-text-light: #666666;
  --color-border: #3a3a3a;
  --color-overlay: rgba(0, 0, 0, 0.7);
  --color-card-hover: rgba(255, 255, 255, 0.06);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.5);
}
EOF

git add -A
commit_as carol "Add dark mode CSS variables"

cat > client/src/hooks/useTheme.js << 'EOF'
import { useState, useEffect } from 'react';

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, toggle };
}
EOF

git add -A
commit_as carol "Add useTheme hook with system preference detection"

# ── feature/image-upload (Alice, draft) ─────────────────────────────
echo "Creating feature/image-upload..."
git checkout -b feature/image-upload main

mkdir -p client/src/components/DropZone
cat > client/src/components/DropZone/DropZone.jsx << 'JSXEOF'
import { useState, useRef } from 'react';
import './DropZone.css';

export default function DropZone({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => { handleDrag(e); setIsDragging(true); };
  const handleDragOut = (e) => { handleDrag(e); setIsDragging(false); };

  const handleDrop = (e) => {
    handleDrag(e);
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`dropzone ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <p>Drag and drop an image here, or click to browse</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />
    </div>
  );
}
JSXEOF

cat > client/src/components/DropZone/DropZone.css << 'EOF'
.dropzone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--color-text-secondary);
}

.dropzone:hover, .dropzone.dragging {
  border-color: var(--color-primary);
  background: rgba(230, 0, 35, 0.04);
}
EOF

git add -A
commit_as alice "Add DropZone component for image uploads"

# ── feature/admin-panel (Bob, draft) ────────────────────────────────
echo "Creating feature/admin-panel..."
git checkout -b feature/admin-panel main

cat >> server/db/schema.sql << 'EOF'

ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER NOT NULL,
    pin_id INTEGER,
    comment_id INTEGER,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);
EOF

git add -A
commit_as bob "Add admin role and reports table schema"

# ── feature/graphql-api (Bob, will be closed) ───────────────────────
echo "Creating feature/graphql-api..."
git checkout -b feature/graphql-api main

cat > server/graphql-schema.js << 'EOF'
// Experimental GraphQL schema — decided not to pursue this
export const typeDefs = `
  type User {
    id: ID!
    username: String!
    displayName: String!
    avatarUrl: String
    pins: [Pin!]!
    boards: [Board!]!
  }

  type Pin {
    id: ID!
    title: String!
    description: String
    imageUrl: String!
    user: User!
    likeCount: Int!
    tags: [String!]!
  }

  type Board {
    id: ID!
    title: String!
    description: String
    user: User!
    pins: [Pin!]!
  }

  type Query {
    pins(limit: Int, offset: Int): [Pin!]!
    pin(id: ID!): Pin
    boards: [Board!]!
    board(id: ID!): Board
    user(id: ID!): User
    search(query: String!): [Pin!]!
  }
`;
EOF

git add -A
commit_as bob "Draft GraphQL schema types"

# ── feature/redis-caching (Bob, will be closed) ────────────────────
echo "Creating feature/redis-caching..."
git checkout -b feature/redis-caching main

cat > server/utils/cache.js << 'EOF'
// Redis caching layer — experimental, may not be needed
// SQLite with WAL mode is performing well enough for now

class CacheLayer {
  constructor() {
    this.store = new Map(); // In-memory fallback
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttl = this.ttl) {
    this.store.set(key, { value, expires: Date.now() + ttl });
  }

  invalidate(pattern) {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) this.store.delete(key);
    }
  }
}

export default new CacheLayer();
EOF

git add -A
commit_as bob "Add in-memory cache layer prototype"

# ── Return to main ──────────────────────────────────────────────────
git checkout main

echo ""
echo "=== Feature branches created ==="
echo ""
echo "Branches:"
echo "  feature/tag-filtering     (2 commits ahead of main) — for open PR"
echo "  feature/notifications     (2 commits ahead of main) — for open PR"
echo "  feature/dark-mode         (2 commits ahead of main) — for open PR"
echo "  feature/image-upload      (1 commit ahead of main)  — for draft PR"
echo "  feature/admin-panel       (1 commit ahead of main)  — for draft PR"
echo "  feature/graphql-api       (1 commit ahead of main)  — for closed PR"
echo "  feature/redis-caching     (1 commit ahead of main)  — for closed PR"
echo ""
echo "Push all branches:"
echo "  git push origin --all"
echo ""
echo "Then run seed scripts:"
echo "  node scripts/seed-labels.js"
echo "  node scripts/seed-milestones.js"
echo "  node scripts/seed-issues.js"
echo "  node scripts/seed-prs.js"
