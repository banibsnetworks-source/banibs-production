import React, { useEffect, useState } from 'react';
import { Code, Plus, Edit, Trash2, ExternalLink, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';

function DevAppsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newApp, setNewApp] = useState({ name: '', description: '', redirect_url: '' });
  const [creating, setCreating] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState({});
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/apps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch apps');
      const data = await response.json();
      setApps(data.apps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createApp = async () => {
    if (!newApp.name.trim() || !newApp.description.trim() || !newApp.redirect_url.trim()) return;
    
    setCreating(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/apps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newApp)
      });

      if (!response.ok) throw new Error('Failed to create app');

      await fetchApps();
      setShowCreateModal(false);
      setNewApp({ name: '', description: '', redirect_url: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const deleteApp = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this app? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/apps/${appId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete app');
      await fetchApps();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleSecretVisibility = (appId) => {
    setVisibleSecrets(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  const maskSecret = (secret) => {
    return secret.substring(0, 20) + '•'.repeat(28);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900"><div className="text-white">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Code className="mr-3 text-[#39FF14]" size={40} />
              Applications
            </h1>
            <p className="text-gray-400">Manage your OAuth applications and integrations</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition"
          >
            <Plus className="mr-2" size={20} />
            Register App
          </button>
        </div>

        {/* Apps List */}
        {apps.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <Code className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-bold text-white mb-2">No Applications Yet</h3>
            <p className="text-gray-400 mb-6">Register your first application to integrate with BANIBS</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition"
            >
              Register Your First App
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {apps.map(app => (
              <div key={app.id} className="bg-gray-800/50 border border-[#39FF14]/20 rounded-lg p-6 hover:border-[#39FF14]/40 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-2xl font-bold text-white">{app.name}</h3>
                      <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                        app.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-gray-400">{app.description}</p>
                  </div>
                  <button
                    onClick={() => deleteApp(app.id)}
                    className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Client ID */}
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Client ID</label>
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                    <code className="text-[#39FF14] font-mono text-sm">{app.client_id}</code>
                    <button
                      onClick={() => copyToClipboard(app.client_id, `${app.id}-client-id`)}
                      className="p-2 hover:bg-gray-700 rounded transition"
                    >
                      {copiedField === `${app.id}-client-id` ? (
                        <Check className="text-green-400" size={16} />
                      ) : (
                        <Copy className="text-gray-400" size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Client Secret */}
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Client Secret</label>
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                    <code className="text-[#39FF14] font-mono text-sm">
                      {visibleSecrets[app.id] ? app.client_secret : maskSecret(app.client_secret)}
                    </code>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSecretVisibility(app.id)}
                        className="p-2 hover:bg-gray-700 rounded transition"
                      >
                        {visibleSecrets[app.id] ? <EyeOff className="text-gray-400" size={16} /> : <Eye className="text-gray-400" size={16} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(app.client_secret, `${app.id}-secret`)}
                        className="p-2 hover:bg-gray-700 rounded transition"
                      >
                        {copiedField === `${app.id}-secret` ? (
                          <Check className="text-green-400" size={16} />
                        ) : (
                          <Copy className="text-gray-400" size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Redirect URL */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Redirect URL</label>
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                    <a href={app.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                      {app.redirect_url}
                      <ExternalLink className="ml-2" size={14} />
                    </a>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Created: {new Date(app.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-gray-800 border border-[#39FF14]/30 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-6">Register Application</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">App Name *</label>
                  <input
                    type="text"
                    value={newApp.name}
                    onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                    placeholder="My BANIBS Integration"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Description *</label>
                  <textarea
                    value={newApp.description}
                    onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                    placeholder="Describe what your application does..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Redirect URL *</label>
                  <input
                    type="url"
                    value={newApp.redirect_url}
                    onChange={(e) => setNewApp({ ...newApp, redirect_url: e.target.value })}
                    placeholder="https://yourapp.com/callback"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/50"
                  />
                  <p className="text-xs text-gray-500 mt-1">OAuth callback URL for your application</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={createApp}
                  className="flex-1 px-4 py-3 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition disabled:opacity-50"
                  disabled={creating || !newApp.name.trim() || !newApp.description.trim() || !newApp.redirect_url.trim()}
                >
                  {creating ? 'Registering...' : 'Register App'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DevAppsPage;
