import React from "react";

export const TrustScoreDisplay = ({ trust }) => {
  if (!trust) {
    return (
      <div className="rounded-2xl border border-gray-700/80 bg-black/40 px-4 py-4 text-sm text-gray-400">
        Trust scores will appear as your Peoples network grows.
      </div>
    );
  }

  const overall = Math.max(0, Math.min(100, trust.overallScore ?? 0));
  const breakdown = trust.breakdown || {};
  const bands = [
    { key: "direct", label: "Direct trust (Peoples)", value: breakdown.direct },
    { key: "structural", label: "Network structure", value: breakdown.structural },
    { key: "stability", label: "History & stability", value: breakdown.stability },
  ];

  return (
    <div className="rounded-2xl border border-gray-700/80 bg-black/40 px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Infinite Circle trust
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">{overall}</span>
            <span className="text-xs text-gray-400 mb-1">/ 100</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Combined score across Peoples tiers, depth, and stability.
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="h-20 w-20 rounded-full border-4 border-gray-800 flex items-center justify-center">
            <div className="h-14 w-14 rounded-full border-4 border-banibs-gold/70 flex items-center justify-center text-sm font-semibold">
              {overall}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {bands.map((b) => {
          const v = typeof b.value === "number" ? b.value : 0;
          const safe = Math.max(0, Math.min(100, v));
          return (
            <div key={b.key}>
              <div className="flex items-center justify-between mb-1 text-gray-300">
                <span>{b.label}</span>
                <span className="text-gray-200">{safe}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-banibs-gold"
                  style={{ width: `${safe}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustScoreDisplay;
