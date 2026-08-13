import { useState, useEffect } from "react";
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
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
        <RoyaltyDashboard records={royaltyData} />

        <div className="grid h-[600px] grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="flex h-full min-h-0 flex-col lg:col-span-2">
            <RoyaltyTrendChart records={royaltyData} />
          </div>
          <div className="flex h-full min-h-0 flex-col lg:col-span-1">
            <DefaulterList records={royaltyData} />
          </div>
        </div>
      </div>
    </div>
  );
}
