// pages/community/FitnessProgramDetailPage.jsx - Phase 11.6.2
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { 
  Dumbbell, 
  ArrowLeft, 
  Clock, 
  Calendar,
  Users,
  Heart,
  CheckCircle,
  AlertCircle,
  Play,
  Award
} from "lucide-react";

export default function FitnessProgramDetailPage() {
  const { programId } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);

  useEffect(() => {
    fetchProgram();
  }, [programId]);

  const fetchProgram = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/fitness/programs/${programId}`
      );

      if (response.ok) {
        const data = await response.json();
        setProgram(data);
      } else if (response.status === 404) {
        setError("Program not found");
      } else {
        setError("Failed to load program");
      }
    } catch (err) {
      console.error("Failed to fetch program:", err);
      setError("Failed to load program");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    setEnrollmentError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setEnrollmentError("Please log in to enroll in programs");
        setEnrolling(false);
        return;
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/fitness/programs/${programId}/enroll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEnrollmentSuccess(true);
        // Update the program to show updated participant count
        setProgram(prev => ({
          ...prev,
          participants_count: prev.participants_count + 1
        }));
      } else if (response.status === 400) {
        const data = await response.json();
        setEnrollmentError(data.detail || "Already enrolled in this program");
      } else if (response.status === 401) {
        setEnrollmentError("Please log in to enroll in programs");
      } else {
        setEnrollmentError("Failed to enroll. Please try again.");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      setEnrollmentError("Failed to enroll. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <CommunityLayout>
        <div className="text-sm text-slate-400">Loading program...</div>
      </CommunityLayout>
    );
  }

  if (error || !program) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-6 text-center">
            <AlertCircle className="mx-auto text-rose-400 mb-3" size={48} />
            <h2 className="text-lg font-bold text-slate-100 mb-2">{error}</h2>
            <Link
              to="/portal/community/fitness"
              className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition"
            >
              <ArrowLeft size={16} />
              Back to Fitness Programs
            </Link>
          </div>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/portal/community/fitness"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft size={16} />
          Back to Fitness Programs
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                <Dumbbell className="text-green-400" size={20} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-100">
                  {program.title}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {program.description}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-xs font-semibold text-green-300">
                {program.level}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                {program.intensity} intensity
              </span>
              {program.delivery && (
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                  {program.delivery.replace('_', ' ')}
                </span>
              )}
              {program.cost_range === 'free' && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                  FREE
                </span>
              )}
            </div>
          </div>

          {/* Program Details */}
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-100 mb-4">About This Program</h2>
            <div className="prose prose-invert prose-green max-w-none text-sm text-slate-300 whitespace-pre-line">
              {program.detailed_description || program.description}
            </div>
          </div>

          {/* What You'll Learn */}
          {program.what_you_learn && program.what_you_learn.length > 0 && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-5 mb-6">
              <h3 className="text-sm font-bold text-green-100 mb-3 flex items-center gap-2">
                <Award size={16} />
                What You'll Learn
              </h3>
              <ul className="space-y-2">
                {program.what_you_learn.map((item, index) => (
                  <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={14} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Schedule */}
          {program.schedule && (
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 mb-6">
              <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Schedule
              </h3>
              <p className="text-xs text-slate-300">{program.schedule}</p>
            </div>
          )}

          {/* Equipment */}
          {program.equipment_needed && program.equipment_needed.length > 0 && (
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Equipment Needed</h3>
              <div className="flex flex-wrap gap-2">
                {program.equipment_needed.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                  >
                    {item.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Enrollment Card */}
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-5">
            <h3 className="text-sm font-bold text-green-100 mb-4">Program Details</h3>
            <div className="space-y-3 mb-4">
              {program.duration_weeks && (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Clock className="text-green-400" size={14} />
                  <span>{program.duration_weeks} weeks</span>
                </div>
              )}
              {program.sessions_per_week && (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Calendar className="text-green-400" size={14} />
                  <span>{program.sessions_per_week}x per week</span>
                </div>
              )}
              {program.session_duration_minutes && (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Play className="text-green-400" size={14} />
                  <span>{program.session_duration_minutes} min sessions</span>
                </div>
              )}
              {program.participants_count > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Users className="text-green-400" size={14} />
                  <span>{program.participants_count} enrolled</span>
                </div>
              )}
            </div>
            
            {program.enrollment_open ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full px-4 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition disabled:opacity-50"
              >
                {enrolling ? "Enrolling..." : "Enroll Now"}
              </button>
            ) : (
              <div className="text-center py-2 text-xs text-slate-400">
                Enrollment currently closed
              </div>
            )}
          </div>

          {/* Coach Info */}
          {(program.coach_name || program.coach_bio) && (
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Your Coach</h3>
              {program.coach_name && (
                <div className="text-sm font-semibold text-slate-200 mb-2">
                  {program.coach_name}
                </div>
              )}
              {program.coach_bio && (
                <p className="text-xs text-slate-400">{program.coach_bio}</p>
              )}
            </div>
          )}

          {/* Chronic Condition Friendly */}
          {program.chronic_friendly && program.chronic_friendly.length > 0 && (
            <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Heart size={16} className="text-purple-400" />
                Safe For
              </h3>
              <div className="flex flex-wrap gap-2">
                {program.chronic_friendly.map((condition) => (
                  <span
                    key={condition}
                    className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300"
                  >
                    {condition.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </CommunityLayout>
  );
}
