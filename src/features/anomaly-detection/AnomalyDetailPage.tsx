import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Send, FileText, ChevronRight, Activity, Calendar } from "lucide-react";
import { getMockData } from "../../data/mock/generateMockData";
import type { Quarry } from "../../types/quarry";
import { calculateSeverity, calculateRevenueLoss, m3ToTonnes } from "../../utils/anomalyUtils";
import { generateAnomalyExplanation, draftShowCauseNotice } from "../../services/claude";
import { formatINR } from "../../utils/formatters";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function AnomalyDetailPage() {
  const { id } = useParams();
  const [quarry, setQuarry] = useState<Quarry | null>(null);

  useEffect(() => {
    const data = getMockData();
    const found = data.quarries.find(q => q.id === id);
    if (found) setQuarry(found);
  }, [id]);

  const anomalyData = useMemo(() => {
    if (!quarry) return null;
    const gapM3 = Math.max(0, quarry.aiEstimatedExtractionVolumeM3Monthly - quarry.declaredExtractionVolumeM3Monthly);
    const gapTonnes = m3ToTonnes(gapM3, quarry.mineralType);
    const severity = calculateSeverity(quarry.declaredExtractionVolumeM3Monthly, quarry.aiEstimatedExtractionVolumeM3Monthly);
    const revenueLoss = calculateRevenueLoss(gapM3, quarry.mineralType);
    const explanation = generateAnomalyExplanation(quarry, gapTonnes);
    const draftNotice = draftShowCauseNotice(quarry, gapTonnes, revenueLoss);

    return { gapTonnes, severity, revenueLoss, explanation, draftNotice };
  }, [quarry]);

  if (!quarry || !anomalyData) {
    return <div className="p-8 text-slate-400">Loading...</div>;
  }

  const chartData = [
    {
      name: "Volume (m³)",
      Declared: quarry.declaredExtractionVolumeM3Monthly,
      "AI Estimated": quarry.aiEstimatedExtractionVolumeM3Monthly,
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/anomaly-detection" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{quarry.name}</h1>
          <p className="text-slate-400 text-sm">
            {quarry.district} • {quarry.mineralType} • Operator ID: {quarry.operatorId}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
            anomalyData.severity === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
            anomalyData.severity === "Medium" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
            "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
          }`}>
            <AlertTriangle className="w-4 h-4" />
            {anomalyData.severity} Severity Anomaly
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics & Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-medium text-slate-400">Estimated Gap</h3>
              <p className="text-3xl font-bold text-orange-400 mt-2">{Math.round(anomalyData.gapTonnes).toLocaleString()} <span className="text-lg">tonnes</span></p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-medium text-slate-400">Potential Revenue Loss</h3>
              <p className="text-3xl font-bold text-red-500 mt-2">{formatINR(anomalyData.revenueLoss)}</p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-200">Volume Comparison</h3>
              <span className="text-sm text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
                AI Confidence: 94%
              </span>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.5rem' }}
                    cursor={{ fill: '#334155', opacity: 0.2 }}
                  />
                  <Legend />
                  <Bar dataKey="Declared" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="AI Estimated" fill="#f97316" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm relative group">
              <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-slate-200 z-10 backdrop-blur">
                Declared Bounds
              </div>
              <img 
                src="https://images.unsplash.com/photo-1579626359555-58547b746f34?q=80&w=800&auto=format&fit=crop" 
                alt="Declared Quarry Area" 
                className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm relative group">
              <div className="absolute top-2 left-2 bg-orange-900/80 text-orange-200 px-2 py-1 rounded text-xs z-10 backdrop-blur border border-orange-500/30">
                AI Detected Extraction Area
              </div>
              <img 
                src="https://images.unsplash.com/photo-1519782559596-3c0fc4402eb0?q=80&w=800&auto=format&fit=crop" 
                alt="AI Detected Quarry Area" 
                className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity filter saturate-150"
              />
              <div className="absolute inset-0 border-2 border-orange-500/50 border-dashed m-4 rounded-lg pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Right Column: Claude AI & Actions */}
        <div className="space-y-6">
          <div className="bg-slate-800/80 backdrop-blur border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.1)] overflow-hidden">
            <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-5 py-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-indigo-200">Claude AI Insight</h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-200 leading-relaxed">
                {anomalyData.explanation.english}
              </p>
              <div className="h-px bg-slate-700/50"></div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                {anomalyData.explanation.tamil}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-200 mb-4">Recommended Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
                <span className="flex items-center gap-2 font-medium">
                  <FileText className="w-4 h-4" />
                  Generate Show Cause Notice
                </span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600/50">
                <span className="flex items-center gap-2 font-medium">
                  <Send className="w-4 h-4" />
                  Send Alert to Inspector
                </span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600/50">
                <span className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  Escalate to District Collector
                </span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Anomaly Timeline
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-orange-500 bg-slate-900 group-hover:bg-orange-500 text-slate-500 group-hover:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-slate-700/30 p-3 rounded-lg border border-slate-600/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-slate-200 text-xs">Today</div>
                    <div className="text-[10px] text-slate-500">10:00 AM</div>
                  </div>
                  <div className="text-slate-400 text-xs">AI flagged major deviation in drone scan.</div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-slate-500 bg-slate-900 group-hover:bg-slate-500 text-slate-500 group-hover:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 opacity-70">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-slate-300 text-xs">3 Days Ago</div>
                  </div>
                  <div className="text-slate-500 text-xs">Routine declaration submitted by operator.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Draft Notice Section */}
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          AI Generated Preliminary Show-Cause Notice
        </h3>
        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700/50 font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
          {anomalyData.draftNotice}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors">
            Copy Notice
          </button>
        </div>
      </div>
    </div>
  );
}
