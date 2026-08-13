import { useState } from "react";
import { TransportMonitoringPage } from "../transport-monitoring/TransportMonitoringPage";
import { TransportTrackingPage } from "../transport-tracking/TransportTrackingPage";
import { Truck, ScanLine } from "lucide-react";

const TABS = [
  { id: "internal", label: "Internal Monitoring", icon: ScanLine },
  { id: "border", label: "Border Enforcement", icon: Truck },
] as const;

export function TransportHubPage() {
  const [activeTab, setActiveTab] = useState<"internal" | "border">("internal");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Hub bar: segmented module switcher */}
      <div className="glass-bar relative z-10 flex shrink-0 items-center border-b border-neutral-border px-4 py-3 sm:px-6">
        <div
          role="tablist"
          aria-label="Transport modules"
          className="flex items-center gap-1 rounded-xl bg-canvas-deep/80 p-1 ring-1 ring-inset ring-neutral-border"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${isActive
                  ? "bg-neutral-surface text-brand-900 shadow-card ring-1 ring-inset ring-neutral-border"
                  : "text-neutral-ink/55 hover:text-brand-800"
                  }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected module */}
      <div key={activeTab} className="relative min-h-0 flex-1 animate-fade-in overflow-hidden">
        {activeTab === "internal" ? <TransportMonitoringPage /> : <TransportTrackingPage />}
      </div>
    </div>
  );
}
