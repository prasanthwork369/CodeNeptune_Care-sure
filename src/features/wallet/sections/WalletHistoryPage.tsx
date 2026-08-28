import { ShimmerBlock } from "@/src/components/ui/shimmer";
import { Transaction } from "../types";
import { exactScale } from "@/src/utils/exactScale";
import React, { useCallback } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ListRenderItem } from "@shopify/flash-list";
import { AppFlashList } from "@/src/components/lists/AppFlashList";
import { TxRow } from "./TxRow";
import { styles as s } from "./WalletHistoryPage.styles";

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
      <View style={[{ width }, s.loadingContainer]}>
        <ShimmerBlock height={exactScale(74)} borderRadius={8} />
        <ShimmerBlock height={exactScale(74)} borderRadius={8} />
        <ShimmerBlock height={exactScale(74)} borderRadius={8} />
        <ShimmerBlock height={exactScale(74)} borderRadius={8} />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={[{ width }, s.emptyContainer]}>
        <Text style={s.emptyText}>
          No transactions
        </Text>
      </View>
    );
  }

  return (
    <View style={[{ width }, s.pageContainer]}>
      <AppFlashList
        data={transactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom }, s.listContent]}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator
              color="#0F7635"
              style={s.footerLoader}
            />
          ) : null
        }
      />
    </View>
  );
};
