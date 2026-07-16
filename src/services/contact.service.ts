import { SUPPORT_EMAIL, SUPPORT_PHONE } from '@/src/constants/data';
import { Alert, Linking } from 'react-native';

const WHATSAPP_MESSAGE =
    'Hi, I would like to place a medicine order via WhatsApp. Please assist me.';

const EMAIL_SUBJECT = 'Help Request - CareSure App';

async function openURL(url: string, fallbackMessage: string): Promise<void> {
    try {
        await Linking.openURL(url);
    } catch {
        Alert.alert('Unable to open', fallbackMessage);
    }
}

/**
 * Plain functions, not a hook — notification handlers run outside React and
 * cannot call hooks. `useContactActions` wraps these for screens.
 */
export const contactService = {
    // `||` not a default param: callers pass backend values that can be null,
    // and a default only fills in for undefined.
    call: (phone?: string | null) => {
        const finalPhone = phone || SUPPORT_PHONE;
        return openURL(
            `tel:${finalPhone}`,
            `Please dial ${finalPhone} manually to place your order.`,
        );
    },

    whatsapp: (whatsapp?: string | null) => {
        const clean = (whatsapp || SUPPORT_PHONE).replace(/\D/g, '');
        const url =
            clean.startsWith('91') || clean.length > 10
                ? `https://wa.me/${clean}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
                : `https://wa.me/91${clean}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
        return openURL(
            url,
            'WhatsApp is not installed. Please install it or call us directly.',
        );
    },

    email: (email?: string | null) => {
        const finalEmail = email || SUPPORT_EMAIL;
        return openURL(
            `mailto:${finalEmail}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`,
            `Please email us at ${finalEmail} manually.`,
        );
    },
};
