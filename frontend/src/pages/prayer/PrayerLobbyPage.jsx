import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Users, Clock } from 'lucide-react';
import SpiritualLayout from '../../components/spiritual/SpiritualLayout';
import PrayerRoomCard from '../../components/spiritual/PrayerRoomCard';
import { useTheme } from '../../contexts/ThemeContext';
import { xhrRequest } from '../../utils/xhrRequest';

/**
 * PrayerLobbyPage - Phase 11.0
 * Main lobby for selecting prayer rooms
 */
const PrayerLobbyPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadRooms();
  }, []);
  
  const loadRooms = async () => {
    try {
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/prayer/rooms`
      );
      
      if (response.ok) {
        setRooms(response.data);
      }
    } catch (err) {
      console.error('Error loading prayer rooms:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SpiritualLayout>
      {/* Hero Section */}
      <div 
        className="spiritual-gradient-soft py-16 px-4 rounded-2xl mb-8"
        style={{
          border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`,
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{
              background: isDark 
                ? 'rgba(139, 92, 246, 0.2)'
                : 'rgba(139, 92, 246, 0.1)',
              border: '2px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            <Sparkles size={40} className="text-purple-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Prayer Rooms
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            A sacred space for spiritual connection and community support. Choose your room and join in prayer.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-purple-500" />
              <span>All faiths welcome</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-500" />
              <span>Anonymous posting</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-purple-500" />
              <span>14-day auto-clear</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Room Selection */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">
          Choose Your Room
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Loading prayer rooms...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <PrayerRoomCard 
                key={room.id} 
                room={room}
                onClick={() => navigate(`/portal/prayer/room/${room.slug}`)}
              />
            ))}
          </div>
        )}
        
        {/* Coming Soon Note */}
        <div 
          className="mt-12 p-6 rounded-lg border text-center"
          style={{
            background: isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.03)',
            borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'
          }}
        >
          <Sparkles size={24} className="text-purple-500 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Live Prayer Circles • Scheduled Prayer Times • Voice Prayer Rooms
          </p>
        </div>
      </div>
    </SpiritualLayout>
  );
};

export default PrayerLobbyPage;