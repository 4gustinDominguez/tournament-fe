# Tournament Frontend

Web application for creating and managing sports tournaments: public browse and registration, plus a private area for tournament admins, referees and players.

Built with **Next.js 16 + React 19 + TypeScript**, with a clean architecture inside the `modules/` layer and full i18n support (Spanish/English).

> Backend: see [tournament-be](https://github.com/4gustinDominguez/tournament-be).

## Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) · React 19 |
| Language | TypeScript 5.9 (`strict`) |
| Styling | Tailwind CSS 3.4 + design tokens (`design/tokens.json`) |
| Components | Radix UI / shadcn |
| Maps | Leaflet / react-leaflet, Nominatim (OpenStreetMap) |
| i18n | next-intl (`es` default, `en`) |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright |
| Lint / Hooks | ESLint 9 (flat config) + Husky |

## Architecture

Business logic lives in `src/modules/`, separated from presentation. Each module follows a `domain → application → infrastructure` structure where dependencies point inwards:

```
src/
├── app/[locale]/        # Routes: (landing), (auth), t/, manage/
├── components/          # UI components
├── modules/             # ← business layer
│   ├── tournament/
│   │   ├── domain/          # Entities + repository interfaces (ports)
│   │   ├── application/     # Use cases
│   │   └── infrastructure/  # API repository (adapters)
│   ├── places/
│   └── referees/
├── sections/            # State providers (contexts) + composition
├── services/            # Cross-cutting client services (images)
├── i18n/                # Locale config + messages
└── config/              # Env-driven configuration
```

The repository is instantiated in a provider (`src/sections/tournaments/tournament-provider.tsx`) and injected through context, so use cases never import the HTTP implementation directly — tests mock the repository interface with a single object.

## Getting started

Requirements: Node.js 22+ (see `.nvmrc`), pnpm, and the [backend](https://github.com/4gustinDominguez/tournament-be) running locally (default `http://localhost:3000`).

```bash
pnpm install
cp .env.example .env
pnpm dev              # http://localhost:3001
```

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | No | Backend base URL (defaults to `http://localhost:3000`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes* | Cloudinary cloud used for browser-side image uploads |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Yes* | Upload preset used for browser-side image uploads |

\* Without them, image upload fails; the rest of the app works.

> `NEXT_PUBLIC_*` values are embedded in the client bundle by design — never put secrets in them.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server on port 3001 |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:coverage` | Unit tests with coverage report |
| `pnpm test:e2e` | Playwright end-to-end suite |
| `pnpm test:e2e:ui` | Playwright UI mode |

## Testing

- **Unit** (`tests/unit/`): 33 files covering components, use cases and utilities. Repository implementations are mocked so business logic is tested without HTTP.
- **E2E** (`tests/e2e/`): Playwright specs for the main flows (auth, admin, referee, public browsing, i18n).

The e2e suite spins up its own isolated stack on ports `3002` (API, file storage — no Postgres needed) and `3003` (web), separate from your dev servers:

```bash
pnpm test:e2e
```

> It expects the backend repo to sit next to this one (same parent directory).

The pre-commit hook runs `lint + typecheck + unit tests` only — e2e runs on demand (`pnpm test:e2e`) because it needs the sibling backend repo.

## Features

- Tournament lifecycle: teams, players, rounds, fixtures (round-robin), matches, standings, venues and referees.
- Role-based access: `SUPER_ADMIN`, `TOURNAMENT_ADMIN`, `REFEREE`, `PLAYER`.
- Public pages: browse tournaments, view standings and register a team.
- Full i18n in Spanish and English, including user documentation under `/docs`.
- Unified notification system instead of `alert()` (`src/lib/notify.ts`).

## Documentation

- `docs/api/` — backend endpoints with `curl` examples.
- `docs/features.md` — feature notes (venues/places).
- `docs/ui-conventions.md` — spacing, radius, palette and responsive conventions.
- `design/tokens.json` — single source of truth for colors, spacing, radius and shadows, consumed by `tailwind.config.ts`.
