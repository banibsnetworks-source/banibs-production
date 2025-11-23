import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import DiasporaLayout from '../../components/diaspora/DiasporaLayout';
import DiasporaSnapshotSummary from '../../components/diaspora/DiasporaSnapshotSummary';
import { User, Globe, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

/**
 * DiasporaSnapshotPage - Phase 12.0
 * Page for users to create/view their diaspora snapshot
 */
const DiasporaSnapshotPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const [regions, setRegions] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    current_region_id: '',
    origin_region_id: '',
    aspiration_region_id: ''
  });
  
  // Fetch regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const response = await axios.get(`${BACKEND_URL}/api/diaspora/regions`);
        setRegions(response.data.regions || []);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };
    fetchRegions();
  }, []);
  
  // Fetch existing snapshot if user is logged in
  useEffect(() => {
    const fetchSnapshot = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${BACKEND_URL}/api/diaspora/snapshot/${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSnapshot(response.data);
        setFormData({
          current_region_id: response.data.current_region_id || '',
          origin_region_id: response.data.origin_region_id || '',
          aspiration_region_id: response.data.aspiration_region_id || ''
        });
      } catch (error) {
        // 404 is expected if no snapshot exists
        if (error.response?.status !== 404) {
          console.error('Error fetching snapshot:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSnapshot();
  }, [user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${BACKEND_URL}/api/diaspora/snapshot`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSnapshot(response.data);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving snapshot:', err);
      setError(err.response?.data?.detail || 'Failed to save snapshot. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <DiasporaLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
            }}
          >
            <User size={24} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Diaspora Snapshot</h1>
            <p className="text-muted-foreground">Share your personal diaspora context</p>
          </div>
        </div>
        
        {/* Intro */}
        <div
          className="p-6 rounded-xl mb-6"
          style={{
            background: isDark ? 'rgba(180, 130, 50, 0.06)' : 'rgba(180, 130, 50, 0.04)',
            border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.12)'}`,
          }}
        >
          <p className="text-muted-foreground">
            Your diaspora snapshot captures your unique place in the global Black family. 
            Where you are now, where your people come from, and where you dream of going—these 
            details tell your story and connect you to millions of others on similar journeys.
          </p>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-amber-600" />
        </div>
      )}
      
      {/* Not logged in state */}
      {!loading && !user && (
        <div
          className="p-8 rounded-xl text-center"
          style={{
            background: isDark ? 'rgba(180, 130, 50, 0.06)' : 'rgba(180, 130, 50, 0.04)',
            border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.12)'}`,
          }}
        >
          <Globe size={48} className="mx-auto mb-4 text-amber-600" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Sign in to create your snapshot</h3>
          <p className="text-muted-foreground">
            Create an account to save your personal diaspora context and connect with others.
          </p>
        </div>
      )}
      
      {/* Form (logged in) */}
      {!loading && user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success message */}
              {success && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your snapshot has been saved successfully!
                  </p>
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              
              {/* Current Region */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Globe size={14} className="inline mr-1" />
                  Where I Am Now *
                </label>
                <select
                  value={formData.current_region_id}
                  onChange={(e) => setFormData({ ...formData, current_region_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">Select your current region...</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Origin Region */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Globe size={14} className="inline mr-1" />
                  Where My People Come From (as far as I know)
                </label>
                <select
                  value={formData.origin_region_id}
                  onChange={(e) => setFormData({ ...formData, origin_region_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select origin region...</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Aspiration Region */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Globe size={14} className="inline mr-1" />
                  Where I'd Like to Visit or Live
                </label>
                <select
                  value={formData.aspiration_region_id}
                  onChange={(e) => setFormData({ ...formData, aspiration_region_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select aspiration region...</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Saving...' : snapshot ? 'Update Snapshot' : 'Save Snapshot'}
              </button>
            </form>
          </div>
          
          {/* Summary (if snapshot exists) */}
          {snapshot && (
            <div>
              <DiasporaSnapshotSummary snapshot={snapshot} />
            </div>
          )}
        </div>
      )}
    </DiasporaLayout>
  );
};

export default DiasporaSnapshotPage;
