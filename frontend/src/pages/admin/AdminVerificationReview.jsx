import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Download, Eye, FileText, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * Admin Verification Review Dashboard - Phase 1A
 * Super_admin only: Review pending business verification submissions
 * Inline document preview with download option
 * Approve/Reject with notes
 */
const AdminVerificationReview = () => {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    fetchVerifications();
  }, [filterStatus]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/business/verification/admin/list?status=${filterStatus}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (verificationId, action) => {
    if (action === 'rejected' && !reviewNotes.trim()) {
      alert('Please provide rejection notes');
      return;
    }

    setReviewing(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/business/verification/admin/review/${verificationId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action,
            notes: reviewNotes.trim()
          })
        }
      );

      if (response.ok) {
        alert(`✓ Verification ${action === 'verified' ? 'approved' : 'rejected'} successfully`);
        setSelectedVerification(null);
        setReviewNotes('');
        fetchVerifications();
      } else {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = {};
        }
        alert(`Error: ${errorData.detail || 'Failed to process review'}`);
      }
    } catch (error) {
      console.error('Review error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setReviewing(false);
    }
  };

  const handleDownloadDocument = async (verificationId, docIndex) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/business/verification/admin/document/${verificationId}/${docIndex}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document_${docIndex + 1}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download document');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Check if user is super_admin
  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Access Denied</h2>
          <p className="text-red-400">
            This page is restricted to super_admin users only.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <span className="ml-4 text-gray-400">Loading verifications...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-white">Business Verification Review</h1>
          </div>
          <p className="text-gray-400">Review and approve business verification submissions</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              filterStatus === 'pending'
                ? 'border-yellow-500 text-yellow-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Pending ({verifications.filter(v => v.verification_status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              filterStatus === 'verified'
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Verified
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              filterStatus === 'rejected'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <XCircle className="w-4 h-4 inline mr-2" />
            Rejected
          </button>
        </div>

        {/* Verifications List */}
        {verifications.length === 0 ? (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Verifications Found</h3>
            <p className="text-gray-500">
              {filterStatus === 'pending' 
                ? 'No pending verifications to review'
                : `No ${filterStatus} verifications`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {verifications.map((verification) => (
              <div 
                key={verification.business_id}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {verification.business_name || `Business ${verification.business_id}`}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Business ID: {verification.business_id}
                    </p>
                    <p className="text-sm text-gray-400">
                      Submitted: {new Date(verification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    verification.verification_status === 'verified' 
                      ? 'bg-green-500/20 text-green-400'
                      : verification.verification_status === 'rejected'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {verification.verification_status.toUpperCase()}
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-3 mb-4">
                  <h4 className="text-sm font-semibold text-gray-300">Uploaded Documents:</h4>
                  {verification.documents && verification.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-800 rounded p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-white font-medium">{doc.type}</div>
                          <div className="text-xs text-gray-400">
                            Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {doc.ai_confidence && (
                          <span className="text-xs text-gray-400 mr-2">
                            Confidence: {Math.round(doc.ai_confidence * 100)}%
                          </span>
                        )}
                        <button
                          onClick={() => handleDownloadDocument(verification.business_id, idx)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Download Document"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Review Actions (only for pending) */}
                {verification.verification_status === 'pending' && (
                  <div className="border-t border-gray-800 pt-4">
                    <textarea
                      value={selectedVerification === verification.business_id ? reviewNotes : ''}
                      onChange={(e) => {
                        setSelectedVerification(verification.business_id);
                        setReviewNotes(e.target.value);
                      }}
                      placeholder="Add review notes (required for rejection)..."
                      className="w-full bg-gray-800 text-white rounded-lg p-3 mb-3 text-sm border border-gray-700 focus:border-yellow-500 focus:outline-none"
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReview(verification.business_id, 'verified')}
                        disabled={reviewing}
                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {reviewing ? 'Processing...' : 'Approve Verification'}
                      </button>
                      <button
                        onClick={() => handleReview(verification.business_id, 'rejected')}
                        disabled={reviewing}
                        className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        {reviewing ? 'Processing...' : 'Reject Verification'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin Notes (for rejected) */}
                {verification.verification_status === 'rejected' && verification.admin_notes && (
                  <div className="border-t border-gray-800 pt-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Rejection Notes:</h4>
                    <p className="text-sm text-gray-400 bg-gray-800 rounded p-3">
                      {verification.admin_notes}
                    </p>
                  </div>
                )}

                {/* Verification Details (for verified) */}
                {verification.verification_status === 'verified' && verification.verified_at && (
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified on {new Date(verification.verified_at).toLocaleDateString()}</span>
                    </div>
                    {verification.expires_at && (
                      <div className="text-sm text-gray-400 mt-1">
                        Valid until {new Date(verification.expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationReview;
