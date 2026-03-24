# StackMates — Backend

> REST API and real-time server for the StackMates developer social platform.

Built with Node.js, Express, MongoDB, and Socket.io. Handles authentication, developer profiles, connection requests, a discovery feed, and real-time messaging.

---

## Tech Stack

- **Node.js + Express 5** — HTTP server and REST API
- **MongoDB + Mongoose** — database and ODM
- **Socket.io** — real-time messaging
- **JWT + bcrypt** — authentication and password hashing
- **AWS SES** — transactional emails (not active)
- **node-cron** — scheduled background jobs
- **cookie-parser + cors** — middleware
- **validator + date-fns** — input validation and date utilities

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)
- AWS account with SES configured (for email features)

### Installation

```bash
git clone https://github.com/funplay25/StackMates-BE.git
cd StackMates-BE
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_STRING=your_mongodb_connection_string
COOKIE_SECRET=your_jwt_secret

AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key

ROOM_SECRET="your_room_secret"
```

### Running locally

```bash
npm run dev       # development with nodemon
npm start         # production
```

Server runs at `http://localhost:5000`.

---

## API Routes

### Auth — `/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register a new user |
| POST | `/login` | Login and receive JWT cookie |
| POST | `/logout` | Clear auth cookie |

### Profile — `/profile`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile/view` | Get current user's profile |
| PATCH | `/profile/edit` | Update profile details |
| PATCH | `/profile/password` | Change password |

### Requests — `/request`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/request/:status/:toUserId` | Send a connection request — `status`: `interested` or `ignored` |
| POST | `/request/review/:status/:requestId` | Review a received request — `status`: `accepted` or `rejected` |

### Users — `/user`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/requests/received` | List pending incoming requests |
| GET | `/user/connections` | List accepted connections |
| GET | `/user/feed` | Discovery feed of other developers |

---

## Real-time Events (Socket.io)

Authentication is required to connect. Pass the JWT token via cookie.

| Event | Direction | Description |
|-------|-----------|-------------|
| `sendMessage` | Client → Server | Send a message to a connection |
| `receiveMessage` | Server → Client | Receive a message in real time |
| `disconnect` | — | Client disconnects from socket |

---

## Project Structure

```
src/
├── config/          # DB connection and environment config
├── models/          # Mongoose schemas (User, ConnectionRequest, Chat)
├── routes/          # Express route handlers
├── middlewares/     # Auth middleware, validators
├── utils/           # Email helpers, cron jobs
└── app.js           # Entry point
```

---

## Frontend

The frontend for this project is at: https://github.com/funplay25/StackMates-FE

---

## License

MIT
