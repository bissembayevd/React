# Replace a news photograph in WebStorm

1. Put your photograph in **`public/images/news/`**. For example: `navi-training.jpg`.
2. Open **`src/config/newsImages.js`**. This is the only filename mapping to edit. Each entry uses a stable article ID, not a title or array position.
3. Assign the filename:

   ```js
   'news-001': 'navi-training.jpg',
   ```

   Enter only the filename, including its extension. Do not enter `public/`, a URL, or a folder path. Use simple lowercase names with hyphens. Match the capitalization exactly so it works after deployment too.
4. Save the image and mapping file. Keep the existing backend and `npm run dev` running. Open **http://127.0.0.1:5173/news/news-001** and the homepage. The same photograph appears wherever that article uses `NewsImage`, including cards and the detail page. The homepage displays only selected articles; any article can be checked directly using its ID.
5. To replace it later, overwrite your own file or assign a different filename. Refresh the browser if it has cached the old photo. Clear the mapping back to `''` to restore the existing API image.

Recommended: **1600 × 900 pixels (16:9)**, JPEG (`.jpg`) or WebP (`.webp`), preferably under 500 KB. PNG is supported but often larger. Images use `object-fit: cover`; keep the subject near the center. Use photographs you have permission to publish and preserve any required attribution in the existing credits page.

All 30 entries initially remain empty, so this change does **not** assign or replace any photograph automatically. Each article can have its own filename. No database updates, backend changes, reseeding, migrations or new packages are required.

If a configured file is missing, the shared component tries the article's existing API image, then the existing local news placeholder, then an embedded fallback. Existing image files are preserved. Article IDs, titles, summaries and content remain in FastAPI/SQLite; the configuration contains only presentation filenames.

To check your file directly, open `http://127.0.0.1:5173/images/news/navi-training.jpg`. If it does not load, check its name, extension and location. For a production compilation check, run `npm run build` from the project root.
