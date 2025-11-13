import React, { useState } from 'react';
import EmojiPicker from '../../components/emoji/EmojiPicker.jsx';
import GlobalNavBar from '../../components/GlobalNavBar';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Simple demo page to showcase the EmojiPicker with Gold Spark premium UI
 * Route: /test/emoji-picker
 */
const EmojiPickerDemo = () => {
  const { theme, toggleTheme } = useTheme();
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [showPicker, setShowPicker] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🎨 BANIBS Emoji Picker Demo
          </h1>
          <p className="text-muted-foreground">
            Interactive demo showcasing the emoji picker with premium Gold Spark pack
          </p>
          <div className="mt-4 flex gap-4">
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400"
            >
              Toggle Theme (Current: {theme})
            </button>
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold hover:bg-accent"
            >
              {showPicker ? 'Hide' : 'Show'} Picker
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Emoji Picker */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-card-foreground mb-4">
              Emoji Picker
            </h2>
            {showPicker ? (
              <EmojiPicker
                onSelect={(emoji) => {
                  setSelectedEmoji(emoji);
                  console.log('Selected emoji:', emoji);
                }}
                showHeader={true}
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Picker hidden. Click "Show Picker" to display.
              </p>
            )}
          </div>

          {/* Selected Emoji Display */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-card-foreground mb-4">
              Selected Emoji
            </h2>
            {selectedEmoji ? (
              <div className="space-y-4">
                <div className="text-center p-8 bg-muted rounded-lg">
                  <div className="text-6xl mb-4">
                    {selectedEmoji.type === 'unicode' ? selectedEmoji.char : ''}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmoji.shortcodes?.[0] || selectedEmoji.id}
                  </p>
                </div>
                
                <div className="bg-background rounded-lg p-4 text-sm font-mono">
                  <p className="text-foreground mb-2"><strong>ID:</strong> {selectedEmoji.id}</p>
                  <p className="text-foreground mb-2"><strong>Type:</strong> {selectedEmoji.type}</p>
                  <p className="text-foreground mb-2"><strong>Category:</strong> {selectedEmoji.category}</p>
                  <p className="text-foreground mb-2">
                    <strong>Shortcodes:</strong> {selectedEmoji.shortcodes?.join(', ')}
                  </p>
                  <p className="text-foreground">
                    <strong>Keywords:</strong> {selectedEmoji.keywords?.join(', ')}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Click an emoji to see details
              </p>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="mt-8 bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-card-foreground mb-4">
            ✨ Features
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">👍🏿 BANIBS Standard</h3>
              <p className="text-sm text-muted-foreground">
                Default pack with dark skin tone emojis, featured and brand-first
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">⭐ BANIBS Gold Spark</h3>
              <p className="text-sm text-muted-foreground">
                Premium pack with golden gradient UI, sparkles, stars, and celebration emojis
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">😊 Standard Yellow</h3>
              <p className="text-sm text-muted-foreground">
                Classic yellow emojis as fallback option
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmojiPickerDemo;
