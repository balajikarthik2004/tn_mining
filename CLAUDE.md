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
- Fonts (Google Fonts, loaded in `index.html`): **Plus Jakarta Sans** for headings (`font-heading`,
  applied automatically to `h1`–`h6`), **Inter** for body/UI, **JetBrains Mono** (`font-mono`) for
  ids/licence numbers

## Design system — "Deep Indigo & Saffron"

All tokens live in the `@theme` block of `src/index.css`; use the token classes, not raw hex or
one-off `slate-*`/`sky-*` values, so a future retheme is a one-file change.

| Token family | Values | Use for |
| --- | --- | --- |
| `brand-50…950` | indigo → navy | chrome (sidebar `chrome-deep`, headings `text-brand-900`), interactive accent (`brand-500/600`), tints (`brand-50`) |
| `gold-50…600` | saffron/brass | Tamil Nadu identity accent — **chrome only** (sidebar mark, seals, "prototype" chips) |
| `status-compliant/warning/violation/expired` | emerald / amber / red / slate | compliance meaning only, via `<StatusBadge>` / `STATUS_META` |
| `neutral-ink/surface/subtle/border/line`, `canvas`, `canvas-deep` | cool neutrals | text, card surfaces, hairlines, page background |
| `shadow-card`, `shadow-card-hover`, `shadow-panel` | indigo-tinted elevation | cards, hover lift, overlays/popovers |
| `animate-fade-up/fade-in/shimmer/pulse-ring` | motion | entrances, skeletons, live dots |

Custom utilities (declared with `@utility`, so ordinary Tailwind classes still override them):
`page-canvas` (page background wash), `surface-card` (white card + ring + elevation), `glass-bar`
(frosted header), `chrome-deep` (navy sidebar/hero), `text-gradient-brand`, `shimmer`,
`hover-progress` (line that sweeps left→right along a card's bottom edge on hover; colour it with
`[--progress-color:var(--color-…)]`), `hide-scrollbar`, plus `.scrollbar-light` for dark panels.

**Every KPI tile is `<StatCard>`.** The dashboard, licensing, QR permit, transport and anomaly stat
rows all render it, so a metric looks identical everywhere — pass `accent` for colour, `hint` for the
sub-line, `emphasis` for a card that needs action. Don't hand-roll a `bg-white … text-3xl` tile.

Shared chrome components — reach for these before hand-rolling one: `<Card>`/`<CardHeader>`,
`<StatCard>` (accents: `brand | compliant | warning | violation | expired | gold`), `<StatusBadge>`
(`soft` for dense UI, `solid` for maps/dark surfaces), `<Table>`, `<Modal>`, `<Skeleton>`,
`<ComingSoonPage>`, `<BrandMark>`.

**Pages have no title header.** Feature pages start directly at their content (stat row, map, table).
The page name comes from the topbar breadcrumb, which resolves it from `NAV_ITEMS` — don't reintroduce
per-page title/description blocks. Section headings inside cards ("Interactive Operations Map") are
fine. The desktop sidebar collapses to a 4.75rem icon rail via the toggle in its header; the choice
persists in `localStorage` under `tn-mining:nav-collapsed`.

Greens are `emerald-*` and warm warnings are `amber-*` throughout — don't reintroduce `green-*` or
`orange-*`, they read as a second, slightly-off palette next to the status colors.

## Real vs. illustrative data

Two categories, kept deliberately distinct (see `DataSourcesNote.tsx`, surfaced in-app via the
"Data & sources" link on the dashboard):

- **Real, published data:** quarry **locations, pit outlines and mapped areas** — every demo quarry
  sits on an actual working site, from OpenStreetMap `landuse=quarry` polygons (ODbL) via
  `scripts/build-quarry-sites.mjs`; Tamil Nadu district boundaries — all **38 present-day districts**
  (`public/geo/tn-districts.geojson`, MIT-licensed, derived from Survey of India/Census data — see
  `public/geo/README.md`), plus the state mask/outline used to show Tamil Nadu only; the seigniorage fee
  (royalty) rate per mineral type (`src/data/mock/officialRates.ts`, sourced from Tamil Nadu Government
  Gazette Extraordinary No. 417, 28 Dec 2017, Appendix-II — a real cited government notification);
  district town locations.
- **Real, published statistics:** `src/data/mock/officialStatistics.ts` holds state mineral revenue by
  year, statewide enforcement outcomes (vehicles seized, penalties, FIRs) and leased areas, quoted from
  the *Tamil Nadu Mines and Minerals Policy Note 2020-21*. The anomaly page shows these in a separate
  "For scale" panel so the modelled gap can be judged against something verifiable — keep that
  separation; never blend them into the seeded figures.
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
   `src/types/common.ts`: emerald/amber/red/slate for Compliant/Warning/Violation/LicenseExpired, each
   with a `color` + `soft`/`ink` pill pair) are semantic and must stay consistent across every feature
   via `<StatusBadge>`. Brand colors (`brand-*`/`gold-*`, defined in `src/index.css`) are
   Government-of-Tamil-Nadu chrome only — sidebar, topbar, buttons, active nav, map selection — and
   must never be substituted for a status color or vice versa. The palette is picked so the two can't
   be confused: brand is indigo/navy, statuses are emerald/amber/red, and the brass `gold-*` accent is
   deliberately yellower than the orange-leaning `status-warning` amber and appears only on navy
   chrome. `STATUS_META` mirrors the `--color-status-*` tokens — change both together.
4. **Shared types first.** `src/types/*.ts` (`Quarry`, `Operator`, `License`, `District`, `MineralType`,
   `QuarryStatus`, etc.) are imported across features. Extend them there rather than redefining shapes
   locally in a feature folder.
5. **Zustand store per concern.** `src/store/dashboardStore.ts` holds Feature 1's filters/search/selection.
   Later features get their own store file rather than overloading this one.
6. **Placeholder pages.** Each disabled nav item has a real route rendering `<ComingSoonPage>`
   (`src/components/ui/ComingSoonPage.tsx`) rather than being hidden — this is intentional per the spec,
   not a stub to "finish later" by hiding it.
7. **Every nav item carries a `section`.** `NAV_ITEMS` in `src/app/navConfig.ts` is grouped into
   `NAV_SECTIONS` (`Overview` / `Enforcement` / `Revenue & Legal`) and the sidebar renders one block per
   section, so a new feature needs a section assigned or it silently won't appear. The topbar breadcrumb
   resolves the current item by longest path prefix, so detail routes (`/licensing/:id`) light up their parent.
8. **Static map data goes in `public/`, referenced by URL — never bundled via a JS import.**
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
- **The district GeoJSON has no `dtname` — the name is in `NAME_2`.** `QuarryMap` looks names up through
  a single `DISTRICT_NAME_EXPR` coalesce (`dtname → NAME_2 → Dist_Name → district → name`). Earlier code
  compared `["get","dtname"]` directly, which is always null in the bundled file, so the selected/hovered
  district silently never highlighted. Use the shared expression for any new district-keyed styling.
- **Quarry coordinates are real; don't re-randomise them.** `generateMockData` walks `QUARRY_SITES`
  (generated into `src/data/mock/quarrySites.ts`) and places one demo quarry per real mapped pit, using
  the site's centroid verbatim — no jitter. `Quarry.siteId` links to the pit outline in
  `public/geo/quarry-sites.geojson`, which the anomaly and licence detail maps fetch to draw the actual
  footprint; `Quarry.siteAreaSqM` is the real mapped area and also scales declared volumes so a huge pit
  doesn't report the same output as a two-hectare one. Earlier builds scattered quarries around district
  centres, which put "quarries" on farmland and housing. `DISTRICT_CENTERS` (with its bbox-derived
  `jitter`) is retained for districts without a mapped site and for framing.
- **Coverage follows reality:** 35 of 38 districts have mapped pits. Chennai, Thiruvarur and
  Mayiladuthurai have none — that's correct for those districts, not a data gap to paper over.
- **The map shows Tamil Nadu only, and won't zoom out past the state.** `tn-mask.geojson` (world minus
  TN) is painted over the basemap and `tn-outline.geojson` draws the border. On load the map fits
  `TN_BOUNDS`, then pins that as `minZoom` and derives `maxBounds` from the fitted view — the scale bar
  reads 100 km there. Do **not** set `maxBounds` as a static prop: with a wide viewport MapLibre
  satisfies it by zooming *in*, which silently overrides the state-wide framing. The fit also has to run
  a frame after `load`, or it uses a stale container size and leaves the state cropped.
- **Detail routes reuse their component, so maps must be told to move.** Navigating
  `/anomaly-detection/Q-007 → /Q-047` re-renders the same component instead of remounting it, so a
  map configured only through `initialViewState` keeps pointing at the previous record. Every
  `/:id` map needs a `ref` + a `flyTo` effect keyed on the record (see `AnomalyDetailPage`), and the
  record state should be cleared while the new id resolves so stale figures never flash.
- **Camera targets under a floating panel need padding.** The Anomaly Radar's glass panel covers the
  left ~370px of its map, so a plain `flyTo({center})` hides the quarry the user just clicked. Pass
  `padding: { left: … }` (desktop only) to keep the target in the visible area.
- **Overlays that must sit above the topbar need a portal.** `<main>` carries `animate-fade-in`, and a
  CSS animation touching `opacity` creates a stacking context — so a `fixed`, high-`z-index` child of a
  page (e.g. `QuarrySidePanel`) still paints *below* the sibling topbar. Both the side panel and `Modal`
  render through `createPortal(document.body)` for this reason.

## Known constraints (by design, not oversights)

- No auth, no backend, no real GPS/satellite/SMS/email — all stubbed as mock data, toasts, or console logs.
- The "10th" nav item, **Reports & Analytics**, isn't in the original 9 named features from the spec
  (map dashboard, anomaly detection, transport tracking, licensing, transport monitoring, permit QR,
  night mining, court cases, royalty intelligence) — it was added to satisfy the acceptance criterion
  of "10 planned features, 9 disabled." Swap it for a different 10th feature name if the product owner
  has a specific one in mind.
- The 5-minute "live" map refresh (`useDashboardData`'s `refreshQuarries`) only jitters a small % of
  quarry statuses — it does not regenerate the dataset, so ids and unrelated fields stay stable.
