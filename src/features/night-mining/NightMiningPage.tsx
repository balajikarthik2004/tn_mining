import { getMockNightAlerts } from "../../data/mock/nightMiningData";
import { NightMiningMap } from "./NightMiningMap";
import { NightAlertFeed } from "./NightAlertFeed";

export function NightMiningPage() {
  const alerts = getMockNightAlerts();

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <div className="grid h-[600px] shrink-0 grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex h-full min-h-0 flex-col lg:col-span-2">
          <NightMiningMap alerts={alerts} />
        </div>
        <div className="flex h-full min-h-0 flex-col lg:col-span-1">
          <NightAlertFeed alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
