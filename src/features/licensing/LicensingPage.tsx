import { getMockData } from "../../data/mock/generateMockData";
import { ExpiryDashboard } from "./ExpiryDashboard";
import { LicenseRegistry } from "./LicenseRegistry";

export function LicensingPage() {
  const { licenses, quarries, operators } = getMockData();

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4 md:p-6">
      <div className="shrink-0">
        <ExpiryDashboard licenses={licenses} />
      </div>

      <div className="surface-card flex h-[500px] shrink-0 flex-col overflow-hidden">
        <LicenseRegistry licenses={licenses} quarries={quarries} operators={operators} />
      </div>
    </div>
  );
}
