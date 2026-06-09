import { medicineApi } from '@/src/api/medicine.api';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const resolveUUID = async (id: string, slug?: string, productId?: string): Promise<string> => {
    if (UUID_RE.test(id)) return id;
    const lookup = slug || productId || id;
    try {
        const detail = await medicineApi.getProductById(lookup);
        return detail.id;
    } catch {
        return id;
    }
};
