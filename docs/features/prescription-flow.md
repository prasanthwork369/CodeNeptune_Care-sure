# Prescription Management & Scanning Architecture 📄

This document details the native document scanner integration, draft persistence, patient selection, PDF previewing, and backend submission in **CareSure Customer**.

---

## 1. Prescription Journey Walkthrough

```text
User initiates Prescription Flow (Bottom Tab / Cart Prompt)
                        │
                        ▼
Choose Method Screen (/app/(prescription)/choose-method.tsx)
    │
    ├── 1. Document Scanner (react-native-document-scanner-plugin)
    │      - Native camera edge detection & perspective crop
    │      - Multi-page document capture
    │
    ├── 2. Camera Photo (expo-image-picker)
    │
    └── 3. Gallery / PDF (expo-document-picker)
                        │
                        ▼
Prescription Draft Store (usePrescriptionDraftStore)
    - Deduplicates images by name and file size
    - Persists draft pages to AsyncStorage across app restarts
                        │
                        ▼
Select Patient Screen (/app/(prescription)/select-patient.tsx)
    - User selects an existing family member or adds a new patient
                        │
                        ▼
Preview Screen (/app/(prescription)/preview.tsx)
    - Multi-page image carousel & reordering
    - Full-screen pinch-to-zoom & PDF rendering (react-native-pdf)
                        │
                        ▼
Upload & Payment (/app/(prescription)/payment.tsx)
    - Validates file size (maxFileSizeMb) and file count (maxFiles)
    - Submits multipart form-data to /api/v1/prescriptions
    - Displays confirmation and clears draft store
```

---

## 2. Document Scanner & Media Handling

### Native Edge Detection & Camera Fallback (`ScannerService`)
- Implemented in `src/features/prescription/scanner/scanner.service.ts`.
- **Primary Method**: Calls `react-native-document-scanner-plugin` (which utilizes Google ML Kit Document Scanner on Android) for automatic document border detection, perspective skew correction, and contrast optimization.
- **Graceful Fallback**: If the native document scanner module is unavailable or encounters an initialization error, `ScannerService` automatically falls back to the standard device camera via `expo-image-picker` (`launchCameraAsync`).
- **Clean Output**: Always returns a typed `RawScanOutput` containing the captured page URIs without throwing unhandled exceptions to UI callers.

### Asynchronous Backend OCR (Not Client-Side)
- **Important**: The mobile client **does not** run on-device OCR models.
- All handwriting extraction, medicine parsing, and patient name matching are executed asynchronously on the CareSure backend server after upload.
- The mobile app later receives structured OCR results in API responses (such as `ocrData.patientName` and `ocrData.rejectionReasons`) for prescription status display.

### PDF Rendering (`react-native-pdf`)
- When patients upload existing digital prescriptions in PDF format, `react-native-pdf` renders vector pages locally with page thumbnails and pinch-to-zoom controls.

---

## 3. Remote Validation Limits & Fallbacks

Prescription limits are dynamically fetched from the `/api/v1/settings/public/customer/upload` settings endpoint:
- **`maxFiles`**: Maximum number of pages/files per upload (defaults to `10`, clamped between `1` and `20` to prevent low-end memory crashes).
- **`maxFileSizeMb`**: Maximum size per image in megabytes (defaults to `10 MB`).
- **`prescriptionValidityMonths`**: Maximum age of a valid prescription (defaults to `6 months`).

---

## 4. Draft State Persistence (`usePrescriptionDraftStore`)

The prescription draft state is persisted to `AsyncStorage`. If a user is interrupted while taking photos (e.g. by an incoming phone call or navigating away to grant camera permissions in OS Settings), their already-captured pages are preserved upon returning to the app. Once the upload succeeds, `clearItems()` wipes the draft.
