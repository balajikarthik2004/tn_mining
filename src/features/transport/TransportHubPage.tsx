import { useState } from "react";
import { TransportMonitoringPage } from "../transport-monitoring/TransportMonitoringPage";
import { TransportTrackingPage } from "../transport-tracking/TransportTrackingPage";
import { Truck, ScanLine } from "lucide-react";

export function TransportHubPage() {
  const [activeTab, setActiveTab] = useState<"internal" | "border">("internal");

  return (
    <div className="flex flex-col h-full bg-gold-50 overflow-hidden">
      {/* Global Transport Hub Header / Tab Bar */}
      <div className="shrink-0 bg-white border-b border-neutral-border px-4 py-3 sm:px-6 sm:py-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
        <div>
          <h1 className="text-xl font-black text-brand-900 tracking-tight">Transport Command Center</h1>
          <p className="text-xs font-bold text-neutral-ink/50 uppercase tracking-widest mt-0.5">Unified Logistics & Enforcement</p>
        </div>
        
        {/* Toggle Buttons */}
        <div className="flex items-center bg-neutral-surface border border-neutral-border p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("internal")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
              activeTab === "internal" 
                ? "bg-white text-brand-900 shadow-sm border border-neutral-border/50" 
                : "text-neutral-ink/60 hover:text-brand-900 hover:bg-neutral-50"
            }`}
          >
            <ScanLine className="w-4 h-4" />
            Internal Monitoring
          </button>
          <button
            onClick={() => setActiveTab("border")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
              activeTab === "border" 
                ? "bg-white text-brand-900 shadow-sm border border-neutral-border/50" 
                : "text-neutral-ink/60 hover:text-brand-900 hover:bg-neutral-50"
            }`}
          >
            <Truck className="w-4 h-4" />
            Border Enforcement
          </button>
        </div>
      </div>

      {/* Render the selected module */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {activeTab === "internal" ? (
          <TransportMonitoringPage />
        ) : (
          <TransportTrackingPage />
        )}
      </div>
    </div>
  );
}
