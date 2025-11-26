// pages/admin/orchestration/components/ModuleDetailDrawer.jsx
import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Lock, 
  ArrowRight, 
  RefreshCw,
  Loader2 
} from "lucide-react";
import PromoteModuleDialog from "./PromoteModuleDialog";

const STAGE_COLORS = {
  PLANNED: "bg-slate-600 text-slate-100",
  IN_DEV: "bg-blue-600 text-blue-100",
  SOFT_LAUNCH: "bg-yellow-600 text-yellow-100",
  FULL_LAUNCH: "bg-green-600 text-green-100",
};

export default function ModuleDetailDrawer({ module, isOpen, onClose, onUpdate }) {
  const [moduleDetails, setModuleDetails] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && module) {
      fetchModuleDetails();
    }
  }, [isOpen, module]);

  const fetchModuleDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      
      // Fetch module details
      const detailsResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/orchestration/modules/${module.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!detailsResponse.ok) {
        setError("Failed to fetch module details");
        setLoading(false);
        return;
      }

      const detailsData = await detailsResponse.json();
      setModuleDetails(detailsData);
    } catch (err) {
      console.error("Failed to fetch module details:", err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateReadiness = async () => {
    setEvaluating(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/orchestration/modules/${module.id}/evaluate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReadiness(data);
      } else {
        setError("Failed to evaluate readiness");
      }
    } catch (err) {
      console.error("Failed to evaluate readiness:", err);
      setError("Network error occurred");
    } finally {
      setEvaluating(false);
    }
  };

  const handlePromote = () => {
    setShowPromoteDialog(true);
  };

  const handlePromoteSuccess = () => {
    setShowPromoteDialog(false);
    onUpdate();
  };

  if (loading) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 w-full sm:max-w-2xl overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-slate-400" size={24} />
            <span className="ml-2 text-slate-400">Loading module details...</span>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (error) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 w-full sm:max-w-2xl">
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="bg-slate-950 border-slate-800 text-slate-100 w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-slate-100">{moduleDetails?.module?.name}</SheetTitle>
            <SheetDescription className="text-slate-400">
              {moduleDetails?.module?.code}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Module Info */}
            <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Current Stage</span>
                <Badge className={STAGE_COLORS[moduleDetails?.module?.rollout_stage]}>
                  {moduleDetails?.module?.rollout_stage}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Layer</span>
                <span className="text-sm text-slate-100">{moduleDetails?.module?.layer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Phase</span>
                <span className="text-sm text-slate-100">{moduleDetails?.module?.phase}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Owner Team</span>
                <span className="text-sm text-slate-100">{moduleDetails?.module?.owner_team || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Status</span>
                {moduleDetails?.module?.is_blocked ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Lock size={12} />
                    Blocked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 border-green-500/30 text-green-400">
                    <CheckCircle size={12} />
                    Active
                  </Badge>
                )}
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* Readiness Evaluation */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-100">Readiness Evaluation</h3>
                <Button
                  onClick={handleEvaluateReadiness}
                  variant="outline"
                  size="sm"
                  disabled={evaluating}
                  className="bg-slate-900 border-slate-700 hover:bg-slate-800"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={14} />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2" size={14} />
                      Evaluate
                    </>
                  )}
                </Button>
              </div>

              {readiness && (
                <div className="space-y-3">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Readiness Status</span>
                      <Badge 
                        variant={readiness.readiness_status === "READY" ? "success" : "secondary"}
                        className={
                          readiness.readiness_status === "READY" 
                            ? "bg-green-600/20 text-green-300 border-green-500/30" 
                            : "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
                        }
                      >
                        {readiness.readiness_status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      Triggers: {readiness.triggers_met} / {readiness.triggers_total} met
                    </div>
                    {readiness.dependency_issues && readiness.dependency_issues.length > 0 && (
                      <div className="mt-2 text-sm text-yellow-400">
                        {readiness.dependency_issues.length} dependency issue(s)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-slate-800" />

            {/* Triggers */}
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                Triggers ({moduleDetails?.triggers?.length || 0})
              </h3>
              {moduleDetails?.triggers && moduleDetails.triggers.length > 0 ? (
                <div className="space-y-2">
                  {moduleDetails.triggers.map((trigger, index) => (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-200">
                          {trigger.trigger_class} / {trigger.trigger_type}
                        </span>
                        <Badge 
                          variant="outline"
                          className={
                            trigger.current_status === "MET"
                              ? "border-green-500/30 text-green-400"
                              : "border-slate-600 text-slate-400"
                          }
                        >
                          {trigger.current_status}
                        </Badge>
                      </div>
                      {trigger.target_value && (
                        <div className="text-xs text-slate-400">
                          Target: {trigger.target_value}
                        </div>
                      )}
                      {trigger.is_mandatory && (
                        <Badge variant="outline" className="mt-1 text-xs border-red-500/30 text-red-400">
                          Mandatory
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No triggers defined</div>
              )}
            </div>

            <Separator className="bg-slate-800" />

            {/* Dependencies */}
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                Dependencies ({moduleDetails?.dependencies?.length || 0})
              </h3>
              {moduleDetails?.dependencies && moduleDetails.dependencies.length > 0 ? (
                <div className="space-y-2">
                  {moduleDetails.dependencies.map((dep, index) => (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-sm font-medium text-slate-200 mb-1">
                        {dep.depends_on_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Required stage: {dep.required_stage}
                      </div>
                      {dep.is_hard_dependency && (
                        <Badge variant="outline" className="mt-1 text-xs border-red-500/30 text-red-400">
                          Hard Dependency
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No dependencies</div>
              )}
            </div>

            <Separator className="bg-slate-800" />

            {/* Recent Events */}
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                Recent Events ({moduleDetails?.recent_events?.length || 0})
              </h3>
              {moduleDetails?.recent_events && moduleDetails.recent_events.length > 0 ? (
                <div className="space-y-2">
                  {moduleDetails.recent_events.slice(0, 5).map((event, index) => (
                    <div key={index} className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-200">
                          {event.event_type}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(event.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {event.from_stage && event.to_stage && (
                        <div className="text-xs text-slate-400">
                          {event.from_stage} → {event.to_stage}
                        </div>
                      )}
                      <div className="text-xs text-slate-500 mt-1 truncate">
                        {event.details}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No recent events</div>
              )}
            </div>

            <Separator className="bg-slate-800" />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handlePromote}
                disabled={moduleDetails?.module?.is_blocked}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <ArrowRight className="mr-2" size={16} />
                Promote Stage
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-slate-900 border-slate-700 hover:bg-slate-800"
              >
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Promote Dialog */}
      {showPromoteDialog && (
        <PromoteModuleDialog
          module={moduleDetails?.module}
          isOpen={showPromoteDialog}
          onClose={() => setShowPromoteDialog(false)}
          onSuccess={handlePromoteSuccess}
        />
      )}
    </>
  );
}
