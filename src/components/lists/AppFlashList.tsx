import { FlashList, FlashListProps, FlashListRef } from "@shopify/flash-list";
import React from "react";

function AppFlashListInner<TItem>(
  props: FlashListProps<TItem>,
  ref: React.Ref<FlashListRef<TItem>>,
) {
  return <FlashList ref={ref} {...props} />;
}

/**
 * Thin FlashList wrapper — the shared place future app-wide, genuinely
 * common config would live. Forces no defaults of its own (a global
 * drawDistance here previously made simple/homogeneous lists like Orders
 * and Wallet History over-render off-screen for no measured benefit).
 * Screens needing specific tuning (e.g. Search Results' drawDistance) set
 * it directly, same as they would on FlashList.
 */
export const AppFlashList = React.forwardRef(AppFlashListInner) as <TItem>(
  props: FlashListProps<TItem> & {
    ref?: React.Ref<FlashListRef<TItem>>;
  },
) => React.ReactElement | null;
