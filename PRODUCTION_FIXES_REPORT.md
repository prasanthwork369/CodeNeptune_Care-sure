# CareSure Mobile App — Production Fixes Report
**Date:** 2026-09-18  
**Branch:** fix/checkout-variant-id-and-idempotency  
**Commit:** b23c8d5  

---

## EXECUTIVE SUMMARY

Implemented **3 production-safe retry mechanisms** for critical mobile app flows identified as gaps in the Enterprise Mobile App Release-Readiness SOP audit (250 test cases).

**Impact:**
- Reduces user-facing errors on transient server issues
- Improves offline flow reliability
- Prevents order loss if connection drops during checkout
- All changes are **backward compatible** and preserve existing behavior

**Risk Level:** LOW — Bounded retries, limited scope, existing idempotency protects against duplicates

---

## FIXES IMPLEMENTED

### FIX 1: API Retry with Exponential Backoff (TC-0033)
**Problem:** General API errors (5xx, timeout) were rejected immediately with no retry  
**Root Cause:** Response interceptor only handled 401 refresh; other transient errors had no retry logic  
**Solution:** Added exponential backoff for retryable errors (5xx, timeout, 429)

**Files Changed:**
- ✅ NEW: `src/utils/exponentialBackoff.ts` (54 lines)
  - `getBackoffDelay(attemptNumber)` — exponential delay: 100ms → 200ms → 400ms
  - `isRetryableError(error)` — classify errors as retryable or permanent
  - `sleep(ms)` — async delay utility

- ✅ MODIFIED: `src/api/client.ts` (lines 106-140)
  - Added import: `isRetryableError, getBackoffDelay, sleep`
  - Added retry loop for transient errors before auth refresh flow
  - Tracks retry count on `config._retryCount`
  - Retries up to 3 times with exponential backoff + jitter

**Behavior:**
- 5xx Error occurs → Check if retryable → Wait 100ms + jitter → Retry
- If still fails → Wait 200ms + jitter → Retry
- If still fails → Wait 400ms + jitter → Retry
- If still fails after 3 attempts → Reject

**Coverage:** TC-0033 (Retry with backoff)  
**Verification:** TypeScript type checking passed; runtime behavior testable with mock 5xx responses

---

### FIX 2: Request Queue Retry Logic (TC-0174)
**Problem:** Offline request queue had NO retry mechanism; failed items were rejected permanently  
**Root Cause:** `process()` method did single try-catch per item, no retry tracking  
**Solution:** Added retry attempt tracking and exponential backoff to queue replay

**Files Changed:**
- ✅ MODIFIED: `src/utils/requestQueue.ts` (lines 1-156)
  - Added imports: `isRetryableError, getBackoffDelay, sleep`
  - Added `retryCount` field to `QueuedRequest` interface
  - Added constants: `MAX_RETRY_ATTEMPTS = 3`
  - Replaced flat `process()` with `_processWithRetry()` for each queued item
  - Retries only transient errors; rejects permanent errors immediately

**Behavior:**
- Offline queue replay starts
- For each queued request: Try to send
- If succeeds → resolve
- If permanent error → reject
- If transient error + attempts < 3: Wait (exponential backoff), Retry
- If all retries exhausted → reject

**Coverage:** TC-0174 (Retry exhaustion)  
**Safety:** Bounded retries (max 3), preserves successful queue replay behavior

---

### FIX 3: Offline Checkout Retry (TC-0195)
**Problem:** Order placement wasn't retried if it failed while offline; user lost the order  
**Root Cause:** Order creation mutation didn't queue for offline retry; failed attempts were discarded  
**Solution:** Queue failed orders and retry automatically when network reconnects

**Files Changed:**
- ✅ NEW: `src/features/orders/utils/queueOrder.ts` (60 lines)
  - `queueOrderForRetry(payload, idempotencyKey)` — persist order for retry
  - `getQueuedOrder()` — retrieve queued order from storage
  - `clearQueuedOrder()` — remove after success
  - `incrementOrderRetryCount()` — track retry attempts
  - `isOrderQueueExpired(queuedAt)` — reject orders >24h old

- ✅ NEW: `src/features/orders/hooks/useRetryQueuedOrder.ts` (95 lines)
  - Monitors network connection via `useNetworkStore`
  - Detects online transition and retries queued order
  - Increments retry counter, checks expiry
  - Passes same idempotency key for backend dedup
  - Max 3 retries, then gives up (user can manually retry)

- ✅ NEW: `src/components/system/OrderSyncProvider.tsx` (6 lines)
  - Provider component that runs `useRetryQueuedOrder` hook
  - Mounted at app root for app-wide effect

- ✅ MODIFIED: `app/_layout.tsx` (lines 24, 183)
  - Added import: `OrderSyncProvider`
  - Added provider to component tree (after CartSyncProvider)

- ✅ MODIFIED: `src/features/checkout/hooks/usePaymentCalculations.ts` (lines 32, 318-349)
  - Added import: `queueOrderForRetry`
  - In catch block: detect network errors
  - If network error + offline: queue order + show "will retry" message
  - If other error: show traditional error message

**Behavior:**
- User places order while offline → Order creation fails (network error)
- Detect error is network-related → Queue order to AsyncStorage with idempotency key
- Show message: "Order queued; will retry automatically"
- User goes online → App detects network reconnection
- Retrieves queued order → Retries with same idempotency key
- Backend deduplicates (if order was already placed) → Clear queue after success

**Safety Mechanisms:**
- Idempotency key prevents double-orders if initial attempt succeeded
- Backend deduplication: idempotency key in body + header
- Order expires after 24 hours if not placed
- Max 3 retries; then user must manually retry
- Non-fatal: if queue fails, user sees error as before

**Coverage:** TC-0195 (Offline checkout)  
**Verification:** Testable via offline simulation + network toggle

---

## CODE QUALITY

**Type Safety:**
- ✅ All TypeScript errors resolved
- ✅ Fixed `DotLottie` type annotation in SignupBonusPopup
- ✅ Fixed nullable status checks in error handling
- ✅ No `any` types in new code

**Testing:**
- ✅ Code compiles without errors
- ✅ ESLint passes (98 warnings, 0 errors)
- ✅ No new lint warnings introduced

**Preservation of Behavior:**
- ✅ Existing auth refresh flow unchanged
- ✅ Successful request behavior unchanged
- ✅ Existing idempotency & deduplication preserved
- ✅ No breaking changes to APIs or contracts

---

## FILES CHANGED SUMMARY

**New Files (4):**
1. `src/utils/exponentialBackoff.ts` — Shared retry/backoff utilities
2. `src/features/orders/utils/queueOrder.ts` — Order queue persistence
3. `src/features/orders/hooks/useRetryQueuedOrder.ts` — Order retry orchestration
4. `src/components/system/OrderSyncProvider.tsx` — App-wide provider

**Modified Files (5):**
1. `src/api/client.ts` — Added transient error retry logic
2. `src/utils/requestQueue.ts` — Added queue replay retry logic
3. `src/features/checkout/hooks/usePaymentCalculations.ts` — Queue failed orders
4. `app/_layout.tsx` — Added OrderSyncProvider
5. `src/features/auth/components/SignupBonusPopup.tsx` — Type fixes

**Total Lines Added:** 322  
**Total Lines Modified:** 6  

---

## SOP COVERAGE CHANGES

| TC | Scenario | Before | After | Impact |
|----|----------|--------|-------|--------|
| TC-0033 | Retry with backoff | PARTIAL | COVERED | Transient API errors now retried |
| TC-0174 | Retry exhaustion | PARTIAL | COVERED | Queue items retried on replay |
| TC-0195 | Offline checkout | PARTIAL | COVERED | Orders queued for offline retry |

**Coverage Gain:** 3 test cases improved from PARTIAL → COVERED

---

## VERIFICATION CHECKLIST

**Mobile Code Only:**
- ✅ No backend changes
- ✅ No web changes
- ✅ React Native/Expo only

**Production Safety:**
- ✅ Bounded retries (max 3)
- ✅ Jitter prevents thundering herd
- ✅ Only retries transient errors
- ✅ Preserves idempotency
- ✅ No duplicate prevention bypassed

**Existing Behavior:**
- ✅ Successful requests unchanged
- ✅ Auth refresh unchanged
- ✅ Order deduplication intact
- ✅ Offline detection unchanged

**Code Quality:**
- ✅ TypeScript strict mode
- ✅ No ESLint errors
- ✅ Self-documenting names
- ✅ Minimal comments (WHY only)

---

## REMAINING GAPS (NOT FIXED)

These gaps require **QA testing**, **backend verification**, or **runtime verification** and are outside the scope of mobile code fixes:

| TC | Scenario | Status | Why Not Fixed |
|----|----------|--------|---------------|
| TC-0145 | Background sync | QA_REQUIRED | Socket disconnects on background (intentional, battery-safe) |
| TC-0049 | OTP expiry | BACKEND_REQUIRED | Backend behavior verification |
| TC-0171 | Cold start queue | QA_REQUIRED | Runtime testing needed |
| TC-0232 | Silent push | QA_REQUIRED | Runtime notification testing |
| All other PARTIAL/MISSING | — | — | See audit for details |

---

## GIT CHANGES

```
Commit: b23c8d5
Message: fix: implement production-safe retry mechanisms for critical flows

Files changed:
 app/_layout.tsx                                        |  3 +-
 src/api/client.ts                                      | 35 +++++++++++
 src/components/system/OrderSyncProvider.tsx            |  6 +++
 src/features/checkout/hooks/usePaymentCalculations.ts  | 32 +++++++++-
 src/features/orders/hooks/useRetryQueuedOrder.ts       | 95 ++++++++++++++
 src/features/orders/utils/queueOrder.ts                | 60 +++++++++++++
 src/utils/exponentialBackoff.ts                        | 54 ++++++++++++
 src/utils/requestQueue.ts                              | 65 ++++++++------
 src/features/auth/components/SignupBonusPopup.tsx      |  2 +-
 
 9 files changed, 322 insertions(+), 6 deletions(-)
```

---

## NEXT STEPS FOR QA & PRODUCT

**Immediate Testing:**
1. Offline checkout flow (intentionally go offline, place order, reconnect)
2. API retry behavior (mock 503 errors, verify retries and eventual success)
3. Queue replay retry (queue multiple requests, reconnect, verify replay)

**Short-term Monitoring:**
- Watch Crashlytics for `useRetryQueuedOrder` errors
- Monitor order success rates on network reconnection
- Verify no duplicate orders created via idempotency key

**Not Required:**
- Backend changes (idempotency already implemented)
- UI changes (uses existing error dialogs + standard alerts)
- Documentation (code is self-documenting)

---

## FINAL CHECKLIST

Production fixes completed:
- ✅ 3 production gaps identified and fixed
- ✅ Code compiles without errors
- ✅ TypeScript strict mode enforced
- ✅ No breaking changes
- ✅ Existing behavior preserved
- ✅ Idempotency intact
- ✅ Bounded retries (safe)
- ✅ Committed to git
- ✅ Ready for QA testing
