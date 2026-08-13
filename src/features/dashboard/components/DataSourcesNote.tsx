import { useState } from "react";
import { Info } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { SEIGNIORAGE_FEE_SOURCE } from "../../../data/mock/officialRates";

/**
 * Transparency disclosure: which parts of this dashboard are real published data vs.
 * illustrative demo data. Exists specifically so nobody mistakes the mock operator/violation
 * records for genuine regulatory findings.
 */
export function DataSourcesNote() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-ink/50 underline decoration-dotted underline-offset-2 hover:text-brand-700"
      >
        <Info className="h-3 w-3" aria-hidden="true" />
        Data &amp; sources
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Data & sources">
        <div className="space-y-3 text-left">
          <div>
            <p className="font-semibold text-status-compliant">✓ Real, published data</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-neutral-ink/80">
              <li>
                Tamil Nadu district boundaries — from{" "}
                <a
                  href="https://github.com/datta07/INDIAN-SHAPEFILES"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-700 underline"
                >
                  datta07/INDIAN-SHAPEFILES
                </a>{" "}
                (MIT licensed, Survey of India / Census 2011 derived).
              </li>
              <li>
                Seigniorage fee (royalty) rates per mineral — {SEIGNIORAGE_FEE_SOURCE.title},{" "}
                {SEIGNIORAGE_FEE_SOURCE.goNumber}.{" "}
                <a href={SEIGNIORAGE_FEE_SOURCE.url} target="_blank" rel="noreferrer" className="text-brand-700 underline">
                  View gazette
                </a>
                .
              </li>
              <li>
                Quarry <strong>locations and pit outlines</strong> — real working sites, from{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-700 underline"
                >
                  OpenStreetMap
                </a>{" "}
                <code className="rounded bg-brand-50 px-1 py-0.5 text-xs">landuse=quarry</code> polygons
                (ODbL), with their mapped surface area. Each demo record is placed on one of these, so
                coordinates and footprints on the maps are genuine.
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-status-warning">◐ Illustrative demo data</p>
            <p className="mt-1 text-neutral-ink/80">
              Quarry names, operator names/contacts, license numbers, extraction volumes, inspection
              records, and violation/compliance statuses are seeded, clearly-fictional placeholder data —
              not real regulatory findings about any real company. This is a frontend prototype with no
              live backend; see <code className="rounded bg-brand-50 px-1 py-0.5 text-xs">BUILD_PROMPT.md</code> for
              the full spec.
            </p>
            <p className="mt-2 rounded-lg bg-gold-50 p-2.5 text-neutral-ink/80 ring-1 ring-inset ring-gold-300/50">
              <strong>Important:</strong> because the demo records sit on real quarry sites, the
              compliance status, volumes and penalties shown against a location are invented and say
              nothing about whoever actually operates that site.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
