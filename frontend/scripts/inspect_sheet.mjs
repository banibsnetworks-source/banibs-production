import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectSheet(sheetNum) {
  const sheetPath = path.join(__dirname, '../public/static/emojis/emoji_sheets', `banibs_sheet_${sheetNum}.png`);
  
  try {
    const metadata = await sharp(sheetPath).metadata();
    console.log(`\n=== Sheet ${sheetNum} ===`);
    console.log(`Dimensions: ${metadata.width} x ${metadata.height}`);
    console.log(`Format: ${metadata.format}`);
    console.log(`Channels: ${metadata.channels}`);
    
    // Try different grid sizes to see which makes sense
    const possibleGrids = [
      { rows: 1, cols: 1, size: 1024 },
      { rows: 8, cols: 8, size: 128 },
      { rows: 10, cols: 10, size: 102.4 },
      { rows: 16, cols: 16, size: 64 },
    ];
    
    console.log(`\nPossible grid layouts:`);
    possibleGrids.forEach(grid => {
      console.log(`  ${grid.rows}x${grid.cols} = ${grid.rows * grid.cols} emojis (each ${grid.size.toFixed(1)}px)`);
    });
    
  } catch (error) {
    console.error(`Error inspecting sheet ${sheetNum}:`, error.message);
  }
}

// Inspect all sheets
async function main() {
  for (let i = 1; i <= 7; i++) {
    await inspectSheet(i);
  }
  
  console.log(`\n=== Recommendation ===`);
  console.log(`User confirmed sheets 6 & 7 are 1x1 (single hero emojis).`);
  console.log(`For sheets 1-5, try starting with 8x8 grid (64 emojis each, 128px size).`);
  console.log(`This is a common emoji sprite sheet layout.`);
}

main();
