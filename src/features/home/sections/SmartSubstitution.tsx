import React from "react";
import { PopularSubstitutes } from "./PopularSubstitutes";
import type { Product } from "@/src/features/product/types";

interface SmartSubstitutionProps {
  products: Product[];
  onProductPress: (id: string) => void;
  isLoading?: boolean;
  onViewAll?: () => void;
  totalCount?: number;
}

export const SmartSubstitution: React.FC<SmartSubstitutionProps> = React.memo(
  ({ products, onProductPress, isLoading, onViewAll, totalCount }) => {
    return (
      <PopularSubstitutes
        products={products}
        onProductPress={onProductPress}
        isLoading={isLoading}
        onViewAll={onViewAll}
        totalCount={totalCount}
      />
    );
  },
);
SmartSubstitution.displayName = "SmartSubstitution";
