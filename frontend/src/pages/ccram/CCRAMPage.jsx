import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * CCRAM - CCR Anchor Module (Phase 2)
 * Real-Time Embodied Anchoring with Audio I/O
 * 
 * Features:
 * - Push-to-Listen (Whisper STT)
 * - Earpiece TTS cues
 * - AR Glasses scroll-card view
 * - Latency monitoring
 * - Panic Mute override
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

const TTS_VOICES = [
  { id: 'nova', name: 'Nova', desc: 'Energetic (recommended)' },
  { id: 'sage', name: 'Sage', desc: 'Wise, measured' },
  { id: 'onyx', name: 'Onyx', desc: 'Deep, authoritative' },
  { id: 'alloy', name: 'Alloy', desc: 'Neutral, balanced' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Bright, cheerful' },
];

const CCRAMPage = () => {
  const [question, setQuestion] = useState('');
  const [topicPack, setTopicPack] = useState('general');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('responses');
  const [panicMuted, setPanicMuted] = useState(false);
  
  // Phase 2: Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [ttsVoice, setTtsVoice] = useState('nova');
  const [latencyMs, setLatencyMs] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [arMode, setArMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Audio refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const sessionIdRef = useRef(`ccram-${Date.now()}`);

  const API_URL = process.env.REACT_APP_BACKEND_URL || '';

  // Initialize audio on first interaction
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        await processAudio(audioBlob);
      };
      
      setAudioEnabled(true);
    } catch (err) {
      setError('Microphone access denied');
    }
  };

  // Process recorded audio through full pipeline
  const processAudio = async (audioBlob) => {
    if (panicMuted) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        const response = await fetch(`${API_URL}/api/ccram/audio/full-pipeline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio_base64: base64Audio,
            session_id: sessionIdRef.current,
            topic_pack: topicPack,
            language: 'en',
            generate_tts: ttsEnabled,
            tts_voice: ttsVoice,
          }),
        });
        
        const data = await response.json();
        
        if (data.muted) {
          setPanicMuted(true);
          setLoading(false);
          return;
        }
        
        if (data.transcript) {
          setQuestion(data.transcript);
        }
        
        if (data.analysis) {
          setResult(data.analysis);
        }
        
        setLatencyMs(data.latency_ms);
        
        // Play first earpiece cue
        if (ttsEnabled && data.earpiece_audio && data.earpiece_audio.length > 0) {
          const firstCue = data.earpiece_audio[0];
          if (firstCue.audio_base64) {
            playAudio(`data:audio/mp3;base64,${firstCue.audio_base64}`);
          }
        }
        
        if (data.error) {
          setError(data.error);
        }
        
        setLoading(false);
      };
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Play audio from URL or base64
  const playAudio = (audioUrl) => {
    if (panicMuted) return;
    
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    
    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    audio.play().catch(console.error);
  };

  // Push-to-listen handlers
  const startRecording = () => {
    if (!audioEnabled || panicMuted) return;
    
    audioChunksRef.current = [];
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Text-based analysis (original flow)
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
      
      const data = await response.json();
      setResult(data);
      
      // Generate and play first earpiece cue
      if (ttsEnabled && data.earpiece_cues && data.earpiece_cues.length > 0) {
        const cueResponse = await fetch(`${API_URL}/api/ccram/audio/earpiece-cue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cue_text: data.earpiece_cues[0],
            session_id: sessionIdRef.current,
            voice: ttsVoice,
            speed: 1.2,
          }),
        });
        
        const cueData = await cueResponse.json();
        if (cueData.audio_url && !cueData.muted) {
          playAudio(cueData.audio_url);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [question, topicPack, API_URL, panicMuted, ttsEnabled, ttsVoice]);

  // Panic Mute - override all
  const handlePanicMute = async () => {
    setPanicMuted(true);
    setQuestion('');
    setResult(null);
    setIsRecording(false);
    
    // Stop any playing audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    
    // Notify backend
    await fetch(`${API_URL}/api/ccram/panic-mute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionIdRef.current,
        clear_buffer: true,
      }),
    }).catch(() => {});
    
    setTimeout(() => setPanicMuted(false), 3000);
  };

  // Play specific earpiece cue
  const playCue = async (cueText) => {
    if (panicMuted) return;
    
    try {
      const response = await fetch(`${API_URL}/api/ccram/audio/earpiece-cue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cue_text: cueText,
          session_id: sessionIdRef.current,
          voice: ttsVoice,
          speed: 1.2,
        }),
      });
      
      const data = await response.json();
      if (data.audio_url && !data.muted) {
        playAudio(data.audio_url);
      }
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  // AR Mode keyboard navigation
  useEffect(() => {
    if (!arMode || !result) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentCardIndex(prev => 
          Math.min(prev + 1, (result.glasses_cards?.length || 1) - 1)
        );
      } else if (e.key === 'ArrowLeft') {
        setCurrentCardIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        setArMode(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [arMode, result]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // AR Mode Full Screen View
  if (arMode && result) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
        onClick={() => setCurrentCardIndex(prev => 
          Math.min(prev + 1, (result.glasses_cards?.length || 1) - 1)
        )}
      >
        {/* Exit hint */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.8rem',
        }}>
          ESC to exit • TAP/SPACE to advance
        </div>
        
        {/* Card counter */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '1rem',
        }}>
          {currentCardIndex + 1} / {result.glasses_cards?.length || 0}
        </div>
        
        {/* Main card */}
        <div style={{
          maxWidth: '90%',
          padding: '60px 80px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            fontWeight: '700',
            color: '#FFFFFF',
            lineHeight: 1.3,
            margin: 0,
            textShadow: '0 0 30px rgba(255,255,255,0.3)',
          }}>
            {result.glasses_cards?.[currentCardIndex] || 'No card'}
          </p>
        </div>
        
        {/* Panic Mute button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePanicMute();
            setArMode(false);
          }}
          style={{
            position: 'absolute',
            bottom: '40px',
            padding: '16px 32px',
            background: '#dc2626',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '1.2rem',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          🛑 PANIC MUTE
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d1f3c 0%, #091428 50%, #050d1a 100%)',
      color: '#FFFFFF',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px',
        borderBottom: '1px solid rgba(100, 150, 220, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: '700',
            margin: 0,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            CCRAM <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>v2.0</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontSize: '0.85rem' }}>
            Real-Time Embodied Anchoring
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Latency indicator */}
          {latencyMs && (
            <div style={{
              padding: '6px 12px',
              background: latencyMs < 3000 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: latencyMs < 3000 ? '#22c55e' : '#eab308',
            }}>
              {latencyMs.toFixed(0)}ms
            </div>
          )}
          
          {/* AR Mode toggle */}
          <button
            onClick={() => result && setArMode(true)}
            disabled={!result}
            style={{
              padding: '10px 16px',
              background: result ? 'rgba(139, 92, 246, 0.2)' : 'rgba(100, 100, 100, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '8px',
              color: result ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
              cursor: result ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
            }}
          >
            👓 AR View
          </button>
          
          {/* Panic Mute Button */}
          <button
            onClick={handlePanicMute}
            style={{
              padding: '10px 20px',
              background: panicMuted ? '#dc2626' : 'rgba(220, 38, 38, 0.2)',
              border: '2px solid #dc2626',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {panicMuted ? '🔇 MUTED' : '🛑 PANIC'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', padding: '20px 32px' }}>
        {/* Left Panel - Input */}
        <div style={{ flex: '0 0 420px' }}>
          {/* Audio Controls */}
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            background: 'rgba(8, 18, 35, 0.8)',
            border: '1px solid rgba(100, 150, 220, 0.2)',
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>AUDIO INPUT</span>
              {!audioEnabled && (
                <button
                  onClick={initializeAudio}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(59, 130, 246, 0.3)',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Enable Mic
                </button>
              )}
            </div>
            
            {/* Push-to-Listen Button */}
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={!audioEnabled || panicMuted}
              style={{
                width: '100%',
                padding: '20px',
                background: isRecording 
                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
                  : audioEnabled 
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'rgba(100, 100, 100, 0.3)',
                border: 'none',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: audioEnabled && !panicMuted ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              {isRecording ? '🎤 LISTENING...' : audioEnabled ? '🎤 HOLD TO SPEAK' : '🎤 MIC DISABLED'}
            </button>
            
            {/* TTS Settings */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={ttsEnabled}
                  onChange={(e) => setTtsEnabled(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>TTS Cues</span>
              </label>
              
              <select
                value={ttsVoice}
                onChange={(e) => setTtsVoice(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: 'rgba(8, 18, 35, 0.8)',
                  border: '1px solid rgba(100, 150, 220, 0.3)',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                }}
              >
                {TTS_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic Pack Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
              CONTEXT PACK
            </label>
            <select
              value={topicPack}
              onChange={(e) => setTopicPack(e.target.value)}
              disabled={panicMuted}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(8, 18, 35, 0.8)',
                border: '1px solid rgba(100, 150, 220, 0.3)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.95rem',
              }}
            >
              {TOPIC_PACKS.map((pack) => (
                <option key={pack.key} value={pack.key}>
                  {pack.name} — {pack.description}
                </option>
              ))}
            </select>
          </div>

          {/* Text Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
              QUESTION / STATEMENT
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={panicMuted ? "System muted..." : "Type or use voice input..."}
              disabled={panicMuted}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '14px',
                background: 'rgba(8, 18, 35, 0.8)',
                border: '1px solid rgba(100, 150, 220, 0.3)',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) analyzeQuestion();
              }}
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeQuestion}
            disabled={!question.trim() || loading || panicMuted}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(100, 150, 220, 0.3)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading || panicMuted ? 'not-allowed' : 'pointer',
              opacity: !question.trim() || panicMuted ? 0.5 : 1,
            }}
          >
            {loading ? 'Processing...' : 'ANALYZE (⌘+Enter)'}
          </button>

          {error && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              background: 'rgba(220, 38, 38, 0.2)',
              border: '1px solid rgba(220, 38, 38, 0.5)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          {/* Classification */}
          {result && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(8, 18, 35, 0.8)',
              border: '1px solid rgba(100, 150, 220, 0.2)',
              borderRadius: '10px',
            }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                CLASSIFICATION
              </h3>
              
              {result.red_flag_triggered ? (
                <div style={{
                  padding: '10px',
                  background: 'rgba(220, 38, 38, 0.2)',
                  border: '1px solid #dc2626',
                  borderRadius: '6px',
                  color: '#fca5a5',
                  fontSize: '0.9rem',
                }}>
                  🚨 RED FLAG: {result.red_flag_reason}
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    background: TRAP_COLORS[result.classification?.primary_trap] || '#6b7280',
                    borderRadius: '16px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                  }}>
                    {result.classification?.primary_trap?.replace('_', ' ')}
                  </div>
                  
                  {result.classification?.secondary_traps?.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {result.classification.secondary_traps.map((trap, i) => (
                        <span key={i} style={{
                          padding: '3px 8px',
                          background: 'rgba(100, 150, 220, 0.2)',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                        }}>
                          {trap.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Responses */}
        <div style={{ flex: 1 }}>
          {result && !result.red_flag_triggered && (
            <>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                borderBottom: '1px solid rgba(100, 150, 220, 0.2)',
                paddingBottom: '10px',
              }}>
                {['responses', 'glasses', 'earpiece'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '8px 16px',
                      background: activeTab === tab ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                      border: activeTab === tab ? '1px solid #3b82f6' : '1px solid transparent',
                      borderRadius: '6px',
                      color: activeTab === tab ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      fontSize: '0.8rem',
                    }}
                  >
                    {tab === 'responses' ? '📝 Responses' : tab === 'glasses' ? '👓 Glasses' : '🎧 Earpiece'}
                  </button>
                ))}
              </div>

              {/* Responses Tab */}
              {activeTab === 'responses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {result.responses?.map((resp, i) => (
                    <div key={i} style={{
                      padding: '20px',
                      background: 'rgba(8, 18, 35, 0.8)',
                      border: '1px solid rgba(100, 150, 220, 0.2)',
                      borderRadius: '10px',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '14px',
                      }}>
                        <span style={{
                          padding: '4px 12px',
                          background: i === 0 ? '#22c55e' : i === 1 ? '#3b82f6' : '#8b5cf6',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                        }}>
                          {resp.length}
                        </span>
                        <button
                          onClick={() => copyToClipboard(resp.full_response)}
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(100, 150, 220, 0.2)',
                            border: 'none',
                            borderRadius: '4px',
                            color: 'rgba(255,255,255,0.8)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.7rem', marginBottom: '3px' }}>
                          MECHANISM
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>{resp.mechanism_anchor}</p>
                      </div>
                      
                      {resp.example && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ color: '#3b82f6', fontWeight: '600', fontSize: '0.7rem', marginBottom: '3px' }}>
                            EXAMPLE
                          </div>
                          <p style={{ margin: 0, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>{resp.example}</p>
                        </div>
                      )}
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ color: '#f97316', fontWeight: '600', fontSize: '0.7rem', marginBottom: '3px' }}>
                          BOUNDARY
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>{resp.boundary_statement}</p>
                      </div>
                      
                      <div>
                        <div style={{ color: '#8b5cf6', fontWeight: '600', fontSize: '0.7rem', marginBottom: '3px' }}>
                          REDIRECT
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.5, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
                          "{resp.redirect_question}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Glasses Tab */}
              {activeTab === 'glasses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.85rem' }}>
                      AR glasses scroll cards • Click card or press 👓 AR View for full screen
                    </p>
                  </div>
                  {result.glasses_cards?.map((card, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        setCurrentCardIndex(i);
                        setArMode(true);
                      }}
                      style={{
                        padding: '20px 28px',
                        background: '#000000',
                        border: '2px solid #FFFFFF',
                        borderRadius: '8px',
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {card}
                    </div>
                  ))}
                </div>
              )}

              {/* Earpiece Tab */}
              {activeTab === 'earpiece' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontSize: '0.85rem' }}>
                    Short whisper cues • Click to play TTS
                  </p>
                  {result.earpiece_cues?.map((cue, i) => (
                    <div 
                      key={i} 
                      onClick={() => playCue(cue)}
                      style={{
                        padding: '14px 20px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        borderRadius: '8px',
                        fontSize: '1.05rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.25)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)'}
                    >
                      <span style={{ fontSize: '1.1rem' }}>🎧</span>
                      {cue}
                      <span style={{ marginLeft: 'auto', fontSize: '0.8rem', opacity: 0.6 }}>▶</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Red Flag Response */}
          {result && result.red_flag_triggered && (
            <div style={{
              padding: '28px',
              background: 'rgba(220, 38, 38, 0.1)',
              border: '2px solid #dc2626',
              borderRadius: '10px',
            }}>
              <h3 style={{ color: '#fca5a5', margin: '0 0 16px' }}>🚨 RED FLAG RESPONSE</h3>
              {result.responses?.[0] && (
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  {result.responses[0].full_response}
                </p>
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
              height: '350px',
              color: 'rgba(255,255,255,0.4)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎯</div>
              <h3 style={{ margin: '0 0 6px', fontWeight: '500' }}>Ready for Analysis</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Use voice or type a hostile question</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 32px',
        borderTop: '1px solid rgba(100, 150, 220, 0.1)',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '0.75rem',
        textAlign: 'center',
      }}>
        CCRAM v2.0 — Real-Time Embodied Anchoring — No Persistent Logging — Panic Mute Overrides All
      </div>
      
      {/* Hidden audio element for TTS playback */}
      <audio ref={audioPlayerRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CCRAMPage;
