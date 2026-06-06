# MatchEdge Desktop

A football pre-match probability decision terminal. Not a betting automation tool.

## Local Setup

Prerequisites:

- Node.js 20 or newer
- pnpm
- Rust stable toolchain installed with rustup, including `rustc` and `cargo` on PATH
- Tauri system dependencies for your operating system

On macOS, install Xcode Command Line Tools if they are not already available:

```sh
xcode-select --install
```

If `pnpm` is not available on PATH but Node.js Corepack is available, enable pnpm or prefix commands with `corepack`:

```sh
corepack enable pnpm
corepack pnpm install
```

Install Rust with rustup before running the Tauri desktop app:

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Install project dependencies:

```sh
pnpm install
```

## Commands

Start the Vite web app:

```sh
pnpm dev
```

Start the Tauri desktop app:

```sh
pnpm tauri dev
```

Run tests:

```sh
pnpm test
```

Run linting:

```sh
pnpm lint
```

Run TypeScript typechecking:

```sh
pnpm typecheck
```

Build the Vite frontend:

```sh
pnpm build
```

Run Tauri CLI commands:

```sh
pnpm tauri
```

## Current Scope

The app currently provides a single-match analysis page. Enter home and away team names, expected goals lambdas, maxGoals, and a top score limit to view deterministic expected goals, win/draw/lose probabilities, top scores, and a recommendation. Optional over/under and three-way market odds inputs show over/under probabilities, normalized market probabilities, overround, and model-market value gaps.

After analysis, the page also includes an in-memory post-match review panel. Enter the actual 90-minute home and away goals, then use the highest model probability direction or choose home, draw, or away manually to compare the prediction direction with the actual result. The panel shows the actual outcome, whether the direction hit or missed, the three-way Brier score, and a short deterministic review summary.

Local SQLite schema definitions live under `src/lib/db` and the Tauri SQL plugin is installed for future local database access. Review records are not persisted yet. SQLite persistence in the UI, external football data, automatic betting, and AI explanations are intentionally out of scope for the current UI.
