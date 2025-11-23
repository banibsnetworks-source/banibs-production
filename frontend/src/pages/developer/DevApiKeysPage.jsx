import React, { useEffect, useState } from 'react';
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react';

function DevApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState({});

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/api-keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch API keys');
      const data = await response.json();
      setApiKeys(data.api_keys);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyLabel.trim()) return;
    
    setCreating(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/api-keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ label: newKeyLabel })
      });

      if (!response.ok) throw new Error('Failed to create API key');

      await fetchApiKeys();
      setShowCreateModal(false);
      setNewKeyLabel('');
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete API key');
      await fetchApiKeys();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (key, keyId) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const maskKey = (key) => {
    return key.substring(0, 20) + '•'.repeat(20);
  };

  if (loading) {
    return <div className=\"flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900\"><div className=\"text-white\">Loading...</div></div>;
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900\">
      <div className=\"container mx-auto px-4 py-8\">
        {/* Header */}
        <div className=\"flex items-center justify-between mb-8\">
          <div>
            <h1 className=\"text-4xl font-bold text-white mb-2 flex items-center\">
              <Key className=\"mr-3 text-[#39FF14]\" size={40} />
              API Keys
            </h1>
            <p className=\"text-gray-400\">Manage your BANIBS API authentication keys</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className=\"flex items-center px-6 py-3 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition\"
          >
            <Plus className=\"mr-2\" size={20} />
            Create API Key
          </button>
        </div>

        {/* API Keys List */}
        {apiKeys.length === 0 ? (
          <div className=\"bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center\">
            <Key className=\"mx-auto text-gray-600 mb-4\" size={64} />
            <h3 className=\"text-xl font-bold text-white mb-2\">No API Keys Yet</h3>
            <p className=\"text-gray-400 mb-6\">Create your first API key to start building with BANIBS</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className=\"px-6 py-3 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition\"
            >
              Create Your First Key
            </button>
          </div>
        ) : (
          <div className=\"space-y-4\">
            {apiKeys.map(key => (
              <div key={key.id} className=\"bg-gray-800/50 border border-[#39FF14]/20 rounded-lg p-6 hover:border-[#39FF14]/40 transition\">
                <div className=\"flex items-start justify-between\">
                  <div className=\"flex-1\">
                    <div className=\"flex items-center mb-3\">
                      <h3 className=\"text-xl font-bold text-white\">{key.label}</h3>
                      <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        key.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {key.status}
                      </span>
                    </div>
                    
                    <div className=\"bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-3\">
                      <div className=\"flex items-center justify-between\">
                        <code className=\"text-[#39FF14] font-mono text-sm\">
                          {visibleKeys[key.id] ? key.api_key : maskKey(key.api_key)}
                        </code>
                        <div className=\"flex items-center space-x-2\">
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className=\"p-2 hover:bg-gray-700 rounded transition\"
                            title={visibleKeys[key.id] ? \"Hide key\" : \"Show key\"}
                          >
                            {visibleKeys[key.id] ? (
                              <EyeOff className=\"text-gray-400\" size={16} />
                            ) : (
                              <Eye className=\"text-gray-400\" size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(key.api_key, key.id)}
                            className=\"p-2 hover:bg-gray-700 rounded transition\"
                            title=\"Copy to clipboard\"
                          >
                            {copiedKey === key.id ? (
                              <Check className=\"text-green-400\" size={16} />
                            ) : (
                              <Copy className=\"text-gray-400\" size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className=\"flex items-center space-x-6 text-sm text-gray-400\">
                      <div>
                        <span className=\"text-gray-500\">Created:</span> {new Date(key.created_at).toLocaleDateString()}
                      </div>
                      {key.last_used && (
                        <div>
                          <span className=\"text-gray-500\">Last used:</span> {new Date(key.last_used).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteApiKey(key.id)}
                    className=\"ml-4 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition\"
                    title=\"Delete API key\"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className=\"fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50\" onClick={() => setShowCreateModal(false)}>
            <div className=\"bg-gray-800 border border-[#39FF14]/30 rounded-lg p-8 max-w-md w-full mx-4\" onClick={(e) => e.stopPropagation()}>
              <h2 className=\"text-2xl font-bold text-white mb-6\">Create API Key</h2>
              
              <div className=\"mb-6\">
                <label className=\"block text-sm font-semibold text-gray-300 mb-2\">
                  Key Label
                </label>
                <input
                  type=\"text\"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                  placeholder=\"e.g., Production API Key\"
                  className=\"w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/50\"
                  autoFocus
                />
              </div>

              <div className=\"bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6\">
                <p className=\"text-sm text-yellow-400\">
                  ⚠️ Store this key securely. You won't be able to see it again after creation.
                </p>
              </div>

              <div className=\"flex space-x-3\">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className=\"flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition\"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={createApiKey}
                  className=\"flex-1 px-4 py-3 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition disabled:opacity-50\"
                  disabled={creating || !newKeyLabel.trim()}
                >
                  {creating ? 'Creating...' : 'Create Key'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DevApiKeysPage;
