import React, { useState } from 'react';
import HighFiveAnim from '../../components/emoji/HighFiveAnim';
import HighFiveButton, { HighFiveUpsellModal } from '../../components/emoji/HighFiveButton';
import './HighFiveDemo.css';

const HighFiveDemo = () => {
  const [showUpsell, setShowUpsell] = useState(false);
  const [selectedTier, setSelectedTier] = useState('free');

  const handleHighFive = async (postId, active) => {
    console.log('High Five!', { postId, active });
    // Simulate API call
    return new Promise(resolve => setTimeout(resolve, 300));
  };

  return (
    <div className=\"highfive-demo-container\">
      <div className=\"demo-header\">
        <h1>🖐🏾 BANIBS High Five System</h1>
        <p>Sprite-based emoji animation with tier-based variants</p>
      </div>

      {/* Variant Showcase */}
      <section className=\"demo-section\">
        <h2>High Five Variants</h2>
        <div className=\"variant-grid\">
          <div className=\"variant-card\">
            <h3>Clean (Free)</h3>
            <HighFiveAnim variant=\"clean\" size={128} mode=\"loop\" fps={10} />
            <p>No spark, just hands slapping</p>
          </div>

          <div className=\"variant-card\">
            <h3>Small Spark (BANIBS+)</h3>
            <HighFiveAnim variant=\"spark_small\" size={128} mode=\"loop\" fps={10} />
            <p>Subtle gold flash at impact</p>
          </div>

          <div className=\"variant-card\">
            <h3>Big Spark (Elite)</h3>
            <HighFiveAnim variant=\"spark_big\" size={128} mode=\"loop\" fps={10} />
            <p>Full BANIBS gold blast</p>
          </div>
        </div>
      </section>

      {/* Animation Modes */}
      <section className=\"demo-section\">
        <h2>Animation Modes</h2>
        <div className=\"mode-grid\">
          <div className=\"mode-card\">
            <h3>Play Once (Reactions)</h3>
            <HighFiveAnim variant=\"spark_big\" size={128} mode=\"once\" fps={12} />
            <p>Click to replay</p>
          </div>

          <div className=\"mode-card\">
            <h3>Loop (Stickers/Flair)</h3>
            <HighFiveAnim variant=\"spark_small\" size={128} mode=\"loop\" fps={10} />
            <p>Continuous animation</p>
          </div>
        </div>
      </section>

      {/* Size Options */}
      <section className=\"demo-section\">
        <h2>Size Options</h2>
        <div className=\"size-showcase\">
          <div className=\"size-item\">
            <HighFiveAnim variant=\"spark_big\" size={64} mode=\"loop\" fps={10} />
            <span>64px</span>
          </div>
          <div className=\"size-item\">
            <HighFiveAnim variant=\"spark_big\" size={128} mode=\"loop\" fps={10} />
            <span>128px</span>
          </div>
          <div className=\"size-item\">
            <HighFiveAnim variant=\"spark_big\" size={256} mode=\"loop\" fps={10} />
            <span>256px</span>
          </div>
        </div>
      </section>

      {/* Reaction Button Integration */}
      <section className=\"demo-section\">
        <h2>Reaction Button (Tier-Based)</h2>
        
        <div className=\"tier-selector\">
          <label>Select User Tier:</label>
          <select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}>
            <option value=\"free\">Free</option>
            <option value=\"banibs_plus\">BANIBS+</option>
            <option value=\"elite\">Elite</option>
          </select>
        </div>

        <div className=\"reaction-showcase\">
          <div className=\"sample-post\">
            <p>Sample post content here...</p>
            <div className=\"post-actions\">
              <HighFiveButton
                postId=\"demo-post-1\"
                hasHighFived={false}
                highFiveCount={42}
                userTier={selectedTier}
                onHighFive={handleHighFive}
                size={32}
              />
            </div>
          </div>
        </div>

        <button 
          className=\"show-upsell-btn\"
          onClick={() => setShowUpsell(true)}
        >
          Show Upsell Modal
        </button>
      </section>

      {/* Asset Info */}
      <section className=\"demo-section info-section\">
        <h2>Asset Structure</h2>
        <div className=\"info-grid\">
          <div className=\"info-card\">
            <h4>Directory</h4>
            <code>/static/emojis/highfive/</code>
          </div>
          <div className=\"info-card\">
            <h4>Variants</h4>
            <ul>
              <li>clean/</li>
              <li>spark_small/</li>
              <li>spark_big/</li>
            </ul>
          </div>
          <div className=\"info-card\">
            <h4>Sprite Format</h4>
            <ul>
              <li>1×8 horizontal strip</li>
              <li>Sizes: 128, 256, 512px</li>
              <li>8 frames per animation</li>
            </ul>
          </div>
        </div>
      </section>

      <HighFiveUpsellModal
        isOpen={showUpsell}
        onClose={() => setShowUpsell(false)}
        targetTier=\"banibs_plus\"
      />
    </div>
  );
};

export default HighFiveDemo;
