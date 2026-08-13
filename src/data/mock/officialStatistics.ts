/**
 * Real, published Tamil Nadu mining statistics — used to give the prototype's seeded figures a
 * verifiable frame of reference. These are NOT mock values: every number below is quoted from the
 * cited government document. Anything derived from them in the UI must stay clearly separated from
 * the illustrative per-quarry data (see DataSourcesNote).
 */

export const TN_MINING_STATISTICS_SOURCE = {
  title: "Tamil Nadu Mines and Minerals — Policy Note 2020-2021",
  publisher: "Industries Department, Government of Tamil Nadu",
  url: "https://www.ielrc.org/content/e2013.pdf",
  note: "Figures quoted as published; FY2019-20 values are year-to-date up to December 2019.",
} as const;

/** Mineral revenue collected by the state, in ₹ crore. */
export const TN_MINERAL_REVENUE_CRORE = [
  { financialYear: "2017-18", crore: 1106, partial: false },
  { financialYear: "2018-19", crore: 1186, partial: false },
  { financialYear: "2019-20", crore: 976, partial: true }, // up to December 2019
] as const;

/** Statewide enforcement outcomes, FY2019-20 up to December 2019. */
export const TN_ENFORCEMENT_FY2019_20 = {
  vehiclesSeized: 7012,
  penaltyCollectedCrore: 12.38,
  criminalCasesFiled: 8165,
  goondasActInvocations: 10,
} as const;

/** Area under lease for selected minerals, in hectares. */
export const TN_LEASED_AREA_HECTARES = {
  granite: 2999,
  limestone: 6776,
  magnesite: 279,
  bauxite: 421,
} as const;

/** ₹ crore → ₹, for comparing against the prototype's rupee figures. */
export function croreToINR(crore: number): number {
  return crore * 1_00_00_000;
}
