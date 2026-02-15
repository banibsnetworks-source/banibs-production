import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Shield, AlertTriangle, ChevronRight, Info, 
  Loader2, CheckCircle, XCircle, HelpCircle,
  BookOpen, FileText, History, Trash2
} from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';

/**
 * HDOS Engine v1 - Routing Classifier
 * 
 * Deterministic analysis of scenarios into DOG/GOD/MIXED/UNDETERMINED
 * No prescriptions. Classification only.
 */

const CONTEXT_TYPES = [
  { value: 'relationship', label: 'Relationship' },
  { value: 'work', label: 'Work/Professional' },
  { value: 'public', label: 'Public/Community' },
  { value: 'other', label: 'Other' },
];

const STAKE_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'med', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const URGENCY_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'med', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const FORCE_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'verbal', label: 'Verbal' },
  { value: 'social', label: 'Social' },
  { value: 'physical', label: 'Physical' },
  { value: 'weapon', label: 'Weapon' },
];

const PRIOR_PATTERNS = [
  { value: 'first', label: 'First occurrence' },
  { value: 'repeat', label: 'Repeat pattern' },
  { value: 'unknown', label: 'Unknown' },
];

const HDOSEnginePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hdosVersion, setHdosVersion] = useState('');
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    scenario_summary: '',
    context_type: 'other',
    public_exposure: false,
    identity_stake: { level: 'none', description: '' },
    power_asymmetry: { present: false, type: '' },
    urgency_level: 'none',
    force_level: 'none',
    escalation_sequence: [],
    prior_pattern: 'unknown',
  });

  const [newEscalationStep, setNewEscalationStep] = useState('');

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch HDOS version on mount
  useEffect(() => {
    fetch(`${API_URL}/api/hdos/version`)
      .then(res => res.json())
      .then(data => setHdosVersion(data.version))
      .catch(() => setHdosVersion('1.2.0'));
  }, [API_URL]);

  // Fetch saved analyses if logged in
  useEffect(() => {
    if (user) {
      fetchSavedAnalyses();
    }
  }, [user]);

  const fetchSavedAnalyses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/hdos/analyses?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAnalyses(data.analyses || []);
      }
    } catch (err) {
      console.error('Error fetching analyses:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/hdos/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Analysis failed');
      }

      const data = await res.json();
      setResult(data);
      
      // Refresh saved analyses if logged in
      if (user) {
        fetchSavedAnalyses();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addEscalationStep = () => {
    if (newEscalationStep.trim()) {
      setFormData(prev => ({
        ...prev,
        escalation_sequence: [
          ...prev.escalation_sequence,
          {
            step_number: prev.escalation_sequence.length + 1,
            description: newEscalationStep.trim()
          }
        ]
      }));
      setNewEscalationStep('');
    }
  };

  const removeEscalationStep = (index) => {
    setFormData(prev => ({
      ...prev,
      escalation_sequence: prev.escalation_sequence
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step_number: i + 1 }))
    }));
  };

  const deleteAnalysis = async (analysisId) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/api/hdos/analyses/${analysisId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchSavedAnalyses();
    } catch (err) {
      console.error('Error deleting analysis:', err);
    }
  };

  const getRoutingColor = (routing) => {
    switch (routing) {
      case 'DOG': return '#EF4444';
      case 'GOD': return '#F59E0B';
      case 'MIXED': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getMagnitudeColor = (magnitude) => {
    switch (magnitude) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      default: return '#10B981';
    }
  };

  return (
    <FullWidthLayout>
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
          color: isDark ? '#e5e5e5' : '#1a1a1a'
        }}
      >
        {/* Header */}
        <header 
          className="border-b"
          style={{ 
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={28} className="text-amber-500" />
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                    HDOS Engine
                  </h1>
                  <p className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    Human Defense Operating System v{hdosVersion}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/hdos/glossary"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                  }}
                >
                  <BookOpen size={16} />
                  Glossary
                </Link>
                <Link
                  to="/hdos/amendments"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                  }}
                >
                  <FileText size={16} />
                  Amendments
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Scenario Summary */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                    Scenario Summary <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    value={formData.scenario_summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, scenario_summary: e.target.value }))}
                    placeholder="Describe the situation..."
                    rows={3}
                    maxLength={2000}
                    className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                      color: isDark ? '#fff' : '#111',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}
                  />
                </div>

                {/* Context Type & Public Exposure */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                      Context Type
                    </label>
                    <select
                      value={formData.context_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, context_type: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                        color: isDark ? '#fff' : '#111',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      {CONTEXT_TYPES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                      Public Exposure
                    </label>
                    <div className="flex items-center gap-4 h-[50px]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!formData.public_exposure}
                          onChange={() => setFormData(prev => ({ ...prev, public_exposure: false }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.public_exposure}
                          onChange={() => setFormData(prev => ({ ...prev, public_exposure: true }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>Yes</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Identity Stake */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                    Identity Stake
                  </label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <select
                      value={formData.identity_stake.level}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        identity_stake: { ...prev.identity_stake, level: e.target.value }
                      }))}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                        color: isDark ? '#fff' : '#111',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      {STAKE_LEVELS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={formData.identity_stake.description}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        identity_stake: { ...prev.identity_stake, description: e.target.value }
                      }))}
                      placeholder="What's at stake? (optional)"
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                        color: isDark ? '#fff' : '#111',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    />
                  </div>
                </div>

                {/* Power Asymmetry */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                    Power Asymmetry
                  </label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 h-[50px]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!formData.power_asymmetry.present}
                          onChange={() => setFormData(prev => ({ 
                            ...prev, 
                            power_asymmetry: { present: false, type: '' }
                          }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.power_asymmetry.present}
                          onChange={() => setFormData(prev => ({ 
                            ...prev, 
                            power_asymmetry: { ...prev.power_asymmetry, present: true }
                          }))}
                          className="w-4 h-4"
                        />
                        <span className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>Yes</span>
                      </label>
                    </div>
                    {formData.power_asymmetry.present && (
                      <input
                        type="text"
                        value={formData.power_asymmetry.type}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          power_asymmetry: { ...prev.power_asymmetry, type: e.target.value }
                        }))}
                        placeholder="e.g., employer/employee"
                        className="w-full px-4 py-3 rounded-xl outline-none"
                        style={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                          color: isDark ? '#fff' : '#111',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Urgency & Force Level */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                      Urgency Level
                    </label>
                    <select
                      value={formData.urgency_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgency_level: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                        color: isDark ? '#fff' : '#111',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      {URGENCY_LEVELS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                      Force Level
                    </label>
                    <select
                      value={formData.force_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, force_level: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                        color: isDark ? '#fff' : '#111',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      {FORCE_LEVELS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Prior Pattern */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                    Prior Pattern
                  </label>
                  <select
                    value={formData.prior_pattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, prior_pattern: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                      color: isDark ? '#fff' : '#111',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}
                  >
                    {PRIOR_PATTERNS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Escalation Sequence */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                    Escalation Sequence
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newEscalationStep}
                      onChange={(e) => setNewEscalationStep(e.target.value)}
                      placeholder="Add escalation step..."
                      className="flex-1 px-4 py-2 rounded-lg outline-none"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                        color: isDark ? '#fff' : '#111',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEscalationStep())}
                    />
                    <button
                      type="button"
                      onClick={addEscalationStep}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-black font-medium"
                    >
                      Add
                    </button>
                  </div>
                  {formData.escalation_sequence.length > 0 && (
                    <div className="space-y-2">
                      {formData.escalation_sequence.map((step, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg"
                          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                        >
                          <span className="text-xs font-mono text-amber-500">{step.step_number}.</span>
                          <span className="flex-1 text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                            {step.description}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeEscalationStep(idx)}
                            className="p-1 rounded hover:bg-red-500/20 text-red-500"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: loading ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') : '#F59E0B',
                    color: loading ? (isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)') : '#000'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      Analyze Scenario
                    </>
                  )}
                </button>
              </form>

              {/* Error */}
              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="mt-6 space-y-4">
                  {/* Routing Classification */}
                  <div 
                    className="p-6 rounded-xl"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                      border: `2px solid ${getRoutingColor(result.routing_classification)}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                          Routing Classification
                        </p>
                        <p 
                          className="text-3xl font-bold"
                          style={{ color: getRoutingColor(result.routing_classification) }}
                        >
                          {result.routing_classification}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                          Confidence
                        </p>
                        <p className="text-lg font-semibold" style={{ color: isDark ? '#fff' : '#111' }}>
                          {result.confidence}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' }}>
                      <p className="text-xs font-mono" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        {result.collapse_path}
                      </p>
                    </div>
                  </div>

                  {/* Pressure Breakdown */}
                  {result.pressure_breakdown.length > 0 && (
                    <div 
                      className="p-6 rounded-xl"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                      }}
                    >
                      <p className="text-xs uppercase tracking-wider mb-4" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                        Pressure Breakdown
                      </p>
                      <div className="space-y-3">
                        {result.pressure_breakdown.map((pv, idx) => (
                          <div 
                            key={idx}
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)' }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium" style={{ color: isDark ? '#fff' : '#111' }}>
                                {pv.vector}
                              </span>
                              <span 
                                className="text-xs px-2 py-1 rounded-full font-medium"
                                style={{ 
                                  backgroundColor: `${getMagnitudeColor(pv.magnitude)}20`,
                                  color: getMagnitudeColor(pv.magnitude)
                                }}
                              >
                                {pv.magnitude}
                              </span>
                            </div>
                            <p className="text-sm mb-2" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                              Trigger: {pv.trigger}
                            </p>
                            {pv.amplifiers.length > 0 && (
                              <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                                Amplifiers: {pv.amplifiers.join(', ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Fields */}
                  {result.missing_fields.length > 0 && (
                    <div 
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                    >
                      <p className="text-sm font-medium text-amber-500 mb-2 flex items-center gap-2">
                        <Info size={16} />
                        Additional information would improve accuracy:
                      </p>
                      <ul className="text-sm space-y-1" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        {result.missing_fields.map((field, idx) => (
                          <li key={idx}>• {field}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Analysis Notes */}
                  {result.analysis_notes.length > 0 && (
                    <div 
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                    >
                      <p className="text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                        Analysis Notes
                      </p>
                      <ul className="text-sm space-y-1" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        {result.analysis_notes.map((note, idx) => (
                          <li key={idx}>• {note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Guardrails Footer */}
                  <div className="p-4 rounded-xl text-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                    <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                      {result.guardrails_footer}
                    </p>
                    <p className="text-xs mt-1" style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}>
                      HDOS v{result.hdos_version}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Info */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                }}
              >
                <p className="text-sm font-medium mb-3" style={{ color: isDark ? '#fff' : '#111' }}>
                  Routing Types
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                    <span style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                      <strong>DOG</strong> - Dismiss, Obstruct, Gaslight
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                    <span style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                      <strong>GOD</strong> - Guilt, Overwhelm, Demand
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
                    <span style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                      <strong>MIXED</strong> - Both patterns present
                    </span>
                  </div>
                </div>
              </div>

              {/* Saved Analyses */}
              {user && savedAnalyses.length > 0 && (
                <div 
                  className="p-4 rounded-xl"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                  }}
                >
                  <p className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: isDark ? '#fff' : '#111' }}>
                    <History size={16} />
                    Recent Analyses
                  </p>
                  <div className="space-y-2">
                    {savedAnalyses.slice(0, 5).map(analysis => (
                      <div 
                        key={analysis.id}
                        className="flex items-center justify-between p-2 rounded-lg"
                        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)' }}
                      >
                        <div>
                          <span 
                            className="text-xs font-bold"
                            style={{ color: getRoutingColor(analysis.output_data.routing_classification) }}
                          >
                            {analysis.output_data.routing_classification}
                          </span>
                          <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteAnalysis(analysis.id)}
                          className="p-1 rounded hover:bg-red-500/20 text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </FullWidthLayout>
  );
};

export default HDOSEnginePage;
