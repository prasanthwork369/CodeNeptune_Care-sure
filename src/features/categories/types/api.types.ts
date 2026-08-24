export interface ApiSubCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  icon: string | null;
}

export interface ApiCategoryFamily {
  id: string;
  name: string;
  mobileShortName?: string;
  slug: string;
  iconActive: string;
  iconInactive: string;
  mobIconUrl?: string;
  subCategories: ApiSubCategory[];
}

export interface ApiCategoryProductItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  dosageForm: string;
  packSize: string;
  unit: string;
  thumbnailUrl: string;
  price: string | number;
  mrp?: string | number;
  discountPercentage: string | number;
  brandName: string;
  description: string | null;
}

export interface ApiFeaturedSubcategoryMetadata {
  text1: string;
  text2: string;
  lineColor: string;
  text2Color: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  featuredImageUrl: string;
}

export interface ApiFeaturedSubcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  familySlug?: string;
  description: string;
  imageUrl: string;
  icon: string;
  categoryName: string;
  featuredMetadata: ApiFeaturedSubcategoryMetadata | null;
  products: ApiCategoryProductItem[];
}

export interface ApiCategoryProductsResponse {
  items: ApiCategoryProductItem[];
  total: number;
  totalPages: number;
}
