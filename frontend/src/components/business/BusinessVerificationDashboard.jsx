import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, Clock, FileText, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * Business Verification Dashboard
 * Owner uploads verification documents
 * View status and expiration
 */
const BusinessVerificationDashboard = ({ businessId }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('LLC');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchVerificationStatus();
  }, [businessId]);

  const fetchVerificationStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/business/verification/status/${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Maximum size: 10MB');
        return;
      }
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('business_id', businessId);
      formData.append('doc_type', docType);

      const response = await fetch(
        `${BACKEND_URL}/api/business/verification/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (response.ok) {
        setUploadSuccess(true);
        setSelectedFile(null);
        // Refresh status
        setTimeout(fetchVerificationStatus, 1000);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;

    const badges = {
      'not_started': {
        icon: AlertCircle,
        text: 'Not Verified',
        color: 'bg-gray-100 text-gray-700'
      },
      'pending': {
        icon: Clock,
        text: 'Pending Review',
        color: 'bg-yellow-100 text-yellow-700'
      },
      'verified': {
        icon: CheckCircle,
        text: 'Verified Business',
        color: 'bg-green-100 text-green-700'
      },
      'rejected': {
        icon: XCircle,
        text: 'Rejected',
        color: 'bg-red-100 text-red-700'
      }
    };

    const badge = badges[status.status] || badges['not_started'];
    const Icon = badge.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${badge.color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{badge.text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading verification status...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Business Verification</h2>
          {getStatusBadge()}
        </div>

        {/* Status Details */}
        {status && status.is_verified && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">Your Business is Verified!</h3>
                <p className="text-sm text-green-700">
                  Verified on {new Date(status.verified_at).toLocaleDateString()}
                </p>
                {status.expires_at && (
                  <p className="text-sm text-green-700 mt-1">
                    Expires on {new Date(status.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {status && status.status === 'rejected' && status.rejection_reason && (
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Verification Rejected</h3>
                <p className="text-sm text-red-700">{status.rejection_reason}</p>
                <p className="text-sm text-red-600 mt-2">Please upload corrected documents below.</p>
              </div>
            </div>
          </div>
        )}

        {status && status.status === 'pending' && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">Under Review</h3>
                <p className="text-sm text-yellow-700">
                  Your verification documents are being reviewed by our team. 
                  You'll be notified when the review is complete.
                </p>
                <p className="text-sm text-yellow-600 mt-2">
                  Documents uploaded: {status.documents_uploaded}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Verification Documents</h3>
          
          <div className="space-y-4">
            {/* Document Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="LLC">LLC Certificate</option>
                <option value="EIN">EIN Document</option>
                <option value="STATE_LICENSE">State Business License</option>
                <option value="BUSINESS_LICENSE">Business License</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Document
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex-1">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.heic,.heif"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-500 cursor-pointer transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload Document</span>
                </>
              )}
            </button>

            {uploadSuccess && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center">
                ✓ Document uploaded successfully!
              </div>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">What documents do I need?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Business registration (LLC, Corporation, etc.)</li>
              <li>• EIN/Tax ID documentation</li>
              <li>• State or local business license</li>
              <li>• Any other official business documentation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessVerificationDashboard;
