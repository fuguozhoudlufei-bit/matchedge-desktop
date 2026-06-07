# Product Specification - MatchEdge Desktop

## Overview
MatchEdge Desktop is a football pre-match probability decision terminal that provides data-driven match analysis. It is not a betting automation tool and must never promise profit.

## Current MVP Scope
- Single-match pre-match analysis page
- Deterministic expected goals input handling
- Deterministic win/draw/lose probability calculation
- Poisson score matrix and top score output
- Optional over/under probability output
- Optional odds comparison chart/table
- Recommendation generated from deterministic model output
- In-memory post-match review panel
- Local deterministic AI explanation draft based only on model output
- SQLite schema definitions for future local persistence

## Next-Phase Scope
- SQLite UI persistence
- Repository/CRUD workflows for stored football entities and model results
- Real football data ingestion
- External odds API ingestion
- OpenAI API integration for explanation generation
- Tauri desktop build CI, security hardening, and interactive browser tests

## Constraints
- No automatic betting
- No profit guarantees
- All probabilities from deterministic local functions
- AI explanations must not modify model probabilities
