import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for each sheet
// User confirmed sheets 6 & 7 are 1x1 (single hero emojis)
// Sheets 1-5 are assumed to be 8x8 grids (64 emojis each)
const SHEETS = [
  { num: 1, rows: 8, cols: 8, description: 'Main emoji set 1' },
  { num: 2, rows: 8, cols: 8, description: 'Main emoji set 2' },
  { num: 3, rows: 8, cols: 8, description: 'Main emoji set 3' },
  { num: 4, rows: 8, cols: 8, description: 'Main emoji set 4' },
  { num: 5, rows: 8, cols: 8, description: 'Main emoji set 5' },
  { num: 6, rows: 1, cols: 1, description: 'Hero emoji 1' },
  { num: 7, rows: 1, cols: 1, description: 'Hero emoji 2' },
];

const INPUT_DIR = path.join(__dirname, '../public/static/emojis/emoji_sheets');
const OUTPUT_DIR = path.join(__dirname, '../public/static/emojis/banibs_full');

async function sliceSheet(sheetConfig) {
  const { num, rows, cols, description } = sheetConfig;
  const sheetPath = path.join(INPUT_DIR, `banibs_sheet_${num}.png`);
  
  console.log(`\n📋 Processing Sheet ${num}: ${description}`);
  console.log(`   Grid: ${rows}x${cols} = ${rows * cols} emojis`);
  
  const metadata = await sharp(sheetPath).metadata();
  const tileWidth = Math.floor(metadata.width / cols);
  const tileHeight = Math.floor(metadata.height / rows);
  
  console.log(`   Source: ${metadata.width}x${metadata.height}`);
  console.log(`   Tile size: ${tileWidth}x${tileHeight}`);
  
  let emojiCount = 0;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col: < cols; col++) {
      const left = col * tileWidth;
      const top = row * tileHeight;
      
      // Generate a unique ID for each emoji
      // Format: banibs_[sheet]_[index].png
      // Example: banibs_1_001.png, banibs_1_002.png, etc.
      const index = row * cols + col + 1;
      const paddedIndex = String(index).padStart(3, '0');
      const filename = `banibs_${num}_${paddedIndex}.png`;
      const outputPath = path.join(OUTPUT_DIR, filename);
      
      // Extract and save this emoji
      await sharp(sheetPath)
        .extract({ left, top, width: tileWidth, height: tileHeight })
        .toFile(outputPath);
      
      emojiCount++;
    }
  }
  
  console.log(`   ✅ Extracted ${emojiCount} emojis from sheet ${num}`);
  return emojiCount;
}

async function generateManifest(totalEmojis) {
  console.log(`\n📝 Generating manifest...`);
  
  // Build the emoji array for the manifest
  const emojis = [];
  let globalIndex = 1;
  
  for (const sheet of SHEETS) {
    const totalInSheet = sheet.rows * sheet.cols;
    
    for (let i = 1; i <= totalInSheet; i++) {
      const paddedIndex = String(i).padStart(3, '0');
      const filename = `banibs_${sheet.num}_${paddedIndex}.png`;
      
      emojis.push({
        type: 'image',
        id: `banibs_full_${String(globalIndex).padStart(4, '0')}`,
        src: filename,
        label: `BANIBS Custom ${globalIndex}`,
        category: 'people', // Default category, can be customized
        tags: ['banibs', 'custom', 'diverse'],
        supportsSkinTone: false, // Image-based emojis don't use Unicode skin tones
      });
      
      globalIndex++;
    }
  }
  
  const manifest = {
    id: 'banibs_full',
    label: '👨🏿 BANIBS (My Tone)',
    style: 'image',
    description: 'Full BANIBS custom emoji collection with diverse representation',
    categories: ['people', 'gestures', 'emotions'],
    emojis: emojis,
    metadata: {
      version: '1.0.0',
      totalEmojis: emojis.length,
      sheets: SHEETS.length,
      generatedAt: new Date().toISOString(),
    }
  };
  
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`   ✅ Manifest created: ${manifestPath}`);
  console.log(`   Total emojis in manifest: ${emojis.length}`);
  
  return manifest;
}

async function main() {
  console.log('🎨 BANIBS Emoji Sheet Slicer');
  console.log('================================\n');
  
  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  // Process each sheet
  let totalEmojis = 0;
  for (const sheetConfig of SHEETS) {
    const count = await sliceSheet(sheetConfig);
    totalEmojis += count;
  }
  
  // Generate manifest
  await generateManifest(totalEmojis);
  
  console.log(`\n✅ Complete!`);
  console.log(`   Total emojis extracted: ${totalEmojis}`);
  console.log(`   Output location: ${OUTPUT_DIR}`);
  console.log(`\n🎉 Ready to integrate into the emoji picker!`);
}

// Run the script
main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
