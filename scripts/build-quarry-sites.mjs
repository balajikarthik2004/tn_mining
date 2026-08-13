#!/usr/bin/env node
/**
 * Regenerates the real quarry-site catalogue used to place this prototype's demo quarries on
 * actual extraction sites instead of random farmland.
 *
 * Source: OpenStreetMap `landuse=quarry` polygons inside Tamil Nadu, via the Overpass API
 * (ODbL — attribution is surfaced in-app through DataSourcesNote).
 *
 * Writes:
 *   public/geo/quarry-sites.geojson  — the chosen pit footprints (real polygons, by `siteId`)
 *   src/data/mock/quarrySites.ts     — id/district/centroid/area for the mock data generator
 *
 * What is real here: the coordinates, the pit outline and its area. Everything the app then hangs
 * on a site — operator, licence number, volumes, violations — stays fictional seeded data.
 *
 * Run with: node scripts/build-quarry-sites.mjs   (after build-district-geojson.mjs)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as turf from "@turf/turf";

const DISTRICTS_PATH = fileURLToPath(new URL("../public/geo/tn-districts.geojson", import.meta.url));
const GEOJSON_OUT = fileURLToPath(new URL("../public/geo/quarry-sites.geojson", import.meta.url));
const TS_OUT = fileURLToPath(new URL("../src/data/mock/quarrySites.ts", import.meta.url));

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const QUERY = `[out:json][timeout:180];
area["ISO3166-2"="IN-TN"][admin_level=4]->.tn;
(way["landuse"="quarry"](area.tn);
 relation["landuse"="quarry"](area.tn););
out geom;`;

/** How many sites the prototype uses. Matches QUARRY_COUNT in generateMockData. */
const SITE_COUNT = 72;
/** Ignore scraps: anything under 2 ha is usually a borrow pit or a mis-tag. */
const MIN_AREA_SQM = 20_000;
/** ~5 m — keeps the pit outline honest while trimming the file. */
const SIMPLIFY_TOLERANCE = 0.00005;
const COORD_PRECISION = 6;

async function fetchQuarries() {
  let lastError;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "tn-mining-ai-prototype/1.0 (build script)",
          Accept: "application/json",
        },
        body: "data=" + encodeURIComponent(QUERY),
      });
      if (!res.ok) throw new Error(`${url} responded ${res.status}`);
      return await res.json();
    } catch (error) {
      lastError = error;
      console.warn(`  ${url} failed (${error.message}) — trying next mirror`);
    }
  }
  throw lastError;
}

const districts = JSON.parse(readFileSync(DISTRICTS_PATH, "utf8"));

console.log("Querying Overpass for landuse=quarry polygons in Tamil Nadu…");
const osm = await fetchQuarries();

const sites = [];
for (const element of osm.elements) {
  if (!element.geometry || element.geometry.length < 4) continue;

  const ring = element.geometry.map((g) => [g.lon, g.lat]);
  const [first] = ring;
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first);

  let polygon;
  try {
    polygon = turf.polygon([ring]);
  } catch {
    continue; // self-intersecting or degenerate ring
  }

  const areaSqM = turf.area(polygon);
  if (areaSqM < MIN_AREA_SQM) continue;

  const centroid = turf.centroid(polygon).geometry.coordinates;
  const district = districts.features.find((f) =>
    turf.booleanPointInPolygon(turf.point(centroid), f)
  )?.properties.district;
  if (!district) continue; // just over the state line

  const simplified = turf.simplify(polygon, { tolerance: SIMPLIFY_TOLERANCE, highQuality: true });
  turf.coordEach(simplified, (coord) => {
    coord[0] = Math.round(coord[0] * 10 ** COORD_PRECISION) / 10 ** COORD_PRECISION;
    coord[1] = Math.round(coord[1] * 10 ** COORD_PRECISION) / 10 ** COORD_PRECISION;
  });

  sites.push({
    siteId: `S-${element.type[0].toUpperCase()}${element.id}`,
    district,
    lat: Math.round(centroid[1] * 10 ** COORD_PRECISION) / 10 ** COORD_PRECISION,
    lng: Math.round(centroid[0] * 10 ** COORD_PRECISION) / 10 ** COORD_PRECISION,
    areaSqM: Math.round(areaSqM),
    geometry: simplified.geometry,
  });
}

console.log(`  ${sites.length} usable pits (>= ${MIN_AREA_SQM / 10_000} ha)`);

// Group by district, largest pit first, then deal round-robin so every quarrying district is
// represented before the bigger districts get a second site.
const byDistrict = new Map();
for (const site of sites.sort((a, b) => b.areaSqM - a.areaSqM || a.siteId.localeCompare(b.siteId))) {
  if (!byDistrict.has(site.district)) byDistrict.set(site.district, []);
  byDistrict.get(site.district).push(site);
}

const districtNames = [...byDistrict.keys()].sort();
const chosen = [];
for (let round = 0; chosen.length < SITE_COUNT; round++) {
  let dealtThisRound = 0;
  for (const name of districtNames) {
    const queue = byDistrict.get(name);
    if (round >= queue.length) continue;
    chosen.push(queue[round]);
    dealtThisRound++;
    if (chosen.length === SITE_COUNT) break;
  }
  if (dealtThisRound === 0) break; // every district exhausted
}

chosen.sort((a, b) => a.district.localeCompare(b.district) || a.siteId.localeCompare(b.siteId));

writeFileSync(
  GEOJSON_OUT,
  JSON.stringify({
    type: "FeatureCollection",
    features: chosen.map((s) => ({
      type: "Feature",
      properties: { siteId: s.siteId, district: s.district, areaSqM: s.areaSqM },
      geometry: s.geometry,
    })),
  })
);

const rows = chosen
  .map(
    (s) =>
      `  { siteId: "${s.siteId}", district: "${s.district}", lat: ${s.lat}, lng: ${s.lng}, areaSqM: ${s.areaSqM} },`
  )
  .join("\n");

writeFileSync(
  TS_OUT,
  `import type { District } from "../../types/common";

/**
 * GENERATED by scripts/build-quarry-sites.mjs — edit that script, not this file.
 *
 * Real quarry sites in Tamil Nadu, from OpenStreetMap \`landuse=quarry\` polygons (ODbL). The
 * coordinates and \`areaSqM\` are real: each entry is an actual pit you can see on satellite
 * imagery. generateMockData places one demo quarry on each site, then hangs entirely fictional
 * operator / licence / volume / violation data off it — see the "Data & sources" note in-app.
 *
 * The matching pit outlines live in public/geo/quarry-sites.geojson, keyed by \`siteId\`.
 */
export interface QuarrySite {
  siteId: string;
  district: District;
  lat: number;
  lng: number;
  /** Mapped surface area of the pit, in square metres. */
  areaSqM: number;
}

export const QUARRY_SITES: QuarrySite[] = [
${rows}
];
`
);

const perDistrict = chosen.reduce((acc, s) => {
  acc[s.district] = (acc[s.district] ?? 0) + 1;
  return acc;
}, {});

console.log(`Wrote ${chosen.length} sites across ${Object.keys(perDistrict).length} districts`);
console.log(`  ${GEOJSON_OUT}`);
console.log(`  ${TS_OUT}`);
