const screenNameMap: Record<string, string> = {
  "/": "launch",
  "/product/": "product_details",
  "/search/product/": "product_comparison",
  "/search": "search",
  "/category/": "category_products",
  "/profile/orders": "orders",
  "/profile": "profile",
  "/notifications": "notifications",
  "/cart": "cart",
  "/payment": "checkout",
  "/upload": "prescription_upload",
  "/login": "login",
  "/otp": "otp",
  "/categories": "categories",
};

export const getScreenNameForPath = (pathname: string): string => {
  for (const [path, name] of Object.entries(screenNameMap)) {
    if (pathname === path || pathname.startsWith(path)) {
      return name;
    }
  }
  return "other";
};
