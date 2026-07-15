```markdown
## Architecture Decision Records (ADRs)

Context: Decisions like "why SQLite over PostgreSQL" or "why JWT over sessions" aren't documented.

ADR template:
- Context, Decision, Consequences

Document key decisions:
  - SQLite for simplicity
  - JWT for stateless auth
  - Unsplash URLs over file uploads
  - CSS Modules vs Tailwind

ANALYSIS: The most relevant file to modify is `.github/ISSUE_TEMPLATE/bug_report.md` (based on issue keywords).
TARGET FILE CURRENT CONTENT:
---
name: Bug Report
about: Report a bug to help us improve Glinterest
title: '[Bug] 

## Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...
2. Click on '...
3. Scroll down to '...
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.
## Environment
- Browser: [e.g. Chrome 120]
- OS: [e.g. macOS 14.2]
- Screen size: [e.g. 1920x1080]\n
RELATED FILES FOR CONTEXT:
=== .github/ISSUE_TEMPLATE/bug_report.md ===
---
name: Bug Report
about: Report a bug to help us improve Glinterest
title: '[Bug] 

## Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...
2. Click on '...
3. Scroll down to '...
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.
## Environment
- Browser: [e.g. Chrome 120]
- OS: [e.g. macOS 14.2]
- Screen size: [e.g. 1920x1080]\n
RELATED FILES FOR CONTEXT:
=== .github/ISSUE_TEMPLATE/feature_request.md ===
---
name: Feature Request
about: Suggest a new feature for Glinterest
title: '[Feature] 

## Problem
What problem does this feature solve? Is it related to a frustration?
## Proposed Solution
Describe the solution you'd like.
## Alternatives Considered
Any alternative solutions or features you've considered.
## Additional Context
Add any mockups, screenshots, or additional context.