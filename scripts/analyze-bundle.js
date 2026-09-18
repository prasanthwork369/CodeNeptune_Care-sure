#!/usr/bin/env node
/**
 * Bundle size analysis script
 * Helps identify which modules are taking up the most space
 *
 * Usage: npm run bundle:analyze
 */

const fs = require('fs');
const path = require('path');

function analyzeDirectory(dir, baseDir = '', results = {}) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        analyzeDirectory(filePath, baseDir || dir, results);
      } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) {
        const size = stat.size;
        const relativePath = path.relative(baseDir, filePath);

        if (!results[relativePath]) {
          results[relativePath] = 0;
        }
        results[relativePath] += size;
      }
    });
  } catch (error) {
    console.error(`Error analyzing ${dir}:`, error.message);
  }

  return results;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

console.log('\n📊 Bundle Analysis Report\n');
console.log('=' .repeat(70));

const srcDir = path.join(__dirname, '../src');
const results = analyzeDirectory(srcDir, srcDir);

// Sort by size
const sorted = Object.entries(results)
  .sort(([, sizeA], [, sizeB]) => sizeB - sizeA)
  .slice(0, 30); // Top 30

console.log('\nTop 30 Largest Files:\n');
console.log('Size       | File');
console.log('-'.repeat(70));

let totalSize = 0;
sorted.forEach(([file, size]) => {
  totalSize += size;
  console.log(`${formatSize(size).padEnd(11)}| ${file}`);
});

console.log('-'.repeat(70));
console.log(`${formatSize(totalSize).padEnd(11)}| TOTAL (Top 30)`);

// Category analysis
console.log('\n\nBundle by Category:\n');

const categories = {
  'Features': /src\/features/,
  'Hooks': /src\/hooks/,
  'Components': /src\/components/,
  'Utils': /src\/utils/,
  'Store': /src\/store/,
  'Services': /src\/services/,
  'API': /src\/api/,
  'Other': /.*/,
};

const categoryStats = {};
Object.entries(categories).forEach(([cat, regex]) => {
  categoryStats[cat] = Object.entries(results)
    .filter(([file]) => regex.test(file))
    .reduce((sum, [, size]) => sum + size, 0);
});

const sortedCats = Object.entries(categoryStats)
  .sort(([, sizeA], [, sizeB]) => sizeB - sizeA);

console.log('Category   | Size');
console.log('-'.repeat(70));
sortedCats.forEach(([cat, size]) => {
  if (size > 0) {
    const percentage = ((size / totalSize) * 100).toFixed(1);
    console.log(`${cat.padEnd(10)} | ${formatSize(size).padEnd(8)} (${percentage}%)`);
  }
});

console.log('\n' + '='.repeat(70));
console.log('\n💡 Optimization Tips:\n');
console.log('1. Code Splitting: Move large features to lazy-loaded bundles');
console.log('2. Tree Shaking: Remove unused imports and exports');
console.log('3. Dependencies: Review node_modules for duplicate packages');
console.log('4. Compression: Enable gzip compression in production');
console.log('5. Image Optimization: Convert to WebP (already done ✅)');

console.log('\n');
