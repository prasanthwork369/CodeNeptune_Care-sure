export type ValidationResult = { valid: boolean; message: string };

const ok = (): ValidationResult => ({ valid: true, message: '' });
const fail = (message: string): ValidationResult => ({ valid: false, message });

// ─── Regex constants ──────────────────────────────────────────────────────────

export const REGEX = {
    digitsOnly: /[^0-9]/g,
    indianMobile: /^[6-9][0-9]{9}$/,
    pincode: /^[1-9][0-9]{5}$/,
    otp: /^\d{6}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// ─── Input sanitisers ─────────────────────────────────────────────────────────

// Local part of a patient's phone, minus the +91 country code we store/display separately.
export const stripIndianCode = (raw?: string | null): string =>
    (raw ?? '').replace(/^\+91/, '').replace(REGEX.digitsOnly, '');

export const sanitize = {
    // Pasted numbers usually carry a +91 or a leading 0. Drop the prefix rather
    // than slicing the first 10 digits, which would keep "91" and lose the tail.
    phone: (raw: string) => {
        let digits = raw.replace(REGEX.digitsOnly, '');
        if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
        else if (digits.length > 10 && digits.startsWith('0')) digits = digits.slice(1);
        return digits.slice(0, 10);
    },
    pincode: (raw: string) => raw.replace(REGEX.digitsOnly, '').slice(0, 6),
    otpDigit: (raw: string) => raw.replace(REGEX.digitsOnly, '').slice(0, 1),
    date: (raw: string) => {
        const digits = raw.replace(/\D/g, '');
        let formatted = digits;
        if (digits.length > 2) formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
        if (digits.length > 4) formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
        return formatted.slice(0, 10);
    },
    money: (raw: string) => raw.replace(REGEX.digitsOnly, '').replace(/^0+/, ''),
    // The app accepts English input only; the keyboard language itself cannot be forced on either platform.
    ascii: (raw: string) => raw.replace(/[^\x20-\x7E\n\t]/g, ''),
};

// Last line of defence before a payload leaves the app: the Android input filter cannot catch
// iOS paste or dictation, so free-text fields are stripped at the API boundary too.
export const sanitizeAsciiFields = <T extends object>(
    payload: T,
    keys: readonly (keyof T)[],
): T => {
    const out = { ...payload };
    for (const key of keys) {
        const value = out[key];
        if (typeof value === 'string') {
            out[key] = sanitize.ascii(value) as T[keyof T];
        }
    }
    return out;
};

// ─── Display formatters ───────────────────────────────────────────────────────

export const format = {
    // Any raw phone ("+919639639639", "919639639639", "9639639639") →
    // "+91 9639639639" — a single gap after the country code, then 10 digits.
    phone: (raw?: string | null): string => {
        if (!raw) return '';
        const digits = raw.replace(REGEX.digitsOnly, '').slice(-10);
        return digits ? `+91 ${digits}` : '';
    },
};

// ─── Validators ───────────────────────────────────────────────────────────────

export const validate = {
    required: (value: string, fieldName: string): ValidationResult =>
        value.trim() ? ok() : fail(`${fieldName} is required`),

    phone: (value: string): ValidationResult => {
        if (!value) return fail('Please enter your mobile number');
        if (value.length < 10) return fail('Please enter a valid 10-digit mobile number');
        if (!REGEX.indianMobile.test(value)) return fail('Please enter a valid 10-digit mobile number');
        return ok();
    },

    pincode: (value: string): ValidationResult => {
        const v = value.trim();
        if (!v) return fail('Pincode is required');
        if (v.length < 6 || !/^\d{6}$/.test(v)) return fail('Enter a valid 6-digit pincode');
        if (!REGEX.pincode.test(v)) return fail('Enter a valid pincode');
        if (/^(\d)\1{5}$/.test(v)) return fail('Enter a valid pincode');
        const digits = v.split('').map(Number);
        const isAscending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
        const isDescending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);
        if (isAscending || isDescending) return fail('Enter a valid pincode');
        return ok();
    },

    otp: (value: string): ValidationResult => {
        if (!value || value.length < 6) return fail('Enter the 6-digit OTP');
        if (!REGEX.otp.test(value)) return fail('OTP must contain digits only');
        return ok();
    },

    email: (value: string): ValidationResult => {
        const v = value.trim();
        if (!v) return fail('Email is required');
        if (!REGEX.email.test(v)) return fail('Enter a valid email address');
        return ok();
    },

    date: (value: string): ValidationResult => {
        if (!value) return fail('Date of Birth is required');
        if (value.length < 10) return fail('Enter full date (DD-MM-YYYY)');
        const [d, m, y] = value.split('-').map(Number);
        if (d < 1 || d > 31) return fail('Invalid day');
        if (m < 1 || m > 12) return fail('Invalid month');
        if (y < 1900 || y > new Date().getFullYear()) return fail('Invalid year');
        return ok();
    },

    form: (rules: ValidationResult[]): string | null => {
        const failed = rules.find((r) => !r.valid);
        return failed ? failed.message : null;
    },
};

