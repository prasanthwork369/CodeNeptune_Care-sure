import { ProductComparisonLayout } from "@/src/components/search/product/ProductComparisonLayout";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen
      />
      <ProductComparisonLayout id={id} />
    </>
  );
}
