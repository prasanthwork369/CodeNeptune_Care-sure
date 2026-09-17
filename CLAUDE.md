You are an expert React Native and Expo engineer helping me build
CareSure.
Write clean, simple, maintainable code. Prioritize clarity over
unnecessary abstraction.
Think like a senior mobile developer.

--

## Project Overview

We are building CareSure, an online pharmacy app for browsing medicines, managing prescriptions, and getting orders delivered.
The app includes:

- Medicine browsing by category and search
- Cart, coupons, and checkout
- Prescription upload, review, and medicine comparison
- Order tracking and order success screens
- Notifications
- User profile, addresses, and location selection
- CareSure Coins (loyalty/rewards)

Keep the implementation simple and readable.

--

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind
- Zustand
- AsyncStorage
- Custom phone/OTP authentication (token-based, via backend API)

Do not introduce new major libraries unless there is a strong reason.
Ask before installing anything new.

--

## Development Philosophy

Build feature by feature.
For every feature:

1. Read this file first.
2. Keep the implementation simple.
3. Avoid overengineering.
4. Prefer readable code over clever code.
5. Build the smallest useful version first.
6. Refactor only when repetition appears.

--

## Code Comments & Structure

- **Comments**: Single-line only, never paragraphs (`// ...`). Simple and in required places only. Only comment to explain *why* (complex business logic, edge cases, workarounds) in one concise line. Never write multi-line comment blocks or explanatory paragraphs (`/* ... */`). Never add comments describing obvious code (e.g., no `// Title`, `// Button`, `// Header`, `// handle click`).
- **Structure**: Clean, modular, and easily understandable at a glance.
  - Self-documenting code with descriptive, intuitive names.
  - Colocate related styles and helpers where appropriate; avoid unnecessary file fragmentation.
  - Strictly adhere to the project's architecture boundaries (`app/` for routes, `components/<feature>/` for UI, `hooks/` for logic/queries, `store/` for global state).

--

## Decision Making

If something is unclear or could be improved, suggest a better
approach. If a new library would significantly help, recommend it,
explain why, and ask before adding it.
Do not install new libraries without approval.

--

## Architecture

This is the actual structure. Keep it accurate — a wrong map is worse
than none.

```
app/                 Expo Router routes only
  (auth)/ (tabs)/ (commerce)/ (catalog)/ (prescription)/
  category/ product/ profile/ search/ notifications/
src/
  api/               one file per backend resource: *.api.ts
  components/        <feature>/sections/ for screen parts
  constants/         icons, images, status codes, typography
  features/          self-contained feature packages (prescription, cart, etc.)
  hooks/             queries/ mutations/ ui/ + feature hooks at the root
  lib/               infrastructure: react-query, sqlite, storage, crashlytics
  modules/           TypeScript wrappers for local Expo native modules
  services/          business logic on top of api/
  store/             Zustand stores (cart, auth, checkout, location, ui, etc.)
  theme/             colours, spacing, animations, screen transitions
  types/             shared types
  utils/             pure helpers, plus utils/offline/
modules/             local native Expo modules (Kotlin + expo-module.config.json)
plugins/             custom Expo config plugins for Android prebuild
scripts/             build & asset optimization scripts
.maestro/            E2E UI automation flows
docs/                comprehensive technical & developer documentation
```

**app/** is for routes and screens only. Screens compose components and
call hooks or stores. They should not contain large reusable UI blocks
or business logic.

**components/** is for reusable UI, grouped **by feature, not by type**.
A cart modal lives under `components/cart/`, not in a shared `modals/`
folder. Screen sub-parts go in `<feature>/sections/`. Create a component
when it is reused, when it makes a screen easier to read, or when it is
a clear UI concept. Do not create components too early.

**api/ vs services/** — `api/` is the raw HTTP call and nothing else.
Add a matching `*.service.ts` **only** when something sits on top:
response reshaping, business rules, or combining several calls. Roughly
half the resources are api-only, and that is correct — do not add an
empty pass-through service.

**hooks/** — `queries/` holds one hook per feature, and those hooks
intentionally return **both** the query data and that feature's
mutations (`useCart` exposes the cart plus add/update/remove). So a
mutation is not necessarily in `mutations/`; look for the feature hook
first. `mutations/` is for mutations with no query to belong to.
`ui/` is for presentation-level hooks.

**store/** holds Zustand stores: cart items (cartStore), auth/token
(authStore), checkout (checkoutStore, checkoutDraftStore), prescription
draft (prescriptionDraftStore), location (locationStore), coupons
(couponStore), network state (useNetworkStore), etc. Persist with
AsyncStorage or SecureStore when needed.

**lib/ vs utils/ vs modules/** — `lib/` is infrastructure wiring
(react-query client, sqlite cache, token storage). `utils/` is pure
helpers with no setup of their own (plus offline primitives in
`utils/offline/`). Root **modules/** contains local native Expo Modules
(`in-app-update`, `native-notifications`, `phone-number-hint`,
`text-input-filter`), whose Kotlin lives in `modules/<name>/android/`
and is registered via `expo-module.config.json`. `src/modules/` provides
the TypeScript typed bridge wrappers. Root **plugins/** contains Expo
config plugins (`withCropScreenColors`, `withFirebaseNotificationColorFix`,
`withGradleJvmHeap`, `withNotifeeRepo`, `withProfileable`) executed
during `expo prebuild`. Never edit the generated `android/` folder — it
is gitignored and regenerated on every prebuild.

Never expose secret keys anywhere in `src/`.

--

## UI Rules

For any UI task:

- Replicate the provided design exactly.
- Match layout, spacing, padding, font sizes, font hierarchy, colors,
  border radius, shadows, alignment, and proportions.
- Do not approximate. Do not simplify unless explicitly asked.

--

## Styling Rules

Use NativeWind classes. Do not use StyleSheet unless it is not possible
to style with className.
Use the NativeWind version installed in this project. Check
package.json. Do not upgrade without approval.
Reuse class patterns through utilities in global.css.

### Style Exception List

Use StyleSheet or inline styles for:

- SafeAreaView (className not supported)
- KeyboardAvoidingView (behavior props)
- Modal (visible, transparent props)
- Animated.View (animated style values)
- Dynamic styles calculated at runtime
- Platform specific styles
- Pressable or TouchableOpacity pressed states
- Shadows (different per platform)

Everywhere else, use NativeWind.

--

## Image Rule

Use centralized image imports.

1. Check if constants/images.ts exists.
2. If not, create it.
3. Import all app images there.
4. Use them through the centralized object.

```ts
import mascot from "@/assets/images/mascot.png";
export const images = {
  mascot,
};
```

```tsx
<Image source={images.mascot} />
```

Do not import image assets directly inside screens or components.

--

## State Management

- Zustand for global client state.
- Local state for temporary UI state.
- AsyncStorage for persistence.

--

## TypeScript

- Strict mode.
- No `any`.
- Keep types simple and readable.

--

## Feature Implementation

When building a feature:

1. Read this file first.
2. Identify the files to change.
3. Keep changes focused.
4. Do not rewrite unrelated code.
5. Follow existing patterns.
6. Make sure the feature works end to end.
7. Fix lint and type errors before finishing.

--

## Secrets

- Never expose secret keys in client code.
- Use server routes for tokens, AI calls, and any external API access.

--

## Authentication

Use the existing custom phone/OTP authentication (authStore, token
storage, profile API). Do not introduce Clerk or another auth provider
without approval.

--

## Communication

Be concise. Explain what changed and how to test it.

--

## Final Reminder

Before every feature:

- Read this file.
- Follow it strictly.
- Build clean, simple code.
- Replicate UI exactly when designs are provided.
