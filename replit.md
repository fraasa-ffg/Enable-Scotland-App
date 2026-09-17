# Enable Scotland

An offline-first Expo app that helps people travel with confidence through journey plans, checklists, emergency contacts and SOS messaging.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- `pnpm --filter @workspace/enable-scotland run dev` — run the Expo mobile preview

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Mobile: Expo Router, React Native, AsyncStorage, Expo Image Picker and Expo Location

## Where things live

- `artifacts/enable-scotland/app/` — Expo Router screens and tab navigation
- `artifacts/enable-scotland/context/AppContext.tsx` — offline state and AsyncStorage persistence
- `artifacts/enable-scotland/constants/colors.ts` — four accessible theme token sets
- `artifacts/enable-scotland/components/UI.tsx` — shared app shell, controls and empty states
- `attached_assets/enable-app-design-frontend-spec_1789656973556.md` — frontend source specification
- `attached_assets/enable-app-flows-backend-spec_1789656973556.md` — offline flow and data specification

## Architecture decisions

- The first build is local-only and uses AsyncStorage because the product specification explicitly excludes accounts, cloud sync and a server.
- The active journey is derived from local journey state and starting a different journey demotes the previous active journey to saved.
- The SOS flow opens the device messages app and uses location only to build the outgoing message; the app does not retain location data.
- Theme tokens are selected from the four palettes in the source specification and shared across the app screens.

## Product

The app supports creating and saving named journeys, starting a journey through a pre-travel checklist, following steps with completion state, attaching photos and notes, searching and deleting journeys, editing the reusable checklist, managing up to three emergency contacts, sending SOS messages with an optional location link, reading offline FAQs and changing the colour theme.

## User preferences

The UI should stay plain-language, supportive and accessibility-first, with large controls and no decorative-only critical actions.

## Gotchas

- The mobile workflow is the source of truth for the Expo preview; do not start Expo with a bare shell command.
- The Atkinson Hyperlegible package was unavailable in the project package registry during the first build, so the scaffold's bundled Inter font is used as a safe fallback.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
