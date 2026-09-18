#!/usr/bin/env node
/**
 * Convert PNG images to WebP format
 * Usage: node scripts/convert-images-to-webp.js
 *
 * Benefits:
 * - ~60% size reduction compared to PNG
 * - Better quality at smaller file sizes
 * - Supported on Android 4.0+ and iOS 14+
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetDir = path.join(__dirname, '../assets');

// PNG files to convert
const filesToConvert = [
  'icons/gift-outline-blue.png',
  'icons/pill-pink.png',
  'icons/wallet-outline-purple.png',
  'images/auth/medicine-4.png',
  'images/icons/update-bell.png',
  'images/notification-icon.png',
  'images/notification-tile.png',
  'images/orders/corporate-order-badge.png',
  'images/icon.png',
  'images/splash-icon.png',
  'images/favicon.png',
];

async function convertToWebP() {
  let converted = 0;
  let failed = 0;

  for (const file of filesToConvert) {
    const inputPath = path.join(assetDir, file);
    const outputPath = inputPath.replace(/\.png$/, '.webp');

    if (!fs.existsSync(inputPath)) {
      console.warn(`⚠️  File not found: ${file}`);
      failed++;
      continue;
    }

    try {
      await sharp(inputPath)
        .webp({ quality: 85, progressive: true })
        .toFile(outputPath);

      const inputSize = fs.statSync(inputPath).size;
      const outputSize = fs.statSync(outputPath).size;
      const reduction = Math.round((1 - outputSize / inputSize) * 100);

      console.log(`✅ ${file}`);
      console.log(`   ${(inputSize / 1024).toFixed(2)}KB → ${(outputSize / 1024).toFixed(2)}KB (-${reduction}%)`);

      converted++;
    } catch (error) {
      console.error(`❌ Failed to convert ${file}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Converted: ${converted}/${filesToConvert.length}`);
  if (failed > 0) console.log(`   Failed: ${failed}`);
}

convertToWebP().catch(console.error);
