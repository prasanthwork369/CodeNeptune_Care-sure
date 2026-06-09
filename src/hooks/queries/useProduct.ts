import { useQuery } from '@tanstack/react-query';
import { medicineApi, MedicineVariant } from '../../api/medicine.api';
import { QUERY_KEYS } from '@/src/lib/react-query/queryKeys';
import { formatPackLabel } from '@/src/utils/packLabel';

export type { MedicineVariant };

const parsePackSize = (packSize: string | number | null | undefined): number => {
    if (packSize == null) return 1;
    const match = String(packSize).match(/\d+/);
    return match ? parseInt(match[0]) : 1;
};

export const useProduct = (productId: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.CATALOG.PRODUCT_BY_ID(productId),
        queryFn: () => medicineApi.getProductById(productId),
        enabled: !!productId,
        staleTime: 0,
    });

    // Numbers for arithmetic only
    const price = data ? parseFloat(String(data.price)) : 0;
    const discountPct = data ? parseFloat(String(data.discountPercentage)) : 0;
    const packSizeNum = data ? parsePackSize(data.packSize) : 1;
    const unitPrice = packSizeNum > 0 ? parseFloat((price / packSizeNum).toFixed(2)) : 0;

    const product = data ? {
        name: data.name,
        slug: data.slug,
        requiresPrescription: data.requiresPrescription,
        manufacturer: data.manufacturer?.name ?? data.brand?.name ?? '',
        brandName: data.brand?.name ?? '',
        description: data.description ?? `${data.dosageForm} | ${data.packSize.trim()}`,
        dosageForm: data.dosageForm,
        packSize: packSizeNum,
        packLabel: formatPackLabel({ packSize: data.packSize, unit: data.unit, dosageForm: data.dosageForm }),
        // Raw API strings for display
        priceDisplay: data.price,
        mrpDisplay: data.mrp ?? data.price,
        unitPriceDisplay: unitPrice.toString(),
        // Numbers for calculations
        price,
        originalPrice: discountPct > 0 && data.mrp ? parseFloat(String(data.mrp)) : undefined,
        savingsPercent: discountPct > 0 ? discountPct : undefined,
        image: data.thumbnailUrl ? { uri: data.thumbnailUrl } : undefined,
        images: [
            ...(data.thumbnailUrl ? [{ uri: data.thumbnailUrl }] : []),
            ...data.images
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .filter(img => !!img.url)
                .map(img => ({ uri: img.url })),
        ],
    } : null;

    const recommendation = data?.recommendation ? {
        id: data.recommendation.id,
        name: data.recommendation.name,
        slug: data.recommendation.slug,
        manufacturer: data.recommendation.manufacturer,
        packSize: data.recommendation.packSize,
        unit: data.recommendation.unit,
        description: [
            data.recommendation.packSize?.trim(),
            data.recommendation.unit,
            'in',
            data.recommendation.dosageForm,
        ].filter(Boolean).join(' '),
        // Raw API strings for display
        priceDisplay: data.recommendation.price,
        mrpDisplay: data.recommendation.mrp ?? data.recommendation.price,
        // Numbers for calculations
        price: parseFloat(data.recommendation.price) || 0,
        originalPrice: data.recommendation.mrp
            ? parseFloat(data.recommendation.mrp)
            : parseFloat(data.recommendation.price) || 0,
        savingsPercent: data.recommendation.discountPercentage || 0,
        image: data.recommendation.thumbnailUrl ? { uri: data.recommendation.thumbnailUrl } : undefined,
        productId: data.recommendation.productId,
    } : null;

    const saltComposition = data?.salts.length
        ? data.salts.map(s => `${s.name} ${s.amount}${s.unit}`).join(' + ')
        : null;

    const variants: MedicineVariant[] = data?.medicine_variants?.filter(v => v.status === 1) ?? [];

    return { product, recommendation, saltComposition, variants, raw: data, isLoading, error };
};
