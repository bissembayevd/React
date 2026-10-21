# CS2 ARENA FastAPI backend

Python 3.12+, FastAPI, SQLAlchemy 2, Pydantic 2, Uvicorn, and SQLite. No external esports API, authentication, containers, or deployment is included.

## Run locally (Windows PowerShell)

From the project root:

```powershell
cd backend
py -3 -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The virtual environment is already prepared in this workspace. On later runs, only the last command is needed. If Python is exposed as `python` rather than `py`, use `python -m venv .venv` for setup. On macOS/Linux use `python3 -m venv .venv`, `.venv/bin/python -m pip install -r requirements.txt`, and `.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`.

Open [API documentation](http://127.0.0.1:8000/docs) or [health](http://127.0.0.1:8000/api/health).

In a second terminal, from the project root:

```powershell
Copy-Item .env.example .env  # Only for first-time setup; keep an existing .env.
npm install
npm run dev
```

The existing `.env` in this workspace already configures `VITE_API_BASE_URL=http://127.0.0.1:8000`. Restart Vite after changing it. The value is the server origin, without `/api`; the service adds the API prefix. There are no URLs in components.

## Configuration

- `DATABASE_URL`: optional SQLAlchemy URL. Defaults to an absolute path to `backend/arena.db`, independent of the launch directory. SQLite foreign keys are enabled for each connection.
- `CORS_ORIGINS`: comma-separated **explicit** frontend origins. Defaults to `http://127.0.0.1:5173,http://localhost:5173`. Change it if Vite uses another port. Wildcard `*` is rejected. The API accepts only GET/POST/PATCH and Content-Type through CORS; credentials are not enabled.

Set backend environment variables in the launching shell (the backend does not read the frontend `.env`):

```powershell
$env:CORS_ORIGINS = 'https://your-frontend.example'
$env:DATABASE_URL = 'sqlite:///C:/absolute/path/to/arena.db'
```

These are configuration examples only; nothing has been deployed.

## Structure and data flow

- `app/main.py`: application factory, startup lifespan, CORS, and error responses.
- `app/database.py`: engine, foreign-key configuration, and per-request session factory.
- `app/models.py`: five SQLAlchemy tables and the player-to-team relationship.
- `app/schemas.py`: Pydantic creation/response models. Responses retain the existing camelCase JSON fields.
- `app/routers/api.py`: GET endpoints, player creation, transactions, and 404/409 responses.
- `app/seed.py`: seed validation and idempotent, insert-only seeding.
- `app/seed_data.json`: exact exported initial demo data, including stable IDs and ISO strings.
- `tests/test_api.py`: tests with temporary SQLite files and FastAPI TestClient.

The flow is React → centralized fetch service → FastAPI validation/router → SQLAlchemy session → SQLite. Responses pass through Pydantic before React receives them. Team `playerIds` is derived from player foreign keys, avoiding a duplicated database roster array.

## Endpoints

| Collection | List | Detail | Creation |
| --- | --- | --- | --- |
| Players | GET `/api/players` | GET `/api/players/{id}` | POST `/api/players` |
| Teams | GET `/api/teams` | GET `/api/teams/{id}` | — |
| News | GET `/api/news` | GET `/api/news/{id}` | — |
| Matches | GET `/api/matches` | GET `/api/matches/{id}` | — |
| Tournaments | GET `/api/tournaments` | GET `/api/tournaments/{id}` | — |

Lists return arrays and details return objects, preserving the original API shapes. GET succeeds with 200; creation returns 201; missing IDs return 404; duplicate nicknames return 409; invalid requests return 422; database failures return 503. Errors have `detail.code` and `detail.message`; validation also includes `detail.errors` with field/message pairs.

Player creation requires nickname, firstName, lastName, nationality, integer age 16–45, supported role, and finite numeric rating 0–3. Text is trimmed and limited to 80 characters. Nickname uniqueness uses a casefolded database key plus a unique constraint, including concurrent requests. New players always have `status: "free-agent"`, `teamId: null`, a generated UUID-based ID, and the bundled placeholder image. Attempts to create active players or choose a team are rejected. Extra request fields are rejected.

## Seeding and persistence

An empty database receives 150 players (120 active / 30 free agents), 24 teams, 30 articles, 40 matches, and 12 tournaments. Each initial team has exactly five active players. Seed validation checks unique IDs, nicknames, counts, and reciprocal relationships. Foreign keys and check constraints protect persisted relationships and match/player status invariants.

Startup creates missing tables and inserts seed IDs that do not exist. It never resets tables, updates an existing row, overwrites a custom edit, or deletes a newly created player. Seeding runs in one transaction. New players live in SQLite and survive browser refresh, backend restart, and use from another browser connected to this backend. Database files and virtual environments are ignored by Git. Back up `arena.db` to retain development additions.

All rosters, identities, scores, schedules, rankings, stories, and tournament/prize details remain clearly labeled **fictional demo data**. The serialized initial records are identical to the previous simulated datasets. Local image paths resolve in the frontend, which already serves the bundled assets.

Old browser records under `cs2-arena:added-players:v1` are left untouched, but are no longer read, merged, or used as a fallback. They are not automatically uploaded to the backend. The seed migration includes the 150 initial records only; legacy browser-only additions can be re-entered using Add Player if needed. No browser storage is cleared.

## Tests

From `backend`:

```powershell
.venv\Scripts\python.exe -m unittest discover -s tests -v
```

These tests use fresh temporary databases and check every list/detail record against the exported snapshot, five-player rosters, free agents, foreign keys, creation, validation boundaries, duplicate nicknames, 404s, CORS, and restarting the app against the same file while preserving a created player and edited team record.

From the project root:

```powershell
npm test
npm run build
```

Each Node test file launches its own temporary FastAPI server on an available port. No development database or browser storage is modified. Python is resolved from `backend/.venv`; optionally set `PYTHON_EXECUTABLE` to a different configured interpreter. Tests cover HTTP compatibility/errors/cancellation, directory controls, forms, homepage selections, and relationships.

The backend follows FastAPI's documented [lifespan startup pattern](https://fastapi.tiangolo.com/advanced/events/) and [explicit-origin CORS configuration](https://fastapi.tiangolo.com/tutorial/cors/).

## Visual assets

app/media.py selects local artwork only when serializing legacy placeholder URLs. ORM records and seed values are unchanged, and custom image paths are preserved. See ../VISUAL_ASSETS.md and the frontend footer credits for sources, licenses, and fallback behavior. The response field names and endpoint shapes remain the same.



## Phase 6B content migration (applied)

Search has been removed only from Matches and Tournaments; their filters, sorting, tabs and pagination remain. Free agents use a uniform question-mark fallback. The verified roster/photo changes are prepared as an explicit data migration, never run during startup. The approved 60-row migration has been applied to the existing database after backup and exact dry-run verification. All 31 free agents are preserved. Results are recorded in backend/reports/phase6b-verification.json.

See [the complete review report](reports/PHASE6B_REVIEW.md) for all proposed changes, sources, asset licenses, dry-run/apply commands and test results. Review the JSON dry run before explicitly approving application. The migration creates a backup and audit log and preserves all saved free agents. No schema change is required.

## Partial player updates

### SQLite locking

SQLite allows one writer at a time. Connections wait up to 15 seconds for a short write lock. If it remains locked, write requests return HTTP 503 with `DATABASE_BUSY` and `Retry-After: 2`; retry after releasing the blocking transaction. In WebStorm's database editor, commit intentional edits or roll back unwanted pending changes, then disconnect the database session if needed. Do not delete SQLite journal files or recreate the database to clear a lock. A timeout cannot release a transaction held by another application.

`PATCH /api/players/{id}` updates only supplied fields and returns the complete player (HTTP 200).

```json
{"nickname": "NewNickname", "nationality": "Kazakhstan", "rating": 1.2}
```

Editable fields: `nickname`, `firstName`, `lastName`, `nationality`, `age` (integer 16–45), `role` (same choices as creation), and `rating` (0–3). Names are trimmed. Nicknames remain unique, case-insensitively. Omitted fields remain unchanged; explicit null, empty objects and unknown fields return 422. IDs, team membership, status and images are unchanged by this endpoint. Missing players return 404; nickname conflicts return 409. Updates persist in SQLite without reseeding or schema changes. Try the endpoint in `/docs`.
