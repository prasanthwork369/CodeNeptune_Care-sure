import { ShimmerBlock } from "@/src/components/ui/shimmer";
import { Transaction } from "../types";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React, { useCallback } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { TxRow } from "./TxRow";

interface WalletHistoryPageProps {
  transactions: Transaction[];
  width: number;
  loading: boolean;
  isFetchingNextPage: boolean;
  paddingBottom: number;
  onEndReached: () => void;
}

// One pager page. Transactions are filtered by the parent from a single query,
// so paging between tabs costs no extra network calls.
export const WalletHistoryPage: React.FC<WalletHistoryPageProps> = ({
  transactions,
  width,
  loading,
  isFetchingNextPage,
  paddingBottom,
  onEndReached,
}) => {
  const keyExtractor = useCallback((tx: Transaction) => tx.id, []);

  // Depends on transactions.length so the divider on the last row stays
  // correct as more pages load in.
  const renderItem: ListRenderItem<Transaction> = useCallback(
    ({ item, index }) => (
      <TxRow tx={item} isLast={index === transactions.length - 1} />
    ),
    [transactions.length],
  );

  if (loading) {
    return (
      <View
        style={{
          width,
          paddingHorizontal: exactScale(16),
          paddingTop: exactScale(16),
          gap: exactScale(12),
        }}
      >
        <ShimmerBlock height={exactScale(74)} borderRadius={8} />
        <ShimmerBlock height={exactScale(74)} borderRadius={8} />
        <ShimmerBlock height={exactScale(74)} borderRadius={8} />
        <ShimmerBlock height={exactScale(74)} borderRadius={8} />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={{ width }}>
        <Text
          style={{
            textAlign: "center",
            color: "#9CA3AF",
            fontWeight: "500",
            fontSize: moderateScale(14),
            marginTop: 40,
          }}
        >
          No transactions
        </Text>
      </View>
    );
  }

  return (
    <View style={{ width, flex: 1 }}>
      <FlashList
        data={transactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom, backgroundColor: "#FFFFFF" }}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color="#0F7635"
              style={{ paddingVertical: exactScale(16) }}
            />
          ) : null
        }
      />
    </View>
  );
};
