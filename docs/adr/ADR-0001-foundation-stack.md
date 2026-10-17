# ADR-0001 — G0-02 technical foundation stack

Status: Accepted for foundation implementation
Date: 2026-10-17

## Context
SRS Rev.10 requires a TypeScript monorepo, React web, runtime-independent API/application logic, Cloudflare Worker + Node adapters, shared contracts and automated quality gates. It does not mandate a specific web bundler or HTTP framework.

## Decision
- npm workspaces for monorepo package boundaries.
- React + Vite for the web shell.
- Shared `@sop/contracts` and `@sop/application` packages.
- Thin Node and Cloudflare adapters around shared application logic.
- No HTTP framework at G0-02; use platform-native APIs to keep the foundation small and runtime-neutral.
- Biome + TypeScript + Vitest + esbuild for lint/typecheck/test/build.

## Consequences
- Framework choice for later business APIs remains reversible.
- Business rules must stay outside runtime adapters.
- D1/Postgres and R2/S3 packages are not implemented in this task; they are introduced only when persistence/storage contracts are ready.
