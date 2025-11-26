// pages/admin/orchestration/components/ReadinessSummary.jsx
import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

const LAYER_LABELS = {
  LAYER_0_INFRASTRUCTURE: "Infrastructure",
  LAYER_1_GOVERNANCE: "Governance",
  LAYER_2_FOUNDATION: "Foundation",
  LAYER_3_SOCIAL: "Social",
  LAYER_4_HIGH_IMPACT: "High-Impact",
};

export default function ReadinessSummary({ summary, modules }) {
  // Group modules by layer
  const modulesByLayer = useMemo(() => {
    const grouped = {};
    modules.forEach(module => {
      if (!grouped[module.layer]) {
        grouped[module.layer] = [];
      }
      grouped[module.layer].push(module);
    });
    return grouped;
  }, [modules]);

  // Group modules by stage
  const modulesByStage = useMemo(() => {
    const grouped = {
      PLANNED: 0,
      IN_DEV: 0,
      SOFT_LAUNCH: 0,
      FULL_LAUNCH: 0,
    };
    modules.forEach(module => {
      if (grouped.hasOwnProperty(module.rollout_stage)) {
        grouped[module.rollout_stage]++;
      }
    });
    return grouped;
  }, [modules]);

  if (!summary) {
    return <div className="text-slate-400">Loading summary...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Modules</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">
                {summary.total_modules || modules.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <CheckCircle className="text-blue-400" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Ready</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {summary.ready_count}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Waiting</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">
                {summary.waiting_count}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Clock className="text-yellow-400" size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Blocked</p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {summary.blocked_count}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="text-red-400" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Stage Distribution */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Stage Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span className="text-sm text-slate-300">Planned</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{modulesByStage.PLANNED}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-slate-300">In Dev</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{modulesByStage.IN_DEV}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-slate-300">Soft Launch</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{modulesByStage.SOFT_LAUNCH}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-300">Full Launch</span>
            </div>
            <p className="text-2xl font-bold text-slate-100">{modulesByStage.FULL_LAUNCH}</p>
          </div>
        </div>
      </Card>

      {/* Layer Breakdown */}
      <Card className="bg-slate-900 border-slate-800 p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Layer Breakdown</h3>
        <div className="space-y-4">
          {Object.entries(modulesByLayer)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([layer, layerModules]) => {
              const ready = layerModules.filter(m => 
                m.rollout_stage === 'SOFT_LAUNCH' || m.rollout_stage === 'FULL_LAUNCH'
              ).length;
              const total = layerModules.length;
              const percentage = total > 0 ? Math.round((ready / total) * 100) : 0;

              return (
                <div key={layer} className="bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">
                      {LAYER_LABELS[layer] || layer}
                    </span>
                    <span className="text-sm text-slate-400">
                      {ready} / {total} active
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {layerModules.map(module => (
                      <Badge
                        key={module.id}
                        variant="outline"
                        className="text-xs border-slate-700 text-slate-300"
                      >
                        {module.code}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
