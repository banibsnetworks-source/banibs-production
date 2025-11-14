// frontend/scripts/sliceBanibsSmart.mjs
//
// Smart BANIBS emoji slicer:
// - Uses pixel data, not fixed grids
// - Detects connected "blobs" of non-transparent pixels
// - Crops each blob as a separate emoji PNG

import fs from "fs";
import path from "path";
import sharp from "sharp";

const __dirname = process.cwd();

// Configure input + output
const SHEETS_DIR = path.join(__dirname, "frontend", "public", "static", "emojis", "emoji_sheets");
const OUT_DIR    = path.join(__dirname, "frontend", "public", "static", "emojis", "banibs_full");

// List all sheets we want to process
// NOTE: Sheets 1-4 are full composite sheets, skip them
// Only process sheets 5, 6, 7 which have individual emojis
const SHEETS = [
  // "banibs_sheet_1.png",  // SKIP - full sheet
  // "banibs_sheet_2.png",  // SKIP - full sheet
  // "banibs_sheet_3.png",  // SKIP - full sheet
  // "banibs_sheet_4.png",  // SKIP - full sheet
  "banibs_sheet_5.png",
  "banibs_sheet_6.png",
  "banibs_sheet_7.png",
];

// Tuning parameters
const ALPHA_THRESHOLD = 10;   // pixel considered "on" if alpha > this
const MIN_BLOB_SIZE   = 40;   // ignore tiny noise blobs (in pixels)
const PADDING         = 16;   // extra pixels around each emoji when cropping

function idx(x, y, width) {
  return y * width + x;
}

async function findBlobs(buffer, width, height) {
  const channels = 4;
  const visited = new Uint8Array(width * height);
  const blobs = [];

  const isOn = (x, y) => {
    const i = (y * width + x) * channels;
    const alpha = buffer[i + 3];
    return alpha > ALPHA_THRESHOLD;
  };

  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = idx(x, y, width);
      if (visited[index]) continue;
      if (!isOn(x, y)) {
        visited[index] = 1;
        continue;
      }

      // BFS/flood-fill to find connected component
      let queue = [[x, y]];
      visited[index] = 1;

      let minX = x, maxX = x;
      let minY = y, maxY = y;
      let count = 0;

      while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        count++;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        for (const [dx, dy] of directions) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const nIndex = idx(nx, ny, width);
          if (visited[nIndex]) continue;
          if (!isOn(nx, ny)) {
            visited[nIndex] = 1;
            continue;
          }
          visited[nIndex] = 1;
          queue.push([nx, ny]);
        }
      }

      if (count >= MIN_BLOB_SIZE) {
        blobs.push({ minX, maxX, minY, maxY, count });
      }
    }
  }

  return blobs;
}

async function sliceSheet(sheetName, startIndex) {
  const inputPath = path.join(SHEETS_DIR, sheetName);
  const baseName  = path.basename(sheetName, path.extname(sheetName));

  console.log(`\n🧩 Processing sheet: ${sheetName}`);

  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  console.log(`   Dimensions: ${width} x ${height}`);

  // Find all blobs (emoji regions)
  let blobs = await findBlobs(data, width, height);

  if (blobs.length === 0) {
    console.warn(`   ⚠️ No blobs found for ${sheetName}`);
    return startIndex;
  }

  // Sort blobs top-to-bottom, then left-to-right for consistent ordering
  blobs.sort((a, b) => {
    if (a.minY === b.minY) {
      return a.minX - b.minX;
    }
    return a.minY - b.minY;
  });

  await fs.promises.mkdir(OUT_DIR, { recursive: true });

  let index = startIndex;

  for (const blob of blobs) {
    let left   = Math.max(blob.minX - PADDING, 0);
    let top    = Math.max(blob.minY - PADDING, 0);
    let right  = Math.min(blob.maxX + PADDING, width - 1);
    let bottom = Math.min(blob.maxY + PADDING, height - 1);

    const outWidth  = right - left + 1;
    const outHeight = bottom - top + 1;

    const id = String(index).padStart(3, "0");
    const filename = `banibs_${id}.png`;
    const outPath  = path.join(OUT_DIR, filename);

    await sharp(inputPath)
      .extract({ left, top, width: outWidth, height: outHeight })
      .png()
      .toFile(outPath);

    console.log(`   ✅ Saved ${filename} [${outWidth}x${outHeight}] from ${baseName}`);
    index++;
  }

  console.log(`   🧮 Found and sliced ${blobs.length} emojis on ${sheetName}`);
  return index;
}

async function main() {
  let index = 1;
  for (const sheet of SHEETS) {
    index = await sliceSheet(sheet, index);
  }
  console.log(`\n🎉 Finished smart slicing. Total emojis: ${index - 1}`);
}

main().catch((err) => {
  console.error("❌ Error in smart slicer:", err);
  process.exit(1);
});
