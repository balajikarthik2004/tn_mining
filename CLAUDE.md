# CLAUDE.md

Guidance for Claude Code (and future contributors) working in this repository.

## What this is

**TN Mining AI Platform** — a prototype monitoring/enforcement tool for Tamil Nadu's mining & quarry
department. It's a **frontend-only prototype**: no real backend, no live government systems, no real
satellite feeds. All data is realistic seeded mock data. The full product plans 10 features; this
build implements the shared foundation plus **Feature 1 — Quarry Map Dashboard**. The other 9 are
disabled "Coming soon" placeholders in the nav so stakeholders can see the full planned scope.

The original build spec is in [BUILD_PROMPT.md](BUILD_PROMPT.md) — read it for full functional/acceptance
detail before extending Feature 1 or starting Feature 2+.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4 (CSS-first config via `@theme` in `src/index.css` — there is no `tailwind.config.js`)
- MapLibre GL JS via `react-map-gl/maplibre`, styled with [OpenFreeMap](https://openfreemap.org)'s free `positron` style — no token, no signup, no billing (swapped in after Mapbox started requiring a billing-enabled account for its free tier). Uses MapLibre's native GeoJSON clustering (no separate Supercluster dependency).
- React Router v6 (`react-router-dom` v7 package, v6 data-less `useRoutes` API)
- Zustand for the dashboard filter/search/selection store
- Recharts + date-fns installed for later features (not yet used by Feature 1)
- lucide-react for all iconography (nav, stat cards, side panel, buttons) — no emoji in the UI

## Real vs. illustrative data

Two categories, kept deliberately distinct (see `DataSourcesNote.tsx`, surfaced in-app via the
"Data & sources" link on the dashboard):

- **Real, published data:** Tamil Nadu district boundaries (`public/geo/tn-districts.geojson`, MIT-licensed,
  derived from Survey of India/Census 2011 data — see `public/geo/README.md`); the seigniorage fee
  (royalty) rate per mineral type (`src/data/mock/officialRates.ts`, sourced from Tamil Nadu Government
  Gazette Extraordinary No. 417, 28 Dec 2017, Appendix-II — a real cited government notification);
  district town locations.
- **Illustrative/seeded data:** quarry names, operator names/contacts, license numbers, extraction
  volumes, inspection records, violation/compliance status. These are clearly-fictional placeholder
  values — **never** attach a fabricated "real" company name to a violation/compliance status; there is
  no public API with real per-quarry mining records for Tamil Nadu, and doing so would misrepresent a
  real entity. If a real per-quarry data source is ever identified, wire it in through the service layer
  (see below) rather than hardcoding it into the generator.

Extraction volume is tracked in **cubic metres** (`Quarry.declaredExtractionVolumeM3Monthly`), not
tonnes — that's the unit TN's real seigniorage fee schedule is quoted in, so royalty math applies the
real rate directly instead of guessing a tonnes↔m³ density conversion.

## Commands

```bash
npm install       # install deps
npm run dev       # start dev server
npm run build     # tsc -b && vite build — must pass with zero TS errors before committing
npm run preview   # preview a production build
npm run lint      # oxlint
```

## Environment

None required for the map — `QuarryMap` points at OpenFreeMap's public tile/style host, which needs
no API key. If a future feature needs a real secret (e.g. a paid data provider), add it via `.env`
(gitignored) and document it here rather than committing it.

## Architecture rules — read before adding a feature

1. **Service-layer seam.** Components must call functions in `src/services/*Api.ts`
   (`getQuarries`, `getOperators`, etc.), never import mock arrays from `src/data/mock/*` directly.
   Swapping mock data for a real backend later means only touching the service files.
2. **One deterministic dataset.** `src/data/mock/generateMockData.ts` is the single source of truth;
   it's seeded (`createSeededRandom`, not raw `Math.random()`) so the dataset — and every quarry/operator/
   license id — is stable across reloads and screenshots. `quarries.ts`, `operators.ts`, `licenses.ts`
   just re-export slices of that one generated result so ids stay linked correctly. If you need more
   mock entities for a new feature, extend `generateAll()` there rather than writing a second generator.
3. **Status colors vs. brand colors — do not mix these up.** Status colors (`STATUS_META` in
   `src/types/common.ts`: green/yellow/red/dark-grey for Compliant/Warning/Violation/LicenseExpired) are
   semantic and must stay consistent across every feature via `<StatusBadge>`. Brand colors
   (`brand-900`/`brand-700`/`gold-500`/etc., defined in `src/index.css`) are Government-of-Tamil-Nadu
   chrome only — sidebar, topbar, buttons, active nav — and must never be substituted for a status
   color or vice versa (the brand maroon and status-violation red are deliberately different reds so
   they're never visually confused).
4. **Shared types first.** `src/types/*.ts` (`Quarry`, `Operator`, `License`, `District`, `MineralType`,
   `QuarryStatus`, etc.) are imported across features. Extend them there rather than redefining shapes
   locally in a feature folder.
5. **Zustand store per concern.** `src/store/dashboardStore.ts` holds Feature 1's filters/search/selection.
   Later features get their own store file rather than overloading this one.
6. **Placeholder pages.** Each disabled nav item has a real route rendering `<ComingSoonPage>`
   (`src/components/ui/ComingSoonPage.tsx`) rather than being hidden — this is intentional per the spec,
   not a stub to "finish later" by hiding it.
7. **Static map data goes in `public/`, referenced by URL — never bundled via a JS import.**
   `QuarryMap.tsx`'s district-boundary `Source` points at `/geo/tn-districts.geojson` as a plain URL
   string; MapLibre fetches it lazily itself. An earlier attempt imported it via Vite's `?raw` + `JSON.parse`
   and inflated the main JS bundle by ~185KB for no benefit — don't repeat that for future static
   geo/reference layers.

## Folder map

```
src/
  app/            Layout (sidebar+topbar shell), routes.tsx, navConfig.ts, App.tsx
  features/       one folder per product feature; dashboard/ is the only functional one
  components/ui/  shared design-system primitives (StatusBadge, StatCard, Button, Modal, Card, Table, Skeleton, ComingSoonPage, BrandMark)
  types/          shared TS interfaces/enums used across all features
  data/mock/      seeded mock data generator, per-entity re-exports, officialRates.ts (real seigniorage rates)
  services/       mock API layer (the swap point for a real backend)
  store/          Zustand stores
  utils/          formatters (₹, m³, dates)
public/geo/       real TN district boundary GeoJSON, served by URL (not bundled into JS)
scripts/          build-district-geojson.mjs — regenerates public/geo/tn-districts.geojson
```

## Gotchas hit during development

- **Stale Vite dep cache after swapping map packages.** If the map suddenly renders blank after
  `npm install`/`uninstall` of a map-related package while the dev server is running, stop the server,
  `rm -rf node_modules/.vite`, and restart — Vite's dependency pre-bundler cache doesn't always notice
  the swap.
- **`maplibre-gl`'s worker breaks under Vite's dep pre-bundler.** `vite.config.ts` has
  `optimizeDeps: { exclude: ['maplibre-gl'] }` — without it, Vite mangles the relative path MapLibre uses
  to spin up its tile-parsing web worker (`new Worker(new URL(...))`), which 404s and silently kills the
  whole map (blank canvas, no tiles, no markers, no console error beyond a 404). Don't remove this exclude.

## Known constraints (by design, not oversights)

- No auth, no backend, no real GPS/satellite/SMS/email — all stubbed as mock data, toasts, or console logs.
- The "10th" nav item, **Reports & Analytics**, isn't in the original 9 named features from the spec
  (map dashboard, anomaly detection, transport tracking, licensing, transport monitoring, permit QR,
  night mining, court cases, royalty intelligence) — it was added to satisfy the acceptance criterion
  of "10 planned features, 9 disabled." Swap it for a different 10th feature name if the product owner
  has a specific one in mind.
- The 5-minute "live" map refresh (`useDashboardData`'s `refreshQuarries`) only jitters a small % of
  quarry statuses — it does not regenerate the dataset, so ids and unrelated fields stay stable.
