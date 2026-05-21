# go-chat

A real-time chat server built with Go, WebSockets, and SQLite.

## Features

- **User authentication** — signup, login, and logout with bcrypt-hashed passwords and JWT session cookies
- **Real-time messaging** — WebSocket-based instant messaging within chat rooms
- **Room management** — create and list chat rooms, view connected clients
- **SQLite persistence** — user data stored in a local SQLite database
- **Zero framework dependencies** — built entirely on Go's standard library (`net/http`) plus minimal external packages

## API

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Create a new user account |
| POST | `/login` | Authenticate and receive a JWT cookie |
| GET | `/logout` | Clear the JWT session cookie |

### WebSocket

| Method | Path | Description |
|--------|------|-------------|
| POST | `/ws/createRoom` | Create a new chat room |
| GET | `/ws/getRooms` | List all available rooms |
| GET | `/ws/joinRoom/{roomId}` | Upgrade to WebSocket and join a room |
| GET | `/ws/getClients/{roomId}` | List connected clients in a room |

## Quick start

```
make run
```

The server starts on `http://0.0.0.0:8080`.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `secret` | JWT signing key (set via `.env` or env var) |

Create a `.env` file in the project root:

```
SECRET_KEY=your-secret-key-here
```

## Project structure

```
cmd/
  main.go                  # Application entrypoint
db/
  db.go                    # SQLite connection
  migrations/              # Database schema migrations
internal/
  user/
    user.go                # Models, repository & service interfaces
    user_handler.go        # HTTP handlers (signup, login, logout)
    user_service.go        # Business logic, JWT generation
    user_repository.go     # SQLite data access
  ws/
    hub.go                 # Central event loop, room & client management
    client.go              # WebSocket client read/write loops
    ws_handler.go          # HTTP handlers (rooms, WebSocket upgrade)
router/
  router.go                # Route definitions
util/
  password.go              # bcrypt hashing helpers
```

## Dependencies

- [gorilla/websocket](https://github.com/gorilla/websocket) — WebSocket protocol
- [golang-jwt/jwt](https://github.com/golang-jwt/jwt) — JSON Web Tokens
- [mattn/go-sqlite3](https://github.com/mattn/go-sqlite3) — SQLite driver
- [joho/godotenv](https://github.com/joho/godotenv) — `.env` file loader
- [golang.org/x/crypto](https://pkg.go.dev/golang.org/x/crypto) — bcrypt password hashing
