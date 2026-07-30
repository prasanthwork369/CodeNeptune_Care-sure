export interface SearchedProduct {
  image: any;
  name: string;
  manufacturer: string;
  description: string;
  price: number;
  priceDisplay: string;
  unitPrice: number;
  unitPriceDisplay: string;
  status: string;
}

export interface RecommendedProduct {
  image: any;
  name: string;
  manufacturer: string;
  description: string;
  savingsPercent: number;
  price: number;
  priceDisplay: string;
  originalPrice: number;
  mrpDisplay: string;
  packSize?: string;
  unit?: string;
}
