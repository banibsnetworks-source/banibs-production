import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSlice() {
  const sheetPath = path.join(__dirname, '../public/static/emojis/emoji_sheets/banibs_sheet_1.png');
  const outputDir = path.join(__dirname, '../public/static/emojis/test_slices');
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  console.log(`Testing 8x8 grid slice on sheet 1...`);
  
  const rows = 8;
  const cols = 8;
  const tileSize = 128; // 1024 / 8 = 128
  
  // Slice just the first few emojis as a test
  const testPositions = [
    { row: 0, col: 0, name: 'top_left' },
    { row: 0, col: 7, name: 'top_right' },
    { row: 3, col: 3, name: 'center' },
    { row: 7, col: 0, name: 'bottom_left' },
    { row: 7, col: 7, name: 'bottom_right' },
  ];
  
  for (const pos of testPositions) {
    const left = pos.col * tileSize;
    const top = pos.row * tileSize;
    
    await sharp(sheetPath)
      .extract({ left, top, width: tileSize, height: tileSize })
      .toFile(path.join(outputDir, `test_${pos.name}_r${pos.row}_c${pos.col}.png`));
    
    console.log(`✅ Sliced ${pos.name}: row ${pos.row}, col ${pos.col}`);
  }
  
  console.log(`\nTest slices saved to: ${outputDir}`);
  console.log(`Check these files to verify the grid is correct.`);
  console.log(`If emojis look good (not cut off), then 8x8 is correct!`);
}

testSlice().catch(console.error);
