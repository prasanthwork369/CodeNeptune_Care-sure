# What To Do When The Website Domain Changes

Simple guide: what breaks, what to redo, and in what order.

---

## The One Rule

> **The website domain is baked INSIDE the app when you build it.**
> Change the domain → you must rebuild the app and release it again.

You cannot fix this with a server change or an OTA update.

---

## Quick Answer

| Question | Answer |
|----------|--------|
| Domain changed — regenerate the certificate? | **No** |
| Domain changed — change assetlinks.json content? | **No** |
| Domain changed — upload assetlinks.json to new domain? | **Yes** |
| Domain changed — rebuild the app? | **Yes** |
| Domain changed — release to Play Store again? | **Yes** |
| Domain changed — do users need to update? | **Yes** |

---

## Why The App Must Be Rebuilt

When you run a build, `app.config.ts` reads the domain and writes it into the app file.

**Step 1** — the domain is read at build time:

```
app.config.ts  →  reads EXPO_PUBLIC_WEB_BASE_URL_PROD
               →  gets hostname (example: caresure.com)
```

**Step 2** — that hostname is written into the app:

```
AndroidManifest.xml (inside the APK)
   host = "caresure.com"      ← frozen here forever
```

**Step 3** — after install, it cannot change:

```
Installed app on phone
   "I only handle links from caresure.com"
   ↑ This is permanent for this app version.
```

So a new domain = a new build = a new Play Store release.

---

## Certificate vs Domain — Two Different Things

People mix these up. They are separate.

### Certificate (the fingerprint)

```
Belongs to:   Your app's signing key
Changes when: You change signing keys
Domain change affects it?  NO
```

### Domain (the website address)

```
Belongs to:   Each app build
Changes when: You rebuild with a different domain
Domain change affects it?  YES — that IS the change
```

**Simple way to remember:**
- Certificate answers: *"Is this really the CareSure app?"*
- Domain answers: *"Which website is this app allowed to open?"*

---

## Steps When Domain Changes

Example: moving from `qa-caresure.codeneptune.com` to `caresure.com`

### Step 1 — Upload the permission file to the new domain

Copy the **same file**, no changes to its content:

```
From:  public/.well-known/assetlinks.json
To:    https://caresure.com/.well-known/assetlinks.json
```

Check it works:

```bash
curl https://caresure.com/.well-known/assetlinks.json
```

Must return the JSON. Not a 404. Not a redirect.

---

### Step 2 — Update the build config

In `eas.json`, production profile:

```json
"production": {
  "env": {
    "EXPO_PUBLIC_APP_ENV": "production",
    "EXPO_PUBLIC_WEB_BASE_URL_PROD": "https://caresure.com"
  }
}
```

---

### Step 3 — Rebuild the app

```bash
eas build --profile production --platform android
```

---

### Step 4 — Release to Play Store

Upload the new AAB. Wait for rollout.

---

### Step 5 — Wait for users to update

Links only work for users who installed the **new** version.

---

## ⚠️ The Danger: Old App Versions

This is the part people forget.

```
User with OLD app version:
   App says:  "I handle qa-caresure.codeneptune.com"
   Link says: "caresure.com"
   Result:    Link opens in browser, not app.
```

If you **shut down the old domain**, old-version users get broken links.

### Safe migration

1. Keep **both** domains working
2. Host `assetlinks.json` on **both** domains (same file, both places)
3. Release the new app version
4. Wait 2–4 weeks for users to update
5. Check Play Console — how many users are still on old versions?
6. Only then retire the old domain

---

## When DOES The Certificate Change?

Only these situations:

| Situation | Certificate changes? |
|-----------|---------------------|
| Website/domain changes | No |
| App code changes | No |
| New app version released | No |
| You switch to a different signing key | **Yes** |
| You enroll in Google Play App Signing | **Yes** |
| Keystore lost and replaced | **Yes** |

### Important note about Google Play App Signing

If Google Play App Signing is enabled (default for new apps), **Google re-signs your app with their own key**.

In that case, `assetlinks.json` must contain **Google's** fingerprint, not yours.

Where to find it:

```
Play Console → Setup → App Integrity → App signing key certificate → SHA-256
```

---

## Checklist For A Domain Change

- [ ] New domain is live and serving HTTPS
- [ ] `assetlinks.json` uploaded to new domain at `/.well-known/assetlinks.json`
- [ ] `curl` confirms the file returns 200 with correct JSON
- [ ] Old domain still has the file too (during migration period)
- [ ] `EXPO_PUBLIC_WEB_BASE_URL_PROD` updated in `eas.json`
- [ ] New production build created
- [ ] Tested on a real device: link opens app, correct product shows
- [ ] Uploaded to Play Store
- [ ] Old domain kept alive for 2–4 weeks
- [ ] Checked Play Console for old-version user count before retiring old domain

---

## Files Involved

| File | What it does |
|------|--------------|
| `app.config.ts` | Reads the domain and writes it into the app at build time |
| `eas.json` | Sets which domain each build profile uses |
| `assetlinks.json` | Permission file — must live on the domain |
| `src/utils/urls.ts` | Builds the web URLs used for sharing |

---

## Summary Diagram

```
          DOMAIN CHANGE
                │
     ┌──────────┴──────────┐
     │                     │
 Certificate            Domain
     │                     │
  No change          Must rebuild
     │                     │
     │            ┌────────┴────────┐
     │            │                 │
     │      Upload file       Update eas.json
     │      to new domain           │
     │            │                 │
     │            └────────┬────────┘
     │                     │
     │               Rebuild app
     │                     │
     │              Release to Play
     │                     │
     └──────────┬──────────┘
                │
        Users must update
```

---

## One-Line Summary

**Certificate follows the app. Domain follows the build. Change the domain, rebuild the app.**
