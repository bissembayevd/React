# Restored deployment data

`app/restored_seed.json` is a deployment snapshot recovered from the existing local SQLite database on 2026-10-22. It includes roster nickname migrations, previously verified biographies and portraits, tournament city photography paths, news image paths and saved free agents. These are existing project records, not newly researched identities or statistics. Other biographical fields and competition statistics retain their original sample-data status.

Render uses this snapshot when `CS2_RESTORED_SEED=1`, or by default when the platform sets `RENDER=true`. Default local initialization and historical migration baselines continue using `app/seed_data.json`. Both initializers remain insert-only: existing records are never updated or deleted on startup.

On the free Render service, a new deployment creates a fresh ephemeral SQLite database from this snapshot. This restores the bundled data after restarts that reset the filesystem. It does not provide persistence for future website submissions: they can still be lost when the ephemeral filesystem resets. Use an external persistent database for durable future writes.

Before restoration, the public API data was backed up locally under `backend/backups/render-api-before-restore-*.json` (not committed). The server-created free agent sa1qal had the same nickname as a local saved player with a different ID. The deployment snapshot retains the server record and its ID rather than publishing two conflicting nicknames. The local database itself was not modified.
