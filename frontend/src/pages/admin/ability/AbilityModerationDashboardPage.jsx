// pages/admin/ability/AbilityModerationDashboardPage.jsx - Phase 11.5.4
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, User, FileText, Calendar, Mail } from "lucide-react";

export default function AbilityModerationDashboardPage() {
  const navigate = useNavigate();
  const [pendingResources, setPendingResources] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState("resources"); // "resources" or "providers"

  useEffect(() => {
    // Check authentication on mount
    const token = localStorage.getItem("access_token");
    if (!token) {
      // Redirect to login if not authenticated
      navigate("/auth/signin");
      return;
    }
    
    fetchPendingItems();
  }, [navigate]);

  const fetchPendingItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch pending resources
      const resourcesResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/admin/pending/resources`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch pending providers
      const providersResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/admin/pending/providers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!resourcesResponse.ok || !providersResponse.ok) {
        if (resourcesResponse.status === 403 || providersResponse.status === 403) {
          setError("Admin access required. You do not have permission to view this page.");
        } else {
          setError("Failed to fetch pending items. Please try again.");
        }
        setLoading(false);
        return;
      }

      const resourcesData = await resourcesResponse.json();
      const providersData = await providersResponse.json();

      setPendingResources(resourcesData.resources || []);
      setPendingProviders(providersData.providers || []);
    } catch (err) {
      console.error("Failed to fetch pending items:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveResource = async (resourceId) => {
    setProcessingId(resourceId);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/admin/resources/${resourceId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Remove from pending list
        setPendingResources((prev) => prev.filter((r) => r.id !== resourceId));
      } else {
        alert("Failed to approve resource");
      }
    } catch (err) {
      console.error("Failed to approve resource:", err);
      alert("Network error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to reject and delete this resource?")) {
      return;
    }

    setProcessingId(resourceId);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/admin/resources/${resourceId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Remove from pending list
        setPendingResources((prev) => prev.filter((r) => r.id !== resourceId));
      } else {
        alert("Failed to reject resource");
      }
    } catch (err) {
      console.error("Failed to reject resource:", err);
      alert("Network error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveProvider = async (providerId) => {
    setProcessingId(providerId);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/admin/providers/${providerId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Remove from pending list
        setPendingProviders((prev) => prev.filter((p) => p.id !== providerId));
      } else {
        alert("Failed to approve provider");
      }
    } catch (err) {
      console.error("Failed to approve provider:", err);
      alert("Network error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectProvider = async (providerId) => {
    if (!window.confirm("Are you sure you want to reject and delete this provider?")) {
      return;
    }

    setProcessingId(providerId);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/admin/providers/${providerId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Remove from pending list
        setPendingProviders((prev) => prev.filter((p) => p.id !== providerId));
      } else {
        alert("Failed to reject provider");
      }
    } catch (err) {
      console.error("Failed to reject provider:", err);
      alert("Network error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Ability Network Moderation</h1>
          <div className="text-sm text-slate-400 mt-4">Loading pending submissions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Ability Network Moderation</h1>
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={24} />
            <div>
              <div className="font-semibold text-red-300">Access Error</div>
              <div className="text-sm text-red-200">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPending = pendingResources.length + pendingProviders.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            Ability Network Moderation
          </h1>
          <p className="text-base text-slate-400">
            Review and approve community-submitted resources and providers
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-purple-400" size={32} />
              <div>
                <div className="text-2xl font-bold text-slate-100">{totalPending}</div>
                <div className="text-sm text-slate-400">Total Pending</div>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-3">
              <FileText className="text-slate-400" size={32} />
              <div>
                <div className="text-2xl font-bold text-slate-100">{pendingResources.length}</div>
                <div className="text-sm text-slate-400">Resources</div>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-3">
              <User className="text-slate-400" size={32} />
              <div>
                <div className="text-2xl font-bold text-slate-100">{pendingProviders.length}</div>
                <div className="text-sm text-slate-400">Providers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("resources")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === "resources"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Resources ({pendingResources.length})
          </button>
          <button
            onClick={() => setActiveTab("providers")}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === "providers"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Providers ({pendingProviders.length})
          </button>
        </div>

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="space-y-4">
            {pendingResources.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <div className="text-sm text-slate-400">
                  No pending resource submissions
                </div>
              </div>
            ) : (
              pendingResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-6 rounded-xl bg-slate-900/50 border border-slate-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-100 mb-1">
                        {resource.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>
                            Submitted by: {resource.submitted_by_name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(resource.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Provider:</span>
                      <span className="text-sm text-slate-300 ml-2">
                        {resource.provider_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Category:</span>
                      <span className="text-sm text-slate-300 ml-2">
                        {resource.category?.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Format:</span>
                      <span className="text-sm text-slate-300 ml-2">{resource.format}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Description:</span>
                      <p className="text-sm text-slate-300 mt-1">{resource.description}</p>
                    </div>
                    {resource.contact_website && (
                      <div>
                        <span className="text-xs font-semibold text-slate-400">Website:</span>
                        <a
                          href={resource.contact_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-400 hover:text-purple-300 ml-2"
                        >
                          {resource.contact_website}
                        </a>
                      </div>
                    )}
                    {resource.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-300">{resource.contact_email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveResource(resource.id)}
                      disabled={processingId === resource.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={16} />
                      {processingId === resource.id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleRejectResource(resource.id)}
                      disabled={processingId === resource.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={16} />
                      {processingId === resource.id ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === "providers" && (
          <div className="space-y-4">
            {pendingProviders.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <div className="text-sm text-slate-400">
                  No pending provider submissions
                </div>
              </div>
            ) : (
              pendingProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="p-6 rounded-xl bg-slate-900/50 border border-slate-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-100 mb-1">
                        {provider.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>
                            Submitted by: {provider.submitted_by_name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(provider.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Type:</span>
                      <span className="text-sm text-slate-300 ml-2">
                        {provider.provider_type?.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Region:</span>
                      <span className="text-sm text-slate-300 ml-2">{provider.region}</span>
                    </div>
                    {provider.city && provider.state && (
                      <div>
                        <span className="text-xs font-semibold text-slate-400">Location:</span>
                        <span className="text-sm text-slate-300 ml-2">
                          {provider.city}, {provider.state}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Bio:</span>
                      <p className="text-sm text-slate-300 mt-1">{provider.bio}</p>
                    </div>
                    {provider.specializations && provider.specializations.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-slate-400">
                          Specializations:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {provider.specializations.map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-4 text-xs">
                      <div>
                        <span className="text-slate-400">Telehealth:</span>
                        <span className="text-slate-300 ml-1">
                          {provider.telehealth_available ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">In-Person:</span>
                        <span className="text-slate-300 ml-1">
                          {provider.in_person_available ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                    {provider.contact_website && (
                      <div>
                        <span className="text-xs font-semibold text-slate-400">Website:</span>
                        <a
                          href={provider.contact_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-400 hover:text-purple-300 ml-2"
                        >
                          {provider.contact_website}
                        </a>
                      </div>
                    )}
                    {provider.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-300">{provider.contact_email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveProvider(provider.id)}
                      disabled={processingId === provider.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 hover:bg-green-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle size={16} />
                      {processingId === provider.id ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleRejectProvider(provider.id)}
                      disabled={processingId === provider.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle size={16} />
                      {processingId === provider.id ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
