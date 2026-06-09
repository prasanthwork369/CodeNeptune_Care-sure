import { NativeModules, Platform } from 'react-native';

const { PhoneNumberHint } = NativeModules;

/**
 * Shows the Android native phone number hint picker (Google Identity Services).
 * Uses GetPhoneNumberHintIntentRequest via Credential Manager — no SMS/contacts
 * permissions required.
 *
 * Returns the selected phone number (e.g. "+919876543210"), or null if the user
 * dismisses the dialog or no numbers are available.
 *
 * iOS always returns null (no equivalent API).
 */
export async function getPhoneNumberHint(): Promise<string | null> {
    if (Platform.OS !== 'android') return null;
    if (!PhoneNumberHint?.getPhoneNumberHint) return null;
    try {
        return await PhoneNumberHint.getPhoneNumberHint();
    } catch {
        return null;
    }
}

/**
 * Strips country code and formatting, returns bare 10-digit Indian mobile number.
 * e.g. "+919876543210" → "9876543210"
 */
export function normalizeIndianPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    // Take last 10 digits — handles +91xxxxxxxxxx and 91xxxxxxxxxx
    return digits.slice(-10);
}
