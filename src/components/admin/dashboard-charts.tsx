"use client";

import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

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

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrend}>
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <Tooltip formatter={(value) => formatPriceTRY(Number(value ?? 0))} />
              <Line
                dataKey="total"
                stroke="#0044d3"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0044d3" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6">
        <section className="surface-card border border-slate-200 bg-white/95 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">Teklif Pipeline</h2>
            <p className="mt-1 text-sm text-slate-600">Durum bazli teklif dagilimi</p>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={quoteDistribution} dataKey="total" nameKey="status" innerRadius={55} outerRadius={82}>
                  {quoteDistribution.map((entry, index) => (
                    <Cell
                      key={`${entry.status}-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface-card border border-slate-200 bg-white/95 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-950">Siparis Dagilimi</h2>
            <p className="mt-1 text-sm text-slate-600">Anlik siparis durum dagilimi</p>
          </div>
          <div className="space-y-3">
            {orderDistribution.map((item, index) => (
              <div key={item.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="text-sm font-medium text-slate-700">{item.status}</span>
                </div>
                <span className="text-sm font-semibold text-slate-950">{item.total}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
