/**
 * DDM (Dismissal Detection Model) Admin Page
 * 
 * Pattern detection tool for discernment purposes.
 * This is NOT an accusation system.
 * 
 * SECURITY: Restricted to Founder/Admin roles only.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Save,
  ChevronRight,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,
  BarChart3,
  FileText,
  Clock,
  User
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Feature labels for the 8-point scale
const FEATURES = [
  { key: 'f1_ignoring', label: 'F1: Ignoring', description: 'Disregarding without engagement', weight: 0.6 },
  { key: 'f2_deflection', label: 'F2: Deflection', description: 'Redirecting away from the point', weight: 0.7 },
  { key: 'f3_dismissal', label: 'F3: Dismissal', description: 'Active rejection without consideration', weight: 1.0 },
  { key: 'f4_invalidation', label: 'F4: Invalidation', description: 'Denying legitimacy of concern', weight: 1.1 },
  { key: 'f5_substitution', label: 'F5: Substitution', description: 'Replacing with preferred narrative', weight: 1.2 },
  { key: 'f6_zealotry', label: 'F6: Zealotry', description: 'Aggressive defense of position', weight: 1.2 },
  { key: 'f7_elimination', label: 'F7: Elimination', description: 'Attempting to remove/silence', weight: 1.4 },
  { key: 'f8_escalation_velocity', label: 'F8: Escalation Velocity', description: 'Speed of intensification', weight: 1.5 },
];

// Subject types
const SUBJECT_TYPES = [
  { value: 'person', label: 'Person' },
  { value: 'group', label: 'Group' },
  { value: 'platform', label: 'Platform' },
  { value: 'institution', label: 'Institution' },
  { value: 'unknown', label: 'Unknown' },
];

// Escalation ladder reference
const ESCALATION_LADDER = [
  '1. Ignoring',
  '2. Deflection',
  '3. Dismissal',
  '4. Invalidation',
  '5. Normalization',
  '6. Substitution',
  '7. Zealotry',
  '8. Elimination',
  '9. Death (theoretical)'
];

const DDMPage = () => {
  const { user, token } = useAuth();
  
  // Form state
  const [contextTitle, setContextTitle] = useState('');
  const [contextNotes, setContextNotes] = useState('');
  const [subjectType, setSubjectType] = useState('unknown');
  const [subjectRef, setSubjectRef] = useState('');
  const [truthClaim, setTruthClaim] = useState('');
  const [responseText, setResponseText] = useState('');
  const [features, setFeatures] = useState(
    Object.fromEntries(FEATURES.map(f => [f.key, 0]))
  );
  const [guardrailAck, setGuardrailAck] = useState(false);
  
  // Results state
  const [result, setResult] = useState(null);
  const [observations, setObservations] = useState([]);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [trend, setTrend] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('observe'); // observe | history | trend
  
  // Check role access
  const isSuperAdmin = user?.roles?.includes('super_admin') || user?.roles?.includes('admin') || user?.roles?.includes('founder');
  
  // Fetch observations
  const fetchObservations = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/ddm/observations?limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setObservations(data.observations || []);
      }
    } catch (err) {
      console.error('Failed to fetch observations:', err);
    }
  }, [token]);
  
  useEffect(() => {
    if (activeTab === 'history') {
      fetchObservations();
    }
  }, [activeTab, fetchObservations]);
  
  // Update feature score
  const updateFeature = (key, value) => {
    setFeatures(prev => ({ ...prev, [key]: parseFloat(value) }));
  };
  
  // Submit observation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!guardrailAck) {
      setError('You must acknowledge the discernment-only use before proceeding.');
      return;
    }
    
    if (!responseText.trim()) {
      setError('Response text is required.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/ddm/observe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          context_title: contextTitle || 'Untitled Observation',
          context_notes: contextNotes,
          subject_type: subjectType,
          subject_ref: subjectRef || null,
          truth_claim: truthClaim || null,
          response_text: responseText,
          features: features,
          guardrail_ack: guardrailAck
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.detail || 'Failed to create observation');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch trend for subject
  const fetchTrend = async () => {
    if (!subjectRef.trim()) {
      setError('Subject reference is required for trend analysis.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/ddm/subject/${encodeURIComponent(subjectRef)}/trend`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTrend(data.trend);
      } else {
        setError(data.detail || 'Failed to fetch trend');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Get band color
  const getBandColor = (band) => {
    switch (band) {
      case 'low': return 'text-green-400 bg-green-900/30 border-green-500';
      case 'med': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500';
      case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-500';
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-500';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500';
    }
  };
  
  // Access denied view
  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Access Denied</h2>
          <p className="text-red-400">
            DDM is restricted to Founder and Admin users only.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Disclaimer */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DDM Engine</h1>
              <p className="text-gray-400 text-sm">Dismissal Detection Model v1.0</p>
            </div>
          </div>
          
          {/* Critical Disclaimer Banner */}
          <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 font-medium mb-1">Pattern Detection Tool — Not an Accusation System</p>
                <p className="text-amber-300/80 text-sm">
                  DDM detects <strong>patterns</strong>, not guilt. All outputs are probabilistic and require 
                  falsifiable testing. This tool is for discernment purposes only and must never be used 
                  to label individuals as liars or make accusations.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4">
          <button
            onClick={() => setActiveTab('observe')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'observe' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            New Observation
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'history' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            History
          </button>
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'trend' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Trend Analysis
          </button>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {/* NEW OBSERVATION TAB */}
        {activeTab === 'observe' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Input Form */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                Observation Input
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Context Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Context Title</label>
                  <input
                    type="text"
                    value={contextTitle}
                    onChange={(e) => setContextTitle(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Brief title for this observation"
                  />
                </div>
                
                {/* Subject Type & Ref */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Subject Type</label>
                    <select
                      value={subjectType}
                      onChange={(e) => setSubjectType(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    >
                      {SUBJECT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Subject Reference</label>
                    <input
                      type="text"
                      value={subjectRef}
                      onChange={(e) => setSubjectRef(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                      placeholder="ID for trend tracking"
                    />
                  </div>
                </div>
                
                {/* Truth Claim (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Truth Claim <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={truthClaim}
                    onChange={(e) => setTruthClaim(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="The truth claim being evaluated"
                  />
                </div>
                
                {/* Response Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Response Text <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Paste the response/behavior being analyzed..."
                    required
                  />
                </div>
                
                {/* Context Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Context Notes</label>
                  <textarea
                    value={contextNotes}
                    onChange={(e) => setContextNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Additional context or observations..."
                  />
                </div>
                
                {/* Feature Sliders */}
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Feature Scores (0.0 - 1.0)
                  </h3>
                  <div className="space-y-3">
                    {FEATURES.map(feature => (
                      <div key={feature.key} className="group">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs text-gray-300">{feature.label}</label>
                          <span className="text-xs text-amber-400 font-mono">{features[feature.key].toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={features[feature.key]}
                          onChange={(e) => updateFeature(feature.key, e.target.value)}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                          {feature.description} (w: {feature.weight})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Guardrail Acknowledgment */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={guardrailAck}
                      onChange={(e) => setGuardrailAck(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-300">
                      I acknowledge this tool is for <strong className="text-amber-400">discernment only</strong> and 
                      will not be used to accuse, label, or publicly expose individuals. I understand all outputs 
                      are probabilistic pattern indicators.
                    </span>
                  </label>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !guardrailAck}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Analyze & Save Observation
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* Results Panel */}
            <div className="space-y-6">
              
              {/* LDI Score Display */}
              {result && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    Analysis Results
                  </h2>
                  
                  {/* LDI Score */}
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-amber-400 mb-2">
                      {result.ldi_score}
                    </div>
                    <p className="text-gray-400 text-sm">LDI Score (0-100)</p>
                    <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium border ${getBandColor(result.escalation_band)}`}>
                      {result.escalation_band.toUpperCase()} BAND
                    </div>
                  </div>
                  
                  {/* Confidence */}
                  <div className="bg-gray-800 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-400">Confidence</span>
                      <span className="text-sm text-amber-400">{(result.ldi_confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${result.ldi_confidence * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{result.uncertainty_note}</p>
                  </div>
                  
                  {/* Protected Variable */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Protected Variable Analysis</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.protected_variable).map(([key, value]) => (
                        <div key={key} className="bg-gray-800 rounded-lg p-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                            <span className="text-amber-400">{(value * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500/70 rounded-full"
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recommended Tests */}
                  <div className="border-t border-gray-800 pt-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Recommended Next Steps
                    </h3>
                    <ul className="space-y-2">
                      {result.recommended_tests.map((test, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                          <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          {test}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Status */}
                  <div className="mt-4 bg-amber-900/20 rounded-lg p-3 border border-amber-500/30">
                    <p className="text-sm text-amber-300">
                      <strong>Status:</strong> {result.status.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-amber-400/70 mt-1">{result.disclaimer}</p>
                  </div>
                </div>
              )}
              
              {/* Escalation Ladder Reference */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Escalation Ladder Reference
                </h2>
                <div className="space-y-2">
                  {ESCALATION_LADDER.map((step, idx) => (
                    <div 
                      key={idx} 
                      className={`px-3 py-2 rounded-lg text-sm ${
                        idx < 3 ? 'bg-green-900/20 text-green-300 border border-green-800' :
                        idx < 6 ? 'bg-yellow-900/20 text-yellow-300 border border-yellow-800' :
                        idx < 8 ? 'bg-orange-900/20 text-orange-300 border border-orange-800' :
                        'bg-red-900/20 text-red-300 border border-red-800'
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Escalation indicators are probabilistic. Movement up the ladder suggests intensifying 
                  defense patterns, but must be verified with falsifiable tests.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Observation History
            </h2>
            
            {observations.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No observations recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {observations.map(obs => (
                  <div 
                    key={obs.id}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700"
                    onClick={() => setSelectedObservation(obs)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{obs.context_title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBandColor(obs.escalation_band)}`}>
                        LDI: {obs.ldi_score}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {obs.subject_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(obs.created_at).toLocaleDateString()}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        obs.status === 'preliminary' ? 'bg-gray-700 text-gray-400' :
                        obs.status === 'verified' ? 'bg-green-900/50 text-green-400' :
                        obs.status === 'defense_likely' ? 'bg-red-900/50 text-red-400' :
                        'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {obs.status}
                      </span>
                    </div>
                    {obs.subject_ref && (
                      <p className="text-xs text-gray-600 mt-1">Ref: {obs.subject_ref}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* TREND TAB */}
        {activeTab === 'trend' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Trend Analysis
            </h2>
            
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                value={subjectRef}
                onChange={(e) => setSubjectRef(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                placeholder="Enter subject reference to analyze..."
              />
              <button
                onClick={fetchTrend}
                disabled={loading || !subjectRef.trim()}
                className="px-6 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Analyze
              </button>
            </div>
            
            {trend && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">Subject: {trend.subject_ref}</h3>
                  <p className="text-gray-400">{trend.trend_summary}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <span className="text-gray-500">Observations: {trend.observation_count}</span>
                    {trend.delta_ldi !== null && (
                      <span className={`font-medium ${
                        trend.delta_ldi > 0 ? 'text-red-400' : 
                        trend.delta_ldi < 0 ? 'text-green-400' : 
                        'text-gray-400'
                      }`}>
                        Δ LDI: {trend.delta_ldi > 0 ? '+' : ''}{trend.delta_ldi}
                      </span>
                    )}
                    {trend.trend_direction && (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        trend.trend_direction === 'escalating' ? 'bg-red-900/50 text-red-400' :
                        trend.trend_direction === 'de-escalating' ? 'bg-green-900/50 text-green-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {trend.trend_direction}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Time Series */}
                {trend.time_series && trend.time_series.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-3">Time Series</h3>
                    <div className="space-y-2">
                      {trend.time_series.map((entry, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                          <div>
                            <span className="text-sm text-gray-400">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                            {entry.note && (
                              <span className="text-xs text-gray-500 ml-2">— {entry.note}</span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-sm font-medium ${getBandColor(entry.escalation_band)}`}>
                            {entry.ldi_score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!trend && (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter a subject reference to view trend analysis.</p>
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default DDMPage;
