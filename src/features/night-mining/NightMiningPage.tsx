import { Moon } from "lucide-react";
import { getMockNightAlerts } from "../../data/mock/nightMiningData";
import { NightMiningMap } from "./NightMiningMap";
import { NightAlertFeed } from "./NightAlertFeed";

export function NightMiningPage() {
  const alerts = getMockNightAlerts();

  return (
    <div className="flex flex-col h-full bg-gold-50 overflow-y-auto p-4 md:p-6 gap-6">
      <div className="shrink-0 flex items-center justify-between border-b border-neutral-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-brand-900 tracking-tight flex items-center gap-2">
            <Moon className="w-6 h-6 text-brand-500" />
            Night Mining Surveillance
          </h1>
          <p className="text-sm font-medium text-neutral-ink/60 mt-1">
            AI-powered thermal satellite monitoring to detect and auto-escalate illicit quarry operations between 18:00 and 06:00.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 h-[600px]">
        <div className="lg:col-span-2 flex flex-col h-full min-h-0">
          <NightMiningMap alerts={alerts} />
        </div>
        <div className="lg:col-span-1 flex flex-col h-full min-h-0">
          <NightAlertFeed alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
