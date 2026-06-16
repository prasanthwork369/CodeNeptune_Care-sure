import { useQuery } from '@tanstack/react-query';
import { prescriptionOrderApi, ApiPrescriptionOrderItem } from '../../api/prescriptionOrder.api';
import { ComparisonMedicine } from '../../components/prescription/MedicineComparisonLayout';

const buildSaltComposition = (item: ApiPrescriptionOrderItem): string => {
    return item.original.salts
        .map((s) => `${s.name} ${s.amount}${s.unit}`)
        .join(' + ');
};

const calcDiscount = (mrp: string | number, selling: number): number => {
    const mrpNum = parseFloat(String(mrp));
    if (!mrpNum || !selling || mrpNum <= selling) return 0;
    return Math.round(((mrpNum - selling) / mrpNum) * 100);
};

const toComparisonMedicines = (items: ApiPrescriptionOrderItem[]): ComparisonMedicine[] =>
    items.map((item) => ({
        id: item.original.id,
        saltComposition: buildSaltComposition(item),
        prescribed: {
            name: item.original.name,
            manufacturer: item.original.brand,
            packSize: `${item.original.form}`,
            image: { uri: item.original.image },
            mrp: parseFloat(String(item.original.mrp)),
        },
        recommended: {
            id: item.recommended.id,
            productId: item.recommended.productId,
            slug: item.recommended.slug,
            name: item.recommended.name,
            manufacturer: item.recommended.brand,
            packSize: `${item.recommended.form}`,
            image: { uri: item.recommended.image },
            price: item.recommended.sellingPrice || parseFloat(String(item.recommended.mrp)),
            mrp: parseFloat(String(item.recommended.mrp)),
            discountPercent: item.recommended.discount > 0
                ? Math.round(item.recommended.discount)
                : calcDiscount(item.recommended.mrp, item.recommended.sellingPrice),
        },
        quantity: item.recommendationMedicineQuantity || item.medicineQuantity || 1,
    }));

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
