# Roadmap - MatchEdge Desktop

## Current Status
MVP accepted. The current app is a deterministic local pre-match analysis terminal with a single-match UI, model outputs, odds comparison, SQLite schema definitions and Tauri SQL boundary, an in-memory review module, and a local deterministic AI explanation layer.

Follow-up hardening work remains in the next phase, including SQLite UI persistence, persisted repository/CRUD workflows, external data/API integrations, desktop build and security hardening, interactive browser coverage, and UI component maintainability.

## MVP Complete
- [x] Tauri + React + TypeScript app skeleton
- [x] CI quality gate
- [x] Odds implied probability model
- [x] Poisson score matrix
- [x] `analyzeMatch()` aggregator
- [x] Single-match analysis page
- [x] Odds comparison chart/table
- [x] SQLite schema definitions and Tauri SQL boundary
- [x] In-memory review module
- [x] Local deterministic AI explanation layer

## Next Phase - Not Yet Done
- [ ] SQLite UI persistence
- [ ] Repositories/CRUD for persisted leagues, teams, matches, odds, model results, and reviews
- [ ] External odds APIs
- [ ] Real football data ingestion
- [ ] OpenAI API integration
- [ ] Tauri desktop build CI
- [ ] Tauri security hardening
- [ ] Interactive browser tests
- [ ] Split SingleMatchAnalysis into smaller components

## Not Included in Current MVP
- Automatic betting is not part of this product scope.
- Real football data ingestion and external odds APIs are not connected yet.
- Review history is not persisted yet; the current review module is in-memory only.
