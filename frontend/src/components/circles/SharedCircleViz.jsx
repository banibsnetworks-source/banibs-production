import React from "react";
import { CircleUserCard } from "./CircleUserCard";

export const SharedCircleViz = ({ primaryUser, otherUser, sharedUsers }) => {
  const primaryName = primaryUser?.displayName || primaryUser?.name || "You";
  const otherName = otherUser?.displayName || otherUser?.name || "Person";

  return (
    <div className="rounded-2xl border border-gray-700/80 bg-black/40 px-4 py-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1 text-xs text-gray-400">
          <div className="font-semibold text-gray-100">{primaryName}</div>
          <div>Source circle</div>
        </div>
        <div className="flex-1 text-center text-[11px] text-gray-400">
          <div className="inline-flex items-center justify-center rounded-full bg-banibs-gold/10 px-3 py-1 text-banibs-gold text-xs font-semibold">
            Shared Peoples
          </div>
          <div className="mt-1 text-gray-500">
            {sharedUsers?.length || 0} mutual connections
          </div>
        </div>
        <div className="flex-1 text-right text-xs text-gray-400">
          <div className="font-semibold text-gray-100">{otherName}</div>
          <div>Partner circle</div>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto pr-2 space-y-2">
        {(!sharedUsers || sharedUsers.length === 0) && (
          <div className="rounded-xl border border-gray-700 bg-black/50 px-3 py-4 text-xs text-gray-400">
            No shared Peoples yet. This can still be safe — just means your
            circles do not overlap (yet).
          </div>
        )}

        {sharedUsers?.map((u) => (
          <CircleUserCard
            key={u._id || u.id}
            user={u}
            tier={u.relationshipTier}
            trustScore={u.trustScore}
            mutualCount={u.mutualCount}
          />
        ))}
      </div>
    </div>
  );
};

export default SharedCircleViz;
