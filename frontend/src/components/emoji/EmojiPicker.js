import React, { useState, useEffect, useRef } from 'react';
import { Smile, Search, X } from 'lucide-react';
import { 
  loadEmojiPacks, 
  getUserEmojiPacks, 
  canAccessPack,
  groupEmojisByCategory,
  renderEmoji,
  DEFAULT_EMOJI_PACK_ID
} from '../../utils/emojiSystem';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './EmojiPicker.css';

/**
 * BANIBS Emoji Picker Component
 * Supports multiple emoji packs with tier-based access
 * Phase 1: Unicode emojis | Phase 2: Image-based emojis
 */
const EmojiPicker = ({ onEmojiSelect, onClose, position = 'bottom' }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [packs, setPacks] = useState([]);
  const [activePack, setActivePack] = useState(DEFAULT_EMOJI_PACK_ID);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const pickerRef = useRef(null);

  useEffect(() => {
    loadPacks();
  }, []);

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
      
      // Sort packs: BANIBS standard first (our brand identity)
      const sortedPacks = availablePacks.sort((a, b) => {
        if (a.id === DEFAULT_EMOJI_PACK_ID) return -1;
        if (b.id === DEFAULT_EMOJI_PACK_ID) return 1;
        return 0;
      });
      
      setPacks(sortedPacks);
      
      // Set default pack to BANIBS standard
      const defaultPack = sortedPacks.find(p => p.id === DEFAULT_EMOJI_PACK_ID) || sortedPacks[0];
      if (defaultPack) {
        setActivePack(defaultPack.id);
        // Set first category as active
        const grouped = groupEmojisByCategory(defaultPack);
        const categories = Object.keys(grouped);
        if (categories.length > 0) {
          setActiveCategory(categories[0]);
        }
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
    const rendered = renderEmoji(emoji);
    onEmojiSelect(rendered);
  };

  const currentPack = getCurrentPack();
  const groupedEmojis = currentPack ? groupEmojisByCategory(currentPack) : {};
  const categories = Object.keys(groupedEmojis);
  
  // Set initial category if not set
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);
  
  const currentCategoryData = activeCategory ? groupedEmojis[activeCategory] : null;

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
