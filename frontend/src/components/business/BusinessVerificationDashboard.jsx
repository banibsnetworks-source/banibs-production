import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, Clock, FileText, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const DOCUMENT_TYPES = [
  { value: 'EIN', label: 'EIN (Tax ID) Document' },
  { value: 'BUSINESS_LICENSE', label: 'Business License' },
  { value: 'REGISTRATION', label: 'Business Registration Certificate' },
];

/**
 * Business Verification Dashboard - Phase 1A
 * Allows business owners to upload verification documents
 * View status, uploaded documents, and admin feedback
 */
const BusinessVerificationDashboard = ({ businessId }) => {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    if (businessId) {
      fetchVerificationStatus();
    }
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
        setVerification(data);
      } else if (response.status === 404) {
        // No verification record yet
        setVerification({ verification_status: 'not_started', documents: [] });
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (docType, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check file sizes
    const oversized = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      alert('Some files are too large. Maximum size: 10MB per file');
      return;
    }

    setSelectedFiles(prev => ({
      ...prev,
      [docType]: files
    }));
    setUploadMessage('');
  };

  const handleUpload = async (docType) => {
    const files = selectedFiles[docType];
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadMessage('');

    try {
      const token = localStorage.getItem('access_token');
      
      // Upload each file
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', docType);

        const response = await fetch(
          `${BACKEND_URL}/api/business/verification/${businessId}/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          }
        );

        if (!response.ok) {
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = {};
          }
          throw new Error(errorData.detail || `Failed to upload ${file.name}`);
        }
      }

      setUploadMessage(`✓ ${files.length} file(s) uploaded successfully!`);
      setSelectedFiles(prev => ({ ...prev, [docType]: [] }));
      
      // Refresh verification status
      setTimeout(fetchVerificationStatus, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage(`✗ ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = () => {
    if (!verification) return null;

    const status = verification.verification_status || 'not_started';
    
    const badges = {
      'not_started': {
        icon: AlertCircle,
        text: 'Not Verified',
        color: 'bg-gray-100 text-gray-700 border border-gray-300'
      },
      'pending': {
        icon: Clock,
        text: 'Pending Review',
        color: 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      },
      'verified': {
        icon: CheckCircle,
        text: 'Verified Business',
        color: 'bg-green-50 text-green-700 border border-green-200'
      },
      'rejected': {
        icon: XCircle,
        text: 'Verification Rejected',
        color: 'bg-red-50 text-red-700 border border-red-200'
      }
    };

    const badge = badges[status] || badges['not_started'];
    const Icon = badge.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${badge.color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{badge.text}</span>
      </div>
    );
  };

  const getDocumentsByType = (docType) => {
    if (!verification || !verification.documents) return [];
    return verification.documents.filter(doc => doc.type === docType);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          <span className="ml-3 text-gray-500">Loading verification status...</span>
        </div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          Unable to load verification status. Please try again later.
        </div>
      </div>
    );
  }

  const status = verification.verification_status || 'not_started';

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Business Verification</h2>
          {getStatusBadge()}
        </div>

        {/* Verified Status */}
        {status === 'verified' && verification.verified_at && (
          <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">✓ Your Business is Verified!</h3>
                <p className="text-sm text-green-700">
                  Verified on {new Date(verification.verified_at).toLocaleDateString()}
                </p>
                {verification.expires_at && (
                  <p className="text-sm text-green-700 mt-1">
                    Valid until {new Date(verification.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rejected Status */}
        {status === 'rejected' && verification.admin_notes && (
          <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
            <div className="flex items-start space-x-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Verification Rejected</h3>
                <p className="text-sm text-red-700 mb-2">{verification.admin_notes}</p>
                <p className="text-sm text-red-600">Please upload corrected documents below.</p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Status */}
        {status === 'pending' && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-200">
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-1">Under Review</h3>
                <p className="text-sm text-yellow-700">
                  Your verification documents are being reviewed by our admin team. 
                  You'll be notified when the review is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Sections */}
        <div className="border-t border-gray-200 pt-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Upload Verification Documents</h3>
          
          {DOCUMENT_TYPES.map((docType) => {
            const uploadedDocs = getDocumentsByType(docType.value);
            const selectedFilesForType = selectedFiles[docType.value] || [];

            return (
              <div key={docType.value} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{docType.label}</h4>
                  <span className="text-sm text-gray-500">
                    {uploadedDocs.length} file(s) uploaded
                  </span>
                </div>

                {/* Uploaded Documents */}
                {uploadedDocs.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {uploadedDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            Document uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                        {doc.ai_confidence && (
                          <span className="text-xs text-gray-500">
                            Confidence: {Math.round(doc.ai_confidence * 100)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* File Upload */}
                <div className="space-y-3">
                  <label className="block">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.heic,.heif"
                      multiple
                      onChange={(e) => handleFileSelect(docType.value, e)}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-500 cursor-pointer transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {selectedFilesForType.length > 0 
                          ? `${selectedFilesForType.length} file(s) selected`
                          : 'Click to select files or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, JPG, PNG up to 10MB (multiple files allowed)
                      </p>
                    </div>
                  </label>

                  {selectedFilesForType.length > 0 && (
                    <>
                      <div className="space-y-1">
                        {selectedFilesForType.map((file, idx) => (
                          <div key={idx} className="text-sm text-gray-600 flex items-center justify-between">
                            <span>• {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleUpload(docType.value)}
                        disabled={uploading}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Upload {selectedFilesForType.length} File(s)</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Upload Message */}
          {uploadMessage && (
            <div className={`p-3 rounded-lg text-sm text-center ${
              uploadMessage.startsWith('✓') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {uploadMessage}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 text-sm mb-2">📄 Required Documents</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>EIN Document:</strong> Federal Tax ID documentation</li>
              <li>• <strong>Business License:</strong> State or local business license</li>
              <li>• <strong>Registration Certificate:</strong> LLC, Corporation, or DBA registration</li>
              <li className="mt-2 text-xs text-blue-600">💡 You can upload multiple files per document type</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessVerificationDashboard;
