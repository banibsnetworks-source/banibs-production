// pages/admin/orchestration/components/ModuleTable.jsx
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Lock, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STAGE_COLORS = {
  PLANNED: "bg-slate-600 text-slate-100",
  IN_DEV: "bg-blue-600 text-blue-100",
  SOFT_LAUNCH: "bg-yellow-600 text-yellow-100",
  FULL_LAUNCH: "bg-green-600 text-green-100",
};

const LAYER_COLORS = {
  LAYER_0_INFRASTRUCTURE: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  LAYER_1_GOVERNANCE: "bg-indigo-600/20 text-indigo-300 border-indigo-500/30",
  LAYER_2_FOUNDATION: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  LAYER_3_SOCIAL: "bg-cyan-600/20 text-cyan-300 border-cyan-500/30",
  LAYER_4_HIGH_IMPACT: "bg-amber-600/20 text-amber-300 border-amber-500/30",
};

const LAYER_LABELS = {
  LAYER_0_INFRASTRUCTURE: "L0: Infrastructure",
  LAYER_1_GOVERNANCE: "L1: Governance",
  LAYER_2_FOUNDATION: "L2: Foundation",
  LAYER_3_SOCIAL: "L3: Social",
  LAYER_4_HIGH_IMPACT: "L4: High-Impact",
};

export default function ModuleTable({ modules, onModuleClick, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLayer, setSelectedLayer] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Get unique layers and stages
  const layers = useMemo(() => {
    const uniqueLayers = [...new Set(modules.map(m => m.layer))];
    return uniqueLayers.sort();
  }, [modules]);

  const stages = ["PLANNED", "IN_DEV", "SOFT_LAUNCH", "FULL_LAUNCH"];

  // Filter modules
  const filteredModules = useMemo(() => {
    return modules.filter(module => {
      const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLayer = selectedLayer === "all" || module.layer === selectedLayer;
      const matchesStage = selectedStage === "all" || module.rollout_stage === selectedStage;
      return matchesSearch && matchesLayer && matchesStage;
    });
  }, [modules, searchTerm, selectedLayer, selectedStage]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search modules by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-slate-100"
          />
        </div>
        
        <select
          value={selectedLayer}
          onChange={(e) => setSelectedLayer(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100"
        >
          <option value="all">All Layers</option>
          {layers.map(layer => (
            <option key={layer} value={layer}>{LAYER_LABELS[layer]}</option>
          ))}
        </select>

        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-slate-100"
        >
          <option value="all">All Stages</option>
          {stages.map(stage => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>

        <Button
          onClick={handleRefresh}
          variant="outline"
          className="bg-slate-900 border-slate-800 hover:bg-slate-800"
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
          Refresh
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-400">
        Showing {filteredModules.length} of {modules.length} modules
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-slate-900">
              <TableHead className="text-slate-300">Module</TableHead>
              <TableHead className="text-slate-300">Code</TableHead>
              <TableHead className="text-slate-300">Layer</TableHead>
              <TableHead className="text-slate-300">Stage</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  No modules found
                </TableCell>
              </TableRow>
            ) : (
              filteredModules.map((module) => (
                <TableRow
                  key={module.id}
                  className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                  onClick={() => onModuleClick(module)}
                >
                  <TableCell className="font-medium text-slate-100">
                    <div className="flex items-center gap-2">
                      {module.is_blocked && <Lock size={14} className="text-red-400" />}
                      {module.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400 font-mono text-sm">
                    {module.code}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={LAYER_COLORS[module.layer]}>
                      {LAYER_LABELS[module.layer]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={STAGE_COLORS[module.rollout_stage]}>
                      {module.rollout_stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {module.is_blocked ? (
                        <span className="flex items-center gap-1 text-red-400 text-sm">
                          <Lock size={14} />
                          Blocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle size={14} />
                          Active
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
