import { searchApi } from "@/src/api/search.api";
import { OrderItem } from "@/src/types/order";
import { AddToCartInput } from "@/src/features/cart/types";

export async function buildCartInputs(
  items: OrderItem[],
): Promise<AddToCartInput[]> {
  const results: AddToCartInput[] = [];

  for (const item of items) {
    let unitPrice = Number(item.unitPrice ?? 0);

    if (!unitPrice) {
      unitPrice = await fetchLivePrice(item);
    }

    if (!unitPrice) {
      if (__DEV__)
        console.warn(
          "[reorderCart] skipping item — no price for",
          item.medicineId,
        );
      continue;
    }

    results.push({
      medicineId: item.medicineId,
      variantId: null,
      medicineName: item.medicineSnapshot?.name ?? item.medicineId,
      medicineSlug: item.medicineSnapshot?.slug ?? item.medicineId,
      unitPrice,
      mrp: unitPrice,
      discountPercent: 0,
      quantity: item.quantity ?? 1,
      requiresPrescription:
        item.medicineSnapshot?.requiresPrescription ?? false,
    });
  }

  return results;
}

async function fetchLivePrice(item: OrderItem): Promise<number> {
  const name = item.medicineSnapshot?.name;
  const slug = item.medicineSnapshot?.slug;

  if (name) {
    try {
      const { data } = await searchApi.searchMedicines(name, 1, 20);
      // Match by ID (both id and productId fields) or slug
      const match =
        data.find(
          (r) => r.id === item.medicineId || r.productId === item.medicineId,
        ) ?? data.find((r) => slug && r.slug === slug);
      if (match) return Number(match.price ?? 0);
    } catch {
      if (__DEV__)
        console.warn("[reorderCart] search failed for", item.medicineId);
    }
  }

  return 0;
}
