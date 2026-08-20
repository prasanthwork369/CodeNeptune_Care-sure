import { ApiProductDetail } from "@/src/features/product/types/api.types";

describe("Product Details Return Policy Resolution", () => {
  const baseApiProduct: ApiProductDetail = {
    id: "uuid-1",
    productId: "CS-123",
    name: "Paracetamol 500mg",
    slug: "paracetamol-500mg",
    dosageForm: "Tablet",
    packSize: "10",
    price: "50",
    discountPercentage: "10",
    mrp: "55",
    requiresPrescription: false,
    thumbnailUrl: "https://example.com/image.jpg",
    description: "Pain reliever",
    shortDescription: "Pain reliever",
    longDescription: null,
    sourceType: 1,
    unit: "tablets",
    disclaimer: null,
    packagingDetail: null,
    countryOfOrigin: "India",
    safetyInteractions: null,
    productHighlights: null,
    keyIngredients: null,
    keyBenefits: null,
    additionalData: null,
    brand: { id: "b-1", name: "HealthCorp", slug: "healthcorp" },
    category: { id: "c-1", name: "Analgesics", slug: "analgesics" },
    manufacturer: { id: "m-1", name: "HealthCorp Pharma", slug: "healthcorp-pharma" },
    marketer: null,
    salts: [],
    images: [],
    medicine_variants: [],
    recommendation: null,
  };

  function deriveProduct(data: ApiProductDetail) {
    return {
      name: data.name,
      isReturnable: data.is_returnable ?? false,
    };
  }

  it("resolves Returnable when is_returnable is true in backend API response", () => {
    const apiData: ApiProductDetail = {
      ...baseApiProduct,
      is_returnable: true,
    };

    const product = deriveProduct(apiData);
    expect(product.isReturnable).toBe(true);

    const returnPolicy = product.isReturnable ? "Returnable" : "Not Returnable";
    expect(returnPolicy).toBe("Returnable");
  });

  it("resolves Not Returnable when is_returnable is false in backend API response", () => {
    const apiData: ApiProductDetail = {
      ...baseApiProduct,
      is_returnable: false,
    };

    const product = deriveProduct(apiData);
    expect(product.isReturnable).toBe(false);

    const returnPolicy = product.isReturnable ? "Returnable" : "Not Returnable";
    expect(returnPolicy).toBe("Not Returnable");
  });

  it("resolves Not Returnable when is_returnable is omitted/undefined in backend API response", () => {
    const apiData: ApiProductDetail = {
      ...baseApiProduct,
    };

    const product = deriveProduct(apiData);
    expect(product.isReturnable).toBe(false);

    const returnPolicy = product.isReturnable ? "Returnable" : "Not Returnable";
    expect(returnPolicy).toBe("Not Returnable");
  });
});
