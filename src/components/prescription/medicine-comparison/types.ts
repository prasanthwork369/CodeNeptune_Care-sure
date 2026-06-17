export interface ComparisonMedicine {
  id: string;
  saltComposition: string;
  prescribed: {
    name: string;
    manufacturer: string;
    packSize: string;
    image: any;
    mrp: number;
  };
  recommended: {
    id: string;
    productId?: string;
    slug: string;
    name: string;
    manufacturer: string;
    packSize: string;
    image: any;
    price: number;
    mrp: number;
    discountPercent: number;
  };
  quantity?: number;
}
