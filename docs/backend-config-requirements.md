# CareSure Mobile — Backend Config Requirements

Fields the mobile app needs added to **existing** settings endpoints. No new
endpoints required.

The app already reads every field below and falls back to a safe local default
when it is absent, so these can be added **one at a time, in any order**, with no
mobile release needed and no risk to users already on the app.

---

## 1. `/api/v1/settings/customer-website`

Currently returns: `whatsappNumber`, `contactPhone`, `contactEmail`, `mapsApiKey`.

### Add — app version policy

| Field | Type | Example | Default if absent |
|---|---|---|---|
| `minSupportedVersion` | string | `"1.0.0"` | none — no block |
| `latestVersion` | string | `"1.4.0"` | none — no prompt |
| `maintenanceMode` | boolean | `false` | `false` |
| `maintenanceMessage` | string | `"Back at 3 PM"` | generic copy |

Behaviour: installed `< minSupportedVersion` → app blocked (forced update).
Installed `< latestVersion` → dismissible prompt. Format must be dotted numeric
(`"1.4.0"`). Anything else is ignored and the app continues normally.

> ⚠️ **Access control:** `minSupportedVersion` must NOT be editable by normal
> admins. A wrong value blocks every install and can only be undone by a
> corrected backend value. Release engineering only.

### Add — feature kill switches

| Field | Type | Default if absent |
|---|---|---|
| `features.substitutesEnabled` | boolean | `true` |
| `features.couponsEnabled` | boolean | `true` |
| `features.prescriptionUploadEnabled` | boolean | `true` |
| `features.walletTopUpEnabled` | boolean | `true` |
| `features.whatsappOrderEnabled` | boolean | `true` |
| `features.callOrderEnabled` | boolean | `true` |

> ⚠️ **Must default to `true`.** A missing field, a failed request or a bad
> response has to leave the feature ON. If these defaulted to off, a backend
> blip would disable the shop for users who could otherwise order.

```json
{
  "whatsappNumber": "...",
  "contactPhone": "...",
  "contactEmail": "...",
  "minSupportedVersion": "1.0.0",
  "latestVersion": "1.4.0",
  "maintenanceMode": false,
  "maintenanceMessage": null,
  "features": {
    "substitutesEnabled": true,
    "couponsEnabled": true,
    "prescriptionUploadEnabled": true,
    "walletTopUpEnabled": true,
    "whatsappOrderEnabled": true,
    "callOrderEnabled": true
  }
}
```

> **Note for backend:** this endpoint is named `customer-website` but is consumed
> by the mobile app too. If you would rather not mix mobile-only fields into a
> web-named endpoint, tell us and we will read them from a mobile-specific
> endpoint instead — it is a small mobile change.

---

## 2. `/api/v1/settings/public/customer/upload`

Currently returns: `maxFileSizeMb`, `prescriptionValidityMonths`.

| Field | Type | Example | Default if absent |
|---|---|---|---|
| `maxFiles` | number | `10` | `10` |

Max prescription files per upload. The app clamps to **1–20** regardless of the
value sent, so a typo cannot break uploads or cause out-of-memory crashes on
low-end Android.

Size and validity are already remote; count is the only one still hardcoded.

```json
{ "maxFileSizeMb": 10, "prescriptionValidityMonths": 6, "maxFiles": 10 }
```

---

## 3. `/api/v1/settings/public/customer/cart-wallet`

Currently returns `cart{...}` and `wallet{...}`.

| Field | Type | Example | Default if absent |
|---|---|---|---|
| `wallet.maxTopUpAmount` | number | `2000` | `2000` |

Also: `cart.maxCartItems` is **already being sent and the app currently ignores
it**. No backend change needed — the mobile side will start honouring it.

---

## Server-side enforcement (required)

Every limit here is a **UX guardrail, not security**. The app can be modified.
The API must independently reject:

- more than `maxFiles` files per prescription upload
- files larger than `maxFileSizeMb`
- top-ups above `maxTopUpAmount`
- cart quantities above `maxCartItems`
- **requests for features that are switched off**

The mobile app must never be the only enforcement point.

---

## Backward compatibility

- Every field **optional**. Older app versions ignore what they don't know.
- Never remove or rename a field once shipped — older installs stay in the wild
  for months.
- Values may be added incrementally; the app treats each independently.
- Changing `maxFiles` to `15` will not affect users on older builds. That is
  expected and safe: they degrade, they do not break.

---

## Admin panel access

| Safe for admins | Release engineering only |
|---|---|
| feature switches | `minSupportedVersion` |
| `maintenanceMode` / `maintenanceMessage` | `latestVersion` |
| support contacts | |
| `maxFiles`, `maxTopUpAmount`, `maxCartItems` | |

---

## Priority

1. **`features` object** — the only way to disable a broken feature without a store release
2. **`maxFiles`** — completes the upload config that already exists
3. **`maxTopUpAmount`**
4. **Version policy** — needed before the update gate can do anything

---

# Open questions for backend

These are not config values — they are contract details the mobile app is
currently guessing at.

## Q1. Which field is the storage delete key? ⚠️

`POST /storage/upload` — the app does not know what the response calls the key
used for deletion, so it guesses:

```ts
data.path ?? data.key ?? deriveKeyFromUrl(data.url)
```

**Why this matters:** if the guess is wrong, `DELETE /storage/delete` silently
fails and removed prescription images stay in the bucket permanently. That is
both a storage cost and medical images persisting after a user removed them,
which may matter for data-retention obligations.

**Please confirm:**
- exact field name for the delete key in the upload response
- whether `DELETE /storage/delete` errors on an unknown key, or returns success

## Q2. What status code does a non-serviceable pincode return?

Mobile tolerates a **non-2xx** response whose body still carries `serviceable`.
Web reads it only on 2xx. One of the two has the contract wrong.

**Please confirm:** 200 with `serviceable: false`, or 4xx with the flag in the
body?

## Q3. Endpoint naming (minor)

`/api/v1/settings/customer-website` is consumed by the mobile app as well as
web. If mobile-only fields there are unwelcome, we can read them from a
mobile-specific endpoint instead — small change on our side.
