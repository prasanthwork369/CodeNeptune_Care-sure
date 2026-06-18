import { useQuery } from '@tanstack/react-query';
import { prescriptionOrderApi, ApiPrescriptionOrderItem } from '../../api/prescriptionOrder.api';
import { ComparisonMedicine } from '../../components/prescription/medicine-comparison/types';

const buildSaltComposition = (item: ApiPrescriptionOrderItem): string => {
    const salts = item.original?.salts || item.recommended?.salts || [];
    return salts
        .map((s) => `${s.name} ${s.amount}${s.unit}`)
        .join(' + ');
};

const calcDiscount = (mrp: string | number, selling: number): number => {
    const mrpNum = parseFloat(String(mrp));
    if (!mrpNum || !selling || mrpNum <= selling) return 0;
    return Math.round(((mrpNum - selling) / mrpNum) * 100);
};

const toComparisonMedicines = (items: ApiPrescriptionOrderItem[]): ComparisonMedicine[] => {
    console.log('[usePrescriptionOrderMedicines] Raw items from API:', JSON.stringify(items, null, 2));
    return items.map((item) => {
        const recommended = item.recommended || item.original;
        const prescribed = item.original || recommended;
        return {
            id: item.original?.id || recommended?.id || item.id || Math.random().toString(),
            saltComposition: buildSaltComposition(item),
            prescribed: {
                name: prescribed?.name || item.originalName || 'Added Medicine',
                manufacturer: prescribed?.brand || '',
                packSize: prescribed ? `${prescribed.form}` : '',
                image: prescribed?.image ? { uri: prescribed.image } : null,
                mrp: prescribed ? parseFloat(String(prescribed.mrp)) : 0,
            },
            recommended: {
                id: recommended.id,
                productId: recommended.productId,
                slug: recommended.slug,
                name: recommended.name,
                manufacturer: recommended.brand,
                packSize: `${recommended.form}`,
                image: { uri: recommended.image },
                price: recommended.sellingPrice || parseFloat(String(recommended.mrp)),
                mrp: parseFloat(String(recommended.mrp)),
                discountPercent: recommended.discount > 0
                    ? Math.round(recommended.discount)
                    : calcDiscount(recommended.mrp, recommended.sellingPrice),
            },
            quantity: item.recommendationMedicineQuantity || item.medicineQuantity || 1,
        };
    });
};

export const usePrescriptionOrderMedicines = (orderId: string) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['prescription-order-medicines', orderId],
        queryFn: () => prescriptionOrderApi.getMedicines(orderId),
        enabled: !!orderId,
        staleTime: 5 * 60_000,
    });

    return {
        medicines: toComparisonMedicines(Array.isArray(data) ? data : []),
        isLoading,
        error,
        refetch,
    };
};
