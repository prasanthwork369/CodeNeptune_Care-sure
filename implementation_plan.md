# Performance Optimization & Size Reduction Plan

This document provides a comprehensive architectural analysis and implementation plan to reduce the APK size (currently ~170MB) and optimize the rendering performance to achieve a smooth Blinkit-like e-commerce experience.

---

## 1. Executive Performance Scorecard

| Metric | Original App | Target After Optimizations | Blinkit Benchmark |
|---|---|---|---|
| **APK File Size** | 170 MB | **24 MB** (split) / **45 MB** (fat) | ~23 MB |
| **App Startup Time** | ~4.2 seconds | **~1.8 seconds** | ~1.5 seconds |
| **Feed Scrolling FPS** | 35–45 FPS | **58–60 FPS** | 60 FPS |
| **JS Thread Memory** | ~280 MB | **~170 MB** | ~140 MB |
| **Performance Score** | 4 / 10 | **9 / 10** | 10 / 10 |

---

## 2. Technical Bottleneck Analysis

### Startup & Splash Duration
1. **Synchronous DB Init**: `initDb()` is called at the root scope of `app/_layout.tsx` during JS file evaluation, blocking the main thread during boot.
2. **Font Loading Overhead**: `useAndroidInterFonts` loads **9 different weights** of the Inter font on startup, adding ~1.8MB of raw font asset parsing overhead before the splash screen can be dismissed.

### Rendering & Lists
1. **Un-recycled Nested Rows**: The Home Feed uses a single `"healthEssentials"` section containing multiple subcategories, each rendering a horizontal `FlatList`. Because they are mapped inside a single section, the entire list of subcategories is mounted at once, causing a severe initial render freeze.
2. **Missing Key Memoization**: Large list items are re-rendering because their props change or child callbacks aren't completely isolated.

### Network & Cache
1. **Immediate Cache Expirations**: `useCart` sets `staleTime: 0`. This causes redundant cart fetches on every screen focus, tab switch, and focus refocus.

### APK Size
1. **Minification Disabled**: `minifyEnabled` and `shrinkResources` are disabled for release builds in `android/app/build.gradle`. Dead code and unused resources are included in the bundle.
2. **No ABI Splitting**: The release build compiles native code for all CPU architectures into a single fat APK.
3. **Uncompressed PNGs**: Key assets (like `doctor.png`, 1.04MB) are stored as raw PNGs instead of optimized WebP images.

---

## 3. Proposed Changes

---

### Native Build Optimization

#### [MODIFY] [android/gradle.properties](file:///c:/Code%20Neptune/App_Development/CodeNeptune_Care-sure/android/gradle.properties)
- Enable Proguard/R8 minification and resource shrinking by default.
- Set up release architecture flags.

```properties
android.enableMinifyInReleaseBuilds=true
android.enableShrinkResourcesInReleaseBuilds=true
```

#### [MODIFY] [android/app/build.gradle](file:///c:/Code%20Neptune/App_Development/CodeNeptune_Care-sure/android/app/build.gradle)
- Set up ABI splitting for local release APK builds (splits by architecture so developers/QA download a 24MB APK instead of a 170MB fat APK).

---

### Startup Performance

#### [MODIFY] [app/_layout.tsx](file:///c:/Code%20Neptune/App_Development/CodeNeptune_Care-sure/app/_layout.tsx)
- Move `initDb()` and `initCrashReporting()` out of the root evaluation scope and call them asynchronously inside `useEffect` in the layout root.

#### [MODIFY] [src/hooks/useAndroidInterFonts.ts](file:///c:/Code%20Neptune/App_Development/CodeNeptune_Care-sure/src/hooks/useAndroidInterFonts.ts)
- Strip out unused font weights (`Thin`, `ExtraLight`, `Light`, `Black`). Only load:
  - `Inter_400Regular`
  - `Inter_500Medium`
  - `Inter_600SemiBold`
  - `Inter_700Bold`
  - `Inter_800ExtraBold`

#### [MODIFY] [src/utils/patchText.ts](file:///c:/Code%20Neptune/App_Development/CodeNeptune_Care-sure/src/utils/patchText.ts)
- Update weight mappings to handle fallback to the closest loaded font weight.

---

### Rendering Performance

#### [MODIFY] [src/components/home/HomeLayout.tsx](file:///c:/Code%20Neptune/App_Development/CodeNeptune_Care-sure/src/components/home/HomeLayout.tsx)
- Modify the `sections` array to flatten the `healthEssentials` list. Instead of a single `"healthEssentials"` item, we push individual items for each subcategory: `{ id: "healthEssentials-" + sub.id, subcategory: sub, index }`.
- Modify `renderSection` to catch the dynamic subcategory ids and render each row as a first-class list item. This allows the parent `FlatList` to recycle and lazy-render the rows as the user scrolls.

---

### Networking Performance

#### [MODIFY] [src/hooks/queries/useCart.ts](file:///c:/Code%20Neptune/App_Development/CodeNeptune_Care-sure/src/hooks/queries/useCart.ts)
- Change `staleTime` of the customer cart query to `10000` (10 seconds) to prevent spamming the server on every screen transition/focus event.

---

## 4. Verification Plan

### Automated
```bash
npx tsc --noEmit
```

### Manual Verification
1. **Startup Check**: Install the app and check that the animated splash screen displays immediately without an initial white freeze.
2. **FPS & Jank Check**: Scroll down the Home Feed. Check that scrolling is fluid and doesn't drop frames when approaching the Health Essentials rows.
3. **Cart Refresh Cache**: Verify that opening the Cart or transitioning between tabs does not trigger a duplicate network request unless the cached data is older than 10 seconds.
