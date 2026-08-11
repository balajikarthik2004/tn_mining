import type { District } from "../../types/common";

/** Approximate real town-center coordinates for each district (quarries jitter around these). */
export const DISTRICT_CENTERS: Record<District, { lat: number; lng: number }> = {
  Salem: { lat: 11.664, lng: 78.146 },
  Namakkal: { lat: 11.219, lng: 78.165 },
  Tiruchirappalli: { lat: 10.79, lng: 78.704 },
  Madurai: { lat: 9.925, lng: 78.119 },
  Coimbatore: { lat: 11.017, lng: 76.955 },
  Krishnagiri: { lat: 12.519, lng: 78.214 },
  Dindigul: { lat: 10.365, lng: 77.981 },
  Karur: { lat: 10.959, lng: 78.081 },
  Tirunelveli: { lat: 8.713, lng: 77.759 },
  Villupuram: { lat: 11.941, lng: 79.492 },
  Vellore: { lat: 12.916, lng: 79.133 },
  Erode: { lat: 11.341, lng: 77.717 },
  Ariyalur: { lat: 11.138, lng: 79.078 },
  Cuddalore: { lat: 11.748, lng: 79.768 },
  Thanjavur: { lat: 10.787, lng: 79.138 },
};

/** Tamil Nadu's real bounding box — used to clamp jittered coordinates. */
export const TN_BOUNDS = {
  minLat: 8.0,
  maxLat: 13.5,
  minLng: 76.5,
  maxLng: 80.3,
};

export const TN_CENTER = { lat: 10.9, lng: 78.4 };
