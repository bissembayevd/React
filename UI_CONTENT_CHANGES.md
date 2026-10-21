# UI and news-image changes

The existing React/Vite routes, FastAPI endpoints, SQLAlchemy models and SQLite records are preserved. No backend source code, migrations, seed data, article records, player records or team records were changed. Before/after comparisons of all five database tables match exactly (152 players, including 32 free agents).

## Presentation

Removed the homepage edition notice, competition notices, directory/detail notices, footer label, rating/ranking/age qualifiers and image captions. No replacement disclaimer was introduced. The old unused competition-notice component and notice styles were removed. Existing default fallback SVGs retain their artwork but no longer display edition wording.

Database-provided `[Demo]` title prefixes and `— Demo` event-name suffixes are hidden only during rendering. The exact legacy standalone sample-data notice paragraph is also hidden on article details. **Stored titles, summaries and article prose remain unchanged**; ordinary mentions of demo/sample content inside prose are intentionally preserved rather than rewriting articles. Generated team notices are hidden, while manually appended team prose remains visible. Technical sample-data context remains in README.

Sorting controls now appear only on Free Agents, whose three sorting choices and behavior are unchanged. Teams use ascending ranking, upcoming matches chronological order, results reverse chronological order, and tournaments ascending start date. Search, filtering, reset buttons, pagination and navigation remain available where they previously existed. Controls use responsive layouts without empty sort columns.

## News images

See [NEWS_IMAGES.md](NEWS_IMAGES.md). All 30 entries in `src/config/newsImages.js` start empty. Nothing is automatically assigned or replaced. `NewsImage` is shared by news cards and the newly connected API-backed article detail route; that route was previously a placeholder. Images fall back in order: configured local file, existing API image, existing placeholder, embedded fallback. No photographs were downloaded, generated, copied into the new directory, or deleted.

## Verification

- Frontend tests: **18 passed**.
- Backend tests: **14 passed**; existing Starlette/httpx deprecation warning only.
- `npm run build`: **passed**, 1,637 modules.
- Isolated headless browser against the regular servers: 12 routes checked for notice containers, edition labels in UI headings/controls, and Free-Agents-only sorting.
- Teams search + country filtering + pagination, match tabs + tournament filtering + reset, tournament status + pagination, and Free Agents search + sorting + pagination passed.
- A temporary browser-only filename mapping rendered the same image on a homepage card and article details. A missing file fell back to the existing API image. The mapping file and photographs were not modified by this test.
- Five routes at **390px** had no horizontal overflow. The exact legacy article notice is absent from final rendered details.
- Database fingerprint and all five tables are unchanged. Counts include the user's additional saved player; tests do not replace the live database with initial data.
- Browser automation used the already installed Playwright runtime and Edge in a separate headless test browser because the in-app browser tool failed to initialize. No dependencies were installed or added to the project.

Evidence: `backend/reports/ui-content-verification.json`, `ui-content-browser.json`, `ui-content-preview.png`, `ui-content-mobile.png`, and `ui-content-before.sha256`. Final desktop/mobile screenshots show the Teams directory after the completed cleanup.

## Changed files

New files:

- `src/config/newsImages.js`
- `src/components/NewsImage.jsx`
- `src/utils/displayText.js`
- `src/styles/news.css`
- `public/images/news/.gitkeep`
- `tests/newsImages.test.js`
- `NEWS_IMAGES.md`
- `UI_CONTENT_CHANGES.md`
- The five review/evidence files listed above (the browser check also produces both PNG screenshots).

Updated files:

- `src/pages/Home.jsx`
- `src/pages/Teams.jsx`
- `src/pages/TeamDetails.jsx`
- `src/pages/Matches.jsx`
- `src/pages/MatchDetails.jsx`
- `src/pages/Tournaments.jsx`
- `src/pages/TournamentDetails.jsx`
- `src/pages/FreeAgents.jsx`
- `src/pages/PlayerDetails.jsx`
- `src/pages/AddPlayer.jsx`
- `src/pages/NewsDetails.jsx`
- `src/components/Layout.jsx`
- `src/components/NewsCard.jsx`
- `src/components/MatchCard.jsx`
- `src/components/MatchRow.jsx`
- `src/components/TournamentCard.jsx`
- `src/components/PlayerCard.jsx`
- `src/components/RosterPlayerCard.jsx`
- `src/utils/imageSources.js`
- `src/utils/playerForm.js`
- `src/styles/home.css`
- `src/styles/teams.css`
- `src/styles/competitions.css`
- `src/styles/polish.css`
- `public/images/news-dark.svg`
- `public/images/news-placeholder.svg`
- `public/images/tournament-placeholder.svg`
- `public/asset-credits.html` (edition prose removed; source/photographer/license credits retained)
- `README.md`

Deleted file:

- `src/components/CompetitionNotice.jsx` (unused after notices were removed).

Temporary test scripts were written only under the already gitignored `.phase6b-preview/` directory: `check-current-ui.cjs` and `final-presentation-check.cjs`. No commits, pushes or deployment were performed. Build output was regenerated under ignored `dist/`.


### Article boilerplate display preference

Following the user clarification, both stock demo/sample-data paragraphs and the exact generated sample-summary template are hidden when rendering articles. Actual story paragraphs and manually written summaries are retained. This applies consistently to featured cards and article details, removes empty summary containers, and never changes the API or database text. Frontend tests: 19 passed; production build passed. Files updated for this follow-up: `src/utils/displayText.js`, `src/components/NewsCard.jsx`, `src/pages/NewsDetails.jsx`, `tests/newsImages.test.js`, this document and the UI verification report.
