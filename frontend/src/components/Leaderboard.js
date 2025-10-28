import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardAPI } from '../services/api';

const Leaderboard = ({ limit = 5 }) => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLeaderboard();
  }, [limit]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await leaderboardAPI.getTopContributors(limit);
      setContributors(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a1a] border-2 border-[#FFD700]/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">🏆 Top Contributors</h3>
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FFD700] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (contributors.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#1a1a1a] border-2 border-[#FFD700] rounded-lg p-6 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
      <h3 className="text-xl font-bold text-white mb-4">🏆 Top Contributors</h3>
      
      <div className="space-y-3">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.id}
            onClick={() => navigate(`/contributor/${contributor.id}`)}
            className="flex items-center justify-between p-3 bg-black border border-[#FFD700]/20 rounded-lg hover:border-[#FFD700] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                index === 0 ? 'bg-[#FFD700] text-black' :
                index === 1 ? 'bg-gray-400 text-black' :
                index === 2 ? 'bg-[#CD7F32] text-white' :
                'bg-gray-700 text-white'
              }`}>
                {index + 1}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{contributor.display_name}</span>
                  {contributor.verified && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#FFD700] text-black text-xs font-bold rounded">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {contributor.approved_submissions} approved
                  {contributor.featured_submissions > 0 && ` • ${contributor.featured_submissions} featured`}
                </div>
              </div>
            </div>
            
            <span className="text-[#FFD700]">→</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
