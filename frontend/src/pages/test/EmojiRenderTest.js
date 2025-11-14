import React from 'react';
import { applySkinTone } from '../../utils/emojiToneUtils';
import GlobalNavBar from '../../components/GlobalNavBar';

/**
 * Simple emoji render test to verify tone application
 * Route: /test/emoji-render
 */
const EmojiRenderTest = () => {
  const baseEmoji = '👍';
  const tones = ['tone1', 'tone2', 'tone3', 'tone4', 'tone5'];

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavBar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          🧪 Emoji Render Test
        </h1>

        {/* Hard-coded toned emojis */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-card-foreground mb-4">
            Hard-Coded Toned Emojis (Direct Unicode)
          </h2>
          <div className="flex gap-4 text-6xl">
            <div>
              <div>👍🏻</div>
              <p className="text-xs text-muted-foreground mt-2">tone1 (hard-coded)</p>
            </div>
            <div>
              <div>👍🏼</div>
              <p className="text-xs text-muted-foreground mt-2">tone2 (hard-coded)</p>
            </div>
            <div>
              <div>👍🏽</div>
              <p className="text-xs text-muted-foreground mt-2">tone3 (hard-coded)</p>
            </div>
            <div>
              <div>👍🏾</div>
              <p className="text-xs text-muted-foreground mt-2">tone4 (hard-coded)</p>
            </div>
            <div>
              <div>👍🏿</div>
              <p className="text-xs text-muted-foreground mt-2">tone5 (hard-coded)</p>
            </div>
          </div>
        </div>

        {/* applySkinTone() function test */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-card-foreground mb-4">
            applySkinTone() Function Test
          </h2>
          <div className="flex gap-4 text-6xl">
            {tones.map(tone => {
              const tonedEmoji = applySkinTone(baseEmoji, tone, true);
              console.log(`applySkinTone('${baseEmoji}', '${tone}', true) =`, tonedEmoji, 
                'charCodes:', Array.from(tonedEmoji).map(c => '0x' + c.codePointAt(0).toString(16)));
              
              return (
                <div key={tone}>
                  <div>{tonedEmoji}</div>
                  <p className="text-xs text-muted-foreground mt-2">{tone} (via applySkinTone)</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Base emoji */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-card-foreground mb-4">
            Base Emoji (No Tone)
          </h2>
          <div className="text-6xl">
            {baseEmoji}
          </div>
          <p className="text-sm text-muted-foreground mt-2">Base character: {baseEmoji}</p>
        </div>
      </div>
    </div>
  );
};

export default EmojiRenderTest;
