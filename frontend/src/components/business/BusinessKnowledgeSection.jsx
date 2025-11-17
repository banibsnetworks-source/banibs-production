import React, { useState, useEffect } from 'react';
import { AlertTriangle, Award, ThumbsUp, ThumbsDown, Plus, X, Loader2 } from 'lucide-react';
import { businessKnowledgeApi } from '../../services/phase83Api';

/**
 * Phase 8.3 - Business Knowledge Flags Section
 * Private knowledge network for business owners
 * Features: Pitfalls, Plus Flags, Anonymity, Voting
 */
const BusinessKnowledgeSection = ({ isOwner }) => {
  const [activeTab, setActiveTab] = useState('all'); // all, pitfall, plus
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'pitfall',
    title: '',
    description: '',
    anonymous: false,
    tags: []
  });
  
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadFlags();
  }, [activeTab]);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const filterType = activeTab === 'all' ? null : activeTab;
      const data = await businessKnowledgeApi.getFlags(filterType, 50, 0);
      setFlags(data);
    } catch (error) {
      console.error('Failed to load flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlag = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    // Validation
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (formData.description.length < 80) {
      errors.description = `Description must be at least 80 characters (currently ${formData.description.length})`;
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await businessKnowledgeApi.createFlag(formData);
      
      // Reset form
      setFormData({
        type: 'pitfall',
        title: '',
        description: '',
        anonymous: false,
        tags: []
      });
      setShowCreateForm(false);
      
      // Reload flags
      loadFlags();
      
      alert('Knowledge flag created successfully!');
    } catch (error) {
      if (error.message.includes('Rate limit')) {
        alert('Rate limit exceeded. You can post up to 5 flags per 24 hours.');
      } else {
        alert(error.message || 'Failed to create knowledge flag');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (flagId, voteType) => {
    try {
      await businessKnowledgeApi.voteOnFlag(flagId, voteType);
      loadFlags(); // Reload to get updated vote counts
    } catch (error) {
      alert(error.message || 'Failed to vote');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Business Knowledge</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Private network for business owners to share warnings and opportunities
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            {showCreateForm ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Share Knowledge
              </>
            )}
          </button>
        )}
      </div>

      {/* Create Flag Form */}
      {showCreateForm && isOwner && (
        <form onSubmit={handleCreateFlag} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Share New Knowledge Flag</h3>
          
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Flag Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'pitfall' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  formData.type === 'pitfall'
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                    : 'border-border hover:border-red-300'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${formData.type === 'pitfall' ? 'text-red-500' : 'text-muted-foreground'}`} />
                <div className="text-sm font-medium">⚠️ Pitfall</div>
                <div className="text-xs text-muted-foreground">Warning or caution</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'plus' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  formData.type === 'plus'
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                    : 'border-border hover:border-green-300'
                }`}
              >
                <Award className={`w-5 h-5 mx-auto mb-1 ${formData.type === 'plus' ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div className="text-sm font-medium">🏆 Plus Flag</div>
                <div className="text-xs text-muted-foreground">Opportunity or tip</div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Brief summary of this knowledge..."
              maxLength={200}
            />
            {formErrors.title && (
              <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (minimum 80 characters)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 min-h-32"
              placeholder="Share detailed information about this pitfall or opportunity..."
              maxLength={2000}
            />
            <div className="flex justify-between text-xs mt-1">
              <span className={formData.description.length < 80 ? 'text-red-500' : 'text-green-500'}>
                {formData.description.length} / 80 characters minimum
              </span>
              <span className="text-muted-foreground">
                {formData.description.length} / 2000 max
              </span>
            </div>
            {formErrors.description && (
              <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
            )}
          </div>

          {/* Anonymous Option */}
          <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.anonymous}
              onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
              className="mt-1"
            />
            <label htmlFor="anonymous" className="flex-1 text-sm">
              <div className="font-medium text-foreground">Share Anonymously</div>
              <div className="text-muted-foreground text-xs mt-1">
                Your business name will be hidden from other business owners. BANIBS admins can still see who posted for moderation purposes.
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Submit Knowledge Flag
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-yellow-500 border-b-2 border-yellow-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Knowledge
        </button>
        <button
          onClick={() => setActiveTab('pitfall')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pitfall'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ⚠️ Pitfalls
        </button>
        <button
          onClick={() => setActiveTab('plus')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'plus'
              ? 'text-green-500 border-b-2 border-green-500'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🏆 Plus Flags
        </button>
      </div>

      {/* Flags List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Loading knowledge flags...</p>
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
              {activeTab === 'pitfall' ? (
                <AlertTriangle className="w-8 h-8 text-red-500" />
              ) : activeTab === 'plus' ? (
                <Award className="w-8 h-8 text-green-500" />
              ) : (
                <span className="text-2xl">🧠</span>
              )}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Knowledge Flags Yet</h3>
            <p className="text-muted-foreground">
              {isOwner
                ? "Be the first to share valuable business knowledge with the community."
                : "Business owners haven't shared any knowledge flags yet."}
            </p>
          </div>
        ) : (
          flags.map((flag) => (
            <div
              key={flag.id}
              className={`bg-card border-2 rounded-lg p-5 ${
                flag.type === 'pitfall'
                  ? 'border-red-200 dark:border-red-900'
                  : 'border-green-200 dark:border-green-900'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {flag.type === 'pitfall' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Award className="w-5 h-5 text-green-500" />
                    )}
                    <h3 className="text-lg font-bold text-foreground">{flag.title}</h3>
                    {flag.is_author && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                        Your Flag
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {flag.anonymous ? (
                      <span className="italic">Anonymous Business Owner</span>
                    ) : (
                      <span>{flag.business_name}</span>
                    )}
                    {' • '}
                    {new Date(flag.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-foreground mb-4 whitespace-pre-wrap">{flag.description}</p>

              {/* Tags */}
              {flag.tags && flag.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {flag.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Voting */}
              {!flag.is_author && (
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <button
                    onClick={() => handleVote(flag.id, 'helpful')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors group"
                  >
                    <ThumbsUp className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-foreground">
                      Helpful ({flag.helpful_votes})
                    </span>
                  </button>
                  <button
                    onClick={() => handleVote(flag.id, 'not_accurate')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
                  >
                    <ThumbsDown className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-foreground">
                      Not Accurate ({flag.not_accurate_votes})
                    </span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BusinessKnowledgeSection;
