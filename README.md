# Avishkar — IDEA Leaderboard API

Backend for the IDEA competition leaderboard. Built with **ElysiaJS + Bun + Drizzle ORM + SQLite**.

> **For devs:** The API is read-only. There are no write endpoints — scores are managed by the backend maintainers. Everything you need to consume the API is documented below.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local dev   | `http://localhost:3000` |

An interactive Swagger UI is also available at `{base_url}/swagger`.

---

## Response Format

Every endpoint returns the same envelope:

```json
// success
{ "success": true, "data": { ... } }

// error
{ "success": false, "error": "description" }
```

---

## Endpoints

### `GET /health`

Server health check.

**Response**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-02-25T00:07:00.000Z"
  }
}
```

---

### `GET /leaderboard`

Returns **all teams** ranked by their **total score** across all events, descending.

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `event_id` | number | ❌ | Filter leaderboard to a single event |

**Example — overall leaderboard**
```
GET /leaderboard
```
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "teamId": 3,
      "teamName": "Circuit Breakers",
      "college": "Anna University",
      "totalScore": 263,
      "eventBreakdown": [
        { "eventId": 1, "eventName": "Coding Challenge", "score": 78 },
        { "eventId": 2, "eventName": "Robotics",         "score": 140 },
        { "eventId": 3, "eventName": "Quiz Blitz",       "score": 45 }
      ]
    },
    {
      "rank": 2,
      "teamId": 1,
      "teamName": "Alpha Coders",
      "college": "NIT Trichy",
      "totalScore": 257,
      "eventBreakdown": [ ... ]
    }
  ]
}
```

**Example — filter to one event**
```
GET /leaderboard?event_id=1
```
Returns the same shape, but `totalScore` and `eventBreakdown` only contain data for that event, and teams are ranked accordingly.

---

### `GET /leaderboard/teams/:id`

Returns a **single team** with its full per-event score breakdown.

> Note: `rank` is `0` in this endpoint — use `GET /leaderboard` to get the ranked list.

**Path Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `id` | number | Team ID |

**Example**
```
GET /leaderboard/teams/1
```
```json
{
  "success": true,
  "data": {
    "rank": 0,
    "teamId": 1,
    "teamName": "Alpha Coders",
    "college": "NIT Trichy",
    "totalScore": 257,
    "eventBreakdown": [
      { "eventId": 1, "eventName": "Coding Challenge", "score": 85 },
      { "eventId": 2, "eventName": "Robotics",         "score": 130 },
      { "eventId": 3, "eventName": "Quiz Blitz",       "score": 42 }
    ]
  }
}
```

**404 — Team not found**
```json
{ "success": false, "error": "team not found" }
```

---

### `GET /teams`

Returns a flat list of all teams (no scores), ordered alphabetically.

**Example**
```
GET /teams
```
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Alpha Coders",    "college": "NIT Trichy",      "createdAt": "2026-02-24 17:54:45" },
    { "id": 2, "name": "Byte Brigade",    "college": "PSG Tech",         "createdAt": "2026-02-24 17:54:45" },
    { "id": 3, "name": "Circuit Breakers","college": "Anna University",  "createdAt": "2026-02-24 17:54:45" }
  ]
}
```

---

### `GET /teams/:id`

Returns a single team by ID (no scores).

**Example**
```
GET /teams/2
```
```json
{
  "success": true,
  "data": { "id": 2, "name": "Byte Brigade", "college": "PSG Tech", "createdAt": "2026-02-24 17:54:45" }
}
```

**404 — Team not found**
```json
{ "success": false, "error": "team not found" }
```

---

### `GET /events`

Returns all competition events, ordered alphabetically.

**Example**
```
GET /events
```
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Coding Challenge", "maxScore": 100, "createdAt": "..." },
    { "id": 3, "name": "Quiz Blitz",       "maxScore": 50,  "createdAt": "..." },
    { "id": 2, "name": "Robotics",         "maxScore": 150, "createdAt": "..." }
  ]
}
```

---

### `GET /events/:id`

Returns a single event by ID.

**Example**
```
GET /events/2
```
```json
{
  "success": true,
  "data": { "id": 2, "name": "Robotics", "maxScore": 150, "createdAt": "..." }
}
```

**404 — Event not found**
```json
{ "success": false, "error": "event not found" }
```

---

## Eden Type-Safe Client (TypeScript frontends)

If your frontend is TypeScript, you can get **full type safety** without writing any types manually:

```bash
bun add elysia @elysiajs/eden
```

```typescript
import { treaty } from "@elysiajs/eden";
import type { App } from "path/to/backend/src/index"; // import the exported type

const api = treaty<App>("http://localhost:3000");

// fully typed — autocomplete works, no casting needed
const { data: leaderboard } = await api.leaderboard.get();
const { data: team }        = await api.leaderboard.teams({ id: "1" }).get();
const { data: teams }       = await api.teams.get();
const { data: events }      = await api.events.get();
```

---

## Bruno Collection

A [Bruno](https://www.usebruno.com/) API collection is included in the `bruno/` folder.  
Open Bruno → **Open Collection** → select the `bruno/` folder. Switch to the `local` environment and fire away.

```
bruno/
  environments/
    local.bru        ← base_url = http://localhost:3000
  health/
    health-check.bru
  leaderboard/
    get-leaderboard.bru
    get-leaderboard-by-event.bru
    get-team-detail.bru
  teams/
    get-all-teams.bru
    get-team-by-id.bru
  events/
    get-all-events.bru
    get-event-by-id.bru
```

---

## Backend Setup (maintainers only)

```bash
bun install          # install dependencies
bun run db:generate  # generate SQL from schema (run after schema changes)
bun run db:migrate   # apply migrations to leaderboard.db
bun run db:seed      # insert demo data
bun run dev          # start server on :3000 with hot reload
bun run db:studio    # open Drizzle Studio — visual DB browser
```
