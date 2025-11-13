import React, { useState, useEffect, useRef } from 'react';
import { Smile, Search, X } from 'lucide-react';
import { loadEmojiPacks, getUserEmojiPacks, canAccessPack } from '../../utils/emojiSystem';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './EmojiPicker.css';

/**
 * BANIBS Emoji Picker Component
 * Supports multiple emoji packs with tier-based access
 */
const EmojiPicker = ({ onEmojiSelect, onClose, position = 'bottom' }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [packs, setPacks] = useState([]);
  const [activePack, setActivePack] = useState('banibs_standard');
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const pickerRef = useRef(null);

  useEffect(() => {
    loadPacks();
  }, []);
  
  // Set default to BANIBS standard pack when component mounts
  useEffect(() => {
    if (packs.length > 0 && !activePack) {
      const banibsStandard = packs.find(p => p.id === 'banibs_standard');
      if (banibsStandard) {
        setActivePack('banibs_standard');
      }
    }
  }, [packs]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const loadedPacks = await loadEmojiPacks();
      const userTier = user?.subscription_tier || 'free';
      const availablePacks = loadedPacks.filter(pack => 
        canAccessPack(pack.id, userTier)
      );
      // Sort packs to put BANIBS standard first
      const sortedPacks = availablePacks.sort((a, b) => {
        if (a.id === 'banibs_standard') return -1;
        if (b.id === 'banibs_standard') return 1;
        return 0;
      });
      setPacks(sortedPacks);
      
      // Set default pack to BANIBS standard (our featured pack)
      const defaultPack = sortedPacks.find(p => p.id === 'banibs_standard') || sortedPacks[0];
      if (defaultPack) {
        setActivePack(defaultPack.id);
      }
    } catch (error) {
      console.error('Failed to load emoji packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPack = () => {
    return packs.find(p => p.id === activePack) || packs[0];
  };

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
  };

  const currentPack = getCurrentPack();
  const currentCategory = currentPack?.categories?.[activeCategory];

  if (loading) {
    return (
      <div ref={pickerRef} className={`emoji-picker ${isDark ? 'dark' : 'light'}`}>
        <div className="emoji-picker-loading">
          <div className="spinner"></div>
          <span>Loading emojis...</span>
        </div>
      </div>
    );
  }

  if (!currentPack) {
    return null;
  }

  return (
    <div ref={pickerRef} className={`emoji-picker ${isDark ? 'dark' : 'light'} position-${position}`}>
      {/* Header */}
      <div className="emoji-picker-header">
        <div className="emoji-picker-title">
          <Smile size={18} />
          <span>{currentPack.title}</span>
        </div>
        <button onClick={onClose} className="emoji-picker-close">
          <X size={18} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="emoji-picker-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search emojis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Pack Tabs */}
      {packs.length > 1 && (
        <div className="emoji-picker-packs">
          {packs.map(pack => (
            <button
              key={pack.id}
              onClick={() => {
                setActivePack(pack.id);
                setActiveCategory(0);
              }}
              className={`pack-tab ${activePack === pack.id ? 'active' : ''}`}
              title={pack.title}
            >
              {pack.featured && <span className="pack-badge">⭐</span>}
              {pack.id === 'base_yellow' && '😊'}
              {pack.id === 'banibs_standard' && '👍🏿'}
              {pack.id === 'banibs_gold_spark' && '✨'}
            </button>
          ))}
        </div>
      )}

      {/* Category Tabs */}
      {currentPack.categories && (
        <div className="emoji-picker-categories">
          {currentPack.categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(index)}
              className={`category-tab ${activeCategory === index ? 'active' : ''}`}
              title={category.name}
            >
              {category.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="emoji-picker-grid">
        {currentCategory?.emojis?.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            className="emoji-item"
            onClick={() => handleEmojiClick(emoji)}
            title={emoji}
          >
            {emoji}
          </button>
        )) || (
          <div className="emoji-picker-empty">
            No emojis in this category
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="emoji-picker-footer">
        {currentCategory?.note && (
          <span className="category-note">{currentCategory.note}</span>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;
