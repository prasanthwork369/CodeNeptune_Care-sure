/**
 * Recompresses images under assets/ in place using sharp.
 * Only overwrites a file when the recompressed version is smaller, and never
 * changes format or dimensions. Run with: npm run optimize-assets
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ASSETS_DIR = path.join(__dirname, "..", "assets");
const EXT_HANDLERS = {
  ".png": (img) => img.png({ quality: 80, compressionLevel: 9 }),
  ".jpg": (img) => img.jpeg({ quality: 80, mozjpeg: true }),
  ".jpeg": (img) => img.jpeg({ quality: 80, mozjpeg: true }),
  ".webp": (img) => img.webp({ quality: 80 }),
};

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

async function optimize(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const handler = EXT_HANDLERS[ext];
  if (!handler) return null;

  const original = fs.readFileSync(filePath);
  const optimized = await handler(sharp(original)).toBuffer();

  if (optimized.length >= original.length) return null;

  fs.writeFileSync(filePath, optimized);
  return { before: original.length, after: optimized.length };
}

async function main() {
  const files = walk(ASSETS_DIR);
  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;

  for (const filePath of files) {
    const result = await optimize(filePath);
    if (!result) continue;
    changed += 1;
    totalBefore += result.before;
    totalAfter += result.after;
    const savedPct = (100 * (1 - result.after / result.before)).toFixed(1);
    console.log(
      `${path.relative(ASSETS_DIR, filePath)}: ${result.before}B -> ${result.after}B (-${savedPct}%)`,
    );
  }

  if (changed === 0) {
    console.log("No files were smaller after recompression — nothing changed.");
    return;
  }

  const totalSavedPct = (100 * (1 - totalAfter / totalBefore)).toFixed(1);
  console.log(
    `\nOptimized ${changed} file(s): ${totalBefore}B -> ${totalAfter}B (-${totalSavedPct}%)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
