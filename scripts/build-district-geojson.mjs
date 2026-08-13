#!/usr/bin/env node
/**
 * Regenerates public/geo/tn-districts.geojson.
 *
 * Downloads the full Tamil Nadu districts layer from datta07/INDIAN-SHAPEFILES (MIT licensed) and
 * keeps **all 38 present-day districts** (the earlier build kept 15, and a later hand-swapped GADM
 * file only had the 30 pre-2019 districts — both are out of date). Coordinates are rounded to 3
 * decimals (~110 m) and ring vertices decimated ~8:1, which is plenty of fidelity for a boundary
 * overlay at this app's zoom levels (max ~10.5).
 *
 * Writes `district` on every feature. Re-run scripts/generate-mask.mjs afterwards so the
 * Tamil-Nadu-only mask matches the new outline.
 *
 * Run with: node scripts/build-district-geojson.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SOURCE_URL =
  "https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/TAMIL%20NADU/TAMIL%20NADU_DISTRICTS.geojson";
const OUT_PATH = fileURLToPath(new URL("../public/geo/tn-districts.geojson", import.meta.url));

/** Sanity check: the source must still carry the full present-day district set. */
const EXPECTED_DISTRICT_COUNT = 38;

const PRECISION = 3; // ~110m at this latitude
const EVERY_NTH = 8;

function round(n) {
  return Math.round(n * 10 ** PRECISION) / 10 ** PRECISION;
}

function isPoint(c) {
  return Array.isArray(c) && typeof c[0] === "number" && typeof c[1] === "number";
}

function decimate(ring, everyNth) {
  if (ring.length <= 20) return ring;
  const out = [];
  for (let i = 0; i < ring.length; i++) {
    if (i % everyNth === 0 || i === ring.length - 1) out.push(ring[i]);
  }
  return out;
}

function simplifyCoords(coords) {
  if (isPoint(coords)) return [round(coords[0]), round(coords[1])];
  if (Array.isArray(coords) && coords.length && isPoint(coords[0])) {
    return decimate(coords.map(simplifyCoords), EVERY_NTH);
  }
  return coords.map(simplifyCoords);
}

const res = await fetch(SOURCE_URL);
if (!res.ok) throw new Error(`Failed to fetch source geojson: ${res.status}`);
const data = await res.json();

const kept = data.features.filter((f) => f.properties?.dtname);
if (kept.length !== EXPECTED_DISTRICT_COUNT) {
  throw new Error(
    `Expected ${EXPECTED_DISTRICT_COUNT} districts in the source layer, got ${kept.length}. ` +
      `If Tamil Nadu has been reorganised again, bump EXPECTED_DISTRICT_COUNT and update ` +
      `DISTRICTS/DISTRICT_CENTERS in src/.`
  );
}

const simplified = {
  type: "FeatureCollection",
  features: kept.map((f) => ({
    type: "Feature",
    properties: { district: f.properties.dtname },
    geometry: { type: f.geometry.type, coordinates: simplifyCoords(f.geometry.coordinates) },
  })),
};

writeFileSync(OUT_PATH, JSON.stringify(simplified));
console.log(`Wrote ${OUT_PATH} (${kept.length} districts)`);
