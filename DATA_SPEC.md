# Data Specification - MatchEdge Desktop

## Database
SQLite is the planned local storage engine. Schema definitions now exist under `src/lib/db`.

Current schema tables:
- `leagues`
- `teams`
- `matches`
- `odds`
- `model_results`

The current data layer includes:
- Tauri SQL connection helpers in `src/lib/db/connection.ts`
- Migration SQL and table/index definitions in `src/lib/db/migrations.ts`
- TypeScript record interfaces in `src/lib/db/records.ts`
- Fictional development seed helpers in `src/lib/db/seed.ts`

Runtime SQLite persistence is not wired into the UI yet. The current single-match analysis page uses local form state and deterministic model functions rather than persisted database records.

## Data Sources
- Seed data is fictional/sample only.
- No external football data source is connected.
- No real odds API is connected.
- No network data ingestion is part of the current MVP.

## Rules
- No user data collection without consent
- All data stored locally
- Model output remains the source of truth for calculated probabilities
