# GoChat

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.25-blue?logo=go" alt="Go version">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/WebSocket-real--time-%23ff69b4" alt="WebSocket">
</p>

<h3 align="center">A full-stack real-time chat application built with Go and Next.js</h3>

<p align="center">
  <b>Go</b> powers the backend: HTTP routing, WebSocket management, authentication, and SQLite persistence — all on the standard library.<br>
  <b>Next.js 16</b> drives the frontend: a modern, dark-themed UI built with Tailwind CSS v4 and shadcn/ui.
</p>

---

## ✨ Features

### Backend (Go)

| Feature | Details |
|---|---|
| **User authentication** | Signup, login, and logout with bcrypt-hashed passwords and HttpOnly JWT cookies |
| **Real-time messaging** | WebSocket-based instant messaging with automatic room broadcasts |
| **Room management** | Create, list, and join arbitrary chat rooms |
| **Live client tracking** | View active members in any room, updated in real time |
| **Persistence** | User accounts stored in a local SQLite database |
| **Zero framework dependencies** | HTTP serving via Go's `net/http` — no Gin, Echo, or Chi |

### Frontend (Next.js)

| Feature | Details |
|---|---|
| **Dark theme** | Full dark-mode UI using OKLCH color primitives |
| **Auth pages** | Login and registration with form validation and error states |
| **Room browser** | Browse available rooms, create new ones, see member counts |
| **Chat view** | Real-time messaging with dual-column layout — messages + active members |
| **System messages** | Join/leave notifications rendered as pill badges |
| **Message bubbles** | Own messages right-aligned in primary color, others left-aligned |
| **Connection status** | Live indicator showing WebSocket connection state |
| **Responsive design** | Adapts from mobile to desktop with a collapsible sidebar |
| **API proxy** | Next.js route handler proxies all API calls to the Go backend |

---

## 🏗️ Architecture

```
┌─────────────────┐      HTTP      ┌──────────────┐
│   Next.js 16    │ ──────────────▶ │   Go Server   │
│   (Frontend)    │ ◀────────────── │  :8080        │
│   :3000         │      JSON       └──────┬───────┘
└────────┬────────┘                        │
         │ WebSocket                       │ WebSocket
         ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐
│   Browser       │              │   Browser       │
│   (Client A)    │              │   (Client B)    │
└─────────────────┘              └─────────────────┘
```

The Go backend runs a **Hub** — a central goroutine that manages rooms and clients via channels. When a message arrives, it's broadcast to every client in the room. The Hub also tracks active clients and pushes live updates.

The Next.js frontend uses an **API proxy** (`app/api/[...path]/route.ts`) to forward requests to Go, avoiding CORS issues in development. WebSocket connections go directly to the Go server.

---

## 📁 Project structure

```
go-chat/
│
├── cmd/
│   └── main.go                     # Application entrypoint
│
├── db/
│   ├── db.go                       # SQLite connection setup
│   └── migrations/
│       ├── 20260510222936_add_users_table.up.sql
│       └── 20260510222936_add_users_table.down.sql
│
├── internal/
│   ├── user/
│   │   ├── user.go                 # Models, repository & service interfaces
│   │   ├── user_handler.go         # HTTP handlers (signup, login, logout)
│   │   ├── user_service.go         # Business logic, JWT generation
│   │   └── user_repository.go      # SQLite data access layer
│   └── ws/
│       ├── hub.go                  # Central event loop, room & client management
│       ├── client.go               # WebSocket client read/write loops
│       └── ws_handler.go           # HTTP handlers (rooms, WebSocket upgrade)
│
├── router/
│   └── router.go                   # Route definitions (net/http ServeMux)
│
├── util/
│   └── password.go                 # bcrypt hashing helpers
│
├── frontend/                       # Next.js 16 application
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Inter + JetBrains Mono, dark theme)
│   │   ├── globals.css             # Tailwind v4 + shadcn/ui with OKLCH tokens
│   │   ├── page.tsx                # Landing → redirects to /rooms or /login
│   │   ├── login/page.tsx          # Login form
│   │   ├── register/page.tsx       # Registration form
│   │   ├── rooms/page.tsx          # Room browser + creator panel
│   │   ├── chat/
│   │   │   ├── page.tsx            # Chat page (with Suspense)
│   │   │   └── chat-client.tsx     # WebSocket client, message list, members sidebar
│   │   └── api/[...path]/route.ts  # Proxy all requests to Go backend
│   ├── components/
│   │   ├── header.tsx              # App header with user avatar + logout
│   │   ├── chat-message.tsx        # Message bubble (own / other / system)
│   │   ├── room-card.tsx           # Room listing card with Join button
│   │   └── ui/                     # shadcn/ui primitives
│   ├── context/
│   │   └── auth-context.tsx        # Auth state (React Context + localStorage)
│   └── lib/
│       ├── api.ts                  # API client (signup, login, rooms, clients)
│       └── utils.ts                # Tailwind merge utility
│
├── Makefile                        # Build and run commands
├── go.mod / go.sum                 # Go module dependencies
└── .env                            # Environment configuration
```

---

## 🚀 Getting started

### Prerequisites

- Go 1.25+
- Node.js 20+
- Make

### Backend

```bash
# Clone and enter the project
git clone https://github.com/sankarshankar/go-chat.git
cd go-chat

# Configure your JWT secret
echo 'SECRET_KEY=your-secret-key-here' > .env

# Build and run
make run
```

The Go server starts on **`http://0.0.0.0:8080`**.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The Next.js app starts on **`http://localhost:3000`**. The API proxy forwards `/api/*` requests to the Go backend.

---

## 📡 API reference

### Authentication

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/signup` | Create a new user account | ❌ |
| `POST` | `/login` | Authenticate and receive a JWT cookie | ❌ |
| `GET`  | `/logout` | Clear the JWT session cookie | ❌ |

### Chat Rooms & WebSocket

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/ws/createRoom` | Create a new chat room (body: `{ "id": "...", "name": "..." }`) |
| `GET`  | `/ws/getRooms` | List all available rooms |
| `GET`  | `/ws/joinRoom/{roomId}?userId=...&username=...` | Upgrade to WebSocket and join a room |
| `GET`  | `/ws/getClients/{roomId}` | List connected clients in a room |

### WebSocket protocol

Once connected via `/ws/joinRoom/{roomId}`, the WebSocket sends and receives JSON messages:

**Client → Server:**
```
<plain text message>    → Sent as raw text, wrapped by server into a chat message
```

**Server → Client:**
```json
{
  "type": "chat",
  "content": "Hello everyone!",
  "roomId": "general",
  "username": "alice"
}
```

```json
{
  "type": "clients",
  "clients": [
    { "id": "1", "username": "alice" },
    { "id": "2", "username": "bob" }
  ]
}
```

---

## 🔧 Configuration

### Backend

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `SECRET_KEY` | `secret` | ✅ | JWT signing key (set via `.env` or environment variable) |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `/api` | Go backend HTTP URL (relative to use the proxy) |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8080` | Go backend WebSocket URL |

---

## 🧱 Design decisions

- **Standard library routing** — Go 1.25's `net/http` ServeMux supports method-based routing (`POST /signup`, `GET /ws/joinRoom/{roomId}`), removing the need for third-party routers.
- **Repository pattern** — The `internal/user` layer separates models, business logic, and data access behind clear interfaces, making it testable and swappable.
- **Channel-based Hub** — All room/client state is managed by a single goroutine via channels, avoiding shared-memory concurrency bugs.
- **SQLite for simplicity** — Zero-configuration database that requires no server process. Ideal for small to medium deployments.
- **HttpOnly JWT cookies** — Tokens are stored in HttpOnly cookies, preventing XSS-based token theft.
- **Next.js proxy pattern** — The `app/api/[...path]/route.ts` catch-all proxy eliminates CORS issues during development and simplifies production deployment.

---

## 🛠️ Tech stack

### Backend

| Dependency | Purpose |
|---|---|
| [gorilla/websocket](https://github.com/gorilla/websocket) | WebSocket protocol implementation |
| [golang-jwt/jwt/v5](https://github.com/golang-jwt/jwt) | JSON Web Token creation and validation |
| [mattn/go-sqlite3](https://github.com/mattn/go-sqlite3) | SQLite database driver |
| [joho/godotenv](https://github.com/joho/godotenv) | `.env` file loader |
| [golang.org/x/crypto](https://pkg.go.dev/golang.org/x/crypto) | bcrypt password hashing |

### Frontend

| Dependency | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org) | React framework with App Router |
| [React 19](https://react.dev) | UI library |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com) | Component primitives |
| [lucide-react](https://lucide.dev) | Icon library |
| [class-variance-authority](https://cva.style) | Component variant management |

---

## 📄 License

MIT
