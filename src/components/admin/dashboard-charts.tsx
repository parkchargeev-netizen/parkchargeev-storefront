import { formatPriceTRY } from "@/lib/format";

const chartColors = ["#0044d3", "#00a25b", "#7c3aed", "#f97316", "#ef4444", "#14b8a6"];

type DashboardChartsProps = {
  revenueTrend: Array<{
    month: string;
    total: number;
  }>;
  quoteDistribution: Array<{
    status: string;
    total: number;
  }>;
  orderDistribution: Array<{
    status: string;
    total: number;
  }>;
};

function ChartEmptyState() {
  return (
    <div className="flex h-full min-h-48 items-center justify-center rounded-lg bg-slate-50 text-sm font-medium text-slate-500">
      Henuz veri yok
    </div>
  );
}

function RevenueTrendChart({ data }: { data: DashboardChartsProps["revenueTrend"] }) {
  if (data.length === 0) {
    return <ChartEmptyState />;
  }

  const width = 760;
  const height = 260;
  const padding = 34;
  const maxValue = Math.max(...data.map((item) => item.total), 1);
  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? width / 2
        : padding + (index * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - (item.total / maxValue) * (height - padding * 2);

    return {
      ...item,
      x,
      y
    };
  });
  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const latest = data.at(-1);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Son deger</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">
            {formatPriceTRY(latest?.total ?? 0)}
          </p>
        </div>
        <p className="text-sm font-medium text-slate-500">
          Maksimum {formatPriceTRY(maxValue)}
        </p>
      </div>
      <svg
        role="img"
        aria-label="Aylik ciro trendi"
        viewBox={`0 0 ${width} ${height}`}
        className="h-72 w-full overflow-visible"
      >
        {[0, 1, 2, 3].map((line) => {
          const y = padding + (line * (height - padding * 2)) / 3;
          return (
            <line
              key={line}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}
        <polyline
          fill="none"
          points={polylinePoints}
          stroke="#0044d3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />
        {points.map((point, index) => (
          <g key={`${point.month}-${index}`}>
            <circle cx={point.x} cy={point.y} fill="#ffffff" r="7" stroke="#0044d3" strokeWidth="4" />
            <text
              x={point.x}
              y={height - 8}
              fill="#64748b"
              fontSize="14"
              fontWeight="600"
              textAnchor="middle"
            >
              {point.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function DistributionBars({
  data,
  emptyLabel
}: {
  data: Array<{ status: string; total: number }>;
  emptyLabel: string;
}) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  if (data.length === 0 || total === 0) {
    return <ChartEmptyState />;
  }

  return (
    <div className="space-y-3">
      <p className="sr-only">{emptyLabel}</p>
      {data.map((item, index) => {
        const percentage = Math.max(4, Math.round((item.total / total) * 100));

        return (
          <div key={item.status} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700">{item.status}</span>
              <span className="font-semibold text-slate-950">{item.total}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: chartColors[index % chartColors.length]
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardCharts({
  revenueTrend,
  quoteDistribution,
  orderDistribution
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <section className="surface-card border border-slate-200 bg-white/95 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-950">Aylik Ciro Trendi</h2>
          <p className="mt-1 text-sm text-slate-600">Son 12 ay icindeki onayli siparis akisi</p>
        </div>
        <RevenueTrendChart data={revenueTrend} />
      </section>

      <div className="grid gap-6">
        <section className="surface-card border border-slate-200 bg-white/95 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">Teklif Pipeline</h2>
            <p className="mt-1 text-sm text-slate-600">Durum bazli teklif dagilimi</p>
          </div>
          <DistributionBars data={quoteDistribution} emptyLabel="Teklif dagilimi bos" />
        </section>

        <section className="surface-card border border-slate-200 bg-white/95 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">Siparis Dagilimi</h2>
            <p className="mt-1 text-sm text-slate-600">Anlik siparis durum dagilimi</p>
          </div>
          <DistributionBars data={orderDistribution} emptyLabel="Siparis dagilimi bos" />
        </section>
      </div>
    </div>
  );
}
