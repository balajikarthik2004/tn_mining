#!/usr/bin/env node
/**
 * Regenerates the "everything except Tamil Nadu" mask used to hide neighbouring states on the
 * dashboard/anomaly maps, plus the crisp state outline drawn on top of the mask edge.
 *
 * Writes:
 *   public/geo/tn-mask.geojson     — world polygon with Tamil Nadu punched out (one MultiPolygon)
 *   public/geo/tn-outline.geojson  — the Tamil Nadu boundary on its own
 *
 * Source: datta07/INDIAN-SHAPEFILES (MIT licensed) — the same layer family as the district
 * boundaries. The state outline is used directly rather than unioning the 38 decimated district
 * polygons: those have rounded coordinates, so adjacent districts no longer share exact edges and
 * a union of them produces thousands of slivers.
 *
 * Run with: node scripts/generate-mask.mjs   (after build-district-geojson.mjs)
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as turf from "@turf/turf";

const SOURCE_URL =
  "https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/STATES/TAMIL%20NADU/TAMIL%20NADU_STATE.geojson";
const MASK_OUT = fileURLToPath(new URL("../public/geo/tn-mask.geojson", import.meta.url));
const OUTLINE_OUT = fileURLToPath(new URL("../public/geo/tn-outline.geojson", import.meta.url));

/** ~0.002° ≈ 200 m: smooth enough for the max zoom this app reaches, and keeps the files small. */
const SIMPLIFY_TOLERANCE = 0.002;
const PRECISION = 4;

const res = await fetch(SOURCE_URL);
if (!res.ok) throw new Error(`Failed to fetch source geojson: ${res.status}`);
const source = await res.json();

// Merge whatever the source ships (single feature, or a couple of parts) into one geometry.
let outline = source.features[0];
for (const feature of source.features.slice(1)) {
  outline = turf.union(turf.featureCollection([outline, feature]));
}

outline = turf.simplify(outline, { tolerance: SIMPLIFY_TOLERANCE, highQuality: true });
turf.coordEach(outline, (coord) => {
  coord[0] = Math.round(coord[0] * 10 ** PRECISION) / 10 ** PRECISION;
  coord[1] = Math.round(coord[1] * 10 ** PRECISION) / 10 ** PRECISION;
});

const world = turf.polygon([
  [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85],
  ],
]);

const mask = turf.difference(turf.featureCollection([world, outline]));
if (!mask) throw new Error("Mask difference produced no geometry");

const partCount =
  mask.geometry.type === "MultiPolygon" ? mask.geometry.coordinates.length : 1;

writeFileSync(MASK_OUT, JSON.stringify(mask));
writeFileSync(
  OUTLINE_OUT,
  JSON.stringify({
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: { name: "Tamil Nadu" }, geometry: outline.geometry }],
  })
);

console.log(`Wrote tn-mask.geojson (${partCount} part(s)) and tn-outline.geojson`);
