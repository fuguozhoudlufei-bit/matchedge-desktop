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

The app currently provides a single-match analysis page with deterministic expected goals, win/draw/lose probabilities, top scores, optional over/under output, an optional three-way odds comparison chart and table, and a recommendation. It includes an in-memory post-match review panel for comparing prediction direction with the actual 90-minute result, but review records are not persisted yet. Local SQLite schema definitions live under `src/lib/db` for future local database access. SQLite persistence in the UI, external football data, automatic betting, and AI explanations are out of scope for the current UI.
