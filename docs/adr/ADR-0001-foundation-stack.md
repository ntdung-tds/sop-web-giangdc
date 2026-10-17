# ADR-0001 — StageSign technical foundation without UI replacement

Status: Accepted for G0-02A
Date: 17/10/2026

## Context
The owner approved the G0-01 landing/login/dashboard as the visual baseline for StageSign. A previous technical-foundation attempt replaced the visible UI and caused version confusion.

## Decision
- Keep `site/` as the approved StageSign UI for G0-02A.
- Add TypeScript workspace foundations behind it: contracts, application layer, Node API adapter and Cloudflare API adapter.
- Use `/api/v1/health` as the first shared contract smoke endpoint.
- Keep adapters thin and keep contract/application logic runtime-independent.
- Do not migrate the approved UI to React in this task. Any UI-framework migration requires a separate task with visual-parity evidence.
- Cloudflare Pages project `sopweb-giangdc-stagesign` continues to publish `site/` during G0-02A.

## Consequences
- Technical work can continue without visual regression.
- There are no production persistence/auth claims in G0-02A.
- React/PWA application-shell migration remains pending and must not silently replace the approved baseline.
