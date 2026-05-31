# AGENTS.md
## Project
MatchEdge Desktop is a football pre-match probability decision terminal.
It is not a betting automation tool and must never promise profit.
## Tech Stack
- Tauri
- React
- TypeScript
- SQLite
- Tailwind CSS
- Recharts
- Vitest
## Non-negotiable Rules
- Do not implement automatic betting.
- Do not use words like "必中", "稳赢", "稳胆", " guaranteed profit".
- Do not let AI modify model probabilities.
- All probabilities must be calculated by deterministic local functions.
- All model functions must have unit tests.
- All new features must update README if user-facing behavior changes.
- Prefer small, focused changes.
- Do not introduce new dependencies without explaining why.
- Do not mix UI changes, database changes, and model changes in one task unless explicitly requested.
## Commands
- Install: pnpm install
- Dev: pnpm tauri dev
- Test: pnpm test
- Lint: pnpm lint
- Typecheck: pnpm typecheck
- Build: pnpm tauri build
## Code Style
- TypeScript strict mode.
- Pure model functions in src/lib/model.
- UI components in src/components.
- Database access in src/lib/db.
- No business logic inside React components.
- Use interfaces for all model input/output.
## Testing Rules
Before finishing any task, run:
pnpm typecheck
pnpm lint
pnpm test
If a command fails, fix it or explain exactly why it cannot be fixed.
## Architecture Rules
- Calculation layer, data layer, and AI explanation layer must be separate.
- Model output is the source of truth.
- AI explanation can summarize, critique, and explain, but cannot invent data.
