# Prescription OCR Implementation Backup

**Backup Creation Date:** 2026-07-13

## Purpose
This backup captures the exact state of the OCR validation engine (including the experimental weighted scoring algorithm for handwritten prescriptions) before it was reverted to the previous stable state. This ensures no experimental code or logic is permanently lost.

## Files Included
This directory contains a complete copy of `src/features/prescription-scanner/` at the time of backup:
- `config.ts` - The weighted scoring configuration.
- `constants.ts` - Shared thresholds and keywords.
- `index.ts` - The orchestrator exporting structured `ScanResult`s.
- `ocr.service.ts` - The ML Kit integration.
- `prescription-validator.ts` - The pure validation function.
- `scanner.service.ts` - The document scanner integration.
- `types.ts` - Shared interfaces.
- `usePrescriptionUploadService.ts` - The core hook handling OCR flow and UI global alerts.

## How to Restore
1. Do NOT import these files directly into the production application.
2. To restore, either manually copy these files back into `src/features/prescription-scanner/`, replacing the existing files, or use Git to revert the revert commit.
