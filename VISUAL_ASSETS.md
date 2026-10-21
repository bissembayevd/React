# CS2 ARENA visual assets

All assets are bundled under `public/images`; runtime image requests never contact third-party sites. Source/author/license links are visible in the footer's [asset credits page](public/asset-credits.html) and recorded in `public/images/team-credits.json`.

## Team marks

Verified Commons files: NAVI, Spirit, FaZe, MOUZ, Astralis, and FlyQuest. Copyright/license status is recorded individually; Spirit and Astralis require CC BY-SA attribution. Original files are retained with their original colors and proportions. G2's supplied logo comes from its official media brand-guidelines page, under those guidelines rather than an open copyright license. No filters or logo effects are applied. Trademarks remain with their owners; this demo implies no endorsement.

Vitality and other teams without a verified reusable asset use neutral text tiles labeled TEAM. These are deliberately not invented imitations of official marks. A custom logo/image already stored in a database record is preserved.

## Fictional artwork

Ten original editable SVG editorial illustrations cover team communication, transfers, match previews, tactical analysis, and the tournament stage. Six original tournament illustrations use different stage palettes for the fictional Masters, Open, and Invitational series. Eight consistent square, nonhuman gaming avatars represent fictional players. No real-person photo, official game-map artwork, or official tournament mark was used.

The original artwork and neutral text tiles are dedicated under CC0 1.0. Third-party logos are excluded from that dedication. They are illustrations for demo content, not images of real reported events.

## Implementation

`backend/app/media.py` changes only legacy placeholder URLs when serializing API responses. It does not mutate SQLAlchemy objects, seed data, player identities, or the database. Paths remain in the existing `logo` and `image` fields, with no schema changes or additional data API. Lists, details, and player creation use the same presentation helper. Stable IDs select avatar/illustration variants; arbitrary custom image URLs remain untouched.

`SafeImage` tries the requested URL, a deduplicated local fallback, then an inline SVG as the final fallback. Failure state is keyed by the requested source, so a changed source is tried again. The final fallback has no network dependency and the failure chain is finite.

`src/styles/polish.css` refines logo contrast, square avatar framing, news hierarchy, match spacing/scores, and footer credit visibility. Existing page layouts, controls, routes, endpoint shapes, and demo notices are preserved.

## Rebuild artwork / refresh sourced assets

From the project root (network needed only for the two fetch scripts):

```powershell
backend/.venv/Scripts/python.exe scripts/fetch_team_logos.py
backend/.venv/Scripts/python.exe scripts/fetch_g2_logo.py
backend/.venv/Scripts/python.exe scripts/build_visual_assets.py
```

The Commons fetcher accepts only explicitly listed free/public-domain licenses. Unknown files/licenses are skipped. Always review sources/rights before adding a new logo; download availability alone is not permission. The G2 script is specific to the logo provided with its official media guidelines. Run the SVG builder last to regenerate credits and local artwork.

Restart the existing backend after changing the media helper (or use Uvicorn --reload). No seed reset or database migration is required.

## Verification

- Backend tests check every presented path exists, list/detail consistency, unchanged nonvisual data, custom-image preservation, SVG safety, and source/license records.
- Frontend tests check the finite fallback candidate order and continue exercising actual FastAPI directory/form/navigation data.
- A Vite-only test fixture at `/tests/fixtures/image-fallback.html` exercises missing primary/fallback URLs. It is outside the production build entry points and does not alter application data.
- All 48 distinct asset paths from the live API returned HTTP 200 with image content types.
- Existing development player rows had the identical SHA-256 snapshot before/after the media update and backend restart (151 records, including the previously saved BackendQA record).

Phone layouts were visually checked in 390px iframe viewports via the Vite-only responsive-preview fixture; ordinary preview pages were also checked at 699px with matching content/viewport widths. All major directories and profiles loaded without broken images. Four fallback cases recovered successfully in the browser.

