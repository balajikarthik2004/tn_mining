import { useMemo } from "react";
import { formatINR } from "../../utils/formatters";
import type { VehicleTrip } from "../../types/transport";
import { SEIGNIORAGE_FEE_PER_M3_INR } from "../../data/mock/officialRates";

interface Props {
  trips: VehicleTrip[];
}

export function InterStateReportDashboard({ trips }: Props) {
  const stats = useMemo(() => {
    let totalCrossings = 0;
    let validPermits = 0;
    let invalidPermits = 0;
    let illegalValue = 0;

    // Simulate monthly scale by multiplying real-time active trips
    const SCALE = 120; 

    trips.forEach(trip => {
      if (trip.status === "Illegal" || trip.status === "Suspicious" || trip.status === "Compliant") {
        totalCrossings++;
        if (trip.permitStatus === "Valid") {
          validPermits++;
        } else {
          invalidPermits++;
          // Estimate value: tonnes to m3 roughly, then * rate. 
          // 1 m3 is roughly 2 tonnes on average
          const estimatedM3 = trip.declaredWeightTonnes / 2;
          illegalValue += estimatedM3 * (SEIGNIORAGE_FEE_PER_M3_INR[trip.mineralType] || 200);
        }
      }
    });

    return { 
      totalCrossings: totalCrossings * SCALE, 
      validPermits: validPermits * SCALE, 
      invalidPermits: invalidPermits * SCALE, 
      illegalValue: illegalValue * SCALE 
    };
  }, [trips]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-medium text-slate-400">Monthly Border Crossings</h3>
        <p className="text-3xl font-bold text-slate-100 mt-2">{stats.totalCrossings.toLocaleString()}</p>
      </div>
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-medium text-slate-400">Valid e-Permits</h3>
        <p className="text-3xl font-bold text-emerald-500 mt-2">{stats.validPermits.toLocaleString()}</p>
      </div>
      <div className="bg-slate-800/80 backdrop-blur border border-red-900/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full -mr-4 -mt-4"></div>
        <h3 className="text-sm font-medium text-red-400">Invalid / No Permits</h3>
        <p className="text-3xl font-bold text-red-500 mt-2">{stats.invalidPermits.toLocaleString()}</p>
      </div>
      <div className="bg-slate-800/80 backdrop-blur border border-orange-900/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4"></div>
        <h3 className="text-sm font-medium text-orange-400">Est. Illegal Transport Value</h3>
        <p className="text-3xl font-bold text-orange-500 mt-2">{formatINR(stats.illegalValue)}</p>
      </div>
    </div>
  );
}
