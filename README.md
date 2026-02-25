# Glinterest 📌

A Pinterest-inspired image bookmarking app built with React and Express.

## Features

- **Pins** — Save and share images with titles, descriptions, and tags
- **Boards** — Organize pins into themed collections
- **Masonry Grid** — Beautiful responsive layout for browsing pins
- **Search** — Find pins by title, description, or tags
- **Social** — Follow users, like and save pins, comment on pins
- **Auth** — Secure JWT-based authentication

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

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

MIT — see [LICENSE](LICENSE) for details.
