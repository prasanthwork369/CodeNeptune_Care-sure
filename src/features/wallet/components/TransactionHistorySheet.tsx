import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { HOME_IMAGES } from "@/src/constants/images";
import { useNav } from "@/src/hooks/useNav";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useMemo } from "react";
import { Image, Text, View } from "react-native";
import { Transaction, TxIconType } from "../types";
import { Touchable } from "@/src/components/ui/Touchable";
import { styles as s } from "./TransactionHistorySheet.styles";

interface TransactionHistorySheetProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const TransactionIcon = ({ type }: { type: TxIconType }) => {
  const isCredit = type === "plus" || type === "coin_credit" || type === "cash";
  const src =
    type === "coin_credit"
      ? HOME_IMAGES.coinCredit
      : type === "coin_debit"
        ? HOME_IMAGES.coinDebit
        : isCredit
          ? HOME_IMAGES.accountBalanceCredit
          : HOME_IMAGES.accountBalanceDebit;
  return (
    <View
      style={[
        s.iconContainer,
        { backgroundColor: isCredit ? "#DFF3E6" : "#FCE8E8" },
      ]}
    >
      <Image
        source={src}
        style={s.iconImage}
        resizeMode="contain"
      />
    </View>
  );
};

export const TransactionHistorySheet: React.FC<
  TransactionHistorySheetProps
> = ({ visible, onClose, transactions }) => {
  const router = useNav();

  const handleSeeAll = () => {
    onClose();
    setTimeout(() => router.push("/profile/wallet/history"), 300);
  };

  const snapPoints = useMemo(() => ["50%"], []);

  return (
    <GorhomBottomSheet
      isVisible={visible}
      onClose={onClose}
      snapPoints={snapPoints}
      closeButtonOffset="50%"
      backgroundStyle={s.sheetBackground}
    >
      {/* Title */}
      <View style={s.titleContainer}>
        <Text style={s.titleText}>
          Transaction History
        </Text>
      </View>

      {/* Rows */}
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={s.scrollView}
      >
        {transactions.length === 0 ? (
          <Text style={s.emptyText}>
            No transactions yet
          </Text>
        ) : (
          transactions.map((tx, idx) => (
            <View key={tx.id}>
              <View style={s.rowItem}>
                <TransactionIcon type={tx.iconType} />
                <View style={s.rowDetails}>
                  <Text style={s.rowTitle}>
                    {tx.title}
                  </Text>
                  <Text style={s.rowDate}>
                    {tx.date}
                  </Text>
                </View>
                {tx.isCoin ? (
                  <View style={s.coinAmountWrap}>
                    <Image
                      source={HOME_IMAGES.dollarCoins}
                      style={s.coinIcon}
                      resizeMode="contain"
                    />
                    <Text
                      style={[
                        s.amountText,
                        { color: tx.amountColor },
                      ]}
                    >
                      {tx.amount}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      s.amountText,
                      { color: tx.amountColor },
                    ]}
                  >
                    {tx.amount}
                  </Text>
                )}
              </View>
              {idx < transactions.length - 1 && (
                <View style={s.divider} />
              )}
            </View>
          ))
        )}
      </BottomSheetScrollView>

      {/* See All */}
      <View style={s.seeAllContainer}>
        <Touchable onPress={handleSeeAll} activeOpacity={0.7}>
          <Text style={s.seeAllText}>
            See All
          </Text>
        </Touchable>
      </View>
    </GorhomBottomSheet>
  );
};
