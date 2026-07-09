# Location QA Checklist

Purpose: Manual tests to validate location permission, GPS handling, persistence, and resume behavior.

Instructions: Follow each test case on a real device (Android and iOS where possible) and mark Pass/Fail.

---

## 1) Fresh install

- Preconditions:
  - App installed fresh (no prior data).
  - Device network available.
- Steps:
  1. Launch the app for the first time.
  2. Observe the header location text.
- Expected Result:
  - Header shows placeholder ("Select Location" / "Location unavailable").
  - No repeated permission or GPS prompts appear automatically.
- Result: [ ] Pass [ ] Fail

---

## 2) First-time user — permission granted, GPS ON

- Preconditions:
  - Fresh install or cleared app data.
  - Location permission not yet requested.
  - Device GPS/Location services ON.
- Steps:
  1. Launch the app.
  2. When prompted for location permission, grant it.
  3. Wait for header to update.
- Expected Result:
  - Permission dialog appears once.
  - App fetches current location in background, header updates to detected city/pincode.
  - `@caresure:last_known_location` is saved (verify by re-opening app — header persists).
- Result: [ ] Pass [ ] Fail

---

## 3) First-time user — permission granted, GPS OFF

- Preconditions:
  - Fresh install or cleared app data.
  - Location permission not yet requested.
  - Device GPS/Location services OFF.
- Steps:
  1. Launch the app.
  2. Grant location permission when asked.
  3. Observe whether a single, non-intrusive "Enable GPS" prompt appears.
  4. Select **Not Now**.
  5. Close the app and re-open.
- Expected Result:
  - Permission dialog appears once and is accepted.
  - App shows one non-intrusive prompt (Enable GPS / Not Now). System settings are NOT opened automatically.
  - Choosing Not Now suppresses further automatic GPS prompts while GPS remains off.
  - Header remains placeholder or any saved/default location.
- Result: [ ] Pass [ ] Fail

---

## 4) First-time user — permission denied

- Preconditions:
  - Fresh install or cleared app data.
  - Device GPS state arbitrary.
- Steps:
  1. Launch app and DENY location permission when prompted.
  2. Relaunch app.
  3. Tap the location area and press "Use Current Location".
- Expected Result:
  - The permission dialog shows once at first prompt; after denial, app does not automatically re-prompt on launch.
  - Header shows placeholder or saved/default location.
  - When tapping "Use Current Location", the app requests permission interactively again.
- Result: [ ] Pass [ ] Fail

---

## 5) Returning user with saved location

- Preconditions:
  - User previously granted permission and app saved a location in AsyncStorage.
- Steps:
  1. Launch app.
  2. Observe header immediately.
- Expected Result:
  - Header shows saved location instantly (no network call required to display header).
  - If permission already granted, app may silently refresh location in background and update header only if location changed.
- Result: [ ] Pass [ ] Fail

---

## 6) App restart

- Preconditions:
  - Saved location exists.
- Steps:
  1. Fully quit the app (remove from recents) and relaunch.
- Expected Result:
  - Saved location loads instantly into header.
  - No duplicate automatic fetch occurs from both startup and resume (only one startup fetch at most).
- Result: [ ] Pass [ ] Fail

---

## 7) Logout / Login

- Preconditions:
  - User signed in with saved location.
- Steps:
  1. Log out from the app.
  2. Log back in.
- Expected Result:
  - If logout clears location per app policy, header shows placeholder; otherwise previous saved location loads.
  - On login, onboarding should not spam permission dialogs; non-interactive checks run normally.
- Result: [ ] Pass [ ] Fail

---

## 8) Returning from Location Settings after enabling GPS

- Preconditions:
  - User previously granted permission, GPS OFF, and selected "Not Now" for the auto prompt.
- Steps:
  1. Tap Enable GPS (opens Settings) or open Settings manually.
  2. Turn GPS ON in device settings.
  3. Return to the app (tap app or open it from the launcher).
- Expected Result:
  - On resume the app silently detects GPS is enabled, fetches current location, updates header, persists new last-known location, and clears the "Not Now" suppression.
  - No prompts or system dialogs appear automatically on resume.
- Result: [ ] Pass [ ] Fail

---

## 9) Tapping "Use Current Location"

- Preconditions:
  - App running; permission may be granted or not.
- Steps:
  1. Open the location sheet and tap "Use Current Location".
- Expected Result:
  - If permission not granted: interactive OS permission dialog appears; if user grants, location is fetched and persisted.
  - If permission granted and GPS on: fetches location, persists it, and opens the add-address flow with prefilled params.
  - If GPS off: a gentle alert shows with Enable GPS action; settings open only when user taps it.
- Result: [ ] Pass [ ] Fail

---

## 10) Network unavailable while fetching location

- Preconditions:
  - Turn off device data/Wi-Fi.
- Steps:
  1. Trigger a location fetch (first-run auto fetch or "Use Current Location").
- Expected Result:
  - If reverse-geocoding or maps API calls fail due to network, app either:
    - Falls back gracefully and shows an error/toast, or
    - Prompts the user to retry.
  - No crashes, and no repeated permission/GPS prompts are triggered.
- Result: [ ] Pass [ ] Fail

---

## 11) Clearing app data / AsyncStorage

- Preconditions:
  - App has saved locations and flags in AsyncStorage.
- Steps:
  1. Clear app data (uninstall/reinstall or clear app storage) or call the app's clear-data flows.
  2. Relaunch app.
- Expected Result:
  - App behaves like a fresh install: shows placeholder, asks permission only when appropriate, and does not auto-open GPS settings.
- Result: [ ] Pass [ ] Fail

---

## 12) Android and iOS differences

- Preconditions:
  - Test on both Android and iOS devices (real devices preferred).
- Steps:
  1. Repeat key scenarios (permission granted/denied, GPS off/on, returning from Settings) on both platforms.
- Expected Result:
  - iOS: `Linking.openSettings()` opens the app settings where user toggles location; system behavior for permission differs but app still respects non-intrusive prompts and only requests when needed.
  - Android: `openLocationSettings()` should open the Location settings screen; the app should detect changes on resume and refresh silently.
  - No platform should repeatedly show system GPS dialogs automatically.
- Result: [ ] Pass [ ] Fail

---

### Notes / Useful checks

- Confirm AsyncStorage keys: `@caresure:last_known_location`, `@caresure:location_permission_asked`, `@caresure:gps_auto_prompt_shown`, `@caresure:gps_prompt_not_now` behave as expected.
- Use device logs (adb logcat / Xcode Console) to confirm only one location fetch occurs on launch/resume.
- Test on real devices when possible — emulators may not emulate GPS hardware or settings reliably.

---

End of checklist.
