> Historical pre-approval review. The user subsequently approved this plan, and the 60 updates were applied successfully. See `PHASE6B_APPLIED.md` and `phase6b-verification.json` for current results.

# Phase 6B review — migration NOT applied to the existing database

Snapshot/research date: **19 October 2026**. The regular application remains at port 5173. A separate preview at **http://127.0.0.1:5174/** uses a migrated temporary database copy on port 8001. Nothing was deployed, committed, or pushed.

## Dry-run result

`backend/reports/phase6b-dry-run.json` contains every proposed field change, including old/new values and a plan hash. It was generated against the existing `backend/arena.db` in SQLite read-only mode.

| Item | Result |
|---|---:|
| Existing players | 151 (150 initial + 1 saved player) |
| Active players | 120 |
| Free agents preserved | 31 (30 original + 1 saved) |
| Teams / news / matches / tournaments | 24 / 30 / 40 / 12 |
| Planned player updates | 15 |
| Planned team description updates | 3 |
| Planned tournament image updates | 12 |
| Planned news image updates | 30 |
| Total row updates | **60** |
| Conflicts / inserts / deletions | **0 / 0 / 0** |

Existing database fingerprint before and after this work: `377074cf8c7dc44099decd739f83046b5d3826c859d3db67a332da0cfbe7cc50` (canonical JSON of all five tables). Primary keys, affiliations, team countries/regions, ratings, schedules, locations, scores, prize pools and all free-agent records are preserved. No schema change is needed.

## Verified roster coverage

These three current official roster pages provide a complete five-player identity set. They are stored as a dated snapshot, never described as a live feed.

| Team | Snapshot identities | Source |
|---|---|---|
| Natus Vincere | Aleksib, b1t, iM, w0nderful, Makazze | [Official NAVI roster](https://navi.gg/en/teams/cs2) |
| Vitality | apEX, ZywOo, flameZ, mezii, ropz | [Official Vitality roster](https://vitality.gg/pages/teams/counter-strike-2) |
| BIG | gr1ks, JDC, tabseN, blameF, faveN | [Official BIG roster, flags and roles](https://bigclan.gg/pages/team/cs2) |

NAVI and BIG supply full names, nationality flags and roles. Existing role vocabulary is preserved: AWP → AWPer, Entry → Entry Fragger, In-game Leader → IGL, Anchor → the broader Rifler category. This normalization is documented in `app/roster_snapshot.json`.

Vitality full names/affiliation come from the official page. Additional field evidence: [ZywOo at BLAST](https://blast.tv/cs/player/0693c10c/zywoo), [flameZ at BLAST](https://blast.tv/cs/player/0c718cc9/flamez), [ropz at BLAST](https://blast.tv/cs/player/fc196dbf/ropz), [apEX biography](https://vitality.gg/pages/athletes/apex), [mezii biography](https://vitality.gg/pages/athletes/mezii), and [ZywOo role reference](https://en.wikipedia.org/wiki/ZywOo). Only apEX and ZywOo roles are migrated. **flameZ, mezii and ropz roles remain unverified and are displayed as “Unverified,” not as factual roles.** All retained ages and ratings are explicitly demo values.

### Teams left explicitly fictional

The remaining **21 teams** do not receive real identities in this migration: FaZe, G2, Spirit, MOUZ, Astralis, Liquid, FURIA, Virtus.pro, Ninjas in Pyjamas, Complexity, ENCE, HEROIC, Falcons, GamerLegion, paiN, Imperial, 9z, The MongolZ, FlyQuest, TYLOO and BetBoom.

Research did not establish a sufficiently consistent, complete current field set for these teams. This is a verification limit, not a claim that they have no real roster. Their existing five fictional players and explicit demo labels remain intact.

Specific limitations found:

- [FaZe’s official team page](https://fazeclan.com/pages/team) lists five nicknames, but [BLAST’s current player index](https://blast.tv/cs/player) conflicts on karrigan's affiliation. No speculative resolution was applied.
- [Spirit’s official site](https://teamspirit.gg/) did not expose roster content in the available browser view; Liquipedia returned 403 and the HLTV team page could not be retrieved in full. Historical Valve rosters were not treated as current.
- [MOUZ](https://mousesports.com/) shows 2026 roster changes, but a complete verified current identity set was not established. G2’s accessible team directory did not establish the requested full roster fields.
- [Liquid’s official page](https://teamliquid.com/games/cs) exposes five nicknames; a complete, consistent set of individual fields was not established. [Complexity’s page](https://complexity.gg/pages/teams-cs2) lists JT while Liquid also lists JT, so this was not treated as reliable proof of a current affiliation.
- [FURIA’s page](https://us.furia.gg/teams/cs2) reverses the nationalities of YEKINDAR and molodoy and gives a different surname for yuurih from [BLAST](https://blast.tv/cs/player/ffb17d14/yuurih). The [molodoy](https://blast.tv/cs/player/ba6025a1/molodoy) and [YEKINDAR](https://blast.tv/cs/player/013ea0dd/yekindar) profiles corroborate the inconsistency. This roster was excluded rather than guessing which fields to combine.
- ENCE’s [September announcement](https://ence.gg/blogs/news/ence-cs2-roster-locked-in), HEROIC’s [July announcement](https://heroic.gg/atc/the-future-of-heroic), and Virtus.pro’s [March announcement](https://virtus.pro/news/virtus-pro-cs2-roster) are dated announcements; they were not promoted to current roster proof without complete current-page verification.
- [GamerLegion](https://www.gamerlegion.gg/pages/team/counter-strike) gives nicknames/roles but not the complete verified identity set. [FlyQuest](https://flyquest.gg/pages/cs2-roster) exposes only four names in the retrieved view. [9z’s directory](https://9z.gg/en/teams) lists seven members without establishing the five starters in that view. [BetBoom](https://betboom.team/) has full names but insufficient verified individual role/nationality evidence. The retrieved TYLOO site explicitly identifies itself as an unaffiliated fan page. Complete current sets were not established for the other teams.

## Photography and attribution

**19 locally stored photographs**: 12 matching tournament cities, two Copenhagen 2024 CS2 stage archives, one gaming setup, and four verified archive portraits (Aleksib 2019, apEX 2019, ZywOo 2019, ropz 2023).

The 11 other verified players use the neutral question mark: b1t, iM, w0nderful, Makazze, flameZ, mezii, gr1ks, JDC, tabseN, blameF and faveN. No photograph was assigned based on a similar name. In particular, search results for an unrelated politician named Ihor Zhdanov and unrelated flameZ branding were rejected.

Every photographer, source URL, license URL and change notice is recorded in [PHOTOGRAPHY_SOURCES.md](PHOTOGRAPHY_SOURCES.md), `public/images/photos/credits.json`, and the footer-linked `/asset-credits.html`. Licenses include CC BY 2.0/3.0, CC BY-SA 3.0/4.0 and CC0. Downloaded pixels are unchanged; CSS cover crops/brightness are disclosed. Source ShareAlike terms also apply to the displayed crop.

The 12 tournament images match Cologne, Katowice, Paris, Copenhagen, Dallas, Rio de Janeiro, Astana, Stockholm, Sydney, Shanghai, Ulaanbaatar and Lisbon, respectively. City photographs illustrate the location only. Schedules and prize pools are untouched.

Match-preview/tournament news uses explicitly illustrative archive stage photography; analysis uses the gaming setup. The 12 team-news/transfer stories use a restrained dark editorial fallback because no sufficiently relevant licensed photograph was established. All 30 articles remain fictional demo stories.

## Migration commands

From the project root, to regenerate the read-only report:

```powershell
Set-Location backend
.venv/Scripts/python.exe -X utf8 -m app.migrate_content --database arena.db --dry-run --report reports/phase6b-dry-run.json
```

**Only after explicit approval of that report**, the apply command is:

```powershell
$reviewedPlan = Get-Content reports/phase6b-dry-run.json -Raw | ConvertFrom-Json
.venv/Scripts/python.exe -X utf8 -m app.migrate_content --database arena.db --apply --approve-plan $reviewedPlan.planHash --report reports/phase6b-applied.json
```

The existing database has **not** received this apply command. A changed database or manifest invalidates approval of an older plan hash. Conflicts abort the complete application. The migration never creates missing entity records, merges players, deletes records, or changes PK/FK columns. It checks original player fields before replacement and protects custom images. Tournament location and news category are guarded to avoid attaching a photograph to an edited, unrelated location/topic.

Apply reserves the SQLite writer lock, rechecks the plan, creates a consistent SQLite backup under `backend/backups/`, validates it, updates only the planned fields in one transaction, and checks FK/roster integrity and every untouched field before commit. A versioned audit entry is appended beside the database as `arena.db.migrations.jsonl`. Repeat runs produce zero updates. Seeding remains insert-only and migration is never called during startup. Backups, audit sidecars and temporary previews are gitignored.

## Tests and visual checks

- Frontend: `node --test` — **15 passed** (HTTP API, directory controls, tabs, filtering, sorting, pagination, persistence and navigation IDs).
- Backend: `.venv/Scripts/python.exe -m unittest discover -s tests -v` — **14 passed**, including migration dry-run, backup consistency, explicit/hash approval, refusal of conflicts, repeatability, restart persistence, user-row preservation, portrait identity guard and complete local photo attribution. Tests use isolated databases.
- `npm run build` — **passed**, 1,634 modules transformed. The bundled npm runtime was used because npm is not on the shell PATH.
- Actual existing DB copied through SQLite's backup API to `.phase6b-preview/final-preview.db`; **60 updates applied to that copy only**, then **0 updates** on repeat. `phase6b-copy-test.json` records the temporary backup and audit result.
- Browser preview: Matches has no search; page 2 + tournament filter + descending date resets to page 1; Results displays 18 completed fixtures; reset retains working controls. Tournaments has no search; status + descending date + pagination works.
- All city images on both tournament pages load locally. Verified roster links preserve IDs; ZywOo opens `player-006`, showing Mathieu Herbaut, the matching 2019 portrait, source disclosure and team link. All ten displayed free-agent cards use loaded question-mark images.
- Six real application routes embedded in **390px viewports**: Matches, Tournaments, Vitality roster, Free Agents, ZywOo profile and Home. No horizontal overflow or broken visible images. Free Agents retains its search; competition routes have none. Layout, responsive wrapping and readable controls checked visually.
- Existing API error/empty/loading components, cleanup and routing remain unchanged. Automated API tests cover invalid IDs, request cancellation, validation, conflicts and network errors; the UI checks above do not claim that every error state was manually forced in the browser.
- Existing Starlette/httpx deprecation warning remains; it does not fail the tests.

## Files changed

- UI: `src/pages/Matches.jsx`, `Tournaments.jsx`, `TeamDetails.jsx`, `PlayerDetails.jsx`; `src/components/NewsCard.jsx`, `TournamentCard.jsx`, `PlayerCard.jsx`, `RosterPlayerCard.jsx`; `src/utils/competitionDirectory.js`, `imageSources.js`; `src/styles/competitions.css`, `polish.css`.
- Backend: `backend/app/migrate_content.py` (new explicit CLI), `roster_snapshot.json` (new sourced manifest), `media.py`, `schemas.py` (additive read-only provenance field, no database schema change).
- Tests: `tests/competitions.test.js`, `backend/tests/test_content_migration.py` (new), `backend/tests/test_media.py`.
- Assets: `public/images/photos/` (19 photographs + attribution JSON), `public/images/player-placeholder.svg`, `news-placeholder.svg`, `tournament-placeholder.svg`, `news-dark.svg`, `public/asset-credits.html`.
- Asset research/reproduction: `scripts/research_photos.py`, `commons-research.json`, `fetch_reviewed_photos.py`, and `build_visual_assets.py` (preserves Phase 6B fallbacks/credits).
- Documentation/review: this report, photography source table, dry-run JSON, temporary-copy result JSON, preview screenshot, root/backend README and `.gitignore`.

The project architecture, API routes, frontend service functions and existing database are preserved. **Applying the 60-row migration to the existing database is the only pending approval step.**
