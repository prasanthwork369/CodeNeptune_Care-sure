import { ApiMobileAdditionalData } from '@/src/api/medicine.api';

type SafetyItem = { image: string; label: string; title: string; description: string };

const getSafetyStatusStyles = (label: string) => {
    const txt = label.toUpperCase();
    if (txt.includes('UNSAFE') || txt.includes('AVOID')) return { color: '#BC0808', bg: '#FFE3E3' };
    if (txt.includes('SAFE')) return { color: '#006C51', bg: '#EDFDF4' };
    if (txt.includes('CAUTION') || txt.includes('CONSULT')) return { color: '#98950E', bg: '#F8FFDE' };
    return { color: '#006C51', bg: '#EDFDF4' };
};

export const buildMoreAboutData = (
    mobileAdditionalData?: ApiMobileAdditionalData | null,
) => {
    const mob = mobileAdditionalData;
    const dynamicTabs: Array<{ id: string; label: string; heading?: string; content: string }> = [];

    if (mob?.mobBenefits) {
        dynamicTabs.push({ id: 'benefits', label: 'Benefits', content: mob.mobBenefits });
    }

    if (mob?.mobSideEffects) {
        dynamicTabs.push({ id: 'side_effect', label: 'Side Effect', content: mob.mobSideEffects });
    }

    if (mob?.mobHowToUse) {
        dynamicTabs.push({ id: 'how_to_use', label: 'How to use', content: mob.mobHowToUse });
    }

    const safetyItems: SafetyItem[] | null =
        Array.isArray(mob?.mobHowItWorks)
            ? (mob!.mobHowItWorks as SafetyItem[])
            : Array.isArray(mob?.safetyGuidance)
            ? (mob!.safetyGuidance as SafetyItem[])
            : null;

    if (safetyItems && safetyItems.length > 0) {
        dynamicTabs.push({ id: 'how_it_works', label: 'How It Works', content: '' });
    }

    if (mob?.mobWhatIfIForgotToTake) {
        dynamicTabs.push({ id: 'what_if_i_forget_to_take', label: 'Missed Dose', content: mob.mobWhatIfIForgotToTake });
    }

    if (mob?.mobManufacturerAddress) {
        dynamicTabs.push({ id: 'manufacturer_address', label: 'Manufacturer', content: mob.mobManufacturerAddress });
    }

    const safetyAdviceList = safetyItems?.length
        ? safetyItems.map((sg) => {
              const { color, bg } = getSafetyStatusStyles(sg.label);
              return {
                  id: sg.title,
                  title: sg.title,
                  status: sg.label,
                  statusColor: color,
                  statusBg: bg,
                  image: sg.image || null,
                  shortDescription: sg.description.length > 80 ? sg.description.slice(0, 80) + '...' : sg.description,
                  fullDescription: sg.description,
                  expandable: sg.description.length > 80,
              };
          })
        : [];

    return { tabsList: dynamicTabs, safetyAdviceList };
};
