import React from "react";

const labels = {
  1: "Peoples",
  2: "Peoples-of-Peoples",
  3: "Extended circle",
  4: "Outer ring",
};

export const CircleDepthTabs = ({ activeDepth, onDepthChange, maxDepth = 4 }) => {
  const depths = Array.from({ length: maxDepth }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-700/80 bg-black/40 px-3 py-2">
      <span className="text-xs text-gray-400 mr-2">Depth:</span>
      {depths.map((depth) => {
        const isActive = depth === activeDepth;
        return (
          <button
            key={depth}
            type="button"
            onClick={() => onDepthChange(depth)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
              isActive
                ? "border-banibs-gold bg-banibs-gold/15 text-banibs-gold"
                : "border-gray-700 bg-transparent text-gray-300 hover:border-banibs-gold/50 hover:text-banibs-gold"
            }`}
          >
            {labels[depth] || `Depth ${depth}`}
          </button>
        );
      })}
    </div>
  );
};

export default CircleDepthTabs;
