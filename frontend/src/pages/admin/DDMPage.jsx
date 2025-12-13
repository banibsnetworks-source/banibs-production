/**
 * DDM (Dismissal Detection Model) Admin Page v1.2
 * EXPANDED SPECIFICATION
 * 
 * Pattern detection tool for discernment purposes.
 * This is NOT an accusation system.
 * 
 * PRIME DIRECTIVES:
 * D0. Pattern Detection Only - Never accuses
 * D1. Guardrails Enforced by Code - Finalize requires tests
 * D2. Default Private/Internal - Admin-only
 * D3. Apply Inward First - "Self" is default
 * D4. Safety Copy Required - Disclaimers everywhere
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
  User,
  Download,
  Lock,
  Unlock,
  AlertCircle,
  Heart
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

// Subject types - "self" is FIRST for inward-first principle (D3)
const SUBJECT_TYPES = [
  { value: 'self', label: '🪞 Self (My Response)', description: 'Analyze my own patterns first' },
  { value: 'person', label: 'Person' },
  { value: 'group', label: 'Group' },
  { value: 'platform', label: 'Platform' },
  { value: 'institution', label: 'Institution' },
  { value: 'unknown', label: 'Unknown' },
];

// Response sources
const RESPONSE_SOURCES = [
  { value: 'spoken', label: 'Spoken' },
  { value: 'written', label: 'Written' },
  { value: 'social_post', label: 'Social Post' },
  { value: 'policy', label: 'Policy' },
  { value: 'media', label: 'Media' },
  { value: 'other', label: 'Other' },
];

// Escalation ladder reference (LOCKED CANON)
const ESCALATION_LADDER = [
  { stage: 1, name: 'Ignoring', color: 'bg-green-900/30 text-green-300 border-green-700' },
  { stage: 2, name: 'Deflection', color: 'bg-green-900/30 text-green-300 border-green-700' },
  { stage: 3, name: 'Dismissal', color: 'bg-yellow-900/30 text-yellow-300 border-yellow-700' },
  { stage: 4, name: 'Invalidation', color: 'bg-yellow-900/30 text-yellow-300 border-yellow-700' },
  { stage: 5, name: 'Normalization', color: 'bg-orange-900/30 text-orange-300 border-orange-700' },
  { stage: 6, name: 'Substitution', color: 'bg-orange-900/30 text-orange-300 border-orange-700' },
  { stage: 7, name: 'Zealotry', color: 'bg-red-900/30 text-red-300 border-red-700' },
  { stage: 8, name: 'Elimination', color: 'bg-red-900/30 text-red-300 border-red-700' },
  { stage: 9, name: 'Death ⚠️', color: 'bg-red-950/50 text-red-200 border-red-500', locked: true },
];

// Test descriptions
const TEST_DESCRIPTIONS = {
  context_tolerance: {
    name: 'Context Tolerance Test',
    question: 'Does the response vary appropriately in different contexts?',
    passHint: 'Response adjusts based on situation',
    failHint: 'Same rigid response regardless of context'
  },
  symmetry: {
    name: 'Symmetry Test',
    question: 'Is the same standard applied equally to all parties?',
    passHint: 'Equal treatment across subjects',
    failHint: 'Different standards for different parties'
  },
  clarification: {
    name: 'Clarification Test',
    question: 'Does new information change the position?',
    passHint: 'Position updates with new evidence',
    failHint: 'Nothing would change the view'
  }
};

const DDMPage = () => {
  const { user, token } = useAuth();
  
  // Form state
  const [contextTitle, setContextTitle] = useState('');
  const [contextNotes, setContextNotes] = useState('');
  const [locationTag, setLocationTag] = useState('');
  const [subjectType, setSubjectType] = useState('self'); // D3: Inward-first default
  const [subjectRef, setSubjectRef] = useState('');
  const [subjectDisplayName, setSubjectDisplayName] = useState('');
  const [truthClaim, setTruthClaim] = useState('');
  const [responseText, setResponseText] = useState('');
  const [responseSource, setResponseSource] = useState('other');
  const [features, setFeatures] = useState(
    Object.fromEntries(FEATURES.map(f => [f.key, 0]))
  );
  const [guardrailAck, setGuardrailAck] = useState(false);
  const [stage9Confirmation, setStage9Confirmation] = useState(false);
  
  // Results state
  const [result, setResult] = useState(null);
  const [observations, setObservations] = useState([]);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [trend, setTrend] = useState(null);
  
  // Test panel state
  const [testResults, setTestResults] = useState({
    context_tolerance: { result: 'unknown', notes: '' },
    symmetry: { result: 'unknown', notes: '' },
    clarification: { result: 'unknown', notes: '' }
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('observe'); // observe | history | trend | tests
  const [showInwardReminder, setShowInwardReminder] = useState(false);
  
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
  
  // D3: Show inward-first reminder when selecting non-self subject
  useEffect(() => {
    if (subjectType !== 'self' && !showInwardReminder) {
      setShowInwardReminder(true);
    }
  }, [subjectType, showInwardReminder]);
  
  // Submit observation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!guardrailAck) {
      setError('D1 Guardrail: You must acknowledge this is for discernment only before proceeding.');
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
          location_tag: locationTag || null,
          subject_type: subjectType,
          subject_ref: subjectRef || null,
          subject_display_name: subjectDisplayName || null,
          truth_claim: truthClaim || null,
          response_text: responseText,
          response_source: responseSource,
          features: features,
          status: 'preliminary',
          visibility: 'admin_only',
          guardrail_ack: guardrailAck,
          stage_9_explicit_confirmation: stage9Confirmation
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        // Show inward reminder if analyzing others
        if (data.inward_first_reminder) {
          setShowInwardReminder(true);
        }
      } else {
        setError(data.detail || 'Failed to create observation');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Update tests on observation
  const handleUpdateTests = async () => {
    if (!result?.id) {
      setError('No observation selected');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/ddm/observation/${result.id}/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tests: testResults,
          guardrail_ack: guardrailAck,
          set_status: 'preliminary'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(prev => ({ ...prev, status: data.status }));
        alert('Tests updated successfully');
      } else {
        setError(data.detail || 'Failed to update tests');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Finalize observation
  const handleFinalize = async () => {
    if (!result?.id) return;
    
    const completedTests = Object.values(testResults).filter(t => t.result !== 'unknown').length;
    if (completedTests < 1) {
      setError('D1 Guardrail: At least 1 falsifiable test must be completed to finalize.');
      return;
    }
    
    if (!guardrailAck) {
      setError('D1 Guardrail: Must acknowledge discernment-only use to finalize.');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/ddm/observation/${result.id}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          guardrail_ack: true,
          final_notes: null
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(prev => ({ ...prev, status: 'finalized' }));
        alert('Observation finalized successfully');
      } else {
        setError(data.detail || 'Failed to finalize');
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
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500';
      case 'high': return 'text-orange-400 bg-orange-900/30 border-orange-500';
      case 'critical': return 'text-red-400 bg-red-900/30 border-red-500';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500';
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-700 text-gray-300';
      case 'preliminary': return 'bg-amber-900/50 text-amber-300';
      case 'finalized': return 'bg-blue-900/50 text-blue-300';
      default: return 'bg-gray-700 text-gray-400';
    }
  };
  
  // Access denied view
  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Access Denied (D2)</h2>
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
        
        {/* Header with Prime Directive Badge */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">DDM Engine</h1>
              <p className="text-gray-400 text-sm">Dismissal Detection Model v1.2</p>
            </div>
            <div className="ml-auto flex gap-2">
              <span className="px-2 py-1 text-xs bg-amber-900/30 text-amber-400 rounded border border-amber-700">D0: Pattern Only</span>
              <span className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded border border-blue-700">D1: Guardrails</span>
              <span className="px-2 py-1 text-xs bg-purple-900/30 text-purple-400 rounded border border-purple-700">D3: Inward First</span>
            </div>
          </div>
          
          {/* Critical Disclaimer Banner (D4) */}
          <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 font-medium mb-1">Pattern Detection Tool — Not an Accusation System</p>
                <p className="text-amber-300/80 text-sm">
                  DDM is a pattern-detection tool. It does <strong>not</strong> determine guilt, intent, or moral worth. 
                  All outputs are probabilistic and require falsifiable testing. Never use DDM to label anyone as 
                  "liar," "guilty," or "evil."
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Inward-First Reminder (D3) */}
        {showInwardReminder && subjectType !== 'self' && (
          <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-purple-200 font-medium mb-1">D3 Reminder: Apply Inward First</p>
                <p className="text-purple-300/80 text-sm">
                  Before analyzing others, consider: Could any of these patterns describe <strong>your own</strong> responses too? 
                  Self-examination helps prevent weaponization of this tool.
                </p>
                <button 
                  onClick={() => setShowInwardReminder(false)}
                  className="text-xs text-purple-400 hover:text-purple-300 mt-2"
                >
                  Dismiss reminder
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4 overflow-x-auto">
          {[
            { id: 'observe', icon: Eye, label: 'New Observation' },
            { id: 'tests', icon: CheckCircle, label: 'Falsifiable Tests' },
            { id: 'history', icon: FileText, label: 'History' },
            { id: 'trend', icon: TrendingUp, label: 'Trend Analysis' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
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
                    maxLength={140}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Brief title for this observation"
                  />
                </div>
                
                {/* Subject Type & Ref */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Subject Type
                      {subjectType === 'self' && <span className="ml-2 text-purple-400 text-xs">(D3 ✓)</span>}
                    </label>
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
                      maxLength={140}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                      placeholder="ID for trend tracking"
                    />
                  </div>
                </div>
                
                {/* Response Source */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Response Source</label>
                    <select
                      value={responseSource}
                      onChange={(e) => setResponseSource(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                    >
                      {RESPONSE_SOURCES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Location/Platform Tag</label>
                    <input
                      type="text"
                      value={locationTag}
                      onChange={(e) => setLocationTag(e.target.value)}
                      maxLength={80}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                      placeholder="e.g., Twitter, Meeting"
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
                
                {/* D1 Guardrail Acknowledgment */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={guardrailAck}
                      onChange={(e) => setGuardrailAck(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-300">
                      <strong className="text-amber-400">D1 Guardrail:</strong> I acknowledge this tool is for 
                      <strong className="text-amber-400"> discernment only</strong>. I will not use it to accuse, 
                      label, or publicly expose anyone. I understand all outputs are probabilistic pattern indicators.
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
                      Analyze & Save (Preliminary)
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
                    <span className={`ml-auto text-xs px-2 py-1 rounded ${getStatusBadge(result.status)}`}>
                      {result.status?.toUpperCase()}
                    </span>
                  </h2>
                  
                  {/* LDI Score */}
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-amber-400 mb-2">
                      {Math.round(result.ldi_100)}
                    </div>
                    <p className="text-gray-400 text-sm">LDI Score (0-100)</p>
                    <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium border ${getBandColor(result.band)}`}>
                      {result.band?.toUpperCase()} BAND
                    </div>
                    {result.escalation_stage_observed && (
                      <div className="mt-2 text-sm text-gray-400">
                        Observed Stage: {result.escalation_stage_observed}
                      </div>
                    )}
                  </div>
                  
                  {/* Confidence */}
                  <div className="bg-gray-800 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-400">Confidence</span>
                      <span className="text-sm text-amber-400">{Math.round((result.confidence || 0) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${(result.confidence || 0) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{result.uncertainty_note}</p>
                  </div>
                  
                  {/* Protected Variable */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Protected Variable Analysis</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {result.protected_variable && Object.entries(result.protected_variable).map(([key, value]) => (
                        key !== 'user_override' && (
                          <div key={key} className="bg-gray-800 rounded-lg p-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                              <span className="text-amber-400">{Math.round((value || 0) * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500/70 rounded-full"
                                style={{ width: `${(value || 0) * 100}%` }}
                              />
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                  
                  {/* Recommended Next Test */}
                  <div className="border-t border-gray-800 pt-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Recommended Next Step
                    </h3>
                    <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700">
                      <p className="text-sm text-blue-300">
                        {result.recommended_next_test === 'all_complete' 
                          ? 'All falsifiable tests completed'
                          : `Run ${TEST_DESCRIPTIONS[result.recommended_next_test]?.name || result.recommended_next_test}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* D4 Disclaimer */}
                  <div className="mt-4 bg-amber-900/20 rounded-lg p-3 border border-amber-500/30">
                    <p className="text-xs text-amber-400/70">{result.disclaimer}</p>
                  </div>
                </div>
              )}
              
              {/* Escalation Ladder Reference */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Escalation Ladder (Locked Canon)
                </h2>
                <div className="space-y-2">
                  {ESCALATION_LADDER.map((step) => (
                    <div 
                      key={step.stage} 
                      className={`px-3 py-2 rounded-lg text-sm border ${step.color} flex items-center justify-between`}
                    >
                      <span>{step.stage}. {step.name}</span>
                      {step.locked && <Lock className="w-4 h-4" title="Requires explicit confirmation" />}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Stage 9 cannot be auto-inferred. Requires explicit user confirmation.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* FALSIFIABLE TESTS TAB */}
        {activeTab === 'tests' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-amber-400" />
              Falsifiable Tests (D1 Requirement)
            </h2>
            
            {!result?.id ? (
              <div className="text-center py-12 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Create an observation first to run tests.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-amber-300 bg-amber-900/20 rounded-lg p-3 border border-amber-700">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  D1 Guardrail: At least 1 test must be completed (pass/fail) to finalize. 
                  Otherwise, observation remains "Preliminary."
                </p>
                
                {Object.entries(TEST_DESCRIPTIONS).map(([key, test]) => (
                  <div key={key} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h3 className="font-medium text-white mb-2">{test.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{test.question}</p>
                    
                    <div className="flex gap-2 mb-3">
                      {['pass', 'fail', 'unknown'].map(result => (
                        <button
                          key={result}
                          onClick={() => setTestResults(prev => ({
                            ...prev,
                            [key]: { ...prev[key], result }
                          }))}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            testResults[key]?.result === result
                              ? result === 'pass' 
                                ? 'bg-green-600 text-white' 
                                : result === 'fail'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-600 text-white'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          {result === 'pass' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                          {result === 'fail' && <XCircle className="w-4 h-4 inline mr-1" />}
                          {result === 'unknown' && <HelpCircle className="w-4 h-4 inline mr-1" />}
                          {result.charAt(0).toUpperCase() + result.slice(1)}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-4 text-xs text-gray-500 mb-3">
                      <span className="text-green-400">✓ Pass: {test.passHint}</span>
                      <span className="text-red-400">✗ Fail: {test.failHint}</span>
                    </div>
                    
                    <textarea
                      value={testResults[key]?.notes || ''}
                      onChange={(e) => setTestResults(prev => ({
                        ...prev,
                        [key]: { ...prev[key], notes: e.target.value }
                      }))}
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                      placeholder="Test notes..."
                    />
                  </div>
                ))}
                
                <div className="flex gap-4">
                  <button
                    onClick={handleUpdateTests}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Tests (Stay Preliminary)
                  </button>
                  
                  <button
                    onClick={handleFinalize}
                    disabled={loading || Object.values(testResults).every(t => t.result === 'unknown')}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Finalize Observation
                  </button>
                </div>
              </div>
            )}
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
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBandColor(obs.escalation_band)}`}>
                          LDI: {Math.round(obs.ldi_100)}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadge(obs.status)}`}>
                          {obs.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {obs.subject_type}
                        {obs.subject_type === 'self' && <span className="text-purple-400">(D3)</span>}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(obs.created_at).toLocaleDateString()}
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
              Trend Analysis (ΔLDI/Δt)
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
                Analyze Trend
              </button>
            </div>
            
            {trend && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-white mb-2">Subject: {trend.subject_ref}</h3>
                  <p className="text-gray-400">{trend.trend_summary}</p>
                  <div className="flex gap-4 mt-3 text-sm flex-wrap">
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
                    {trend.delta_ldi_per_day !== null && (
                      <span className="text-gray-500">
                        ({trend.delta_ldi_per_day > 0 ? '+' : ''}{trend.delta_ldi_per_day}/day)
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
                              {new Date(entry.ts).toLocaleDateString()}
                            </span>
                            {entry.note && (
                              <span className="text-xs text-gray-500 ml-2">— {entry.note}</span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-sm font-medium ${getBandColor(entry.escalation_band)}`}>
                            {Math.round(entry.ldi_100)}
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
