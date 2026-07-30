import { ShimmerBlock } from "@/src/components/ui/shimmer";
import { Transaction } from "@/src/types/wallet";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
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
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom, backgroundColor: "#FFFFFF" }}
        onScroll={({ nativeEvent }) => {
          const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
          const reachedEnd =
            contentOffset.y + layoutMeasurement.height >=
            contentSize.height - 100;
          if (reachedEnd) onEndReached();
        }}
        scrollEventThrottle={200}
      >
        {transactions.map((tx, idx) => (
          <TxRow key={tx.id} tx={tx} isLast={idx === transactions.length - 1} />
        ))}
        {isFetchingNextPage && (
          <ActivityIndicator
            color="#0F7635"
            style={{ paddingVertical: exactScale(16) }}
          />
        )}
      </ScrollView>
    </View>
  );
};
