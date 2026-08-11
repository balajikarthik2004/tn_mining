import { FileText } from "lucide-react";
import { getMockData } from "../../data/mock/generateMockData";
import { ExpiryDashboard } from "./ExpiryDashboard";
import { LicenseRegistry } from "./LicenseRegistry";

export function LicensingPage() {
  const { licenses, quarries, operators } = getMockData();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-400" />
          Mining & Quarry Licensing
        </h1>
        <p className="text-slate-400 mt-2">
          Manage quarry licenses, monitor expiry dates, and process renewal applications.
        </p>
      </div>

      <ExpiryDashboard licenses={licenses} />
      <LicenseRegistry licenses={licenses} quarries={quarries} operators={operators} />
    </div>
  );
}
