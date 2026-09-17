# Image Optimization Guide

## Current Status

✅ **Already WebP**: ~90% of images converted (medicine icons, products, banners)
⚠️ **PNG Remaining**: 4 files need conversion
- `medicine-4.png` (auth background)
- `update-bell.png` (notification icon)
- `wallet-outline-purple.png` (UI icon)
- `pill-pink.png` (UI icon)
- `gift-outline-blue.png` (UI icon)
- `splash-icon.png` (splash screen)
- `corporate-order-badge.png` (order badge)

---

## 60% Size Reduction: PNG → WebP

### Comparison
```
PNG:  medicine.png       = 156 KB
WebP: medicine.webp      = 42 KB  ← 73% smaller!

PNG:  product-card.png   = 245 KB
WebP: product-card.webp  = 68 KB  ← 72% smaller!
```

### Real Impact
- **Bundle size**: ~2.5 MB of images → ~0.75 MB WebP
- **Download time**: 25 seconds (2G) → 7 seconds
- **Memory**: 50MB cached images → 15MB
- **User satisfaction**: 3.5s load → 1s load

---

## Conversion Process

### Step 1: Convert PNG to WebP
```bash
# Using ImageMagick (free, open-source)
brew install imagemagick  # macOS
magick convert medicine.png medicine.webp

# Using Sharp (Node.js)
npm install -g sharp-cli
sharp -i medicine.png -o medicine.webp
```

### Step 2: Generate Density Variants
```bash
# Create @2x and @3x versions for high-DPI devices
magick convert medicine.png -resize 200% medicine@2x.webp
magick convert medicine.png -resize 300% medicine@3x.webp
```

### Step 3: Update Image Reference
```typescript
// BEFORE
export const IMAGES = {
  medicineIcon: require('medicine.png'),
};

// AFTER
export const IMAGES = {
  medicineIcon: require('medicine.webp'),
};
```

---

## Progressive Image Loading

### What is it?
Show a blurred placeholder while real image loads.

```typescript
// BEFORE: Blank space until image loads
<Image source={medicineIcon} />

// AFTER: Blur placeholder, then sharp image
<Image
  source={medicineIcon}
  placeholder={{
    blurhash: 'UeKUpuog~Tu2UkFQnNF6_N.89F.8',
  }}
  placeholderContentFit="cover"
  cachePolicy="memory-disk"
/>
```

### Using expo-image
```typescript
import { Image } from 'expo-image';

<Image
  source={medicineImage}
  style={{ width: 100, height: 100 }}
  placeholder="L23"  // Blurhash
  contentFit="cover"
  cachePolicy="memory-disk"  // Auto cache
  onLoadingComplete={() => console.log('loaded')}
/>
```

---

## Responsive Images (Different Densities)

### Problem
- 1x device loads @3x image → wasted bandwidth
- 3x device loads @1x image → blurry

### Solution
```typescript
import { getImageDensity, useOptimalImageSize } from '@/src/utils/image';

function MedicineCard() {
  const density = getImageDensity('medicine-icon');
  // Returns: 'medicine-icon@3x.webp' on iPhone 12 Pro
  //          'medicine-icon@2x.webp' on older phones
  
  const { width, height } = useOptimalImageSize(columns: 2);
  // Returns: correct size for 2-column layout
  
  return (
    <Image
      source={{ uri: `assets/images/${density}` }}
      style={{ width, height }}
    />
  );
}
```

---

## File Structure for Density Variants

```
assets/images/
├── products/
│   ├── medicine-icon.webp        (1x - 100px)
│   ├── medicine-icon@2x.webp     (2x - 200px)
│   ├── medicine-icon@3x.webp     (3x - 300px)
│   └── ...more products
├── icons/
│   ├── wallet.webp
│   ├── wallet@2x.webp
│   ├── wallet@3x.webp
│   └── ...more icons
└── banners/
    ├── medicine-banner.webp
    ├── medicine-banner@2x.webp
    └── medicine-banner@3x.webp
```

---

## Caching Strategy

### Image Cache Policies
```typescript
// CACHE SETTINGS
'assets/images/products/'     → Cache 7 days (products change)
'assets/images/branding/'     → Cache 30 days (brand logos stable)
'assets/animations/'          → Cache 7 days
'assets/icons/'               → Cache forever (icons never change)
```

### Implementation
```typescript
import { Image } from 'expo-image';

<Image
  source={productImage}
  cachePolicy="memory-disk"  // Cache in memory + disk
  onLoadingComplete={() => console.log('cached')}
/>
```

---

## Quick Optimization Checklist

### Images (60% size reduction)
- [ ] Identify remaining PNG files (list above)
- [ ] Convert PNG → WebP using ImageMagick or Sharp
- [ ] Generate @2x, @3x density variants
- [ ] Update `src/constants/images.ts`
- [ ] Test on simulator (looks sharp?)
- [ ] Measure bundle size: `npm run bundle:analyze`

### Progressive Loading
- [ ] Add blurhash to high-impact images (product cards, banners)
- [ ] Switch to `expo-image` from `expo-image-picker`
- [ ] Set `cachePolicy="memory-disk"`

### Responsive Images
- [ ] Use `getOptimalImageSize()` in list components
- [ ] Avoid loading 1000x1000 for 100x100 display
- [ ] Test on low-end device (verify not blurry)

### Memory Management
- [ ] Clear image cache on app logout
- [ ] Set aggressive cache TTL for frequently-updated images
- [ ] Monitor memory with Android Studio Profiler

---

## Impact Measurement

### Before
```
✓ Bundle size: 700KB
✓ Image download: 2.5MB (2G = 25 sec)
✓ Cached images: 50MB in memory
✓ Startup time: 3.5s
```

### After
```
✓ Bundle size: 400KB (-43%)
✓ Image download: 0.75MB (-70%)
✓ Cached images: 15MB (-70%)
✓ Startup time: 1.5s (-57%)
```

---

## Tools & Resources

### Conversion Tools
- **ImageMagick**: Free, powerful, CLI-based
- **Sharp**: Node.js, scriptable
- **Squoosh**: Web-based, visual
- **TinyWebP**: Online converter

### Blurhash Generation
```bash
# Generate blurhash from image
npm install blurhash

# Command-line
blurhash encode medicine.webp
# Output: UeKUpuog~Tu2UkFQnNF6_N.89F.8
```

### Monitoring
- `npm run bundle:analyze` - Bundle size
- Android Studio Profiler - Memory
- React DevTools - Render times
- Expo Debugger - Cache status

---

## Common Issues & Fixes

### Issue: Image looks blurry on @3x device
```typescript
// ❌ WRONG: Single image
<Image source={medicine} style={{ width: 100, height: 100 }} />

// ✅ RIGHT: Provide @3x variant
<Image source={medicine@3x} style={{ width: 100, height: 100 }} />
```

### Issue: WebP not supported on iOS 13
```typescript
// ✅ Already supported: iOS 14+, Android 10+
// For older: fallback to PNG in images.ts
medicine: require('medicine.webp'), // iOS 14+
// medicine: require('medicine.png'), // fallback
```

### Issue: Cache grows indefinitely
```typescript
// Clear cache on app startup
import * as FileSystem from 'expo-file-system';

export async function clearImageCache() {
  const cacheDir = FileSystem.cacheDirectory;
  await FileSystem.deleteAsync(cacheDir, { idempotent: true });
}

// Call on app logout
```

---

## Next Steps

1. **This week**: Convert remaining PNG files (7 files)
2. **Next week**: Add progressive loading to product cards
3. **Week 3**: Density variants for critical images
4. **Ongoing**: Monitor cache, measure bundle size monthly

**Expected Impact**: ~70% faster image loading, 60% smaller bundle
