# Real geographic data

All three files are derived from [datta07/INDIAN-SHAPEFILES](https://github.com/datta07/INDIAN-SHAPEFILES)
(MIT licensed), itself built from Survey of India / Census administrative boundary data.

| File | What it is |
| --- | --- |
| `tn-districts.geojson` | All **38 present-day districts** of Tamil Nadu (post-2019/20 reorganisation — includes Chengalpattu, Kallakurichi, Ranipet, Tenkasi, Tirupathur, Mayiladuthurai). Each feature carries a `district` property. |
| `tn-mask.geojson` | A world polygon with Tamil Nadu punched out. Drawn as a flat fill over the basemap so only Tamil Nadu is visible — no neighbouring states. |
| `tn-outline.geojson` | The state boundary on its own, drawn as a crisp line along the mask edge. |
| `quarry-sites.geojson` | Footprints of the 72 **real quarry pits** the demo records sit on, keyed by `siteId`, from OpenStreetMap `landuse=quarry` (ODbL). Detail maps fetch this to draw the actual pit outline. |

District coordinates are rounded to 3 decimal places (~110 m) and vertices decimated ~8:1 — plenty of
fidelity at the zoom levels this dashboard reaches (max ~10.5), at a fraction of the source size
(~460 KB vs ~3.5 MB). The mask/outline are simplified to ~200 m tolerance (~42 KB each).

An earlier version of `tn-districts.geojson` held only the 30 pre-2019 districts under GADM's
`NAME_2` property; anything reading district names should go through `QuarryMap`'s
`DISTRICT_NAME_EXPR`, which coalesces `dtname → NAME_2 → Dist_Name → district → name`.

These live in `public/` (not `src/`) and are referenced by URL, so MapLibre fetches them lazily as
static assets instead of them being bundled into the JS — a `src/`-side `import ...?raw` was tried
first and inflated the main bundle for no benefit, since the data never needs to pass through
JS/React at all. The `?v=` query on those URLs is a cache-buster; bump it when regenerating.

## Regenerating

```bash
node scripts/build-district-geojson.mjs   # 38-district boundaries
node scripts/generate-mask.mjs            # mask + state outline
node scripts/build-district-centers.mjs   # rewrites src/data/mock/districts.ts
node scripts/build-quarry-sites.mjs       # real pit footprints + src/data/mock/quarrySites.ts
```

Run them in that order — the centres script reads the district file, and the mock data generator
places quarries using the centres/jitter it writes.
