# TN Mining AI Platform (Prototype)

A frontend-only prototype of a monitoring/enforcement dashboard for Tamil Nadu's mining & quarry
department. This build implements the shared app foundation plus **Feature 1 — Quarry Map Dashboard**;
the other 9 planned features are visible in the sidebar as disabled "Coming soon" placeholders.

See [BUILD_PROMPT.md](BUILD_PROMPT.md) for the full functional spec and [CLAUDE.md](CLAUDE.md) for
architecture rules before extending this.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. The map renders immediately — no API key, signup, or billing needed
(it uses [OpenFreeMap](https://openfreemap.org), a free vector-tile host built on OpenStreetMap data).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |

## What's in this prototype

- 72 seeded (deterministic) mock quarries across 15 Tamil Nadu districts
- Interactive MapLibre/OpenFreeMap map (free, no API key) with clustered, status-colored markers,
  hover popups, a real Tamil Nadu district-boundary overlay, and scale/fullscreen/geolocate controls
- District / Mineral Type / Status / License Expiry / Last Inspection filters
- Live search across quarry name, operator name, and license number
- Stat cards (Total Quarries, Active, Violations Today, Expired Licenses, Revenue This Month)
- Quarry detail side panel with license, extraction, royalty, and inspection data
- Stubbed quick actions (View License / Raise Alert / Generate Notice) pointing at future features
- Simulated 5-minute "live" status refresh (no backend — jitters mock data)
- Government-of-Tamil-Nadu maroon-and-gold brand theme with lucide-react iconography throughout,
  kept visually separate from semantic status colors
- Fully responsive down to ~375px, with the side panel becoming a bottom sheet on mobile

### Real data vs. illustrative data

Click **"Data & sources"** on the dashboard for the full disclosure. In short: Tamil Nadu's district
boundaries and the per-mineral seigniorage fee (royalty) rates are **real, cited government/open data**
(TN Government Gazette No. 417, 2017; MIT-licensed district boundary data). Individual quarry names,
operators, license numbers, and violation records are **illustrative seeded data** — there is no public
API with real per-quarry mining records for Tamil Nadu, so nothing here should be read as an actual
regulatory finding about a real company.

No real backend, authentication, satellite imagery, GPS tracking, or SMS/email delivery is implemented —
see §7 of [BUILD_PROMPT.md](BUILD_PROMPT.md) for the full list of what's intentionally out of scope.
