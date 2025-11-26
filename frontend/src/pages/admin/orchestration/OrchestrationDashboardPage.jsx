// pages/admin/orchestration/OrchestrationDashboardPage.jsx - BPOC Admin Dashboard
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import ModuleTable from "./components/ModuleTable";
import ReadinessSummary from "./components/ReadinessSummary";
import EventHistory from "./components/EventHistory";
import ModuleDetailDrawer from "./components/ModuleDetailDrawer";

export default function OrchestrationDashboardPage() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [readinessSummary, setReadinessSummary] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("modules");

  useEffect(() => {
    // Check authentication on mount
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/auth/signin");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch modules list
      const modulesResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/orchestration/modules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch readiness summary
      const summaryResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/orchestration/readiness_summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!modulesResponse.ok || !summaryResponse.ok) {
        if (modulesResponse.status === 403 || summaryResponse.status === 403) {
          setError("Admin access required. You do not have permission to view this page.");
        } else {
          setError("Failed to fetch orchestration data. Please try again.");
        }
        setLoading(false);
        return;
      }

      const modulesData = await modulesResponse.json();
      const summaryData = await summaryResponse.json();

      setModules(modulesData.modules || []);
      setReadinessSummary(summaryData);
    } catch (err) {
      console.error("Failed to fetch orchestration data:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module);
  };

  const handleCloseDrawer = () => {
    setSelectedModule(null);
  };

  const handleModuleUpdate = () => {
    // Refresh data after module update
    fetchData();
    setSelectedModule(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">BPOC Orchestration Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-slate-400 mt-4">
            <Loader2 className="animate-spin" size={16} />
            <span>Loading orchestration data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">BPOC Orchestration Dashboard</h1>
          <Alert className="mt-6 bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            BPOC Orchestration Dashboard
          </h1>
          <p className="text-base text-slate-400">
            Manage BANIBS platform module rollouts, dependencies, and governance
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="modules" className="data-[state=active]:bg-slate-800">
              Modules ({modules.length})
            </TabsTrigger>
            <TabsTrigger value="readiness" className="data-[state=active]:bg-slate-800">
              Readiness Summary
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-slate-800">
              Event History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="mt-6">
            <ModuleTable 
              modules={modules} 
              onModuleClick={handleModuleClick}
              onRefresh={fetchData}
            />
          </TabsContent>

          <TabsContent value="readiness" className="mt-6">
            <ReadinessSummary 
              summary={readinessSummary}
              modules={modules}
            />
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <EventHistory />
          </TabsContent>
        </Tabs>

        {/* Module Detail Drawer */}
        {selectedModule && (
          <ModuleDetailDrawer
            module={selectedModule}
            isOpen={!!selectedModule}
            onClose={handleCloseDrawer}
            onUpdate={handleModuleUpdate}
          />
        )}
      </div>
    </div>
  );
}
