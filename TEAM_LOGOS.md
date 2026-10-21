# Manually assigning team logos

1. Put your downloaded, permitted logo files in `public/images/teams/`. Keep existing files so fallback logos remain available. PNG, JPG, JPEG, WebP, AVIF and SVG are supported. Transparent backgrounds work best; avoid white backgrounds baked into the image itself.
2. Open `src/config/teamLogos.js` in WebStorm. All 24 stable API team IDs are listed, with team names in comments. You can also find an ID in a team profile URL (for example `/teams/team-01`) or in `GET /api/teams`.
3. Enter just the filename, including its extension. For example, after adding `public/images/teams/navi-custom.png`, change:

   ```js
   'team-01': 'navi-custom.png', // Natus Vincere
   ```

4. Run the existing frontend and backend servers, then open the team profile and Teams directory. The same assignment appears on home rankings, match cards, match details, related tournament matches and player team links. Refresh if necessary. No database changes or reseeding are needed.
5. Leave a value empty to use the existing API logo. A missing custom file falls back to that logo. If no valid logo exists, a dark initials placeholder appears without a broken image icon.

For deployment, include the image files and configuration in your project. Match filename capitalization exactly (production servers are often case-sensitive), use filenames without directory paths, and avoid renaming files without updating the mapping. Vite copies `public/images/teams/` to `dist/images/teams/` during `npm run build`; do not include `public/` in filenames or URLs. Preview the production build with `npm run preview` and check the same pages. Keep any required logo permissions and attribution with your assets.
