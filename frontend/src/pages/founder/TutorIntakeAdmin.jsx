// pages/founder/TutorIntakeAdmin.jsx - Admin View for Tutor Applications
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FullWidthLayout from "../../components/layouts/FullWidthLayout";
import { 
  GraduationCap, ArrowLeft, User, Mail, MapPin, 
  BookOpen, Clock, CheckCircle2, XCircle, Eye,
  RefreshCw, FileText, ExternalLink
} from "lucide-react";

/**
 * Tutor Intake Admin - Review Submissions
 * 
 * Founder/super_admin only view to:
 * - List all intake submissions
 * - Filter by status
 * - Update status + add notes
 */

const STATUS_CONFIG = {
  new: { label: "New", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  reviewed: { label: "Reviewed", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
  approved: { label: "Approved", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
  rejected: { label: "Rejected", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" }
};

export default function TutorIntakeAdmin() {
  const { accessToken } = useAuth();
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ new: 0, reviewed: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (accessToken) {
      fetchSubmissions();
      fetchStats();
    }
  }, [accessToken, statusFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const url = statusFilter 
        ? `${API_URL}/api/alt-school/admin/intake/tutors?status=${statusFilter}`
        : `${API_URL}/api/alt-school/admin/intake/tutors`;
      
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/alt-school/admin/intake/stats`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const updateSubmission = async (id, newStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_URL}/api/alt-school/admin/intake/tutors/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus, notes: notes || null })
      });
      
      if (response.ok) {
        // Refresh data
        fetchSubmissions();
        fetchStats();
        setSelectedSubmission(null);
        setNotes("");
      }
    } catch (err) {
      console.error("Failed to update submission:", err);
    } finally {
      setUpdating(false);
    }
  };

  const openDetail = (submission) => {
    setSelectedSubmission(submission);
    setNotes(submission.notes || "");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <FullWidthLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/founder/command"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Control Center
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                <GraduationCap className="text-blue-400" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Tutor Intake Review</h1>
                <p className="text-sm text-gray-400">Alternative School Hub · Phase-0.5</p>
              </div>
            </div>
            
            <button
              onClick={() => { fetchSubmissions(); fetchStats(); }}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors"
              data-testid="refresh-intake"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
              className={`p-4 rounded-xl text-center transition-all ${
                statusFilter === key 
                  ? `${config.bg} border ${config.border}` 
                  : "bg-gray-800/50 border border-gray-700 hover:border-gray-600"
              }`}
              data-testid={`filter-${key}`}
            >
              <div className={`text-2xl font-bold ${statusFilter === key ? config.text : "text-white"}`}>
                {stats[key] || 0}
              </div>
              <div className="text-xs text-gray-400">{config.label}</div>
            </button>
          ))}
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
            <div className="text-2xl font-bold text-white">{stats.total || 0}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="rounded-xl bg-gray-900/50 border border-gray-800 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {statusFilter ? `No ${statusFilter} submissions` : "No submissions yet"}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const statusConf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.new;
                  return (
                    <tr 
                      key={sub.id} 
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{sub.name}</div>
                        <div className="text-xs text-gray-500">{sub.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{sub.subject_focus}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{sub.location}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text} border ${statusConf.border}`}>
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(sub.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(sub)}
                          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          data-testid={`view-${sub.id}`}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-800">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedSubmission.name}</h2>
                  <p className="text-sm text-gray-400">{selectedSubmission.email}</p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400"
                >
                  <XCircle size={18} />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Location</label>
                    <p className="text-white flex items-center gap-2">
                      <MapPin size={14} className="text-gray-500" />
                      {selectedSubmission.location}
                    </p>
                  </div>
                  {selectedSubmission.phone && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Phone</label>
                      <p className="text-white">{selectedSubmission.phone}</p>
                    </div>
                  )}
                </div>
                
                {/* Teaching Profile */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Subject/Focus</label>
                    <p className="text-white flex items-center gap-2">
                      <BookOpen size={14} className="text-amber-400" />
                      {selectedSubmission.subject_focus}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase">Age/Grade Range</label>
                    <p className="text-white">{selectedSubmission.age_grade_range}</p>
                  </div>
                </div>
                
                {/* Bio */}
                <div>
                  <label className="text-xs text-gray-500 uppercase">Bio</label>
                  <p className="text-gray-300 text-sm leading-relaxed bg-gray-800/50 p-3 rounded-lg">
                    {selectedSubmission.bio}
                  </p>
                </div>
                
                {/* Optional Fields */}
                {(selectedSubmission.website || selectedSubmission.availability) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSubmission.website && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase">Website</label>
                        <a 
                          href={selectedSubmission.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                        >
                          {selectedSubmission.website.replace(/^https?:\/\//, '').slice(0, 30)}...
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                    {selectedSubmission.availability && (
                      <div>
                        <label className="text-xs text-gray-500 uppercase">Availability</label>
                        <p className="text-white flex items-center gap-2">
                          <Clock size={14} className="text-gray-500" />
                          {selectedSubmission.availability}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Submitted Date */}
                <div className="text-xs text-gray-500">
                  Submitted: {formatDate(selectedSubmission.created_at)}
                  {selectedSubmission.updated_at && ` · Updated: ${formatDate(selectedSubmission.updated_at)}`}
                </div>
                
                {/* Admin Notes */}
                <div>
                  <label className="text-xs text-gray-500 uppercase mb-1 block">Admin Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal notes about this submission..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none text-sm"
                    data-testid="admin-notes"
                  />
                </div>
                
                {/* Status Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs text-gray-500 self-center mr-2">Update Status:</span>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => updateSubmission(selectedSubmission.id, key)}
                      disabled={updating || selectedSubmission.status === key}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
                        selectedSubmission.status === key
                          ? `${config.bg} ${config.text} border ${config.border}`
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                      data-testid={`set-status-${key}`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FullWidthLayout>
  );
}
