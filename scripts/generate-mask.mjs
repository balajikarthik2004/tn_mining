import fs from "fs";
import { fileURLToPath } from "url";
import * as turf from "@turf/turf";

const INPUT_PATH = fileURLToPath(new URL("../public/geo/tn-districts.geojson", import.meta.url));
const OUT_PATH = fileURLToPath(new URL("../public/geo/tn-mask.geojson", import.meta.url));

const data = JSON.parse(fs.readFileSync(INPUT_PATH, "utf8"));

// 1. Union all districts to get a single outline of Tamil Nadu
let tnOutline = null;
for (const feature of data.features) {
  if (tnOutline === null) {
    tnOutline = feature;
  } else {
    try {
      tnOutline = turf.union(turf.featureCollection([tnOutline, feature]));
    } catch (e) {
      console.warn("Union failed for a feature, skipping...");
    }
  }
}

// 2. Create a "world" polygon
const world = turf.polygon([[
  [-180, -90],
  [180, -90],
  [180, 90],
  [-180, 90],
  [-180, -90]
]]);

// 3. Difference (World - TN)
const mask = turf.difference(turf.featureCollection([world, tnOutline]));

fs.writeFileSync(OUT_PATH, JSON.stringify(mask));
console.log("Wrote tn-mask.geojson");
