# Release Readiness Audit — CareSure Mobile

Static audit against *Enterprise Mobile App Engineering Release Readiness SOP*
(250 rows / **167 unique** test cases — TC-0143→TC-0250 repeat 25 scenarios four
times).

**Status: static audit CLOSED.** Next step is a release build and physical-device
verification. Nothing further can be proven by reading code.

---

## Result

| Pass | Category | PASS | PARTIAL | MISSING |
|---|---|---|---|---|
| 1 | UX & User Behaviour | 17 | 5 | 0 |
| 2 | Network & API | 14 | 5 | 1 |
| 3 | Authentication & Session | 5 | 2 | 0 |
| 4 | Notifications | 6 | 2 | 0 |
| 5 | Security | 6 | 3 | 0 |
| 6 | Storage & Files | 8 | 0 | 2 |
| | **Total** | **56** | **17** | **3** |

**P0 release blockers found: none.**

## Fixed during the audit

| Finding | Commit |
|---|---|
| 429/400/409 classified as `unknown` and **retried** — a 429 sent 3 requests where the server asked for 0 | `3b8fc30` |
| OTP verify + guest-cart merge duplicate guards (state → ref) | `2f080d2` |
| WebView `originWhitelist` `"*"` → `"about:"`, JS explicitly disabled | `d45d057` |
| Prescription temp cache copies never deleted after successful upload | *pending* |

---

## ACCEPTED FOR THIS RELEASE

### P1-A · Font scaling disabled app-wide

`patchText.ts:148` and `patchTextInput.ts:33` set `allowFontScaling: false` on
every `Text` and `TextInput`, so the app ignores the OS font-size setting.

**Decision: accepted for this release cycle.** The design intentionally uses
fixed Figma typography across devices. **Do not change the global Text/TextInput
patch during this release.**

Trade-off on record: users who enable large system fonts — a meaningful segment
for a pharmacy app — see no scaling. Accepted knowingly, not overlooked.

---

## Follow-up — after release validation

### A11Y-1 · Controlled font scaling on critical text

Evaluate `maxFontSizeMultiplier` ≈ **1.2–1.3** for critical **ordering** and
**prescription** text, keeping `allowFontScaling: false` as the global default.

Candidate surfaces: product name and price, quantity stepper, cart and checkout
totals, prescription upload limits and status, order status.

Scope deliberately excludes decorative and layout-critical text, so the fixed
Figma sizing holds everywhere else.

**Blocked until:** release validation is complete.

---

## Deferred — not implemented, no work planned yet

| ID | Item | Severity |
|---|---|---|
| P2-B | Unsaved-changes confirmation missing on AddAddress / MyProfile / AddPatient | P2 |
| P2-C | `ProductGrid` pull-to-refresh is inert (`refreshing={false}`) | P2 |
| P2-D | No Retry affordance on empty-cache error screens | P2 |
| — | Offline request queue is dead code — recommend deleting | P2 |
| — | Resumable downloads not implemented | P2 |
| — | Low-storage / `ENOSPC` handling absent | P1 |

## Not justified — deliberately not built

Certificate pinning · root/jailbreak detection · screenshot blocking · biometric
auth · PIN auth · forgot-password · remember-me · dark mode · landscape.

Each was assessed against CareSure's actual threat model and product scope
rather than implemented because a checklist mentioned it.

---

## Open, owned by backend

1. **Storage delete key** — the app guesses `path ?? key ?? derivedFromUrl`.
   If wrong, deleted prescription images persist server-side. *Privacy /
   retention, not exploit.* **Highest-value open item.**
2. **Prescription URL access control** — are hosted URLs signed/expiring? Not
   verifiable from the app; if guessable, they are unauthenticated medical records.
3. Pincode non-2xx contract · config fields in `docs/backend-config-requirements.md`.

---

## Next step — device verification

None of the audit's conclusions about runtime behaviour are proven. Priority
order for the first device session:

1. **Release build, fresh install** — `npx expo prebuild --clean` then
   `npx expo run:android --variant release`. First compile of the Kotlin
   In-App Update module.
2. **Cold-launch text rendering** — hero title, category tabs, header city.
   Verifies the font-race fix.
3. **10 large prescription uploads** — progress, retry, memory, and that app
   cache stops growing (verifies the temp-copy fix).
4. **Airplane mode** across cart, coupon, upload, order-cancel.
5. **Notification cold start** from a killed app.
6. **Google Play Internal App Sharing**, version A → B, for the update flows.
