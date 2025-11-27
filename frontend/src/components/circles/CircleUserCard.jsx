import React from "react";

const tierStyles = {
  Peoples: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  Cool: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  Alright: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  Others: "bg-gray-600/20 text-gray-300 border-gray-600/60",
};

export const CircleUserCard = ({
  user,
  tier,
  trustScore,
  mutualCount,
  onClick,
}) => {
  const displayName =
    user?.displayName || user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown";

  const initials =
    (displayName || "U")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const tierKey = tier || user?.relationshipTier || "Others";
  const pillStyle = tierStyles[tierKey] || tierStyles["Others"];

  const score = typeof trustScore === "number" ? trustScore : user?.trustScore;
  const safeScore = Math.max(0, Math.min(100, score || 0));

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-2xl border border-gray-700/80 bg-black/40 px-4 py-3 text-left hover:border-banibs-gold/60 hover:bg-banibs-gold/5 transition"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-banibs-gold/60 to-banibs-bronze/70 text-sm font-semibold text-black/90">
          {initials}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {displayName}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${pillStyle}`}
            >
              {tierKey}
            </span>
          </div>
          {user?.headline && (
            <div className="truncate text-xs text-gray-400">
              {user.headline}
            </div>
          )}
        </div>
      </div>

      {/* Trust + mutuals */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Trust score</span>
            <span className="text-gray-200 font-medium">{safeScore}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-banibs-gold transition-all group-hover:bg-banibs-gold/90"
              style={{ width: `${safeScore}%` }}
            />
          </div>
        </div>
        <div className="flex flex-col items-end text-[11px] text-gray-400">
          <span className="uppercase tracking-wide">Mutuals</span>
          <span className="text-sm font-semibold text-gray-100">
            {mutualCount ?? user?.mutualCount ?? 0}
          </span>
        </div>
      </div>
    </button>
  );
};

export default CircleUserCard;
