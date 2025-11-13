import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  SKIN_TONES, 
  HAIR_TEXTURES, 
  HAIR_LENGTHS, 
  HAIR_COLORS, 
  FACIAL_HAIR, 
  ACCESSORIES,
  DEFAULT_EMOJI_IDENTITY 
} from '../../config/emojiIdentityConfig';
import { applySkinTone } from '../../utils/emojiToneUtils';
import { Save, Loader2 } from 'lucide-react';

/**
 * BANIBS Emoji Identity Settings Panel
 * Phase 1.1: Personalized Skin Tone (Unicode)
 * Future: Full identity with hair, accessories, etc. for image-based emojis
 */
const EmojiIdentitySettingsPanel = () => {
  const { user, updateUserProfile } = useAuth();
  const [identity, setIdentity] = useState(DEFAULT_EMOJI_IDENTITY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load user's current emoji identity
  useEffect(() => {
    if (user?.emoji_identity) {
      setIdentity({ ...DEFAULT_EMOJI_IDENTITY, ...user.emoji_identity });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      await updateUserProfile({ emoji_identity: identity });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save emoji identity:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setIdentity(prev => ({ ...prev, [field]: value }));
  };

  const handleAccessoryToggle = (accessoryId) => {
    setIdentity(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessoryId)
        ? prev.accessories.filter(a => a !== accessoryId)
        : [...prev.accessories, accessoryId]
    }));
  };

  // Preview emoji with current tone
  const previewEmojis = ['👍', '👋', '🙌', '👏', '✊', '💪'];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🎨 BANIBS Emoji Identity
        </h1>
        <p className="text-muted-foreground">
          Personalize your emoji experience to reflect your unique identity. 
          Choose your skin tone, hair, style, and accessories.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="space-y-6">
          {/* Skin Tone Selection - PHASE 1.1 PRIMARY FEATURE */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-card-foreground mb-4">
              Skin Tone
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select your skin tone. This applies to all people and hand emojis.
            </p>
            <div className="space-y-2">
              {SKIN_TONES.map(tone => (
                <label
                  key={tone.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${identity.skinTone === tone.id 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-border hover:border-yellow-500/50 hover:bg-accent'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="skinTone"
                    value={tone.id}
                    checked={identity.skinTone === tone.id}
                    onChange={(e) => handleChange('skinTone', e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-3xl">{tone.example}</span>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{tone.label}</div>
                    {tone.id === 'tone4' && (
                      <div className="text-xs text-yellow-500 font-semibold">
                        ⭐ BANIBS Default
                      </div>
                    )}
                  </div>
                  {identity.skinTone === tone.id && (
                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Hair Texture - PHASE 2 PREVIEW */}
          <div className="bg-card border border-border rounded-xl p-6 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-card-foreground">
                Hair Texture
              </h2>
              <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                Phase 2
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Coming soon: Choose your hair texture for custom BANIBS image emojis
            </p>
            <select
              value={identity.hairTexture}
              onChange={(e) => handleChange('hairTexture', e.target.value)}
              disabled
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground opacity-50 cursor-not-allowed"
            >
              {HAIR_TEXTURES.map(texture => (
                <option key={texture.id} value={texture.id}>
                  {texture.label}
                </option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                ✓ Saved!
              </>
            ) : (
              <>
                <Save size={20} />
                Save Identity
              </>
            )}
          </button>
        </div>

        {/* Live Preview */}
        <div className="bg-card border border-border rounded-xl p-6 sticky top-4">
          <h2 className="text-xl font-bold text-card-foreground mb-4">
            Live Preview
          </h2>
          
          {/* Emoji Preview */}
          <div className="bg-muted rounded-lg p-6 mb-6" key={identity.skinTone}>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Your emojis with {SKIN_TONES.find(t => t.id === identity.skinTone)?.label.toLowerCase()}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {previewEmojis.map((emoji, idx) => {
                const tonedEmoji = applySkinTone(emoji, identity.skinTone, true);
                return (
                  <div key={`${emoji}-${identity.skinTone}-${idx}`} className="text-5xl">
                    {tonedEmoji}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Identity Summary */}
          <div className="bg-background rounded-lg p-4 text-sm space-y-2">
            <h3 className="font-semibold text-foreground mb-3">Your Identity</h3>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Skin Tone:</span>
              <span className="text-foreground font-medium">
                {SKIN_TONES.find(t => t.id === identity.skinTone)?.label}
              </span>
            </div>
            <div className="flex justify-between opacity-50">
              <span className="text-muted-foreground">Hair:</span>
              <span className="text-foreground">Phase 2</span>
            </div>
            <div className="flex justify-between opacity-50">
              <span className="text-muted-foreground">Accessories:</span>
              <span className="text-foreground">Phase 2</span>
            </div>
          </div>

          {/* Phase 2 Teaser */}
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-foreground">
              <strong>🚀 Coming Soon:</strong> Custom BANIBS image emojis with your exact 
              hair style, color, facial hair, and accessories. Phase 1 applies skin tones 
              to Unicode emojis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmojiIdentitySettingsPanel;
