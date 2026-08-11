# Real geographic data

`tn-districts.geojson` — Tamil Nadu district boundary polygons for the 15 districts used in this
prototype. Derived from [datta07/INDIAN-SHAPEFILES](https://github.com/datta07/INDIAN-SHAPEFILES)
(MIT licensed), itself built from Survey of India / Census 2011 administrative boundary data.

Filtered down from the full 38-district, ~8.8MB state file to just the 15 districts this app uses,
with coordinates rounded to 3 decimal places (~110m precision) and vertices decimated ~8:1 — plenty
of fidelity for a state-level reference overlay at the zoom levels this dashboard operates at, at a
fraction of the size (~185KB vs ~8.8MB).

Lives in `public/` (not `src/`) and is referenced by URL from `QuarryMap.tsx`'s district-boundary
`Source`, so MapLibre fetches it lazily as a normal static asset instead of it being bundled into
the JS — a `src/`-side `import ...?raw` was tried first and inflated the main bundle by ~185KB for
no benefit, since the data never needs to pass through JS/React at all.

Regenerate with `node scripts/build-district-geojson.mjs` (repo root) if the district list changes.
