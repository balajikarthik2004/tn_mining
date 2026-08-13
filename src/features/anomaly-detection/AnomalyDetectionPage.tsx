import { useState, useEffect } from "react";
import { getMockData } from "../../data/mock/generateMockData";
import type { Quarry } from "../../types/quarry";
import { RevenueGapDashboard } from "./RevenueGapDashboard";
import { AnomalyList } from "./AnomalyList";
import { AnomalyMap } from "./components/AnomalyMap";

export function AnomalyDetectionPage() {
  const [quarries, setQuarries] = useState<Quarry[]>([]);

  useEffect(() => {
    const data = getMockData();
    setQuarries(data.quarries);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
      <RevenueGapDashboard quarries={quarries} />
      <AnomalyMap quarries={quarries} />
      <AnomalyList quarries={quarries} />
    </div>
  );
}
