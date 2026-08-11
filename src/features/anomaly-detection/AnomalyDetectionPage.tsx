import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { getMockData } from "../../data/mock/generateMockData";
import type { Quarry } from "../../types/quarry";
import { RevenueGapDashboard } from "./RevenueGapDashboard";
import { AnomalyList } from "./AnomalyList";

export function AnomalyDetectionPage() {
  const [quarries, setQuarries] = useState<Quarry[]>([]);

  useEffect(() => {
    const data = getMockData();
    setQuarries(data.quarries);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          AI Anomaly Detection & Revenue Gap
        </h1>
        <p className="text-slate-400 mt-2">
          AI-driven analysis comparing declared vs. actual extraction volumes to identify revenue leakage.
        </p>
      </div>

      <RevenueGapDashboard quarries={quarries} />
      <AnomalyList quarries={quarries} />
    </div>
  );
}
