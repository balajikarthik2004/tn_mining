import { useState } from "react";
import { X, Phone, Mail, User, Gauge, Coins, CalendarCheck, ShieldAlert, FileText, Siren, FileWarning } from "lucide-react";
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
  { label: "View License", feature: "Feature 4 (Licensing)", icon: FileText, variant: "secondary" as const },
  { label: "Raise Alert", feature: "Feature 8 (Court Case Tracker)", icon: Siren, variant: "primary" as const },
  { label: "Generate Notice", feature: "Feature 8 (Court Case Tracker)", icon: FileWarning, variant: "primary" as const },
];

export function QuarrySidePanel({ quarry, operator, license }: QuarrySidePanelProps) {
  const isOpen = useDashboardStore((s) => s.isSidePanelOpen);
  const closeSidePanel = useDashboardStore((s) => s.closeSidePanel);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  if (!isOpen || !quarry) return null;

  return (
    <>
      {/* Backdrop on mobile only (full-screen overlay); side rail on desktop has no backdrop */}
      <button
        aria-label="Close panel"
        onClick={closeSidePanel}
        className="fixed inset-0 z-30 bg-neutral-ink/40 md:hidden"
      />
      <aside
        className={`fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-neutral-surface shadow-2xl
          md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-100 md:rounded-none md:border-l md:border-neutral-border`}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-2 md:hidden">
          <span className="h-1 w-10 rounded-full bg-neutral-border" aria-hidden="true" />
        </div>

        <div className="flex items-start justify-between gap-3 border-b border-neutral-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-brand-900">{quarry.name}</h2>
            <p className="text-xs text-neutral-ink/60">{quarry.district} District</p>
            <div className="mt-2">
              <StatusBadge status={quarry.status} />
            </div>
          </div>
          <button
            onClick={closeSidePanel}
            aria-label="Close"
            className="shrink-0 rounded-md p-1.5 text-neutral-ink/50 hover:bg-brand-50 hover:text-brand-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <Section title="Operator">
            <Row icon={User} label="Operator" value={operator?.name ?? "—"} />
            <Row icon={Phone} label="Phone" value={operator?.contactPhone ?? "—"} />
            <Row icon={Mail} label="Email" value={operator?.contactEmail ?? "—"} />
            <Row label="Mineral Type" value={quarry.mineralType} />
          </Section>

          <Section title="License">
            <Row label="License Number" value={license?.licenseNumber ?? "—"} />
            <div className="grid grid-cols-2 gap-3 rounded-md bg-brand-50 p-3">
              <div>
                <p className="text-xs font-medium text-neutral-ink/60">Valid From</p>
                <p className="font-semibold text-brand-900">{license ? formatDate(license.validFrom) : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-ink/60">Valid Until</p>
                <p className="font-semibold text-brand-900">{license ? formatDate(license.validUntil) : "—"}</p>
                {license && (
                  <p
                    className={`text-xs font-semibold ${
                      daysRemainingLabel(license.validUntil).startsWith("Expired") ? "text-status-violation" : "text-status-compliant"
                    }`}
                  >
                    {daysRemainingLabel(license.validUntil)}
                  </p>
                )}
              </div>
            </div>
          </Section>

          <Section title="Extraction & Royalty">
            <div className="grid grid-cols-2 gap-3 rounded-md border border-neutral-border p-3">
              <div>
                <p className="text-xs font-medium text-neutral-ink/60">Declared</p>
                <p className="font-semibold text-brand-900">{formatVolumeM3(quarry.declaredExtractionVolumeM3Monthly)}/mo</p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-ink/60">AI Estimated</p>
                <p
                  className={`font-semibold ${
                    quarry.aiEstimatedExtractionVolumeM3Monthly > quarry.declaredExtractionVolumeM3Monthly
                      ? "text-status-violation"
                      : "text-brand-900"
                  }`}
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

          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.label}
                variant={action.variant}
                className="flex-1 text-xs!"
                onClick={() => setPendingAction(action.feature)}
              >
                <action.icon className="h-3.5 w-3.5" aria-hidden="true" />
                {action.label}
              </Button>
            ))}
          </div>

          <p className="border-t border-neutral-border pt-3 text-[11px] leading-relaxed text-neutral-ink/45">
            <Gauge className="mr-1 inline h-3 w-3 align-text-bottom" aria-hidden="true" />
            Operator, license number, and compliance figures shown are illustrative demo data. District
            geography and the seigniorage fee rate used for royalty math are real, published Government of
            Tamil Nadu figures — see the "Data & Sources" note on the dashboard.
          </p>
        </div>
      </aside>

      <Modal isOpen={pendingAction !== null} onClose={() => setPendingAction(null)} title="Coming soon">
        <p>This action will be available when {pendingAction} is built.</p>
      </Modal>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-neutral-ink/45">{title}</h3>
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
      <dt className="flex shrink-0 items-center gap-1.5 text-neutral-ink/60">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        {label}
      </dt>
      <dd className={`truncate text-right font-medium text-neutral-ink ${valueClassName ?? ""}`}>{value}</dd>
    </div>
  );
}
