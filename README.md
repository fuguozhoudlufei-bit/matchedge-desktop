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

Issue #3 initializes the Tauri, React, TypeScript, Vite, Tailwind CSS, Vitest, and ESLint application skeleton only. SQLite, probability calculations, model functions, football data, and AI explanations are intentionally out of scope for this initialization.
