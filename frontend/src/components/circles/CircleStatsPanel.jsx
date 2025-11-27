import React from "react";

export const CircleStatsPanel = ({ stats }) => {
  const safeStats = stats || {};

  const rows = [
    {
      key: "totalNodes",
      label: "Total nodes",
      value: safeStats.totalNodes,
      hint: "People in your current trust map.",
    },
    {
      key: "totalEdges",
      label: "Total connections",
      value: safeStats.totalEdges,
      hint: "Relationships linking your circles.",
    },
    {
      key: "peoplesCount",
      label: "Peoples",
      value: safeStats.peoplesCount,
      hint: "Core inner-circle anchors.",
    },
    {
      key: "coolCount",
      label: "Cool",
      value: safeStats.coolCount,
      hint: "Strong but slightly wider circle.",
    },
    {
      key: "alrightCount",
      label: "Alright",
      value: safeStats.alrightCount,
      hint: "Known, but not given full access.",
    },
    {
      key: "othersCount",
      label: "Others",
      value: safeStats.othersCount,
      hint: "Outer ring / low trust.",
    },
    {
      key: "avgDepth",
      label: "Average depth",
      value: safeStats.avgDepth,
      hint: "Typical distance from you.",
    },
    {
      key: "clusteringCoeff",
      label: "Clustering",
      value:
        typeof safeStats.clusteringCoeff === "number"
          ? safeStats.clusteringCoeff.toFixed(2)
          : safeStats.clusteringCoeff,
      hint: "How tightly your Peoples cluster.",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-700/80 bg-black/40 px-4 py-4 text-xs space-y-3">
      <div>
        <div className="text-[11px] uppercase tracking-wide text-gray-400">
          Circle stats
        </div>
        <div className="text-[11px] text-gray-500 mt-1">
          Snapshot of your trust graph at this depth.
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => {
          if (row.value === undefined || row.value === null) return null;
          return (
            <div
              key={row.key}
              className="flex items-center justify-between gap-2 border-b border-gray-800/70 pb-1 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-col">
                <span className="text-gray-200">{row.label}</span>
                <span className="text-[11px] text-gray-500">{row.hint}</span>
              </div>
              <span className="text-sm font-semibold text-gray-100">
                {row.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CircleStatsPanel;
