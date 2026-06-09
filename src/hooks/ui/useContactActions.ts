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

export function useContactActions(options?: { phone?: string; whatsapp?: string; email?: string }) {
    const finalPhone = options?.phone || SUPPORT_PHONE;
    const finalWhatsapp = options?.whatsapp || SUPPORT_PHONE;
    const finalEmail = options?.email || SUPPORT_EMAIL;

    const callSupport = () =>
        openURL(
            `tel:${finalPhone}`,
            `Please dial ${finalPhone} manually to place your order.`
        );

    const whatsappOrder = () => {
        const cleanWhatsapp = finalWhatsapp.replace(/\D/g, '');
        const whatsappUrl = cleanWhatsapp.startsWith('91') || cleanWhatsapp.length > 10
            ? `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
            : `https://wa.me/91${cleanWhatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
        return openURL(
            whatsappUrl,
            'WhatsApp is not installed. Please install it or call us directly.'
        );
    };

    const emailSupport = () =>
        openURL(
            `mailto:${finalEmail}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`,
            `Please email us at ${finalEmail} manually.`
        );

    return { callSupport, whatsappOrder, emailSupport };
}
