# TN Mining AI Platform — Build Prompt for Claude Code
## Feature 1: Quarry Map Dashboard (+ Project Foundation)

**How to use this document:** Copy everything below into Claude Code as your opening prompt in a fresh project folder. It gives Claude the full context, the technical foundation to lock in now (so Features 2–10 plug in cleanly later), and the detailed spec for Feature 1.

---

## 0. Project Context

We are building a prototype of the **TN Mining AI Platform** — a monitoring and enforcement tool for Tamil Nadu's mining/quarry department. The full product has 10 features (map dashboard, AI anomaly detection, inter-state transport tracking, licensing, transport monitoring, QR permit validation, night mining detection, court case tracking, royalty intelligence — built one at a time).

**This build covers two things:**
1. A **shared frontend foundation** that every later feature will extend (folder structure, shared types, mock data layer, design system, navigation shell).
2. **Feature 1 — Quarry Map Dashboard**, fully implemented on top of that foundation.

**Constraints for this phase:**
- This is a **prototype**. Frontend-only, no real backend.
- All data is **realistic mock/seed data** — no live government systems, no real satellite feeds. Structure the code so a real API can be swapped in later without touching components (see §2.3).
- Build it so it *feels* like one connected application from day one, even though only Feature 1 is functional today (placeholder nav items for Features 2–10 are fine).

---

## 1. Tech Stack (locked in for this prototype)

> **Superseded:** the map stack below originally specced Mapbox GL JS. Mapbox now requires a
> billing-enabled account even for its free tier, so the actual implementation uses **MapLibre GL JS**
> (`react-map-gl/maplibre` + `maplibre-gl`) styled with **[OpenFreeMap](https://openfreemap.org)** — a
> free, no-signup, no-token, no-billing vector tile/style host built on OpenStreetMap data. No
> `VITE_MAPBOX_TOKEN` or `.env` setup is needed for the map. See [CLAUDE.md](CLAUDE.md) for the current
> architecture. The rest of this section is kept for historical context.

- **React 18 + TypeScript + Vite** — fast dev loop, no backend needed
- **Tailwind CSS** — utility styling, easy to theme status colors consistently
- ~~**Mapbox GL JS** (via `react-map-gl` or the `mapbox-gl` package directly) — for the Tamil Nadu quarry map~~
- ~~**Supercluster** (or Mapbox's built-in clustering) — marker clustering for districts with many quarries~~ (implemented via MapLibre's built-in clustering instead)
- **React Router v6** — routing/nav shell for all 10 features
- **Zustand** — lightweight global state (filters, selected quarry, side panel open/closed)
- **Recharts** — for later charts (Feature 2 gap charts, Feature 9 trends) — not needed yet, but install now so the pattern is consistent
- **date-fns** — date handling (license expiry countdowns, etc.)

~~You'll need a free Mapbox access token (mapbox.com → sign up → default public token). Store it as `VITE_MAPBOX_TOKEN` in a `.env` file (add `.env` to `.gitignore`). If no token is available yet, stub the map with a placeholder and note clearly where the token goes.~~ No longer applicable — see the superseded note above.

---

## 2. Foundation to Establish Now (shared by all 10 features)

### 2.1 Folder structure

```
src/
  app/
    App.tsx
    routes.tsx              # route table incl. placeholder routes for Features 2-10
    Layout.tsx              # sidebar nav + topbar shell
  features/
    dashboard/               # Feature 1 lives here
      DashboardPage.tsx
      components/
        QuarryMap.tsx
        StatCards.tsx
        FilterBar.tsx
        SearchBar.tsx
        QuarrySidePanel.tsx
    anomaly-detection/        # placeholder page, "Coming soon"
    transport-tracking/       # placeholder page
    licensing/                # placeholder page
    transport-monitoring/     # placeholder page
    permit-qr/                 # placeholder page
    night-mining/              # placeholder page
    court-cases/               # placeholder page
    royalty-intelligence/     # placeholder page
  components/ui/              # shared: StatusBadge, Card, Button, Modal, Table, Skeleton
  types/
    quarry.ts
    operator.ts
    license.ts
    violation.ts
    payment.ts
    inspection.ts
    common.ts                # District, MineralType, StatusColor enums shared everywhere
  data/
    mock/
      districts.ts
      quarries.ts
      operators.ts
      licenses.ts
      generateMockData.ts     # deterministic generator (seeded, not Math.random on every render)
  services/
    quarryApi.ts              # mockApi now, swappable for real fetch later
    licenseApi.ts
  store/
    dashboardStore.ts         # Zustand store: filters, selectedQuarryId, searchQuery
  utils/
    formatters.ts             # currency (₹), tonnage, date formatting
```

### 2.2 Shared TypeScript types (define now, other features will import these)

```ts
// types/common.ts
export type District =
  | "Salem" | "Namakkal" | "Tiruchirappalli" | "Madurai" | "Coimbatore"
  | "Krishnagiri" | "Dindigul" | "Karur" | "Tirunelveli" | "Villupuram"
  | "Vellore" | "Erode" | "Ariyalur" | "Cuddalore" | "Thanjavur";

export type MineralType = "Sand" | "Granite" | "Limestone" | "Gravel" | "Black Granite" | "Rough Stone";

export type QuarryStatus = "Compliant" | "Warning" | "Violation" | "LicenseExpired";
// 🟢 Compliant · 🟡 Warning · 🔴 Violation · ⚫ LicenseExpired

// types/quarry.ts
export interface Quarry {
  id: string;
  name: string;
  district: District;
  lat: number;
  lng: number;
  mineralType: MineralType;
  status: QuarryStatus;
  operatorId: string;
  licenseId: string;
  declaredExtractionTonnesMonthly: number;
  aiEstimatedExtractionTonnesMonthly: number; // used fully in Feature 2, needed for stat cards now
  royaltyPaidINR: number;
  royaltyOutstandingINR: number;
  lastInspectionDate: string; // ISO date
  inspectorName: string;
  activeViolationsCount: number;
  lastViolationLoggedAt?: string; // ISO datetime, set for a subset of Violation-status quarries to drive "Violations Today"
}

// types/operator.ts
export interface Operator {
  id: string;
  name: string;
  contactPhone: string;
  contactEmail: string;
}

// types/license.ts
export interface License {
  id: string;
  licenseNumber: string;
  quarryId: string;
  validFrom: string;   // ISO date
  validUntil: string;  // ISO date
}
```

### 2.3 Mock data service pattern (so swapping in a real API later is trivial)

```ts
// services/quarryApi.ts
import { quarries } from "../data/mock/quarries";

const LATENCY_MS = 300;

export async function getQuarries(): Promise<Quarry[]> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  return quarries;
}

export async function getQuarryById(id: string): Promise<Quarry | undefined> {
  await new Promise((r) => setTimeout(r, LATENCY_MS));
  return quarries.find((q) => q.id === id);
}
```

All components call these service functions, never the raw mock arrays directly — that's the seam where a real backend plugs in later without touching UI code.

### 2.4 Design system tokens

**Brand palette — Government of Tamil Nadu identity.**
This is chrome/branding (sidebar, topbar, buttons, headers, active nav state, links) — kept visually distinct from status colors below so officials never confuse "this button is maroon" with "this quarry is in violation." Palette is inspired by the maroon-and-gold used across TN Government letterheads, the state emblem's temple gopuram artwork, and department seals — reads as official/institutional rather than generic SaaS blue.

| Token | Hex | Usage |
|---|---|---|
| `brand-maroon-900` (primary) | `#5C0A1E` | Sidebar background, topbar, primary buttons, active nav item |
| `brand-maroon-700` | `#7A0C2E` | Hover states on primary buttons/nav |
| `brand-maroon-50` | `#FBEAEE` | Subtle tinted backgrounds (selected row, hover on light surfaces) |
| `brand-gold-500` (accent) | `#D4A017` | Active nav indicator/underline, icons, dividers, focus rings, badges |
| `brand-gold-300` | `#E8C158` | Secondary accents, chart highlight, hover on gold elements |
| `brand-gold-50` | `#FDF6E3` | Page background tint / card highlight (warm off-white, not stark grey) |
| `neutral-ink` | `#1F2937` | Body text |
| `neutral-surface` | `#FFFFFF` | Card/panel backgrounds |
| `neutral-border` | `#E7DFC6` | Borders/dividers (warm-toned grey, ties into the gold family) |

Tailwind config extension:
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        900: "#5C0A1E",
        700: "#7A0C2E",
        50:  "#FBEAEE",
      },
      gold: {
        500: "#D4A017",
        300: "#E8C158",
        50:  "#FDF6E3",
      },
    },
  },
},
```

Applied: sidebar + topbar use `brand-900` with white text; the active nav item gets a `gold-500` left-border/indicator; primary CTA buttons (`Raise Alert`, `Generate Notice`) are `brand-900` with `gold-500` on hover/focus ring; page background is `gold-50` (warm, not clinical white/grey); links and secondary icons use `brand-700`.

**Status colors — semantic, unchanged by branding, used consistently everywhere (all 10 features):**
- Compliant `#22c55e` (green)
- Warning `#eab308` (yellow)
- Violation `#ef4444` (red — deliberately a brighter/cooler red than `brand-maroon`, so it reads as an alert, not a branding accent)
- LicenseExpired `#374151` (dark grey/black)

- Reusable `<StatusBadge status={...} />` component — a colored pill with label, using the status colors above (not brand colors) — used on the map legend, side panel, and later on the licensing table (Feature 4) and case tracker (Feature 8)
- Reusable `<StatCard label value icon trend? />` for the summary row — card surface in `neutral-surface`, top accent bar or icon tint in `gold-500`
- App shell: left sidebar (`brand-900` background) with nav items for all 10 features (icons + labels), only "Quarry Map Dashboard" is clickable/active (`gold-500` active indicator) — others show a "Coming soon" badge and are disabled, not hidden (so stakeholders reviewing the prototype can see the full planned scope)

---

## 3. Mock Data Spec

Generate **60–80 quarries** spread across these 15 real Tamil Nadu districts (a representative subset, not all 38 — enough for a convincing demo): Salem, Namakkal, Tiruchirappalli, Madurai, Coimbatore, Krishnagiri, Dindigul, Karur, Tirunelveli, Villupuram, Vellore, Erode, Ariyalur, Cuddalore, Thanjavur.

- **GPS coordinates:** scatter within Tamil Nadu's real bounding box (approx. lat 8.0–13.5, lng 76.5–80.3), clustered loosely around each district's actual town coordinates (e.g. Salem ≈ 11.66, 78.15) with small random jitter so markers land in plausible spots.
- **Mineral types:** distribute realistically — Sand and Granite should dominate (TN's biggest mining sectors), with smaller shares of Limestone, Gravel, Black Granite, Rough Stone.
- **Status distribution:** ~65% Compliant, 15% Warning, 12% Violation, 8% LicenseExpired — enough variety to make every filter and stat card meaningful.
- **Extraction figures:** `aiEstimatedExtractionVolumeM3Monthly` should be equal to declared for Compliant quarries, and 15–60% higher than declared for Warning/Violation quarries (this gap becomes the seed for Feature 2 later — keep the field even though the anomaly UI isn't built yet).
  > **Superseded:** the field is tracked in **cubic metres**, not tonnes (`declaredExtractionVolumeM3Monthly` /
  > `aiEstimatedExtractionVolumeM3Monthly`) — see below.
- **Royalty figures:** derive `royaltyPaidINR` / `royaltyOutstandingINR` from declared volume × a plausible per-unit rate so the "Revenue This Month" stat card is a real sum, not a hardcoded number.
  > **Superseded:** the actual implementation uses **real, government-published seigniorage fee rates**
  > (₹ per cubic metre, from Tamil Nadu Government Gazette No. 417, 28 Dec 2017) instead of made-up
  > per-tonne figures — see `src/data/mock/officialRates.ts` and [CLAUDE.md](CLAUDE.md)'s "Real vs.
  > illustrative data" section.
- **Dates:** `lastInspectionDate` within the past 90 days; license `validUntil` spread so some fall within 30/60/90 days (for future expiry-alert testing in Feature 4) and a few already expired (to populate the ⚫ status).
- Use a **seeded/deterministic generator** (not `Math.random()` on every load) so the demo dataset is stable across refreshes and screenshots.
- **"Violations Today" stat card:** add a `lastViolationLoggedAt` (ISO datetime) field to a handful of Violation-status quarries, dated today, so this card has a real, non-zero number to compute from — don't hardcode it.

---

## 4. Feature 1 Functional Spec — Quarry Map Dashboard

### Overview
The central home screen. Every user lands here first. Shows all quarries across Tamil Nadu on an interactive map with status.

### Requirements
- Display all mock quarries as map markers on a Tamil Nadu map view.
- Color-code markers by status: 🟢 Compliant · 🟡 Warning · 🔴 Violation · ⚫ License Expired.
- Clicking a marker opens a side panel with quarry details.
- Filters: District · Mineral Type · Status · License Expiry (range) · Last Inspection Date (range).
- Search bar: by quarry name, operator name, or license number — filters the map and any list view live as you type.
- Summary stat cards at top, computed from the (filtered) mock dataset: Total Quarries · Active · Violations Today · Expired Licenses · Revenue This Month.
- Marker clustering when zoomed out over districts with many quarries; clusters expand on click/zoom.
- Map auto-"refreshes" every 5 minutes (for the prototype, this can just re-run the mock data pass with a small randomized status jitter, to simulate live updates without a backend).
- Fully responsive down to mobile widths (~375px) — side panel becomes a bottom sheet or full-screen overlay on small screens rather than a fixed side rail.

### Quarry Detail Side Panel (on marker click)
- Quarry Name · License Number · Operator Name · Contact
- Mineral Type
- License Valid From / Valid Until (with a "days remaining" indicator)
- Last Declared Extraction Volume · AI Estimated Extraction Volume (shown side by side even though the full gap-analysis UI is Feature 2)
- Royalty Paid · Royalty Outstanding
- Last Inspection Date · Inspector Name
- Active Violations count
- Quick action buttons: **View License** · **Raise Alert** · **Generate Notice** — for this prototype, these should open a modal/toast that says "This action will be available when Feature 4 (Licensing) / Feature 8 (Court Case Tracker) is built" rather than being hidden — they establish the UI pattern now.

---

## 5. Acceptance Criteria (definition of done for this build)

- [ ] Map renders centered on Tamil Nadu with all mock quarries visible as clustered, color-coded markers.
- [ ] Clicking a marker opens the side panel with every field listed in §4 populated from mock data.
- [ ] All 5 filters work individually and in combination; clearing filters restores the full dataset.
- [ ] Search matches on quarry name, operator name, and license number (case-insensitive, partial match).
- [ ] Stat cards recompute correctly when filters/search are applied (e.g. "Total Quarries" reflects the filtered count).
- [ ] Status colors match the spec exactly and are used consistently between the map legend and the side panel badge.
- [ ] Brand colors (maroon/gold) are used consistently for chrome (sidebar, topbar, buttons, active states) and never substituted for status colors.
- [ ] Layout is usable at both desktop and mobile widths with no horizontal scroll or overlapping elements.
- [ ] No TypeScript errors, no console errors/warnings on load or interaction.
- [ ] Sidebar nav shows all 10 planned features, with 9 of them visibly disabled/"coming soon" and only the dashboard active.

---

## 6. Suggested Build Order (for Claude Code to follow)

1. Scaffold the Vite + React + TS project; install Tailwind, Mapbox GL JS, React Router, Zustand, Recharts, date-fns.
2. Create the folder structure and shared types from §2.1–2.2.
3. Build the deterministic mock data generator (§3) and the `quarryApi`/`licenseApi` service layer (§2.3).
4. Configure the Tailwind theme with the brand + status color tokens (§2.4) before building any UI.
5. Build the app shell: sidebar nav (10 items, 1 active) + topbar + routing table with placeholder pages for Features 2–10.
6. Build the map component with Mapbox, clustering, and color-coded markers driven by the mock data service.
7. Build the stat cards row, wired to the same filtered dataset the map uses.
8. Build the filter bar and search bar; wire both into the shared Zustand store so map, side panel, and stat cards all react together.
9. Build the quarry side panel with all fields and the three stubbed quick-action buttons.
10. Add the 5-minute simulated refresh and mobile-responsive layout pass.
11. Self-review against the acceptance criteria in §5 and fix anything unmet.

---

## 7. Explicitly Out of Scope for This Build

- Any real backend, database, or authentication.
- Real satellite/drone imagery or AI extraction estimation (Feature 2).
- Real GPS truck tracking, e-permit databases, or police integrations (Features 3, 5, 6).
- Real SMS/email delivery (Feature 4, 9) — stub these as console logs or toasts.

Keep the mock data model and service-layer seam (§2.3) clean specifically so these can be added feature-by-feature without reworking Feature 1.
