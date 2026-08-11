import { Moon } from "lucide-react";
import { getMockNightAlerts } from "../../data/mock/nightMiningData";
import { NightMiningMap } from "./NightMiningMap";
import { NightAlertFeed } from "./NightAlertFeed";

export function NightMiningPage() {
  const alerts = getMockNightAlerts();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Moon className="w-6 h-6 text-indigo-400" />
          Night Mining Detection
        </h1>
        <p className="text-slate-400 mt-2">
          AI-powered thermal satellite monitoring to detect and auto-escalate illegal quarry operations between 6 PM and 6 AM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NightMiningMap alerts={alerts} />
        </div>
        <div className="lg:col-span-1">
          <NightAlertFeed alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
