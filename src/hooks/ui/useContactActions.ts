import { SUPPORT_EMAIL, SUPPORT_PHONE } from '@/src/constants/data';
import { Alert, Linking } from 'react-native';

const WHATSAPP_MESSAGE =
    'Hi, I would like to place a medicine order via WhatsApp. Please assist me.';

const EMAIL_SUBJECT = 'Help Request - CareSure App';

async function openURL(url: string, fallbackMessage: string): Promise<void> {
    try {
        await Linking.openURL(url);
    } catch (error) {
        Alert.alert('Unable to open', fallbackMessage);
    }
}

export function useContactActions() {
    const callSupport = () =>
        openURL(
            `tel:${SUPPORT_PHONE}`,
            `Please dial ${SUPPORT_PHONE} manually to place your order.`
        );

    const whatsappOrder = () =>
        openURL(
            `https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
            'WhatsApp is not installed. Please install it or call us directly.'
        );

    const emailSupport = () =>
        openURL(
            `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`,
            `Please email us at ${SUPPORT_EMAIL} manually.`
        );

    return { callSupport, whatsappOrder, emailSupport };
}
