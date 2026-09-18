import { ProductComparisonLayout } from "@/src/features/search/screens/ProductComparisonLayout";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen />
      <ProductComparisonLayout id={id} />
    </>
  );
}
