import { useState, useEffect } from "react";
import { IndianRupee, Zap, Activity } from "lucide-react";
import { getMockRoyaltyData, mutateRoyaltyData } from "../../data/mock/royaltyData";
import { RoyaltyDashboard } from "./RoyaltyDashboard";
import { DefaulterList } from "./DefaulterList";
import { RoyaltyTrendChart } from "./RoyaltyTrendChart";

export function RoyaltyIntelligencePage() {
  const [royaltyData, setRoyaltyData] = useState(() => getMockRoyaltyData());

  useEffect(() => {
    const interval = setInterval(() => {
      setRoyaltyData([...mutateRoyaltyData()]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-gold-50 overflow-y-auto">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-neutral-border px-4 py-4 sm:px-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 sticky top-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brand-900 tracking-tight flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-brand-500" />
            Royalty Payment Intelligence
          </h1>
          <p className="text-sm font-medium text-neutral-ink/60 mt-1">
            AI-powered royalty predictions, 3-way gap analysis, and automated defaulter tracking.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <div className="hidden md:flex bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest items-center gap-2 shadow-sm">
            <Activity className="w-4 h-4 text-green-600 animate-pulse" /> Live Feed
          </div>
          <div className="hidden md:flex bg-brand-50 border border-brand-200 text-brand-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest items-center gap-2 shadow-sm">
            <Zap className="w-4 h-4 text-brand-600" /> AI Forecast Active
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 w-full">
        <RoyaltyDashboard records={royaltyData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <RoyaltyTrendChart records={royaltyData} />
          </div>
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <DefaulterList records={royaltyData} />
          </div>
        </div>
      </div>
    </div>
  );
}
