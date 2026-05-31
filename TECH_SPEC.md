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
- Calculation layer: pure model functions in src/lib/model
- Data layer: SQLite access in src/lib/db
- AI explanation layer: separate from calculation layer
- UI components: in src/components
