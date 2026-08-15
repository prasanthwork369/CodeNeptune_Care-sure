// Thumbnails on this screen are always remote URLs rendered with RN's Image,
// so they are plain {uri} objects — not expo-image's ImageSource.
export interface SearchedProduct {
  image?: { uri: string };
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
  image?: { uri: string };
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
