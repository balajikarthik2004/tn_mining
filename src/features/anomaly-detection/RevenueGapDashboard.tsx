import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { IndianRupee, AlertTriangle, Mountain, TrendingUp, BookMarked, MapPinned } from "lucide-react";
import type { Quarry } from "../../types/quarry";
import { calculateRevenueLoss, m3ToTonnes } from "../../utils/anomalyUtils";
import { formatINR, formatINRCompact, formatQuantityCompact } from "../../utils/formatters";
import { StatCard } from "../../components/ui/StatCard";
import {
  TN_ENFORCEMENT_FY2019_20,
  TN_MINERAL_REVENUE_CRORE,
  TN_MINING_STATISTICS_SOURCE,
  croreToINR,
} from "../../data/mock/officialStatistics";
import { AnomalyMap } from "./components/AnomalyMap";
interface Props {
  quarries: Quarry[];
}

/**
 * The four numbers an enforcement officer acts on, plus where the leakage is concentrated.
 * (An earlier version also showed total/declared revenue and a mineral-wise donut — neither
 * changed what anyone would do next, so they're gone.)
 */
export function RevenueGapDashboard({ quarries }: Props) {
  const data = useMemo(() => {
    let totalGap = 0;
    let gapTonnes = 0;
    let flagged = 0;
    const districtGap: Record<string, number> = {};

    quarries.forEach((q) => {
      const gapM3 = Math.max(
        0,
        q.aiEstimatedExtractionVolumeM3Monthly - q.declaredExtractionVolumeM3Monthly
      );
      if (gapM3 <= 0) return;
      flagged++;
      gapTonnes += m3ToTonnes(gapM3, q.mineralType);
      const revenueLoss = calculateRevenueLoss(gapM3, q.mineralType);
      totalGap += revenueLoss;
      districtGap[q.district] = (districtGap[q.district] || 0) + revenueLoss;
    });

    const districtChartData = Object.entries(districtGap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return { totalGap, gapTonnes, flagged, districtChartData, annualRecovery: totalGap * 12 };
  }, [quarries]);

  const tiles = [
    {
      label: "Monthly revenue gap",
      value: formatINRCompact(data.totalGap),
      valueTitle: formatINR(data.totalGap),
      hint: "Unpaid seigniorage at published rates",
      icon: IndianRupee,
      accent: "violation" as const,
      emphasis: true,
    },
    {
      label: "Quarries flagged",
      value: data.flagged.toString(),
      hint: `of ${quarries.length} monitored sites`,
      icon: AlertTriangle,
      accent: "warning" as const,
    },
    {
      label: "Over-extraction",
      value: formatQuantityCompact(data.gapTonnes, "t"),
      valueTitle: `${Math.round(data.gapTonnes).toLocaleString("en-IN")} tonnes`,
      hint: "Beyond declared volumes this month",
      icon: Mountain,
      accent: "brand" as const,
    },
    {
      label: "Annualised recovery",
      value: formatINRCompact(data.annualRecovery),
      valueTitle: formatINR(data.annualRecovery),
      hint: "If the current gap is enforced",
      icon: TrendingUp,
      accent: "compliant" as const,
    },
  ];

  // Published state revenue, used to express the modelled gap as a share of something real.
  const latestFullYear = TN_MINERAL_REVENUE_CRORE.filter((r) => !r.partial).at(-1)!;
  const gapVsStateRevenue = (
    ((data.totalGap * 12) / croreToINR(latestFullYear.crore)) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <StatCard
            key={tile.label}
            label={tile.label}
            value={tile.value}
            hint={tile.hint}
            icon={tile.icon}
            accent={tile.accent}
            emphasis={tile.emphasis}
            valueTitle={tile.valueTitle}
          />
        ))}
      </div>
       <AnomalyMap quarries={quarries} />

      <div className="surface-card hover-progress flex h-[320px] flex-col p-5">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-400/70 to-transparent"
          aria-hidden="true"
        />
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-line pb-3">
          <h3 className="flex items-center gap-2.5 font-heading text-[15px] font-bold text-brand-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-brand-800 text-white shadow-sm ring-1 ring-inset ring-white/25">
              <MapPinned className="h-4 w-4" />
            </span>
            Where the leakage is
          </h3>
          <p className="text-xs text-neutral-ink/50">Top districts by unpaid seigniorage</p>
        </div>
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.districtChartData}
              layout="vertical"
              margin={{ left: 44, right: 24, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f7" horizontal={false} />
              <XAxis
                type="number"
                stroke="#8b93ad"
                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                fontSize={11}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#4a5169"
                width={92}
                fontSize={11}
                fontWeight={600}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: any) => [formatINR(value as number), "Revenue loss"]}
                cursor={{ fill: "#f4f6fd" }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                {data.districtChartData.map((_, index) => (
                  <Cell key={index} fill={index === 0 ? "#ef4444" : "#5b62ec"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real published figures, kept visibly separate from the modelled numbers above */}
      <div className="surface-card hover-progress p-5 [--progress-color:var(--color-gold-500)]">
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold-400/70 to-transparent"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gold-400/10 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-neutral-line pb-3">
          <h3 className="flex items-center gap-2.5 font-heading text-[15px] font-bold text-brand-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-gold-300 to-gold-500 text-brand-950 shadow-sm ring-1 ring-inset ring-white/30">
              <BookMarked className="h-4 w-4" />
            </span>
            For scale: published state figures
          </h3>
          <a
            href={TN_MINING_STATISTICS_SOURCE.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-brand-700 underline decoration-dotted underline-offset-2 hover:text-brand-500"
          >
            {TN_MINING_STATISTICS_SOURCE.title}
          </a>
        </div>

        <dl className="relative mt-4 grid grid-cols-2 gap-5 lg:grid-cols-4">
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.09em] text-neutral-ink/45">
              State mineral revenue
            </dt>
            <dd className="mt-1.5 font-heading text-lg font-extrabold text-brand-900">
              ₹{latestFullYear.crore.toLocaleString("en-IN")} cr
            </dd>
            <p className="text-xs text-neutral-ink/50">FY {latestFullYear.financialYear}, all minerals</p>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.09em] text-neutral-ink/45">
              Vehicles seized
            </dt>
            <dd className="mt-1.5 font-heading text-lg font-extrabold text-brand-900">
              {TN_ENFORCEMENT_FY2019_20.vehiclesSeized.toLocaleString("en-IN")}
            </dd>
            <p className="text-xs text-neutral-ink/50">FY 2019-20, to December</p>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.09em] text-neutral-ink/45">
              Penalties collected
            </dt>
            <dd className="mt-1.5 font-heading text-lg font-extrabold text-brand-900">
              ₹{TN_ENFORCEMENT_FY2019_20.penaltyCollectedCrore} cr
            </dd>
            <p className="text-xs text-neutral-ink/50">
              Across {TN_ENFORCEMENT_FY2019_20.criminalCasesFiled.toLocaleString("en-IN")} FIRs
            </p>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase tracking-[0.09em] text-neutral-ink/45">
              Modelled gap vs revenue
            </dt>
            <dd className="mt-1.5 font-heading text-lg font-extrabold text-status-violation">
              {gapVsStateRevenue}%
            </dd>
            <p className="text-xs text-neutral-ink/50">Annualised, of FY {latestFullYear.financialYear}</p>
          </div>
        </dl>

        <p className="relative mt-4 border-t border-neutral-line pt-3 text-xs leading-relaxed text-neutral-ink/50">
          The four figures above are quoted from the Government of Tamil Nadu policy note. The gap,
          flagged counts and per-quarry volumes on this page are modelled demo values over real quarry
          locations — they are not departmental findings.
        </p>
      </div>
    </div>
  );
}
