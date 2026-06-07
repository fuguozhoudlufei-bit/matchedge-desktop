# Technical Specification - MatchEdge Desktop

## Tech Stack
- Tauri (desktop framework)
- React (UI)
- TypeScript (language)
- SQLite (database)
- Tailwind CSS (styling)
- Recharts (charts)
- Vitest (testing)

## Architecture
- Model layer: pure deterministic functions in `src/lib/model`
- Review layer: deterministic post-match review helpers in `src/lib/review`
- Database schema layer: SQLite schema, migrations, typed records, fictional seed helpers, and Tauri SQL connection helpers in `src/lib/db`
- Local AI explanation layer: prompt/schema/input builders and deterministic draft output in `src/lib/ai`
- UI layer: React components in `src/components`

## Current MVP Modules
- `src/lib/model` provides odds implied probability, three-way market normalization, Poisson score matrix, value-gap calculation, over/under output, and the `analyzeMatch()` aggregator.
- `src/lib/review` provides in-memory review calculations for actual scores, prediction hit checks, Brier score, and review summaries.
- `src/lib/db` defines the SQLite table/index schema and Tauri SQL boundary, but repositories/CRUD and UI persistence are not implemented yet.
- `src/lib/ai` builds a safe local explanation boundary from model output and renders a deterministic draft. It does not call external AI APIs.
- `src/components/SingleMatchAnalysis.tsx` renders the current single-match analysis workflow, including model inputs, probability output, top scores, optional over/under output, odds comparison, recommendation, review panel, and AI explanation panel.

## Persistence Boundary
The Tauri SQL plugin dependency and connection helpers exist. Runtime persistence is not wired into the UI yet, so current MVP user input, analysis results, and reviews are not stored in SQLite.

## Separation Rules
- Calculation layer, data layer, and AI explanation layer remain separate.
- React components must not contain business logic.
- AI explanation can summarize and critique supplied model output, but must not calculate, modify, override, or invent probabilities.
