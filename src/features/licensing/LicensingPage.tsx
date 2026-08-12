import { FileText } from "lucide-react";
import { getMockData } from "../../data/mock/generateMockData";
import { ExpiryDashboard } from "./ExpiryDashboard";
import { LicenseRegistry } from "./LicenseRegistry";

export function LicensingPage() {
  const { licenses, quarries, operators } = getMockData();

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 md:p-6 gap-6 bg-gold-50">
      <div className="shrink-0 flex items-center justify-between border-b border-neutral-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-brand-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-500" />
            Mining & Quarry Licensing
          </h1>
          <p className="text-sm font-medium text-neutral-ink/60 mt-1">
            Manage active quarry leases, monitor upcoming expiries, and process renewal applications.
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <ExpiryDashboard licenses={licenses} />
      </div>
      
      <div className="shrink-0 h-[500px] bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <LicenseRegistry licenses={licenses} quarries={quarries} operators={operators} />
      </div>
    </div>
  );
}
