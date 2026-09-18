/**
 * Wire-level cover for cart and order idempotency keys.
 *
 * order-service dedupes cart writes on (cartId, idempotencyKey) via the
 * cart_mutation_idempotency table (postgres-cart.repository.ts) and orders on
 * (customerId, idempotencyKey) (create-order.usecase.ts). Both read the key
 * from the request BODY, so these assert what actually goes over the wire.
 */
import { cartApi } from "@/src/features/cart/api/cart.api";
import { cartMutations } from "@/src/features/cart/services/cart.mutations";
import { orderApi } from "@/src/features/orders/api/order.api";
import { apiClient } from "@/src/api/client";
import { API_ENDPOINTS } from "@/src/utils/urls";

jest.mock("@/src/api/client", () => ({
  apiClient: { post: jest.fn(), patch: jest.fn(), delete: jest.fn(), get: jest.fn() },
}));

jest.mock("@/src/store/authStore", () => ({
  useAuthStore: { getState: () => ({ isAuthenticated: true }) },
}));

jest.mock("@/src/lib/react-query/queryClient", () => ({
  queryClient: { setQueryData: jest.fn() },
}));

jest.mock("@/src/store/cartStore", () => ({
  useCartPendingStore: {
    getState: () => ({
      addGuestItem: jest.fn(),
      updateGuestItem: jest.fn(),
      removeGuestItem: jest.fn(),
    }),
  },
}));

const mockPost = apiClient.post as jest.Mock;

const addInput = {
  medicineId: "11111111-1111-4111-8111-111111111111",
  variantId: null,
  medicineName: "Zincovit",
  medicineSlug: "zincovit",
  unitPrice: 120,
  mrp: 120,
  discountPercent: 0,
  quantity: 1,
  requiresPrescription: false,
};

describe("cart mutation idempotency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ data: { data: { items: [] } } });
  });

  it("sends idempotencyKey in the add-item body when supplied", async () => {
    await cartApi.addItem(addInput, "cart-key-1");

    const [url, body] = mockPost.mock.calls[0];
    expect(url).toBe(API_ENDPOINTS.CART_ITEMS);
    expect(body.idempotencyKey).toBe("cart-key-1");
    expect(body.medicineId).toBe(addInput.medicineId);
  });

  it("omits the field entirely when no key is supplied", async () => {
    await cartApi.addItem(addInput);

    const body = mockPost.mock.calls[0][1];
    expect("idempotencyKey" in body).toBe(false);
  });

  it("sends idempotencyKey alongside items on bulk add", async () => {
    await cartApi.bulkAddItems(
      [{ medicineId: addInput.medicineId, quantity: 2 }],
      "bulk-key-1",
    );

    const [url, body] = mockPost.mock.calls[0];
    expect(url).toBe(API_ENDPOINTS.CART_ITEMS_BULK);
    expect(body.idempotencyKey).toBe("bulk-key-1");
    expect(body.items).toHaveLength(1);
  });

  it("generates a key for every authenticated add", async () => {
    await cartMutations.addItem(addInput);
    await cartMutations.addItem(addInput);

    const first = mockPost.mock.calls[0][1].idempotencyKey;
    const second = mockPost.mock.calls[1][1].idempotencyKey;

    expect(typeof first).toBe("string");
    expect(first).toHaveLength(36);
    // Distinct adds must not collide, or the second would be swallowed.
    expect(first).not.toBe(second);
  });
});

describe("order idempotency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ data: { data: { id: "order-1" } } });
  });

  const orderPayload = {
    items: [{ medicineId: addInput.medicineId, quantity: 1, unitPrice: "100" }],
    deliveryAddress: {
      name: "Asha",
      phone: "9999999999",
      line1: "12 MG Road",
      city: "Bengaluru",
      state: "KA",
      pincode: "560001",
      country: "IN",
    },
    subtotal: "100",
    total: "100",
  };

  it("puts the key on the body, not only the header", async () => {
    await orderApi.createOrder(orderPayload as never, "order-key-1");

    const [url, body, config] = mockPost.mock.calls[0];
    expect(url).toBe(API_ENDPOINTS.ORDERS);
    expect(body.idempotencyKey).toBe("order-key-1");
    expect(config.headers["Idempotency-Key"]).toBe("order-key-1");
  });

  it("does not overwrite a key the payload already carries", async () => {
    await orderApi.createOrder(
      { ...orderPayload, idempotencyKey: "from-payload" } as never,
      "from-argument",
    );

    expect(mockPost.mock.calls[0][1].idempotencyKey).toBe("from-payload");
  });

  it("leaves the body untouched when no key is supplied", async () => {
    await orderApi.createOrder(orderPayload as never);

    const [, body, config] = mockPost.mock.calls[0];
    expect(body.idempotencyKey).toBeUndefined();
    expect(config).toBeUndefined();
  });
});
