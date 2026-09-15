# Testing & Quality Assurance Guide 🧪

This document outlines the testing architecture, unit and component test workflows with **Jest** and **React Native Testing Library**, and end-to-end (E2E) testing with **Maestro**.

---

## 1. Automated Testing Commands

CareSure enforces automated quality gates:

```bash
# Run the complete Jest test suite
npm test

# Run tests in watch mode during active development
npm run test:watch

# Generate code coverage statistics
npm run test:coverage

# Run ESLint validation
npm run lint

# Run TypeScript static type check (Zero errors allowed)
npx tsc --noEmit
```

---

## 2. Jest & Component Testing Setup

CareSure uses `jest-expo` as its test preset. Configuration lives in `jest.config.js` and global test setup is in `jest.setup.ts`.

### Mocking Strategy (`jest.setup.ts`)
Because React Native native modules require an actual mobile runtime (Android ART / iOS Darwin), Jest executes in a simulated Node.js environment with native bridges mocked out:

- **NetInfo**: Mocked to simulate online states with cellular/wifi connection types.
- **Expo SecureStore & AsyncStorage**: In-memory key-value dictionary mock.
- **SQLite (`expo-sqlite`)**: Mocked with synchronous memory operations.
- **Firebase Messaging & Crashlytics**: Mocked to capture events without network calls.
- **Reanimated & Gesture Handler**: Mocked using official test helpers to prevent TurboModule crashes.
- **Static Assets**: All `.png`, `.jpg`, `.svg`, `.lottie` imports are resolved to `<rootDir>/__tests__/__mocks__/fileMock.js`.

### Writing a Component Test Example
```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import { QuantityStepper } from "@/src/components/cart/QuantityStepper";

describe("QuantityStepper", () => {
  it("increments quantity when plus button is pressed", () => {
    const onIncrement = jest.fn();
    render(<QuantityStepper quantity={1} onIncrement={onIncrement} onDecrement={jest.fn()} />);

    fireEvent.press(screen.getByTestId("stepper-plus-btn"));
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });
});
```

---

## 3. End-to-End Testing with Maestro (`.maestro/`)

CareSure incorporates [Maestro](https://maestro.mobile.dev/) for high-confidence, non-flaky end-to-end mobile user journey testing.

### Test Flows in `.maestro/`:
1. **`smoke-login-cart.yaml`**: Full happy path — enters phone number, inputs mock OTP, browses catalogue, selects a medicine, adds to cart, and reaches checkout.
2. **`flow-logout-login.yaml`**: Tests session destruction and re-authentication.
3. **`flow-prescription-upload.yaml`**: Tests document picker flow, page reordering, and draft submission.

### Running Maestro Flows Locally:
Prerequisites: Connected physical Android device or running emulator with the app installed.
```bash
# Run smoke test flow
maestro test .maestro/smoke-login-cart.yaml

# Run prescription upload flow
maestro test .maestro/flow-prescription-upload.yaml
```

---

## 4. Continuous Integration (`.github/workflows/ci.yml`)

Every pull request and push to `main` or `develop` triggers GitHub Actions:
1. `npm ci` (clean dependency installation on Node 20).
2. `npx tsc --noEmit` (verifies strict TypeScript compilation).
3. `npm run lint` (ESLint checks).
4. `npm test -- --ci --maxWorkers=2 --colors` (executes all unit and component tests).
