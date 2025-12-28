import React, { useState, useCallback } from 'react';

/**
 * CCRAM - CCR Anchor Module
 * Conversation Containment Rule Support Tool
 * 
 * Real-time response assistance for hostile/public interviews
 */

const TOPIC_PACKS = [
  { key: 'general', name: 'General', description: 'Mechanism focus, pattern observation' },
  { key: 'banibs', name: 'BANIBS', description: 'Sovereignty, circulation, agency' },
  { key: 'hdos', name: 'HDOS', description: 'Decision-space, exit preservation' },
  { key: 'dismissive', name: 'Dismissive Argument', description: 'Fault scanning, inquiry collapse' },
  { key: 'restorative', name: 'Restorative Circles', description: 'Circulation, regeneration' },
  { key: 'tree_of_life', name: 'Tree of Life', description: 'Word-as-life, nourishment' },
];

const TRAP_COLORS = {
  identity: '#ef4444',
  motive: '#f97316',
  urgency: '#eab308',
  gotcha: '#84cc16',
  smear: '#ef4444',
  scope_creep: '#06b6d4',
  misquote: '#8b5cf6',
  evidence: '#ec4899',
  false_binary: '#f43f5e',
  neutral: '#6b7280',
};

const CCRAMPage = () => {
  const [question, setQuestion] = useState('');
  const [topicPack, setTopicPack] = useState('general');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('responses');
  const [panicMuted, setPanicMuted] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL || '';

  const analyzeQuestion = useCallback(async () => {
    if (!question.trim() || panicMuted) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/ccram/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          topic_pack: topicPack,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [question, topicPack, API_URL, panicMuted]);

  const handlePanicMute = () => {
    setPanicMuted(true);
    setQuestion('');
    setResult(null);
    setTimeout(() => setPanicMuted(false), 3000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d1f3c 0%, #091428 50%, #050d1a 100%)',
      color: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        borderBottom: '1px solid rgba(100, 150, 220, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CCRAM
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontSize: '0.9rem' }}>
            CCR Anchor Module — Conversation Containment Support
          </p>
        </div>
        
        {/* Panic Mute Button */}
        <button
          onClick={handlePanicMute}
          style={{
            padding: '12px 24px',
            background: panicMuted ? '#dc2626' : 'rgba(220, 38, 38, 0.2)',
            border: '2px solid #dc2626',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {panicMuted ? '🔇 MUTED' : '🛑 PANIC MUTE'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', padding: '24px 32px' }}>
        {/* Left Panel - Input */}
        <div style={{ flex: '0 0 400px' }}>
          {/* Topic Pack Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
              CONTEXT PACK
            </label>
            <select
              value={topicPack}
              onChange={(e) => setTopicPack(e.target.value)}
              disabled={panicMuted}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(8, 18, 35, 0.8)',
                border: '1px solid rgba(100, 150, 220, 0.3)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              {TOPIC_PACKS.map((pack) => (
                <option key={pack.key} value={pack.key}>
                  {pack.name} — {pack.description}
                </option>
              ))}
            </select>
          </div>

          {/* Question Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
              INCOMING QUESTION / STATEMENT
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={panicMuted ? "System muted..." : "Enter the hostile question or statement..."}
              disabled={panicMuted}
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '16px',
                background: 'rgba(8, 18, 35, 0.8)',
                border: '1px solid rgba(100, 150, 220, 0.3)',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '1rem',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  analyzeQuestion();
                }
              }}
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeQuestion}
            disabled={!question.trim() || loading || panicMuted}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? 'rgba(100, 150, 220, 0.3)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading || panicMuted ? 'not-allowed' : 'pointer',
              opacity: !question.trim() || panicMuted ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Analyzing...' : 'ANALYZE & GENERATE CCR RESPONSE'}
          </button>

          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid rgba(220, 38, 38, 0.5)',
              borderRadius: '8px',
              color: '#fca5a5',
            }}>
              {error}
            </div>
          )}

          {/* Classification Result */}
          {result && (
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'rgba(8, 18, 35, 0.8)',
              border: '1px solid rgba(100, 150, 220, 0.2)',
              borderRadius: '12px',
            }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                TRAP CLASSIFICATION
              </h3>
              
              {result.red_flag_triggered ? (
                <div style={{
                  padding: '12px',
                  background: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid #dc2626',
                  borderRadius: '8px',
                  color: '#fca5a5',
                }}>
                  🚨 RED FLAG: {result.red_flag_reason}
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: TRAP_COLORS[result.classification.primary_trap] || '#6b7280',
                    borderRadius: '20px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                  }}>
                    {result.classification.primary_trap.replace('_', ' ')}
                  </div>
                  
                  {result.classification.secondary_traps?.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {result.classification.secondary_traps.map((trap, i) => (
                        <span key={i} style={{
                          padding: '4px 10px',
                          background: 'rgba(100, 150, 220, 0.2)',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                        }}>
                          {trap.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p style={{ margin: '12px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                    {result.classification.reasoning}
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Responses */}
        <div style={{ flex: 1 }}>
          {result && !result.red_flag_triggered && (
            <>
              {/* Tab Navigation */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                borderBottom: '1px solid rgba(100, 150, 220, 0.2)',
                paddingBottom: '12px',
              }}>
                {['responses', 'glasses', 'earpiece'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '10px 20px',
                      background: activeTab === tab ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      border: activeTab === tab ? '1px solid #3b82f6' : '1px solid transparent',
                      borderRadius: '8px',
                      color: activeTab === tab ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      fontSize: '0.85rem',
                    }}
                  >
                    {tab === 'responses' ? '📝 Responses' : tab === 'glasses' ? '👓 Glasses' : '🎧 Earpiece'}
                  </button>
                ))}
              </div>

              {/* Responses Tab */}
              {activeTab === 'responses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {result.responses.map((resp, i) => (
                    <div key={i} style={{
                      padding: '24px',
                      background: 'rgba(8, 18, 35, 0.8)',
                      border: '1px solid rgba(100, 150, 220, 0.2)',
                      borderRadius: '12px',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                      }}>
                        <span style={{
                          padding: '6px 14px',
                          background: i === 0 ? '#22c55e' : i === 1 ? '#3b82f6' : '#8b5cf6',
                          borderRadius: '16px',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}>
                          {resp.length} VERSION
                        </span>
                        <button
                          onClick={() => copyToClipboard(resp.full_response)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(100, 150, 220, 0.2)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'rgba(255,255,255,0.8)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.75rem', marginBottom: '4px' }}>
                          MECHANISM ANCHOR
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.6 }}>{resp.mechanism_anchor}</p>
                      </div>
                      
                      {resp.example && (
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ color: '#3b82f6', fontWeight: '600', fontSize: '0.75rem', marginBottom: '4px' }}>
                            EXAMPLE
                          </div>
                          <p style={{ margin: 0, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>{resp.example}</p>
                        </div>
                      )}
                      
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ color: '#f97316', fontWeight: '600', fontSize: '0.75rem', marginBottom: '4px' }}>
                          BOUNDARY
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>{resp.boundary_statement}</p>
                      </div>
                      
                      <div>
                        <div style={{ color: '#8b5cf6', fontWeight: '600', fontSize: '0.75rem', marginBottom: '4px' }}>
                          REDIRECT
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.6, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)' }}>
                          "{resp.redirect_question}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Glasses Tab */}
              {activeTab === 'glasses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                    High-contrast cards for AR glasses (1-2 lines each)
                  </p>
                  {result.glasses_cards.map((card, i) => (
                    <div key={i} style={{
                      padding: '24px 32px',
                      background: '#000000',
                      border: '2px solid #FFFFFF',
                      borderRadius: '8px',
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      textAlign: 'center',
                      letterSpacing: '0.5px',
                    }}>
                      {card}
                    </div>
                  ))}
                </div>
              )}

              {/* Earpiece Tab */}
              {activeTab === 'earpiece' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                    Short whisper cues (3-8 words)
                  </p>
                  {result.earpiece_cues.map((cue, i) => (
                    <div key={i} style={{
                      padding: '16px 24px',
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>🎧</span>
                      {cue}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Red Flag Response */}
          {result && result.red_flag_triggered && (
            <div style={{
              padding: '32px',
              background: 'rgba(220, 38, 38, 0.1)',
              border: '2px solid #dc2626',
              borderRadius: '12px',
            }}>
              <h3 style={{ color: '#fca5a5', margin: '0 0 20px' }}>🚨 RED FLAG RESPONSE</h3>
              {result.responses[0] && (
                <>
                  <p style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
                    {result.responses[0].full_response}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Empty State */}
          {!result && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ margin: '0 0 8px', fontWeight: '500' }}>Ready for Analysis</h3>
              <p style={{ margin: 0 }}>Enter a hostile question to generate CCR-anchored responses</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '20px 32px',
        borderTop: '1px solid rgba(100, 150, 220, 0.1)',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.8rem',
        textAlign: 'center',
      }}>
        CCRAM v1.0 — Mechanism-Anchored Response System — No Logging Active
      </div>
    </div>
  );
};

export default CCRAMPage;
