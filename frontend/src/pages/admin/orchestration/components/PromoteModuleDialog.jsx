// pages/admin/orchestration/components/PromoteModuleDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";

const STAGE_ORDER = ["PLANNED", "IN_DEV", "SOFT_LAUNCH", "FULL_LAUNCH"];

const getNextStage = (currentStage) => {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex < STAGE_ORDER.length - 1) {
    return STAGE_ORDER[currentIndex + 1];
  }
  return currentStage; // Already at final stage
};

export default function PromoteModuleDialog({ module, isOpen, onClose, onSuccess }) {
  const [targetStage, setTargetStage] = useState(getNextStage(module?.rollout_stage || "PLANNED"));
  const [reason, setReason] = useState("");
  const [override, setOverride] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState(null);

  const handlePromote = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for this promotion");
      return;
    }

    setPromoting(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/orchestration/modules/${module.id}/stage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to_stage: targetStage,
            reason: reason,
            override: override,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
      } else {
        setError(data.message || "Failed to promote module");
      }
    } catch (err) {
      console.error("Failed to promote module:", err);
      setError("Network error occurred");
    } finally {
      setPromoting(false);
    }
  };

  const availableStages = STAGE_ORDER.slice(
    STAGE_ORDER.indexOf(module?.rollout_stage || "PLANNED")
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Promote Module Stage</DialogTitle>
          <DialogDescription className="text-slate-400">
            Promote {module?.name} to a new rollout stage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Stage Info */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-sm text-slate-400 mb-1">Current Stage</div>
            <div className="text-lg font-semibold text-slate-100">
              {module?.rollout_stage}
            </div>
          </div>

          {/* Target Stage Selection */}
          <div className="space-y-2">
            <Label htmlFor="target-stage" className="text-slate-200">
              Target Stage
            </Label>
            <select
              id="target-stage"
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          {/* Promotion Arrow */}
          <div className="flex items-center justify-center text-slate-400">
            <span className="text-lg">{module?.rollout_stage}</span>
            <ArrowRight className="mx-3" size={20} />
            <span className="text-lg font-semibold text-blue-400">{targetStage}</span>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-200">
              Reason for Promotion
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why this module should be promoted..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Override Checkbox */}
          <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <Checkbox
              id="override"
              checked={override}
              onCheckedChange={setOverride}
              className="border-yellow-500/50"
            />
            <div className="flex-1">
              <label
                htmlFor="override"
                className="text-sm font-medium text-yellow-300 cursor-pointer"
              >
                Override readiness checks
              </label>
              <p className="text-xs text-yellow-400/80">
                Bypass trigger and dependency validation (use with caution)
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={promoting}
            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePromote}
            disabled={promoting || !reason.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {promoting ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} />
                Promoting...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2" size={16} />
                Promote
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
