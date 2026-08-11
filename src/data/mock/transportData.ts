import type { VehicleTrip, RoutePoint, PermitStatus, TripStatus } from "../../types/transport";
import { createSeededRandom, pick, randomFloat, randomInt } from "./seededRandom";

const SEED = 88412;

function generatePath(startLat: number, startLng: number, endLat: number, endLng: number, steps: number): RoutePoint[] {
  const path: RoutePoint[] = [];
  const now = Date.now();
  for (let i = 0; i < steps; i++) {
    const fraction = i / (steps - 1);
    const jitterLat = (Math.random() - 0.5) * 0.02;
    const jitterLng = (Math.random() - 0.5) * 0.02;
    path.push({
      lat: startLat + (endLat - startLat) * fraction + jitterLat,
      lng: startLng + (endLng - startLng) * fraction + jitterLng,
      timestamp: new Date(now - (steps - i) * 120000).toISOString(), // every 2 mins
    });
  }
  return path;
}

let cachedTrips: VehicleTrip[] | null = null;

export function getMockTransportTrips(): VehicleTrip[] {
  if (cachedTrips) return cachedTrips;

  const random = createSeededRandom(SEED);
  const trips: VehicleTrip[] = [];

  const BORDER_DESTINATIONS = [
    { state: "Andhra Pradesh", lat: 13.5, lng: 79.5 },
    { state: "Karnataka", lat: 12.8, lng: 77.8 },
    { state: "Kerala", lat: 10.8, lng: 76.9 },
  ] as const;

  for (let i = 1; i <= 10; i++) {
    const isIllegal = i <= 3; // First 3 are illegal
    const isSuspicious = i === 4; // 1 suspicious
    
    const status: TripStatus = isIllegal ? "Illegal" : isSuspicious ? "Suspicious" : "Compliant";
    const permitStatus: PermitStatus = isIllegal ? pick(random, ["Missing", "Expired", "Forged"]) : "Valid";
    
    const startLat = 11.0 + randomFloat(random, -1, 1);
    const startLng = 78.5 + randomFloat(random, -1, 1);
    
    let endLat, endLng, borderState;
    if (isIllegal || isSuspicious) {
      const border = pick(random, [...BORDER_DESTINATIONS]);
      // Push slightly past border if illegal
      const push = isIllegal ? 0.1 : -0.1;
      endLat = border.lat + (border.lat > startLat ? push : -push) + randomFloat(random, -0.1, 0.1);
      endLng = border.lng + (border.lng > startLng ? push : -push) + randomFloat(random, -0.1, 0.1);
      borderState = border.state;
    } else {
      endLat = 11.5 + randomFloat(random, -1, 1);
      endLng = 79.0 + randomFloat(random, -1, 1);
    }
    
    const pathSteps = randomInt(random, 15, 30);
    const actualRoute = generatePath(startLat, startLng, endLat, endLng, pathSteps);
    
    const declaredRoute = isIllegal || isSuspicious 
      ? generatePath(startLat, startLng, 13.08, 80.27, 2) // Chennai is the declared destination for illegal trips to show deviation
      : [actualRoute[0], actualRoute[actualRoute.length - 1]];
      
    const currentLocation = actualRoute[actualRoute.length - 1];

    trips.push({
      id: `TRP-${String(i).padStart(4, "0")}`,
      vehicleNumber: `TN ${randomInt(random, 10, 99)} ${pick(random, ["AA", "AB", "XY", "ZZ"])} ${randomInt(random, 1000, 9999)}`,
      driverName: pick(random, ["Kumar", "Selvam", "Raja", "Muthu", "Kannan"]),
      operatorName: `Operator ${i}`,
      originQuarry: `Quarry ${i}`,
      declaredDestination: isIllegal || isSuspicious ? "Chennai Stockyard" : "Local Construction Site",
      mineralType: pick(random, ["Sand", "Granite", "Rough Stone"]),
      declaredWeightTonnes: randomInt(random, 15, 40),
      permitStatus,
      status,
      currentLocation,
      isApproachingBorder: isSuspicious,
      hasCrossedBorder: isIllegal,
      borderState,
      crossingTimestamp: isIllegal ? new Date().toISOString() : undefined,
      actualRoute,
      declaredRoute,
    });
  }

  cachedTrips = trips;
  return trips;
}
