import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { loadEmojiPacks } from '../../utils/emojiSystem';
import HighFiveAnim from '../../components/emoji/HighFiveAnim';
import HighFiveButton from '../../components/emoji/HighFiveButton';
import GlobalNavBar from '../../components/GlobalNavBar';

/**
 * Emoji System Test Page
 * Internal testing route: /test/emojis
 * Shows all emoji packs, static rendering, and High-Five animations
 */
const EmojiTestPage = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState('clean');
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const loadedPacks = await loadEmojiPacks();
      setPacks(loadedPacks);
    } catch (error) {
      console.error('Failed to load packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const playAnimation = () => {
    setAnimKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavBar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🧪 BANIBS Emoji System Test Page
          </h1>
          <p className="text-muted-foreground">
            Internal testing for emoji packs and animations
          </p>
          <button
            onClick={toggleTheme}
            className="mt-4 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold"
          >
            Toggle Theme (Current: {theme})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading emoji packs...</p>
          </div>
        )}

        {/* Emoji Packs */}
        {!loading && (
          <>
            {/* Section 1: Loaded Packs */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                📦 Loaded Emoji Packs ({packs.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {packs.map(pack => (
                  <div key={pack.id} className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground">{pack.title}</h3>
                      {pack.featured && <span className="text-yellow-500">⭐ Featured</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{pack.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">ID:</span> {pack.id} | 
                      <span className="font-semibold"> Type:</span> {pack.type} | 
                      <span className="font-semibold"> Tier:</span> {pack.tier}
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Categories: {pack.categories?.length || 0}</p>
                      {pack.categories?.slice(0, 3).map(cat => (
                        <div key={cat.id} className="text-2xl inline-block mr-2">
                          {cat.icon}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Static Emoji Rendering */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                😀 Static Emoji Rendering
              </h2>
              {packs.map(pack => (
                <div key={pack.id} className="mb-6">
                  <h3 className="font-bold text-foreground mb-3">{pack.title}</h3>
                  {pack.categories?.slice(0, 2).map(category => (
                    <div key={category.id} className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {category.icon} {category.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.emojis?.slice(0, 20).map((emoji, idx) => (
                          <span key={idx} className="text-3xl p-2 hover:bg-muted rounded">
                            {emoji}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Section 3: High-Five Animations */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                🙌 High-Five Animation Test
              </h2>
              
              {/* Variant Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Variant:
                </label>
                <div className="flex gap-2">
                  {['clean', 'spark_small', 'spark_big'].map(variant => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedVariant === variant
                          ? 'bg-yellow-500 text-gray-900'
                          : 'bg-muted text-foreground hover:bg-muted/70'
                      }`}
                    >
                      {variant === 'clean' && '🖐️ Clean (Free)'}
                      {variant === 'spark_small' && '✨ Spark Small (Plus)'}
                      {variant === 'spark_big' && '💫 Spark Big (Elite)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Display */}
              <div className="bg-muted rounded-lg p-8 mb-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-background/50 rounded-lg p-4 inline-block">
                    <HighFiveAnim
                      key={`${selectedVariant}-${animKey}`}
                      variant={selectedVariant}
                      size={128}
                      mode="once"
                      fps={12}
                    />
                  </div>
                  <button
                    onClick={playAnimation}
                    className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400"
                  >
                    ▶️ Play Animation
                  </button>
                  <p className="text-sm text-muted-foreground text-center">
                    Animation: {selectedVariant} | Size: 128px | FPS: 12 | Frames: 8
                  </p>
                </div>
              </div>

              {/* Loop Mode Test */}
              <div className="mb-4">
                <h3 className="font-bold text-foreground mb-2">Loop Mode Test</h3>
                <div className="flex gap-4 items-center bg-muted rounded-lg p-4">
                  {['clean', 'spark_small', 'spark_big'].map(variant => (
                    <div key={variant} className="text-center">
                      <HighFiveAnim
                        variant={variant}
                        size={64}
                        mode="loop"
                        fps={10}
                      />
                      <p className="text-xs text-muted-foreground mt-2">{variant}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: High-Five Button Integration */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                👆 High-Five Button Component
              </h2>
              <div className="bg-muted rounded-lg p-6">
                <div className="flex gap-8 items-center justify-center flex-wrap">
                  {/* Free Tier */}
                  <div className="text-center">
                    <HighFiveButton
                      postId="test-1"
                      hasHighFived={false}
                      highFiveCount={42}
                      userTier="free"
                      size={32}
                      showCount={true}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Free Tier</p>
                  </div>

                  {/* Plus Tier */}
                  <div className="text-center">
                    <HighFiveButton
                      postId="test-2"
                      hasHighFived={false}
                      highFiveCount={156}
                      userTier="banibs_plus"
                      size={32}
                      showCount={true}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Plus Tier</p>
                  </div>

                  {/* Elite Tier */}
                  <div className="text-center">
                    <HighFiveButton
                      postId="test-3"
                      hasHighFived={false}
                      highFiveCount={999}
                      userTier="elite"
                      size={32}
                      showCount={true}
                    />
                    <p className="text-xs text-muted-foreground mt-2">Elite Tier</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Theme Compatibility */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                🎨 Theme Compatibility
              </h2>
              <div className="space-y-4">
                <div className="bg-background p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Background Color Test</p>
                  <div className="flex gap-4 items-center">
                    <span className="text-4xl">😀</span>
                    <span className="text-4xl">👍🏿</span>
                    <HighFiveAnim variant="clean" size={48} mode="loop" fps={8} />
                  </div>
                </div>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Card Background Test</p>
                  <div className="flex gap-4 items-center">
                    <span className="text-4xl">🎉</span>
                    <span className="text-4xl">❤️</span>
                    <HighFiveAnim variant="spark_small" size={48} mode="loop" fps={8} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmojiTestPage;
