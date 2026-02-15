# MeChat 💬

A real-time chat application built with React, Node.js, Socket.io, Better-Auth, and Drizzle ORM. Users can sign up, join chat rooms, and exchange messages instantly — all persisted in a local SQLite database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Routing | React Router v7 (framework mode) |
| Backend | Node.js + Express 5 |
| Real-time | Socket.io |
| Auth | Better-Auth |
| ORM | Drizzle ORM |
| Database | SQLite (via better-sqlite3) |
| Styling | CSS / Tailwind |

---

## Project Structure

```
mechat/
├── server/
│   ├── src/
│   │   ├── auth.ts            # Better-Auth configuration
│   │   ├── index.ts           # Express server + Socket.io
│   │   └── db/
│   │       ├── client.ts      # Drizzle + SQLite connection
│   │       └── schema.ts      # All table & relation definitions
│   ├── drizzle/
│   │   └── migrations/        # Auto-generated migration files
│   ├── drizzle.config.ts
│   ├── chat.db                # SQLite database (auto-created)
│   └── .env
└── client/
    ├── src/
    │   ├── lib/
    │   │   ├── auth-client.ts  # Better-Auth React client
    │   │   └── socket.ts       # Socket.io singleton
    │   ├── routes/
    │   │   ├── login.tsx
    │   │   ├── register.tsx
    │   │   └── chat.tsx
    │   ├── app/
    │   │   ├── root.tsx
    │   │   └── routes.ts
    │   └── app.css
    └── .env
```

---

## Prerequisites

- Node.js v18+
- npm v9+

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Ladkan/MeChat.git
cd mechat
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```bash
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:8000
```

> Generate a secret with: `npx @better-auth/cli secret`

Run database migrations to create `chat.db`:

```bash
npm run db:migrate
```

Start the dev server:

```bash
npm run dev
```

The server will be running at `http://localhost:8000`.

### 3. Set up the client

```bash
cd ../client
npm install
npm run dev
```

The client will be running at `http://localhost:5173`.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `BETTER_AUTH_SECRET` | Secret key used to sign sessions | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | The base URL of the server | `http://localhost:8000` |

### Client (`client/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_SERVER_URL` | Server base URL (optional, defaults to localhost) | `http://localhost:8000` |

---

## Available Scripts

### Server

| Script | Description |
|---|---|
| `npm run dev` | Start server with hot reload via `tsx watch` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run db:generate` | Generate Drizzle migrations from schema changes |
| `npm run db:migrate` | Apply pending migrations to `chat.db` |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |

### Client

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## Features

- **Authentication** — Sign up and sign in with email & password via Better-Auth. Sessions are managed via secure HTTP-only cookies.
- **Protected routes** — Unauthenticated users are redirected to `/login` via React Router `clientLoader`.
- **Real-time messaging** — Messages are broadcast instantly to all users in a room using Socket.io.
- **Message persistence** — All messages are saved to SQLite and loaded on room join.
- **Multiple rooms** — Users can join and switch between different chat rooms.
- **Typing indicators** — Live "user is typing..." feedback via Socket.io events.
- **Session-protected WebSockets** — Socket.io connections are authenticated using the Better-Auth session cookie in the `io.use()` middleware.

---

## API Reference

### Auth endpoints (handled by Better-Auth)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/sign-up/email` | Register a new user |
| `POST` | `/api/auth/sign-in/email` | Sign in and receive a session cookie |
| `POST` | `/api/auth/sign-out` | Invalidate the current session |
| `GET` | `/api/auth/get-session` | Get the current session |

### App endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/rooms/:roomId/messages` | Fetch message history for a room (auth required) |

### Socket.io events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `join_room` | Client → Server | `roomId: string` | Join a chat room |
| `send_message` | Client → Server | `{ roomId, content }` | Send a message to a room |
| `receive_message` | Server → Client | `{ id, content, sender, roomId, createdAt }` | Broadcast a new message |
| `typing` | Client → Server | `{ roomId }` | Notify the room the user is typing |
| `user_typing` | Server → Client | `{ name }` | Broadcast typing notification to room |

---

## Database Schema

```
user          — id, name, email, emailVerified, image, createdAt, updatedAt
session       — id, expiresAt, token, userId, ipAddress, userAgent
account       — id, accountId, providerId, userId, password
verification  — id, identifier, value, expiresAt
room          — id, name, creatorId, createdAt
message       — id, content, roomId, userId, createdAt
```

> The `user`, `session`, `account`, and `verification` tables are managed automatically by Better-Auth.

---

## License

MIT