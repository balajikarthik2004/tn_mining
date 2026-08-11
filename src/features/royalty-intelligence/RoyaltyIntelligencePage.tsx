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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-indigo-400" />
            Royalty Payment Intelligence
          </h1>
          <p className="text-slate-400 mt-2">
            AI-powered royalty predictions, 3-way gap analysis, and automated defaulter tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="hidden md:flex bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Feed
          </div>
          <div className="hidden md:flex bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> AI Forecast Active
          </div>
        </div>
      </div>

      <RoyaltyDashboard records={royaltyData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RoyaltyTrendChart records={royaltyData} />
        </div>
        <div className="lg:col-span-1">
          <DefaulterList records={royaltyData} />
        </div>
      </div>
    </div>
  );
}
