import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Download, CheckCircle2, AlertCircle, Clock, Truck, FileSignature, Receipt, Map as MapIcon, ChevronRight } from "lucide-react";
import { getMockData } from "../../data/mock/generateMockData";
import type { License } from "../../types/license";
import type { Quarry } from "../../types/quarry";
import type { Operator } from "../../types/operator";
import { formatINR, formatDateTime } from "../../utils/formatters";
import { RenewalApplicationModal } from "./RenewalApplicationModal";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// Esri Hybrid Satellite style
const MAP_STYLE = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      attribution: "Tiles &copy; Esri"
    },
    "esri-reference": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256
    },
    "esri-transportation": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256
    }
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esri-satellite",
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: "esri-transportation-layer",
      type: "raster",
      source: "esri-transportation",
      minzoom: 0,
      maxzoom: 22
    },
    {
      id: "esri-reference-layer",
      type: "raster",
      source: "esri-reference",
      minzoom: 0,
      maxzoom: 22
    }
  ]
} as any;

export function LicenseDetailPage() {
  const { id } = useParams();
  const [license, setLicense] = useState<License | null>(null);
  const [quarry, setQuarry] = useState<Quarry | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);

  useEffect(() => {
    const { licenses, quarries, operators } = getMockData();
    const l = licenses.find(x => x.id === id);
    if (l) {
      setLicense(l);
      const q = quarries.find(x => x.id === l.quarryId);
      setQuarry(q || null);
      if (q) {
        setOperator(operators.find(x => x.id === q.operatorId) || null);
      }
    }
  }, [id]);

  // Generate a mock polygon for the lease boundary based on the quarry lat/lng
  const leaseBoundaryGeojson = useMemo(() => {
    if (!quarry) return null;
    const size = 0.003; // Approx 300m
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [quarry.lng - size, quarry.lat - size],
              [quarry.lng + size, quarry.lat - size],
              [quarry.lng + size, quarry.lat + size],
              [quarry.lng - size, quarry.lat + size],
              [quarry.lng - size, quarry.lat - size]
            ]]
          },
          properties: {}
        }
      ]
    };
  }, [quarry]);

  if (!license || !quarry || !operator) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-900"></div>
      </div>
    );
  }

  const StatusIcon = 
    license.status === "Active" ? CheckCircle2 :
    license.status === "Expiring Soon" ? Clock : AlertCircle;
    
  const statusColor = 
    license.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
    license.status === "Expiring Soon" ? "bg-orange-50 text-orange-700 border-orange-200" :
    "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="flex flex-col h-full bg-gold-50 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-neutral-border px-4 py-3 sm:px-6 sm:py-4 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 z-10 relative">
        <div className="flex items-start gap-4">
          <Link to="/licensing" className="mt-1 flex items-center justify-center w-10 h-10 rounded-full bg-white border border-neutral-border hover:bg-neutral-50 text-neutral-ink/70 transition-colors shadow-sm shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-brand-900 tracking-tight">
                Quarry Lease Dossier
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${statusColor}`}>
                <StatusIcon className="w-3 h-3" />
                {license.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-neutral-ink/70">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-ink/50 uppercase tracking-widest text-[10px]">License No:</span> 
                <span className="text-brand-900 font-bold bg-neutral-surface px-1.5 py-0.5 rounded border border-neutral-border">{license.licenseNumber}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-ink/50 uppercase tracking-widest text-[10px]">Quarry:</span> 
                <span className="text-brand-900 font-bold">{quarry.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-ink/50 uppercase tracking-widest text-[10px]">Operator:</span> 
                <span className="text-brand-900 font-bold">{operator.name}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-border text-brand-900 rounded-lg transition-colors font-bold text-sm shadow-sm">
            <Download className="w-4 h-4" /> Export Dossier
          </button>
          {(license.status === "Expiring Soon" || license.status === "Expired") && (
            <button 
              onClick={() => setShowRenewalModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-lg transition-colors font-bold text-sm shadow-sm"
            >
              Apply for Renewal
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Map Section */}
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="bg-neutral-surface px-6 py-3 border-b border-neutral-border shrink-0 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-brand-500" />
                <h3 className="font-bold text-brand-900">Approved Lease Boundary (Survey Mapping)</h3>
              </div>
              <div className="flex-1 relative">
                <Map
                  initialViewState={{
                    longitude: quarry.lng,
                    latitude: quarry.lat,
                    zoom: 14
                  }}
                  mapStyle={MAP_STYLE}
                  interactive={true}
                >
                  {leaseBoundaryGeojson && (
                    <Source type="geojson" data={leaseBoundaryGeojson as any}>
                      <Layer 
                        id="lease-boundary-fill" 
                        type="fill" 
                        paint={{
                          "fill-color": "#eab308",
                          "fill-opacity": 0.2
                        }} 
                      />
                      <Layer 
                        id="lease-boundary-line" 
                        type="line" 
                        paint={{
                          "line-color": "#ca8a04",
                          "line-width": 3,
                          "line-dasharray": [2, 2]
                        }} 
                      />
                    </Source>
                  )}
                </Map>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-neutral-border shadow-sm text-xs font-bold text-brand-900 flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-yellow-600 border-dashed bg-yellow-500/20"></div>
                   Approved Boundary (Geofence)
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border">
                <h3 className="font-bold text-brand-900">License Particulars</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="bg-neutral-surface border border-neutral-border rounded-lg p-4">
                    <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Mineral Type</span>
                    <span className="block text-brand-900 font-bold">{quarry.mineralType}</span>
                  </div>
                  <div className="bg-neutral-surface border border-neutral-border rounded-lg p-4">
                    <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">District</span>
                    <span className="block text-brand-900 font-bold">{quarry.district}</span>
                  </div>
                  <div className="bg-neutral-surface border border-neutral-border rounded-lg p-4">
                    <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Issue Date</span>
                    <span className="block text-brand-900 font-bold">{new Date(license.validFrom).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="bg-neutral-surface border border-neutral-border rounded-lg p-4">
                    <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Expiry Date</span>
                    <span className="block text-brand-900 font-bold">{new Date(license.validUntil).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="bg-neutral-surface border border-neutral-border rounded-lg p-4">
                    <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Operator Phone</span>
                    <span className="block text-brand-900 font-bold">{operator.contactPhone}</span>
                  </div>
                  <div className="bg-neutral-surface border border-neutral-border rounded-lg p-4">
                    <span className="block text-[10px] font-bold text-neutral-ink/50 uppercase tracking-widest mb-1">Operator Email</span>
                    <span className="block text-brand-900 font-bold">{operator.contactEmail}</span>
                  </div>
                </div>
                {license.status === "Expired" && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-800">Automated Suspension Triggered</h4>
                      <p className="text-sm font-medium text-red-700/80 mt-1 leading-relaxed">
                        E-permit generation for this quarry has been automatically suspended due to license expiry. 
                        Enforcement teams have been alerted and transit passes are blocked.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center justify-between">
                <h3 className="font-bold text-brand-900 flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-brand-500" /> Statutory Clearances & Documents
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {license.documents.map(doc => (
                  <div key={doc.id} className="flex items-start gap-4 p-4 bg-white border border-neutral-border rounded-xl hover:border-brand-500/50 hover:shadow-md transition-all group cursor-pointer">
                    <div className="p-2.5 bg-neutral-surface text-brand-900 rounded-lg border border-neutral-border group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:border-brand-200 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-900 text-sm group-hover:text-brand-700 transition-colors">{doc.title}</h4>
                      <p className="text-[10px] font-bold text-neutral-ink/40 uppercase tracking-widest mt-1">Uploaded {formatDateTime(doc.uploadedAt)}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-ink/30 group-hover:text-brand-500 transition-colors self-center" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center justify-between">
                <h3 className="font-bold text-brand-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-500" /> Authorized Vehicles
                </h3>
              </div>
              <div className="p-6 flex flex-wrap gap-3">
                {license.vehicles.map(veh => (
                  <div key={veh.id} className="px-4 py-2 bg-white border border-neutral-border rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-sm font-black text-brand-900 tracking-wide">{veh.registrationNumber}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-border"></span>
                    <span className="text-[9px] font-bold text-neutral-ink/50 uppercase tracking-widest bg-neutral-surface px-1.5 py-0.5 rounded border border-neutral-border">{veh.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center justify-between">
                <h3 className="font-bold text-brand-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-brand-500" /> Royalty & Payment History
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {license.payments.map(pay => (
                  <div key={pay.id} className="flex items-center justify-between p-4 bg-white border border-neutral-border rounded-xl hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${pay.status === 'Success' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <div className="font-bold text-brand-900 text-sm">{pay.type}</div>
                      <div className="text-[10px] font-bold text-neutral-ink/40 uppercase tracking-widest mt-1">{new Date(pay.date).toLocaleDateString("en-IN")}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-brand-900 text-base group-hover:text-brand-700 transition-colors">{formatINR(pay.amountINR)}</div>
                      <div className={`text-[9px] font-black uppercase tracking-widest mt-1 px-1.5 py-0.5 rounded inline-block border ${pay.status === 'Success' ? 'text-green-700 bg-green-50 border-green-200' : 'text-orange-700 bg-orange-50 border-orange-200'}`}>
                        {pay.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-neutral-border rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-neutral-surface px-6 py-4 border-b border-neutral-border flex items-center justify-between">
                <h3 className="font-bold text-brand-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-500" /> Renewal Ledger
                </h3>
              </div>
              <div className="p-6">
                {license.renewals.length > 0 ? (
                  <div className="space-y-4">
                    {license.renewals.map((ren) => (
                      <div key={ren.id} className="p-4 rounded-xl border border-neutral-border bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                        <div className="flex items-center justify-between space-x-2 mb-2">
                          <div className="font-black text-brand-900">{ren.periodStart.slice(0, 4)} - {ren.periodEnd.slice(0, 4)}</div>
                          <div className="text-[9px] font-black text-green-700 uppercase tracking-widest bg-green-50 border border-green-200 px-2 py-0.5 rounded">{ren.status}</div>
                        </div>
                        <div className="text-xs font-medium text-neutral-ink/60 leading-relaxed">Lease period extended and approved by district collectorate.</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 bg-neutral-surface border border-neutral-border border-dashed rounded-xl">
                     <Clock className="w-6 h-6 text-neutral-ink/20 mx-auto mb-2" />
                     <p className="text-sm font-bold text-neutral-ink/40">No previous renewals recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showRenewalModal && (
        <RenewalApplicationModal 
          licenseId={license.licenseNumber} 
          onClose={() => setShowRenewalModal(false)} 
        />
      )}
    </div>
  );
}
