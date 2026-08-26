# WhatsApp Style Chat App — Starter

Starter code for the chat assignment. Login, user list and the socket connection
are already working. **The chat events are your job.** Look for `TODO (student)`.

## What is already done

- Register / Login / Logout with JWT in an httpOnly cookie
- Protected `/chat` page
- `GET /api/chat/users` — all users except me
- Socket.IO server with the JWT handshake check
- Each user joins a room named after their user id
- Online user tracking (Map of userId -> open tabs)
- All the CSS (WhatsApp style, responsive)

## What you must build

Search the project for `TODO (student)`. There are TODOs in:

- `server/models/Message.js` — add the `read` field
- `server/socket.js` — all chat events
- `client/src/pages/Chat.jsx` — listeners, open chat, send message

### Events to build

| Event | Direction | Data |
| --- | --- | --- |
| `online:count` | server → all browsers | number |
| `chat:history` | browser → server | other user id |
| `chat:send` | browser → server | `{ to, text }` |
| `chat:message` | server → both browsers | saved message |
| `chat:unread` | browser → server | nothing |
| `chat:read` | browser → server | other user id |
| `chat:unread:update` | server → one browser | `{ userId, count }` |
| `chat:typing` (bonus) | browser → server → browser | `{ to }` |

## How to run

```bash
# 1. Server
cd server
cp .env.example .env       # then edit .env
npm install
npm run dev                # http://localhost:3000

# 2. Client (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

MongoDB must be running, locally or on Atlas.

## Testing

Open a normal window and an incognito window. Register two users. Chat between them.

## Rules

- Do not push `node_modules` or `.env`
- Minimum 6 commits with clear messages
- Put your screenshots in the `screenshots/` folder and show them below

## Screenshots

| Screen | Image |
| --- | --- |
| Login | `screenshots/01-login.png` |
| User list | `screenshots/02-userlist.png` |
| Chat | `screenshots/03-chat.png` |
| Unread badge | `screenshots/04-unread.png` |
| Mobile | `screenshots/05-mobile.png` |
| Two users | `screenshots/06-two-users.png` |

## Submit

https://student-tracking-portal.vercel.app/ → enter roll number → View Progress →
enter email → Verify & Continue → Week #8 → paste your public GitHub URL → Submit.
