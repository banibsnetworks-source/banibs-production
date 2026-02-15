import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Shield, ChevronRight, Info, 
  Loader2, BookOpen, FileText, History, Trash2,
  AlertTriangle, CheckCircle, XCircle, MinusCircle, Bookmark
} from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import PinButton from '../../components/pins/PinButton';

/**
 * HDOS Engine v1 - Exit-Safe Routing Classifier
 * 
 * CONSTITUTIONAL LOCK:
 * - STRUCTURAL VISIBILITY TOOL ONLY
 * - NEVER prescribes actions, predicts behavior, or inspects inner states
 * - MAY classify STRUCTURE/CONFIGURATION (environment + sequence)
 * 
 * OUTPUT: routing.state + confidence + pressure_breakdown + collapse_path + warnings
 */

const CONTEXT_TYPES = [
  { value: 'personal', label: 'Personal' },
  { value: 'work', label: 'Work' },
  { value: 'institution', label: 'Institution' },
  { value: 'public', label: 'Public' },
];

const LEVELS = [
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

const EXIT_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'partial', label: 'Partial' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' },
];

const HDOSEnginePage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hdosVersion, setHdosVersion] = useState('');
  const [savedAnalyses, setSavedAnalyses] = useState([]);

  // Form state - per specification
  const [formData, setFormData] = useState({
    context_type: 'personal',
    public_exposure: false,
    power_asymmetry: 'none',
    urgency_level: 'none',
    moral_loading: 'none',
    refusal_cost: 'none',
    exit_paths_available: 'unknown',
    force_level: 'none',
    escalation_sequence: [],
    notes: '',
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

      // Build request payload
      const payload = {
        ...formData,
        notes: formData.notes || null
      };

      const res = await fetch(`${API_URL}/api/hdos/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
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
        escalation_sequence: [...prev.escalation_sequence, newEscalationStep.trim()]
      }));
      setNewEscalationStep('');
    }
  };

  const removeEscalationStep = (index) => {
    setFormData(prev => ({
      ...prev,
      escalation_sequence: prev.escalation_sequence.filter((_, i) => i !== index)
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

  const getRoutingColor = (state) => {
    switch (state) {
      case 'EXIT-SEALED': return '#EF4444';
      case 'EXIT-THREATENED': return '#F59E0B';
      case 'EXIT-PRESERVED': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getRoutingIcon = (state) => {
    switch (state) {
      case 'EXIT-SEALED': return <XCircle size={24} />;
      case 'EXIT-THREATENED': return <AlertTriangle size={24} />;
      case 'EXIT-PRESERVED': return <CheckCircle size={24} />;
      default: return <MinusCircle size={24} />;
    }
  };

  const getMagnitudeColor = (magnitude) => {
    switch (magnitude) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      default: return '#10B981';
    }
  };

  const SelectField = ({ label, value, onChange, options, tooltip }) => (
    <div>
      <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: isDark ? '#fff' : '#111' }}>
        {label}
        {tooltip && (
          <span className="group relative">
            <Info size={14} className="text-gray-500 cursor-help" />
            <span className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-48 p-2 text-xs rounded-lg bg-gray-800 text-gray-200 z-10">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl outline-none"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
          color: isDark ? '#fff' : '#111',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

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
                    Human Defense Operating System v{hdosVersion} • Exit-Safe Model
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/hdos/glossary"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/10"
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
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/10"
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
              {/* Constitutional Notice */}
              <div 
                className="p-4 rounded-xl mb-6"
                style={{ 
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)'
                }}
              >
                <p className="text-sm" style={{ color: '#F59E0B' }}>
                  <strong>Structural Visibility Only</strong> — This tool classifies configuration, not persons. 
                  It does not prescribe actions, predict behavior, or inspect inner states.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" data-testid="hdos-engine-form">
                {/* Row 1: Context & Public Exposure */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Context Type"
                    value={formData.context_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, context_type: e.target.value }))}
                    options={CONTEXT_TYPES}
                    tooltip="Environment where interaction occurs"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                      Public Exposure
                    </label>
                    <div 
                      className="flex items-center gap-4 h-[50px] px-4 rounded-xl"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!formData.public_exposure}
                          onChange={() => setFormData(prev => ({ ...prev, public_exposure: false }))}
                          className="w-4 h-4 accent-amber-500"
                        />
                        <span className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.public_exposure}
                          onChange={() => setFormData(prev => ({ ...prev, public_exposure: true }))}
                          className="w-4 h-4 accent-amber-500"
                        />
                        <span className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>Yes</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Row 2: Power Asymmetry & Urgency */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Power Asymmetry"
                    value={formData.power_asymmetry}
                    onChange={(e) => setFormData(prev => ({ ...prev, power_asymmetry: e.target.value }))}
                    options={LEVELS}
                    tooltip="Imbalance of power between parties"
                  />
                  <SelectField
                    label="Urgency Level"
                    value={formData.urgency_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, urgency_level: e.target.value }))}
                    options={LEVELS}
                    tooltip="Time pressure being applied"
                  />
                </div>

                {/* Row 3: Moral Loading & Refusal Cost */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Moral Loading"
                    value={formData.moral_loading}
                    onChange={(e) => setFormData(prev => ({ ...prev, moral_loading: e.target.value }))}
                    options={LEVELS}
                    tooltip="Duty/obligation pressure being invoked"
                  />
                  <SelectField
                    label="Refusal Cost"
                    value={formData.refusal_cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, refusal_cost: e.target.value }))}
                    options={LEVELS}
                    tooltip="Cost for saying no / pausing / leaving"
                  />
                </div>

                {/* Row 4: Exit Paths & Force Level */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Exit Paths Available"
                    value={formData.exit_paths_available}
                    onChange={(e) => setFormData(prev => ({ ...prev, exit_paths_available: e.target.value }))}
                    options={EXIT_OPTIONS}
                    tooltip="Can you leave, pause, or disengage?"
                  />
                  <SelectField
                    label="Force Level"
                    value={formData.force_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, force_level: e.target.value }))}
                    options={FORCE_LEVELS}
                    tooltip="Type of force being applied or threatened"
                  />
                </div>

                {/* Escalation Sequence (Optional) */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                    Escalation Sequence <span className="text-gray-500">(optional)</span>
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
                      className="px-4 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
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
                          <span className="text-xs font-mono text-amber-500">{idx + 1}.</span>
                          <span className="flex-1 text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                            {step}
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

                {/* Notes (Optional) */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                    Notes <span className="text-gray-500">(optional, do not infer inner states)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Brief context (observable facts only)..."
                    rows={2}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                      color: isDark ? '#fff' : '#111',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="hdos-analyze-button"
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
                      Analyze Configuration
                    </>
                  )}
                </button>
              </form>

              {/* Error */}
              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20" data-testid="hdos-error">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="mt-6 space-y-4" data-testid="hdos-result">
                  {/* Routing State */}
                  <div 
                    className="p-6 rounded-xl"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                      border: `2px solid ${getRoutingColor(result.routing?.state)}`
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span style={{ color: getRoutingColor(result.routing?.state) }}>
                          {getRoutingIcon(result.routing?.state)}
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                            Routing State
                          </p>
                          <p 
                            className="text-2xl font-bold"
                            style={{ color: getRoutingColor(result.routing?.state) }}
                          >
                            {result.routing?.state}
                          </p>
                        </div>
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
                    
                    {/* Indices */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="p-2 rounded-lg text-center" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' }}>
                        <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>Pressure</p>
                        <p className="text-lg font-mono font-bold" style={{ color: result.pressure_index >= 60 ? '#EF4444' : isDark ? '#fff' : '#111' }}>
                          {result.pressure_index}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' }}>
                        <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>Exit Integrity</p>
                        <p className="text-lg font-mono font-bold" style={{ color: result.exit_integrity_index <= 25 ? '#EF4444' : result.exit_integrity_index <= 55 ? '#F59E0B' : '#10B981' }}>
                          {result.exit_integrity_index}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' }}>
                        <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>Escalation</p>
                        <p className="text-lg font-mono font-bold" style={{ color: result.escalation_index >= 50 ? '#F59E0B' : isDark ? '#fff' : '#111' }}>
                          {result.escalation_index}
                        </p>
                      </div>
                    </div>
                    
                    {/* Collapse Path */}
                    <div className="p-3 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' }}>
                      <p className="text-xs font-mono" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        {result.collapse_path}
                      </p>
                    </div>

                    {/* DOG Config Flag (Geometry Only) */}
                    {result.dog_config_present && (
                      <div className="mt-3 p-2 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <p className="text-xs text-center" style={{ color: '#EF4444' }}>
                          DOG_CONFIG_PRESENT: true (geometry only, not identity)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Warnings */}
                  {result.warnings && result.warnings.length > 0 && (
                    <div 
                      className="p-4 rounded-xl"
                      style={{ 
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                      }}
                    >
                      <p className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: '#F59E0B' }}>
                        <AlertTriangle size={16} />
                        Warnings
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.warnings.map((warning, idx) => (
                          <span 
                            key={idx}
                            className="text-xs px-2 py-1 rounded-full font-medium"
                            style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}
                          >
                            {warning}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pressure Breakdown */}
                  {result.pressure_breakdown && result.pressure_breakdown.length > 0 && (
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
                            {pv.amplifiers && pv.amplifiers.length > 0 && (
                              <p className="text-xs mb-1" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                                Amplifiers: {pv.amplifiers.join(', ')}
                              </p>
                            )}
                            {pv.observable_signals && pv.observable_signals.length > 0 && (
                              <p className="text-xs" style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}>
                                Signals: {pv.observable_signals.join(', ')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
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
              {/* Quick Reference */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                }}
              >
                <p className="text-sm font-medium mb-3" style={{ color: isDark ? '#fff' : '#111' }}>
                  Routing States
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }} />
                    <span style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                      <strong>EXIT-PRESERVED</strong> — Exits open
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                    <span style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                      <strong>EXIT-THREATENED</strong> — Exits narrowing
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                    <span style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                      <strong>EXIT-SEALED</strong> — Exits blocked
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6B7280' }} />
                    <span style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                      <strong>UNDETERMINED</strong> — Insufficient data
                    </span>
                  </div>
                </div>
              </div>

              {/* Index Thresholds */}
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                }}
              >
                <p className="text-sm font-medium mb-3" style={{ color: isDark ? '#fff' : '#111' }}>
                  Classification Thresholds
                </p>
                <div className="space-y-1 text-xs" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                  <p>Exit Integrity ≤ 25 → SEALED</p>
                  <p>Exit Integrity ≤ 55 → THREATENED</p>
                  <p>Exit Integrity > 55 → PRESERVED</p>
                  <p className="mt-2 pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    DOG_CONFIG if SEALED/THREATENED + Pressure ≥ 60
                  </p>
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
                            style={{ color: getRoutingColor(analysis.output_data?.routing?.state) }}
                          >
                            {analysis.output_data?.routing?.state || 'N/A'}
                          </span>
                          <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                            {analysis.created_at ? new Date(analysis.created_at).toLocaleDateString() : 'N/A'}
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
