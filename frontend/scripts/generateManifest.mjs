// Generate manifest for smart-sliced BANIBS emojis

import fs from 'fs';
import path from 'path';

const __dirname = process.cwd();
const EMOJIS_DIR = path.join(__dirname, 'frontend', 'public', 'static', 'emojis', 'banibs_full');

async function generateManifest() {
  console.log('📝 Generating manifest for smart-sliced BANIBS emojis...\n');
  
  // Read all PNG files
  const files = await fs.promises.readdir(EMOJIS_DIR);
  const pngFiles = files
    .filter(f => f.endsWith('.png'))
    .sort();
  
  console.log(`Found ${pngFiles.length} emoji images\n`);
  
  // Build emoji array
  const emojis = pngFiles.map((filename, index) => {
    const id = path.basename(filename, '.png');
    
    return {
      type: 'image',
      id: `banibs_full_${id}`,
      src: filename,
      label: `BANIBS Custom ${index + 1}`,
      category: 'people',
      tags: ['banibs', 'custom', 'diverse', 'Black'],
      supportsSkinTone: false,
    };
  });
  
  // Create manifest
  const manifest = {
    id: 'banibs_full',
    label: '👨🏿 BANIBS (My Tone)',
    type: 'image',
    description: 'Smart-sliced BANIBS custom emoji collection with diverse Black representation',
    categories: ['people', 'gestures', 'emotions', 'hands', 'faces'],
    emojis: emojis,
    metadata: {
      version: '2.0.0',
      slicingMethod: 'smart-pixel-detection',
      totalEmojis: emojis.length,
      generatedAt: new Date().toISOString(),
    }
  };
  
  // Write manifest
  const manifestPath = path.join(EMOJIS_DIR, 'manifest.json');
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('✅ Manifest generated successfully!');
  console.log(`   Location: ${manifestPath}`);
  console.log(`   Total emojis: ${emojis.length}`);
  console.log(`   Slicing method: Smart pixel detection\n`);
}

generateManifest().catch(err => {
  console.error('❌ Error generating manifest:', err);
  process.exit(1);
});
