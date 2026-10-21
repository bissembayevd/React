# GitHub Pages — CS2 ARENA

Repository: https://github.com/bissembayevd/React, branch `main`.
Site: https://bissembayevd.github.io/React/.

Vite uses `base: '/React/'` in development and production. React uses HashRouter, so routes are `/React/#/teams`, `/React/#/players/player-001` and `/React/#/matches#results`. Refreshing these URLs requests `/React/` from the static host. Use hash routes when sharing detail links; `/React/teams` is not a Pages route.

## GitHub setup

1. Open the repository's **Settings → Pages → Build and deployment** and set **Source: GitHub Actions**.
2. Ensure **Settings → Actions → General → Actions permissions** allows the official GitHub actions used by this repository.
3. When an HTTPS backend is available, open **Settings → Secrets and variables → Actions → Variables → New repository variable**. Set `VITE_API_BASE_URL` to its origin, for example `https://your-api.example.com`, without a trailing `/api`. This is public frontend configuration, not a secret. Never use localhost for a public deployment.
4. In that backend's deployment configuration, allow frontend origin `https://bissembayevd.github.io` through CORS (no `/React/` path in the origin). This frontend preparation does not modify or deploy the backend.
5. Review the local changes, then commit and push them to `main` yourself, including `package-lock.json`, `.github/workflows/deploy.yml`, source files and your `public/` assets. Keep `.env`, SQLite files, `.venv/`, `node_modules/` and `dist/` out of Git.
6. Open **Actions → Deploy frontend to GitHub Pages** and check the run. A push to `main` installs dependencies with `npm ci`, builds, uploads only `dist/` and publishes using the official Pages actions. The workflow can also be started manually with **Run workflow**.
7. Visit the public URL, navigate to a detail page, refresh, and check images and the Results tab. After changing `VITE_API_BASE_URL`, run the workflow again because Vite embeds it at build time.

GitHub Pages hosts only static frontend files. Until a reachable backend is configured, API-dependent pages retain their existing loading/error states and cannot show database records. The workflow does not bundle SQLite, start Python, or substitute seed data. An unset API variable keeps the existing same-origin `/api` behavior, which has no backend on Pages.

## Local verification

```sh
npm ci
npm test
npm run build
npm run preview
```

Open `http://localhost:4173/React/`. For development, run the existing backend separately and use `npm run dev`, then open `http://localhost:5173/React/`. Keep your existing local `.env` for its `VITE_API_BASE_URL`. API routes remain `/api/...`, not `/React/api/...`.

Continue assigning filenames in `src/config/newsImages.js` and `src/config/teamLogos.js`. Their local image paths and API-provided local paths are prefixed at rendering time; do not add `/React/` manually to database records or filenames. Public HTML attribution links use relative paths. Match asset filename capitalization exactly for Linux hosting.

References: [Vite static deployment](https://vite.dev/guide/static-deploy.html#github-pages), [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
