import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Phone, Mail, User, Gauge, Coins, CalendarCheck, ShieldAlert, FileText, Siren, FileWarning, MapPin } from "lucide-react";
import type { Quarry } from "../../../types/quarry";
import type { Operator } from "../../../types/operator";
import type { License } from "../../../types/license";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { useDashboardStore } from "../../../store/dashboardStore";
import { daysRemainingLabel, formatDate, formatINR, formatVolumeM3 } from "../../../utils/formatters";

interface QuarrySidePanelProps {
  quarry: Quarry | undefined;
  operator: Operator | undefined;
  license: License | undefined;
}

const QUICK_ACTIONS = [
  { label: "License", feature: "Feature 4 (Licensing)", icon: FileText, variant: "secondary" as const },
  { label: "Raise alert", feature: "Feature 8 (Court Case Tracker)", icon: Siren, variant: "primary" as const },
  { label: "Notice", feature: "Feature 8 (Court Case Tracker)", icon: FileWarning, variant: "primary" as const },
];

export function QuarrySidePanel({ quarry, operator, license }: QuarrySidePanelProps) {
  const isOpen = useDashboardStore((s) => s.isSidePanelOpen);
  const closeSidePanel = useDashboardStore((s) => s.closeSidePanel);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Two-phase mount so the drawer can animate *out* as well as in: `isMounted` keeps it in the
  // tree until the slide-out transition finishes, `isShown` drives the transform.
  const [isMounted, setMounted] = useState(false);
  const [isShown, setShown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Escape closes the drawer, matching the backdrop click.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSidePanel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeSidePanel]);

  if (!isMounted || !quarry) return null;

  const isOverExtracting =
    quarry.aiEstimatedExtractionVolumeM3Monthly > quarry.declaredExtractionVolumeM3Monthly;

  // Rendered in a portal: inside the page tree the animated <main> creates a stacking context,
  // which let the glass topbar paint over the drawer header (hiding the close button).
  return createPortal(
    <>
      {/* Click-anywhere-outside backdrop, fades with the drawer */}
      <button
        aria-label="Close panel"
        onClick={closeSidePanel}
        className={`fixed inset-0 z-[60] bg-brand-950/45 backdrop-blur-[2px] transition-opacity duration-300 ${isShown ? "opacity-100" : "opacity-0"
          }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${quarry.name} details`}
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-[26rem] flex-col overflow-hidden bg-neutral-surface shadow-panel transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isShown ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header — navy chrome with an unmissable close control */}
        <div className="chrome-deep shrink-0 px-5 pb-4 pt-4 text-white">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold-300">
              Quarry file
            </p>
            <button
              onClick={closeSidePanel}
              aria-label="Close details"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-900 shadow-card transition-all hover:bg-gold-300 hover:text-brand-950"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Close
            </button>
          </div>

          <h2 className="font-heading text-lg font-extrabold leading-tight">{quarry.name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {quarry.district} District
            <span aria-hidden="true">·</span>
            {quarry.mineralType}
          </p>
          <div className="mt-3">
            <StatusBadge status={quarry.status} variant="solid" />
          </div>
        </div>

        {/* Scrolling body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Section title="Operator">
            <Row icon={User} label="Operator" value={operator?.name ?? "—"} />
            <Row icon={Phone} label="Phone" value={operator?.contactPhone ?? "—"} />
            <Row icon={Mail} label="Email" value={operator?.contactEmail ?? "—"} />
          </Section>

          <Section title="License">
            <Row label="License Number" value={license?.licenseNumber ?? "—"} />
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-brand-50 p-3.5 ring-1 ring-inset ring-brand-100">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-ink/45">
                  Valid From
                </p>
                <p className="mt-0.5 font-semibold text-brand-900">
                  {license ? formatDate(license.validFrom) : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-ink/45">
                  Valid Until
                </p>
                <p className="mt-0.5 font-semibold text-brand-900">
                  {license ? formatDate(license.validUntil) : "—"}
                </p>
                {license && (
                  <p
                    className={`text-xs font-semibold ${daysRemainingLabel(license.validUntil).startsWith("Expired")
                      ? "text-status-violation"
                      : "text-status-compliant"
                      }`}
                  >
                    {daysRemainingLabel(license.validUntil)}
                  </p>
                )}
              </div>
            </div>
          </Section>

          <Section title="Extraction & Royalty">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-border p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-ink/45">
                  Declared
                </p>
                <p className="mt-0.5 font-semibold text-brand-900">
                  {formatVolumeM3(quarry.declaredExtractionVolumeM3Monthly)}/mo
                </p>
              </div>
              <div
                className={`rounded-xl border p-3.5 ${isOverExtracting ? "border-status-violation/30 bg-status-violation/5" : "border-neutral-border"
                  }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-ink/45">
                  AI Estimated
                </p>
                <p
                  className={`mt-0.5 font-semibold ${isOverExtracting ? "text-status-violation" : "text-brand-900"}`}
                >
                  {formatVolumeM3(quarry.aiEstimatedExtractionVolumeM3Monthly)}/mo
                </p>
              </div>
            </div>
            <Row icon={Coins} label="Royalty Paid" value={formatINR(quarry.royaltyPaidINR)} />
            <Row
              icon={Coins}
              label="Royalty Outstanding"
              value={formatINR(quarry.royaltyOutstandingINR)}
              valueClassName={quarry.royaltyOutstandingINR > 0 ? "text-status-violation" : undefined}
            />
          </Section>

          <Section title="Compliance">
            <Row icon={CalendarCheck} label="Last Inspection" value={formatDate(quarry.lastInspectionDate)} />
            <Row icon={User} label="Inspector" value={quarry.inspectorName} />
            <Row
              icon={ShieldAlert}
              label="Active Violations"
              value={String(quarry.activeViolationsCount)}
              valueClassName={quarry.activeViolationsCount > 0 ? "text-status-violation" : undefined}
            />
          </Section>

          <p className="border-t border-neutral-line pt-3 text-[11px] leading-relaxed text-neutral-ink/45">
            <Gauge className="mr-1 inline h-3 w-3 align-text-bottom" aria-hidden="true" />
            Operator, license number, and compliance figures shown are illustrative demo data. District
            geography and the seigniorage fee rate used for royalty math are real, published Government of
            Tamil Nadu figures — see the "Data &amp; sources" note on the dashboard.
          </p>
        </div>

        {/* Pinned actions */}
        <div className="shrink-0 border-t border-neutral-border bg-neutral-subtle/70 px-5 py-3.5">
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                className="flex-1 whitespace-nowrap"
                onClick={() => setPendingAction(action.feature)}
              >
                <action.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </aside>

      <Modal isOpen={pendingAction !== null} onClose={() => setPendingAction(null)} title="Coming soon">
        <p>This action will be available when {pendingAction} is built.</p>
      </Modal>
    </>,
    document.body
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-ink/40">{title}</h3>
      {children}
    </section>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="flex shrink-0 items-center gap-1.5 text-neutral-ink/55">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {label}
      </dt>
      <dd
        className={`min-w-0 break-words text-right font-semibold text-neutral-ink ${valueClassName ?? ""}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
