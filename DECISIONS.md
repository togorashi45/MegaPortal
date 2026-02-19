# Portal Decisions (Locked)

Last updated: February 19, 2026
Owner: Jake McKinney

This file is the project source of truth for high-impact decisions.
If a PRD conflicts with this file, this file wins unless Jake explicitly overrides it.

## Core decisions

1. Hosting platform: Google Cloud Run.
2. App architecture: one unified Next.js portal shell with module routes.
3. Current build phase: sample/demo mode with no external API integrations.
4. Product tracks: maintain both a sample portal and a production/API-connected portal.
5. Preserve progress: do not replace solved implementation decisions from prior work unless explicitly requested.

## Implementation constraints

1. Keep interactive UX live in demo mode: forms, dropdowns, buttons, filters, and role gating must work.
2. Use sample data now; design code paths so API integrations can be added later without rewrite.
3. Keep module work additive and backward-compatible with existing working flows.

## Change control

To change any locked decision, append:
- Date
- Decision changed
- Old value
- New value
- Reason
