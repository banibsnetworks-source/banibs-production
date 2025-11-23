// components/marketplace/DigitalBadge.jsx
import React from "react";

export default function DigitalBadge({ isDigital }) {
  if (!isDigital) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-[0.65rem] text-slate-200">
        Physical
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-violet-700/70 border border-violet-400/60 text-[0.65rem] text-violet-50">
      Digital · Instant
    </span>
  );
}