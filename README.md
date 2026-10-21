# CS2 ARENA

An existing React + Vite university project with a separate Python FastAPI backend. The frontend uses JavaScript/JSX, React Router, Lucide, and plain CSS. The existing dark/lime design and routes are preserved.

**All esports content is fictional demo data**, including player identities, rosters, availability, ratings, rankings, scores, dates, and prize pools.

## Run locally

Use Node.js 22.12+ (or 20.19+) and Python 3.12+.

Terminal 1 — backend (Windows PowerShell, from the project root):

```powershell
cd backend
py -3 -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The virtual environment is already prepared in this workspace; setup is only needed once. On macOS/Linux use python3 and .venv/bin/python. See [backend instructions](backend/README.md) for details.

Terminal 2 — frontend (from the project root):

```sh
npm install
# First-time setup only: copy .env.example to .env.
npm run dev
```

The current .env already sets VITE_API_BASE_URL=http://127.0.0.1:8000. Restart Vite after changing it. Components never hardcode backend URLs. A local Vite /api proxy is also configured for same-origin requests when the base URL is empty. Backend CORS defaults to the two explicit local Vite origins; production origins must be configured explicitly. Nothing is deployed.

Open [frontend](http://127.0.0.1:5173/) and [FastAPI docs](http://127.0.0.1:8000/docs).

## Features and routes

| URL | Feature |
| --- | --- |
| / | Featured/latest news, upcoming matches, results, top teams |
| /teams | Search, country filter, ranking/name sort, 10 per page |
| /teams/:teamId | Team profile, complete linked roster |
| /free-agents | Nickname search, country/role filters, rating/name sort, 10 per page |
| /add-player | Controlled form, validation, database-backed creation |
| /players/:playerId | Player profile, availability or active-team link |
| /matches | Upcoming/Results, team search, tournament filter, date sort, 10 per page |
| /matches#results | Direct navigation to Results |
| /matches/:matchId | Match profile, final scores only for completed matches, team links |
| /tournaments | Name search, status filter, date sort, 6 per page |
| /tournaments/:tournamentId | Tournament profile and related fixtures |
| /news/:newsId | Existing news-detail placeholder |
| Other URLs | 404 |

Controls compose and reset pagination when changed. Lists are derived without mutating loaded API records. Loading, retryable error, empty, success, invalid-ID, and form-validation feedback remain in place. Layouts adapt to narrow screens, and seed team rosters display five cards on wide desktop screens.

## Structure and architecture

- src/components: shared Navbar, Layout, page headings, request states, pagination, news/match/team/player/tournament cards, date labels, image fallbacks.
- src/pages: existing route components; no redesign was introduced.
- src/hooks/useApiResource.js: shared request state with AbortController and stale-result cleanup.
- src/services/api.js: the only frontend data access layer. It preserves getPlayers, getPlayerById, addPlayer, getTeams, getTeamById, getNews, getNewsById, getMatches, getMatchById, getTournaments, and getTournamentById.
- src/utils: directory selection, filtering, sorting, pagination, and controlled-form validation.
- src/styles: existing global, homepage, team, player, and competition styles.
- public/images: bundled SVG placeholders.
- backend/app: FastAPI, Pydantic schemas, SQLAlchemy models, SQLite sessions, routers, seed validation, and snapshot.
- tests: real-HTTP frontend/service regression tests with isolated test backends.
- backend/tests: database, endpoint, validation, CORS, and restart-persistence tests.

React fetches JSON from FastAPI; SQLAlchemy reads/writes SQLite. The backend database is the runtime source of truth. The old simulated service, artificial delay, and frontend seed fallback are removed. Initial records were exported exactly into backend/app/seed_data.json before removing the old frontend generator.

## Data and persistence

| Entity | Initial count |
| --- | --- |
| Players | 150: 120 active and 30 free agents |
| Teams | 24, each with five initial active players |
| News | 30 |
| Matches | 40: 22 upcoming and 18 completed |
| Tournaments | 12 |

Stable IDs, camelCase fields, ISO strings, and relationships are preserved. Team playerIds are derived from player foreign keys. Startup seeding inserts missing seed IDs only; it never overwrites existing database records. New free agents persist in backend/arena.db across server restarts.

New players require all form fields, integer age 16–45, role, and rating 0–3. The API trims text, checks case-insensitive nickname uniqueness, generates the ID, and enforces free-agent/null affiliation. Creation returns 201; validation 422; duplicate nickname 409; missing records 404.

Old localStorage records are left intact but are no longer read or automatically uploaded. They are not part of the 150-record seed migration. Re-enter browser-only additions through Add Player if they are needed in the database.

All service functions accept an optional { signal } argument. Shared loaders, homepage loading, and form submission pass AbortController signals and preserve unmount/stale-response guards. Aborting a POST cannot undo a write the server has already committed. Errors use ApiError with code, message, HTTP status, and optional field details.

## Verify

```powershell
# Project root; backend virtual environment must be installed first.
npm test
npm run build

# Backend tests
cd backend
.venv\Scripts\python.exe -m unittest discover -s tests -v
```

Node tests launch real, isolated FastAPI processes with temporary SQLite files. Backend tests verify all seed records and relationships, every GET/detail endpoint, validation, uniqueness, CORS, and player persistence after app restart while preserving edited data. Development data is untouched by automated tests.

Browser verification also created a clearly named BackendQA free agent in the development database; it is retained for persistence verification. API docs, run commands, error shapes, CORS/DATABASE_URL configuration, and backend architecture are explained in [backend/README.md](backend/README.md).

## Visual polish

Local licensed team marks, original editorial/tournament SVG artwork, neutral fictional-player avatars, credits, and robust fallbacks are documented in [VISUAL_ASSETS.md](VISUAL_ASSETS.md). API shapes and stored records are unchanged.



## Phase 6B content migration (applied)

Search has been removed only from Matches and Tournaments; their filters, sorting, tabs and pagination remain. Free agents use a uniform question-mark fallback. The verified roster/photo changes are prepared as an explicit data migration, never run during startup. The approved 60-row migration has been applied to the existing database after backup and exact dry-run verification. All 31 free agents are preserved. Results are recorded in backend/reports/phase6b-verification.json.

See [the complete review report](backend/reports/PHASE6B_REVIEW.md) for all proposed changes, sources, asset licenses, dry-run/apply commands and test results. Review the JSON dry run before explicitly approving application. The migration creates a backup and audit log and preserves all saved free agents. No schema change is required.


## UI presentation and manual news images

The interface hides edition badges and standalone presentation notices. This does not change the sample-data status of the project: unverified rosters, player ages/ratings, rankings, stories, schedules, results and prize pools remain sample/fictional data. Removing UI labels does not make them verified or live reporting. Existing verified roster provenance remains in the API and its dated source manifest. Article prose and stored titles are preserved; only standalone edition markers are hidden in displayed headings/names.

Sorting controls are available only in Free Agents. Teams default to ascending ranking, upcoming matches to earliest first, results to latest first, and tournaments to earliest start date. Search, filters and pagination remain available as before.

For photographs, follow [NEWS_IMAGES.md](NEWS_IMAGES.md). Put your files in `public/images/news/` and edit the single mapping in `src/config/newsImages.js`. Cards and article details share `NewsImage`. Empty entries retain the API image; missing files fall back without database writes. No photographs are supplied or automatically assigned by this workflow.


### Article boilerplate display preference

Following the user clarification, both stock demo/sample-data paragraphs and the exact generated sample-summary template are hidden when rendering articles. Actual story paragraphs and manually written summaries are retained. This applies consistently to featured cards and article details, removes empty summary containers, and never changes the API or database text. Frontend tests: 19 passed; production build passed. Files updated for this follow-up: `src/utils/displayText.js`, `src/components/NewsCard.jsx`, `src/pages/NewsDetails.jsx`, `tests/newsImages.test.js`, this document and the UI verification report.
