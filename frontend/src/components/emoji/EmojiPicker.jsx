// /app/frontend/src/components/emoji/EmojiPicker.jsx

import React, { useMemo, useState, useEffect } from 'react';
import {
  getAllEmojiPacks,
  getDefaultEmojiPack,
  searchEmojisInPack,
} from '../../utils/emojiSystem';
import { applySkinTone } from '../../utils/emojiToneUtils';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Props:
 * @typedef EmojiPickerProps
 * @property {(emoji: any) => void} onSelect   - Called when user clicks an emoji
 * @property {() => void} [onClose]            - Called when picker should close
 * @property {boolean} [showHeader]            - Show pack tabs + search bar
 * @property {string} [className]              - Optional extra className(s)
 */

/**
 * Phase 1 BANIBS Emoji Picker
 * - BANIBS pack first
 * - Unicode rendering only (for now)
 * - Image branch already wired for Phase 2
 *
 * @param {EmojiPickerProps} props
 */
export default function EmojiPicker({
  onSelect,
  onClose,
  showHeader = true,
  className = '',
}) {
  const { user } = useAuth();
  const [allPacks, setAllPacks] = useState([]);
  const [defaultPack, setDefaultPack] = useState(null);
  const [activePackId, setActivePackId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Get user's emoji identity (default to tone4 for BANIBS)
  const userSkinTone = user?.emoji_identity?.skinTone || 'tone4';
  
  // Debug logging
  useEffect(() => {
    console.log('🎨 EmojiPicker Debug:', {
      userSkinTone,
      userIdentity: user?.emoji_identity,
      packsLoaded: allPacks.length,
      activePackId
    });
  }, [userSkinTone, user, allPacks, activePackId]);

  // Load packs on mount
  useEffect(() => {
    const loadPacks = async () => {
      try {
        const packs = await getAllEmojiPacks();
        const defPack = await getDefaultEmojiPack();
        setAllPacks(packs);
        setDefaultPack(defPack);
        setActivePackId(defPack?.id);
      } catch (error) {
        console.error('Failed to load emoji packs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPacks();
  }, []);

  const activePack = useMemo(
    () => allPacks.find((p) => p.id === activePackId) || defaultPack,
    [allPacks, activePackId, defaultPack]
  );

  const visibleEmojis = useMemo(
    () => (activePack ? searchEmojisInPack(activePack, search) : []),
    [activePack, search]
  );

  const handleEmojiClick = (emoji) => {
    if (typeof onSelect === 'function') {
      onSelect(emoji);
    }
  };

  if (loading) {
    return (
      <div
        className={`
          banibs-emoji-picker
          bg-card text-foreground border border-border rounded-xl shadow-sm
          p-4 text-center
          ${className}
        `}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading emojis...</p>
      </div>
    );
  }

  if (!activePack) {
    return null;
  }

  return (
    <div
      className={`
        banibs-emoji-picker
        bg-card text-foreground border border-border rounded-xl shadow-lg
        p-2 md:p-3
        ${className}
      `}
      style={{ width: '350px', maxHeight: '450px' }}
    >
      {showHeader && (
        <div className="mb-2 space-y-2">
          {/* Pack Tabs */}
          {allPacks.length > 1 && (
            <div className="flex flex-wrap items-center gap-1">
              {allPacks.map((pack) => {
                const isGoldSpark = pack.id === 'banibs_gold_spark';
                const isActive = pack.id === activePackId;
                
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setActivePackId(pack.id)}
                    className={`
                      text-xs md:text-sm px-3 py-1.5 rounded-lg border
                      transition-all font-medium
                      ${
                        isActive
                          ? isGoldSpark
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 border-yellow-500 shadow-lg'
                            : 'bg-yellow-500 text-gray-900 border-yellow-500'
                          : isGoldSpark
                            ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-500 border-yellow-500/50 hover:from-yellow-400/30 hover:to-yellow-600/30'
                            : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    {pack.id === 'banibs_standard' && '👍🏿'}
                    {pack.id === 'banibs_gold_spark' && '⭐'}
                    {pack.id === 'base_yellow' && '😊'}
                    {' '}{pack.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emojis…"
              className="
                w-full px-3 py-2 text-sm rounded-lg
                bg-background border border-input text-foreground
                focus:outline-none focus:ring-2 focus:ring-yellow-500/50
                placeholder:text-muted-foreground
              "
            />
          </div>
        </div>
      )}

      {/* Emoji Grid */}
      <div
        className="
          grid grid-cols-8 gap-1
          max-h-64 overflow-y-auto
          py-2
        "
        style={{ scrollbarWidth: 'thin' }}
      >
        {visibleEmojis.map((emoji) => (
          <button
            key={emoji.id}
            type="button"
            onClick={() => handleEmojiClick(emoji)}
            className="
              flex items-center justify-center
              rounded-lg
              hover:bg-accent
              transition-all
              aspect-square
              p-1
            "
            title={emoji.shortcodes?.[0] || emoji.id}
          >
            <EmojiRenderer emoji={emoji} userSkinTone={userSkinTone} />
          </button>
        ))}

        {visibleEmojis.length === 0 && (
          <div className="col-span-full text-xs text-muted-foreground py-4 text-center">
            No emojis found.
          </div>
        )}
      </div>

      {/* Footer */}
      {onClose && (
        <div className="mt-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * EmojiRenderer
 * - Phase 1.1: Unicode with personalized skin tone
 * - Phase 2: Will support image-based with sprite sheets
 */
function EmojiRenderer({ emoji, userSkinTone }) {
  // Approx 32–40px visual size target
  const sizePx = 36;

  if (emoji.type === 'image') {
    // Phase 2: Image-based rendering
    const style = {
      width: sizePx,
      height: sizePx,
      backgroundImage: `url(${emoji.spriteSheet})`,
      backgroundPosition: `-${emoji.x}px -${emoji.y}px`,
      backgroundSize: 'auto',
    };

    return (
      <span
        className="inline-block"
        style={style}
        aria-label={emoji.shortcodes?.[0] || emoji.id}
      />
    );
  }

  // Phase 1.1: Unicode with tone application
  const supportsSkinTone = emoji.supportsSkinTone !== undefined ? emoji.supportsSkinTone : false;
  const displayChar = supportsSkinTone 
    ? applySkinTone(emoji.char, userSkinTone, true)
    : emoji.char;

  // Debug first few emojis
  if (Math.random() < 0.1) {
    console.log('🎨 EmojiRenderer:', {
      emojiId: emoji.id,
      baseChar: emoji.char,
      supportsSkinTone,
      userSkinTone,
      displayChar,
      charCodes: [...displayChar].map(c => c.codePointAt(0).toString(16))
    });
  }

  return (
    <span
      className="leading-none"
      style={{
        fontSize: sizePx,
        lineHeight: 1,
      }}
      aria-label={emoji.shortcodes?.[0] || emoji.id}
    >
      {displayChar}
    </span>
  );
}
