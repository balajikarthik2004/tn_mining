import type { InternalTrip, RoutePoint, TripAnomaly, InternalTripStatus } from "../../types/transport";
import { createSeededRandom, pick, randomFloat, randomInt } from "./seededRandom";

const SEED = 99412;

function generateInternalPath(startLat: number, startLng: number, endLat: number, endLng: number, steps: number, timeAgoHours: number): RoutePoint[] {
  const path: RoutePoint[] = [];
  const now = Date.now();
  const startTime = now - (timeAgoHours * 60 * 60 * 1000);
  
  for (let i = 0; i < steps; i++) {
    const fraction = i / (steps - 1);
    const jitterLat = (Math.random() - 0.5) * 0.01;
    const jitterLng = (Math.random() - 0.5) * 0.01;
    path.push({
      lat: startLat + (endLat - startLat) * fraction + jitterLat,
      lng: startLng + (endLng - startLng) * fraction + jitterLng,
      timestamp: new Date(startTime + (i * 2 * 60 * 1000)).toISOString(),
    });
  }
  return path;
}

let cachedInternalTrips: InternalTrip[] | null = null;

export function getMockInternalTrips(): InternalTrip[] {
  if (cachedInternalTrips) return cachedInternalTrips;

  const random = createSeededRandom(SEED);
  const trips: InternalTrip[] = [];

  const DESTINATIONS = [
    { name: "Chennai Port", lat: 13.0827, lng: 80.2707 },
    { name: "Coimbatore Industrial Area", lat: 11.0168, lng: 76.9558 },
    { name: "Madurai Stockyard", lat: 9.9252, lng: 78.1198 },
    { name: "Trichy Construction Site", lat: 10.7905, lng: 78.7047 },
    { name: "Salem Plant", lat: 11.6643, lng: 78.1460 },
  ];

  for (let i = 1; i <= 25; i++) {
    const isAnomaly = i <= 6;
    const isDelivered = i > 15 && i <= 20;
    
    let status: InternalTripStatus = isDelivered ? "Delivered" : "In Transit";
    
    if (isAnomaly && status === "In Transit") {
      status = pick(random, ["Suspicious", "Overdue"]);
    }

    const startLat = 11.0 + randomFloat(random, -1, 1);
    const startLng = 78.5 + randomFloat(random, -1, 1);
    const dest = pick(random, DESTINATIONS);
    
    const timeAgoHours = isDelivered ? randomFloat(random, 4, 12) : randomFloat(random, 0.5, 3);
    const pathSteps = randomInt(random, 15, 45);
    
    const route = generateInternalPath(startLat, startLng, dest.lat, dest.lng, pathSteps, timeAgoHours);
    const currentLocation = route[isDelivered ? route.length - 1 : Math.floor(route.length * randomFloat(random, 0.3, 0.9))];
    
    const loadingWeightTonnes = randomInt(random, 15, 35);
    let deliveryWeightTonnes: number | undefined = undefined;
    
    const anomalies: TripAnomaly[] = [];
    
    if (isDelivered) {
      if (isAnomaly) {
        deliveryWeightTonnes = Math.round(loadingWeightTonnes * randomFloat(random, 0.8, 0.9));
        anomalies.push({
          id: `ANM-${i}-1`,
          type: "Weight Mismatch",
          description: `Delivery weight (${deliveryWeightTonnes}t) is significantly lower than loading weight (${loadingWeightTonnes}t).`,
          timestamp: new Date().toISOString(),
          severity: "High"
        });
      } else {
        deliveryWeightTonnes = loadingWeightTonnes;
      }
    } else if (isAnomaly) {
      const anomalyType = pick(random, ["Route Deviation", "Time Anomaly", "Frequent Stops"] as const) as "Route Deviation" | "Time Anomaly" | "Frequent Stops";
      anomalies.push({
        id: `ANM-${i}-1`,
        type: anomalyType,
        description: anomalyType === "Route Deviation" ? "Vehicle deviated from declared route by >2km." :
                     anomalyType === "Time Anomaly" ? "Trip is taking significantly longer than estimated." :
                     "Vehicle stopped at unregistered location for >30 minutes.",
        timestamp: new Date(Date.now() - randomInt(random, 10, 60) * 60 * 1000).toISOString(),
        severity: anomalyType === "Route Deviation" ? "High" : "Medium"
      });
    }

    const startTime = new Date(Date.now() - (timeAgoHours * 60 * 60 * 1000));
    const estTime = new Date(startTime.getTime() + (randomInt(random, 2, 6) * 60 * 60 * 1000));

    trips.push({
      id: `INT-TRP-${String(i).padStart(4, "0")}`,
      tripSheetNumber: `TS/TN/${new Date().getFullYear()}/${randomInt(random, 10000, 99999)}`,
      vehicleNumber: `TN ${randomInt(random, 10, 99)} ${pick(random, ["AA", "AB", "XY", "ZZ"])} ${randomInt(random, 1000, 9999)}`,
      driverName: pick(random, ["Kumar", "Selvam", "Raja", "Muthu", "Kannan", "Ramesh", "Vijay"]),
      operatorName: `TN Operator ${i}`,
      originQuarry: `Quarry ${randomInt(random, 1, 72)}`,
      destination: dest.name,
      mineralType: pick(random, ["Sand", "Granite", "Rough Stone", "Gravel", "Limestone"]),
      
      startTime: startTime.toISOString(),
      estimatedArrivalTime: estTime.toISOString(),
      actualArrivalTime: isDelivered ? new Date(estTime.getTime() + (randomInt(random, -30, 30) * 60 * 1000)).toISOString() : undefined,
      
      loadingWeightTonnes,
      deliveryWeightTonnes,
      
      status,
      currentLocation,
      route,
      anomalies,
      checkpostsPassed: randomInt(random, 0, 4),
    });
  }

  cachedInternalTrips = trips;
  return trips;
}
