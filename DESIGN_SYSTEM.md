# AntiCode Design System v1.0

Internal Lab design system. Tokens live in `styles/lab.scss`.
Preview: **Admin → Irányítópult → Design System**.

## Principles

- Preserve AntiCode identity (calm premium SaaS, soft green accent).
- ~90% quiet surface, ~10% accent detail.
- No neon / cyberpunk / gamer aesthetics.
- Prefer semantic tokens over hardcoded colors in Lab UI.
- Controlled glass only (`Glass/Standard` via `--lab-surface-glass` + blur).

## Token layers

1. **Primitive** — `--lab-green-*`, neutrals via semantic mapping.
2. **Semantic** — `--lab-bg-primary`, `--lab-text-*`, `--lab-action-*`, `--lab-status-*`.
3. **Component** — buttons/cards use semantic tokens (`.lab-btn`, `.lab-card`).

## Light / Dark

Toggle in Design System playground sets `data-lab-theme="dark"` on `<html>`.

## Spacing scale

4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 (`--lab-space-*`).

## Radius

sm 8 · md 12 · lg 16 · xl 20 · pill 999.

## Motion

fast 120ms · default 180ms · slow 280ms · `prefers-reduced-motion` respected.

## Typography

- Display / Lab titles: Georgia stack (`--lab-font-serif`)
- UI / data: Segoe UI stack (`--lab-font-sans`)
- Code: monospace (`--lab-font-mono`)
- Metrics: `font-variant-numeric: tabular-nums`

## Adding a token

1. Define in `styles/lab.scss` (light + dark if needed).
2. Document here.
3. Show in Design System playground.
4. Then consume in components.

## Data integrity badges

Lab measurement UI must show provenance badges: REAL / ESTIMATED / TEST / SIMULATED / UNAVAILABLE / UNKNOWN.
Never convert UNAVAILABLE → PASS.
