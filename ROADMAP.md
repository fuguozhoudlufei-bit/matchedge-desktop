# Roadmap - MatchEdge Desktop

## Current Status
MVP accepted. The current app is a deterministic local pre-match analysis terminal with a single-match UI, model outputs, a local review module, SQLite schema definitions, and a local AI explanation draft layer.

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
- [ ] Real football data
- [ ] OpenAI API integration
- [ ] Tauri desktop build CI
- [ ] Tauri security hardening
- [ ] Interactive browser tests
