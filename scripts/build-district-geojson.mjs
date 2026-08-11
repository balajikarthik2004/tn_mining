#!/usr/bin/env node
/**
 * Regenerates src/data/geo/tn-districts.geojson.
 *
 * Downloads the full Tamil Nadu districts layer from datta07/INDIAN-SHAPEFILES (MIT licensed),
 * keeps only the 15 districts this app uses, rounds coordinates to 3 decimal places, and
 * decimates ring vertices ~8:1 -- shrinks ~8.8MB down to ~185KB, plenty of fidelity for a
 * state-level reference overlay at this app's zoom levels.
 *
 * Run with: node scripts/build-district-geojson.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SOURCE_URL =
  "https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/TAMIL%20NADU/TAMIL%20NADU_DISTRICTS.geojson";
const OUT_PATH = fileURLToPath(new URL("../public/geo/tn-districts.geojson", import.meta.url));

const KEEP_DISTRICTS = [
  "Salem", "Namakkal", "Tiruchirappalli", "Madurai", "Coimbatore",
  "Krishnagiri", "Dindigul", "Karur", "Tirunelveli", "Villupuram",
  "Vellore", "Erode", "Ariyalur", "Cuddalore", "Thanjavur",
];

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

const kept = data.features.filter((f) => KEEP_DISTRICTS.includes(f.properties.dtname));
const missing = KEEP_DISTRICTS.filter((d) => !kept.some((f) => f.properties.dtname === d));
if (missing.length) {
  throw new Error(`Source data is missing expected districts: ${missing.join(", ")}`);
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
