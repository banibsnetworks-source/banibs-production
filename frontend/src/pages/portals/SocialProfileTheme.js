import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Eye } from 'lucide-react';
import SocialLayout from '../../components/social/SocialLayout';
import { ProfileAvatar } from '../../components/social/ProfileAvatar';

/**
 * Profile Theme Settings Page
 * /portal/social/profile/theme
 * 
 * Allows users to customize their profile appearance:
 * - Accent color
 * - Layout style
 * - Cover treatment
 * - Tagline bar
 */

const ACCENT_COLORS = [
  { id: 'gold', name: 'BANIBS Gold', color: '#E8B657', default: true },
  { id: 'royal_blue', name: 'Royal Blue', color: '#4169E1' },
  { id: 'purple', name: 'Deep Purple', color: '#9333EA' },
  { id: 'emerald', name: 'Emerald', color: '#10B981' },
  { id: 'brick_red', name: 'Brick Red', color: '#DC2626' },
  { id: 'teal', name: 'Teal', color: '#14B8A6' }
];

const LAYOUT_STYLES = [
  { 
    id: 'classic', 
    name: 'Classic', 
    description: 'Center-aligned, balanced',
    preview: '👤\n━━━\nName'
  },
  { 
    id: 'creator', 
    name: 'Creator', 
    description: 'Left avatar, prominent CTA',
    preview: '👤 Name\n   ━━━━'
  },
  { 
    id: 'business', 
    name: 'Business', 
    description: 'Professional, contact-focused',
    preview: '👤\n▢▢▢▢\nInfo'
  }
];

const COVER_STYLES = [
  { id: 'normal', name: 'Normal', description: 'No overlay' },
  { id: 'dark_overlay', name: 'Dark Overlay', description: 'Better text contrast' },
  { id: 'light_overlay', name: 'Light Overlay', description: 'Subtle brightening' },
  { id: 'accent_gradient', name: 'Accent Gradient', description: 'Branded look' }
];

const SocialProfileTheme = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState(null);
  
  // Theme settings
  const [accent, setAccent] = useState('gold');
  const [layout, setLayout] = useState('classic');
  const [coverStyle, setCoverStyle] = useState('normal');
  const [showTagline, setShowTagline] = useState(false);

  // Load profile and theme
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/me`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          
          // Load theme if exists
          if (data.theme) {
            setAccent(data.theme.accent || 'gold');
            setLayout(data.theme.layout || 'classic');
            setCoverStyle(data.theme.cover_style || 'normal');
            setShowTagline(data.theme.show_tagline_bar || false);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/me`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            theme: {
              accent,
              layout,
              cover_style: coverStyle,
              show_tagline_bar: showTagline
            }
          })
        }
      );

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Error saving theme:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SocialLayout>
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/portal/social/profile')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-gold)',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '16px'
            }}
          >
            ← Back to Edit Profile
          </button>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Profile Theme
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Customize how your profile looks to visitors
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
          {/* Settings Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Accent Color */}
            <section style={{
              background: 'var(--bg-card)',
              border: `1px solid var(--border-subtle)`,
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Accent Color
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setAccent(color.id)}
                    style={{
                      padding: '16px',
                      background: accent === color.id ? 'var(--hover-overlay)' : 'transparent',
                      border: accent === color.id ? `2px solid ${color.color}` : `1px solid var(--border-subtle)`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: color.color
                      }} />
                      {accent === color.id && <Check size={16} color={color.color} />}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {color.name}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Layout Style */}
            <section style={{
              background: 'var(--bg-card)',
              border: `1px solid var(--border-subtle)`,
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Layout Style
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {LAYOUT_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setLayout(style.id)}
                    style={{
                      padding: '16px',
                      background: layout === style.id ? 'var(--hover-overlay)' : 'transparent',
                      border: layout === style.id ? `2px solid var(--accent-profile)` : `1px solid var(--border-subtle)`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      whiteSpace: 'pre',
                      lineHeight: 1.4,
                      color: 'var(--text-tertiary)'
                    }}>
                      {style.preview}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {style.name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {style.description}
                      </div>
                    </div>
                    {layout === style.id && <Check size={18} color="var(--accent-profile)" />}
                  </button>
                ))}
              </div>
            </section>

            {/* Cover Style */}
            <section style={{
              background: 'var(--bg-card)',
              border: `1px solid var(--border-subtle)`,
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Cover Treatment
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {COVER_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setCoverStyle(style.id)}
                    style={{
                      padding: '12px',
                      background: coverStyle === style.id ? 'var(--hover-overlay)' : 'transparent',
                      border: coverStyle === style.id ? `2px solid var(--accent-profile)` : `1px solid var(--border-subtle)`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {style.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {style.description}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Tagline Bar */}
            <section style={{
              background: 'var(--bg-card)',
              border: `1px solid var(--border-subtle)`,
              borderRadius: '12px',
              padding: '24px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showTagline}
                  onChange={(e) => setShowTagline(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Show Tagline Highlight Bar
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Display your headline with accent color highlight
                  </div>
                </div>
              </label>
            </section>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '14px 24px',
                background: 'var(--accent-gold)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile Theme'}
            </button>
          </div>

          {/* Live Preview Column */}
          <div style={{ position: 'sticky', top: '20px' }}>
            <div style={{
              background: 'var(--bg-card)',
              border: `1px solid var(--border-subtle)`,
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Eye size={18} color="var(--text-secondary)" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Live Preview
                </span>
              </div>

              {/* Preview content with selected accent */}
              <div data-profile-accent={accent}>
                <div style={{ 
                  height: '120px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  marginBottom: '-40px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Cover overlay preview */}
                  {coverStyle === 'dark_overlay' && (
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      background: 'rgba(0,0,0,0.4)' 
                    }} />
                  )}
                  {coverStyle === 'light_overlay' && (
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      background: 'rgba(255,255,255,0.2)' 
                    }} />
                  )}
                  {coverStyle === 'accent_gradient' && (
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      background: `linear-gradient(135deg, var(--accent-profile) 0%, transparent 100%)`,
                      opacity: 0.3
                    }} />
                  )}
                </div>

                <div style={{ padding: '0 16px' }}>
                  <ProfileAvatar 
                    name={profile?.display_name || 'User'}
                    avatarUrl={profile?.avatar_url}
                    size="xl"
                  />
                  <div style={{ marginTop: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {profile?.display_name || 'Your Name'}
                    </h3>
                    {profile?.handle && (
                      <div style={{ fontSize: '13px', color: 'var(--accent-profile)', marginTop: '4px' }}>
                        @{profile.handle}
                      </div>
                    )}
                  </div>

                  {showTagline && profile?.headline && (
                    <div className="profile-tagline-bar" style={{ 
                      marginTop: '12px',
                      fontSize: '13px',
                      fontWeight: 500
                    }}>
                      {profile.headline}
                    </div>
                  )}

                  <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="profile-interest-chip">Tech</span>
                    <span className="profile-interest-chip">Business</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SocialLayout>
  );
};

export default SocialProfileTheme;
