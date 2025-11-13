import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, Wifi, WifiOff, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import SocialLayout from '../../components/social/SocialLayout';

/**
 * Theme & Display Settings Page
 * /portal/social/settings/display
 * 
 * Controls:
 * - Theme (Dark, Light, System)
 * - Autoplay (Always, WiFi Only, Off)
 * - Other display preferences
 */
const SocialSettingsDisplay = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [autoplay, setAutoplay] = useState('always');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/social/settings`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          }
        );

        if (response.ok) {
          const settings = await response.json();
          setAutoplay(settings.autoplay || 'always');
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleThemeChange = async (newTheme) => {
    setSaving(true);
    await setTheme(newTheme);
    showSavedMessage();
    setSaving(false);
  };

  const handleAutoplayChange = async (newAutoplay) => {
    setSaving(true);
    setAutoplay(newAutoplay);

    try {
      const token = localStorage.getItem('access_token');
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/settings`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({ autoplay: newAutoplay })
        }
      );
      showSavedMessage();
    } catch (err) {
      console.error('Error saving autoplay setting:', err);
    } finally {
      setSaving(false);
    }
  };

  const showSavedMessage = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <SocialLayout>
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading settings...</div>
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/portal/social')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-gold)',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '16px',
              padding: 0
            }}
          >
            ← Back to Feed
          </button>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Theme & Display
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Customize how BANIBS Social looks and feels
          </p>
        </div>

        {/* Saved Indicator */}
        {saved && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--status-success-bg)',
            border: `1px solid var(--status-success)`,
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--status-success)'
          }}>
            <Check size={18} />
            <span>Settings saved</span>
          </div>
        )}

        {/* Theme Section */}
        <section style={{
          background: 'var(--bg-card)',
          border: `1px solid var(--border-subtle)`,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Theme
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            Choose the appearance of BANIBS Social
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Dark Theme */}
            <button
              onClick={() => handleThemeChange('dark')}
              disabled={saving}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px',
                background: theme === 'dark' ? 'var(--accent-gold-soft)' : 'var(--bg-secondary)',
                border: theme === 'dark' ? '2px solid var(--accent-gold)' : `1px solid var(--border-subtle)`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Moon size={24} color={theme === 'dark' ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: 600,
                  color: theme === 'dark' ? 'var(--accent-gold)' : 'var(--text-primary)'
                }}>
                  Dark
                </span>
                {theme === 'dark' && <Check size={18} color="var(--accent-gold)" style={{ marginLeft: 'auto' }} />}
              </div>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--text-tertiary)',
                textAlign: 'left'
              }}>
                Black glass with gold accents
              </p>
            </button>

            {/* Light Theme */}
            <button
              onClick={() => handleThemeChange('light')}
              disabled={saving}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px',
                background: theme === 'light' ? 'var(--accent-gold-soft)' : 'var(--bg-secondary)',
                border: theme === 'light' ? '2px solid var(--accent-gold)' : `1px solid var(--border-subtle)`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Sun size={24} color={theme === 'light' ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: 600,
                  color: theme === 'light' ? 'var(--accent-gold)' : 'var(--text-primary)'
                }}>
                  Light
                </span>
                {theme === 'light' && <Check size={18} color="var(--accent-gold)" style={{ marginLeft: 'auto' }} />}
              </div>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--text-tertiary)',
                textAlign: 'left'
              }}>
                Frosted glass with gold accents
              </p>
            </button>

            {/* System Theme (Optional - Future) */}
            <button
              disabled
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px',
                background: 'var(--bg-secondary)',
                border: `1px solid var(--border-subtle)`,
                borderRadius: '10px',
                cursor: 'not-allowed',
                opacity: 0.5
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Monitor size={24} color="var(--text-tertiary)" />
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: 600,
                  color: 'var(--text-tertiary)'
                }}>
                  System
                </span>
              </div>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--text-tertiary)',
                textAlign: 'left'
              }}>
                Coming soon
              </p>
            </button>
          </div>
        </section>

        {/* Autoplay Section */}
        <section style={{
          background: 'var(--bg-card)',
          border: `1px solid var(--border-subtle)`,
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Video Autoplay
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            Control when videos play automatically
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Always On */}
            <button
              onClick={() => handleAutoplayChange('always')}
              disabled={saving}
              style={{
                padding: '16px',
                background: autoplay === 'always' ? 'var(--accent-gold-soft)' : 'var(--bg-secondary)',
                border: autoplay === 'always' ? '2px solid var(--accent-gold)' : `1px solid var(--border-subtle)`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 600,
                  color: autoplay === 'always' ? 'var(--accent-gold)' : 'var(--text-primary)',
                  flex: 1
                }}>
                  Always
                </div>
                {autoplay === 'always' && <Check size={18} color="var(--accent-gold)" />}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Videos play automatically on any connection
              </p>
            </button>

            {/* WiFi Only */}
            <button
              onClick={() => handleAutoplayChange('wifi_only')}
              disabled={saving}
              style={{
                padding: '16px',
                background: autoplay === 'wifi_only' ? 'var(--accent-gold-soft)' : 'var(--bg-secondary)',
                border: autoplay === 'wifi_only' ? '2px solid var(--accent-gold)' : `1px solid var(--border-subtle)`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Wifi size={18} color={autoplay === 'wifi_only' ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 600,
                  color: autoplay === 'wifi_only' ? 'var(--accent-gold)' : 'var(--text-primary)',
                  flex: 1
                }}>
                  WiFi Only
                </div>
                {autoplay === 'wifi_only' && <Check size={18} color="var(--accent-gold)" />}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Save mobile data by autoplaying only on WiFi
              </p>
            </button>

            {/* Off */}
            <button
              onClick={() => handleAutoplayChange('off')}
              disabled={saving}
              style={{
                padding: '16px',
                background: autoplay === 'off' ? 'var(--accent-gold-soft)' : 'var(--bg-secondary)',
                border: autoplay === 'off' ? '2px solid var(--accent-gold)' : `1px solid var(--border-subtle)`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <WifiOff size={18} color={autoplay === 'off' ? 'var(--accent-gold)' : 'var(--text-secondary)'} />
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 600,
                  color: autoplay === 'off' ? 'var(--accent-gold)' : 'var(--text-primary)',
                  flex: 1
                }}>
                  Off
                </div>
                {autoplay === 'off' && <Check size={18} color="var(--accent-gold)" />}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Never autoplay videos, click to play manually
              </p>
            </button>
          </div>
        </section>
      </div>
    </SocialLayout>
  );
};

export default SocialSettingsDisplay;
