import React, { useEffect, useState } from 'react';
import { Webhook, Plus, Trash2, Zap } from 'lucide-react';

function DevWebhooksPage() {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] });
  const [creating, setCreating] = useState(false);

  const availableEvents = [
    'user.created', 'user.updated', 'business.created', 'business.updated',
    'campaign.created', 'campaign.funded', 'transaction.created',
    'post.created', 'post.liked'
  ];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/webhooks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      const data = await response.json();
      setWebhooks(data.webhooks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    if (!newWebhook.url.trim() || newWebhook.events.length === 0) return;
    
    setCreating(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWebhook)
      });

      if (!response.ok) throw new Error('Failed to create webhook');

      await fetchWebhooks();
      setShowCreateModal(false);
      setNewWebhook({ url: '', events: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const deleteWebhook = async (webhookId) => {
    if (!window.confirm('Delete this webhook endpoint?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchWebhooks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleEvent = (event) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900"><div className="text-white">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Webhook className="mr-3 text-[#39FF14]" size={40} />
              Webhooks
            </h1>
            <p className="text-gray-400">Receive real-time notifications for BANIBS events</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition"
          >
            <Plus className="mr-2" size={20} />
            Add Webhook
          </button>
        </div>

        {webhooks.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <Webhook className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-bold text-white mb-2">No Webhooks Configured</h3>
            <p className="text-gray-400 mb-6">Set up webhooks to receive real-time event notifications</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition"
            >
              Add Your First Webhook
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map(webhook => (
              <div key={webhook.id} className="bg-gray-800/50 border border-[#39FF14]/20 rounded-lg p-6 hover:border-[#39FF14]/40 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <Zap className="text-[#39FF14] mr-2" size={20} />
                      <h3 className="text-xl font-bold text-white">{webhook.url}</h3>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Events</label>
                      <div className="flex flex-wrap gap-2">
                        {webhook.events.map(event => (
                          <span key={event} className="px-3 py-1 bg-[#39FF14]/20 text-[#39FF14] rounded-full text-xs font-semibold">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 mb-3">
                      <div className="text-sm text-gray-400">
                        <span className="text-gray-500">Secret:</span> <code className="text-[#39FF14] font-mono">{webhook.secret}</code>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Created: {new Date(webhook.created_at).toLocaleDateString()}
                      {webhook.last_success && ` • Last success: ${new Date(webhook.last_success).toLocaleDateString()}`}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteWebhook(webhook.id)}
                    className="ml-4 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-gray-800 border border-[#39FF14]/30 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-white mb-6">Add Webhook Endpoint</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Webhook URL *</label>
                  <input
                    type="url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    placeholder="https://yourapp.com/webhooks/banibs"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Select Events *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableEvents.map(event => (
                      <label key={event} className="flex items-center p-3 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer hover:border-[#39FF14]/30 transition">
                        <input
                          type="checkbox"
                          checked={newWebhook.events.includes(event)}
                          onChange={() => toggleEvent(event)}
                          className="mr-3 w-4 h-4 accent-[#39FF14]"
                        />
                        <span className="text-sm text-gray-300">{event}</span>
                      </label>
                    ))}
                  </div>
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
                  onClick={createWebhook}
                  className="flex-1 px-4 py-3 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition disabled:opacity-50"
                  disabled={creating || !newWebhook.url.trim() || newWebhook.events.length === 0}
                >
                  {creating ? 'Adding...' : 'Add Webhook'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DevWebhooksPage;
