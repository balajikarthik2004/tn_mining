import type { MineralType } from "../../types/common";

/**
 * REAL government-published seigniorage fee rates for minor minerals in Tamil Nadu.
 *
 * Source: Tamil Nadu Government Gazette Extraordinary No. 417, dated 28 December 2017 —
 * G.O. Ms. No. 183, Industries (MME.1) — "Amendments to the Tamil Nadu Minor Mineral
 * Concession Rules, 1959", substituted Appendix-II, Part A ("Rate of Seigniorage Fee").
 * https://tnmines.tn.gov.in/pdf/Gazette%20No.417-Revision%20of%20seigniorage%20fee%202017.pdf
 *
 * Rates are officially quoted **per cubic metre**, not per tonne — this app tracks extraction
 * volume in cubic metres (see `Quarry.declaredExtractionVolumeM3Monthly`) specifically so these
 * real rates can be applied directly without a density-conversion guess.
 *
 * Mapping notes (the gazette's mineral categories don't line up 1:1 with this app's simplified
 * MineralType list):
 *   - "Granite"        -> Appendix-II 2(b): "Red, Pink, Grey, Green, White or other coloured or
 *                          multi coloured granites ... ornamental and decorative stones" = ₹2,321/m³
 *   - "Black Granite"  -> Appendix-II 2(a): "Black granite" = ₹3,859/m³
 *   - "Sand"           -> Appendix-II 3: "Ordinary Sand" = ₹120/m³
 *   - "Limestone"      -> Appendix-II 5: "Limestone, Limeshell and Kankar ..." = ₹130/m³
 *   - "Rough Stone"    -> Appendix-II 1(a): "Rough stones including Khandas and boulders" = ₹46/m³
 *   - "Gravel"         -> not separately listed; mapped to the closest published category,
 *                          Appendix-II 1(b): "Size reduced (broken or crushed) materials
 *                          including metal jelly, ballast, millstone and hand chakais" = ₹59/m³
 *
 * Note: a later notification (SRO A-12(a)/2025, 20 May 2025) revised the rough-stone rate to
 * ₹33/tonne, but the full revised schedule for every mineral in a machine-readable, per-cubic-metre
 * form wasn't publicly available at the time this was written — so the complete 2017 schedule above
 * is used as the consistent baseline across all six mineral types.
 */
export const SEIGNIORAGE_FEE_PER_M3_INR: Record<MineralType, number> = {
  Sand: 120,
  Granite: 2321,
  Limestone: 130,
  Gravel: 59,
  "Black Granite": 3859,
  "Rough Stone": 46,
};

export const SEIGNIORAGE_FEE_SOURCE = {
  title: "Tamil Nadu Government Gazette Extraordinary No. 417 (28 Dec 2017), Appendix-II",
  goNumber: "G.O. Ms. No. 183, Industries (MME.1)",
  url: "https://tnmines.tn.gov.in/pdf/Gazette%20No.417-Revision%20of%20seigniorage%20fee%202017.pdf",
};
