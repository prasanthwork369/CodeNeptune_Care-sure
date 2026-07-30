import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { HOME_IMAGES } from "@/src/constants/images";
import { useNav } from "@/src/hooks/useNav";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useMemo } from "react";
import { Image, Text, View } from "react-native";
import { Transaction, TxIconType } from "@/src/types/wallet";
import { Touchable } from "@/src/components/ui/Touchable";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

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
      style={{
        width: exactScale(44),
        height: exactScale(44),
        borderRadius: exactScale(22),
        backgroundColor: isCredit ? "#DFF3E6" : "#FCE8E8",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={src}
        style={{ width: exactScale(26), height: exactScale(26) }}
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
    setTimeout(() => router.push("/profile/wallet/history" as any), 300);
  };

  const snapPoints = useMemo(() => ["50%"], []);

  return (
    <GorhomBottomSheet
      isVisible={visible}
      onClose={onClose}
      snapPoints={snapPoints}
      closeButtonOffset="50%"
      backgroundStyle={{
        backgroundColor: "#fff",
        borderTopLeftRadius: exactScale(12),
        borderTopRightRadius: exactScale(12),
      }}
    >
      {/* Title */}
      <View
        style={{
          alignItems: "center",
          paddingTop: exactScale(24),
          paddingBottom: exactScale(16),
          borderBottomWidth: 1,
          borderBottomColor: "#F3F4F6",
        }}
      >
        <Text
          style={{
            fontSize: moderateScale(16),
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Transaction History
        </Text>
      </View>

      {/* Rows */}
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={{ flex: 1 }}
      >
        {transactions.length === 0 ? (
          <Text
            style={{
              textAlign: "center",
              color: "#9CA3AF",
              fontWeight: "500",
              fontSize: moderateScale(14),
              paddingVertical: exactScale(32),
            }}
          >
            No transactions yet
          </Text>
        ) : (
          transactions.map((tx, idx) => (
            <View key={tx.id}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: exactScale(20),
                  paddingVertical: exactScale(14),
                }}
              >
                <TransactionIcon type={tx.iconType} />
                <View style={{ flex: 1, marginLeft: exactScale(14) }}>
                  <Text
                    style={{
                      fontSize: moderateScale(14),
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {tx.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      color: "#6B7280",
                      marginTop: exactScale(2),
                    }}
                  >
                    {tx.date}
                  </Text>
                </View>
                {tx.isCoin ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: exactScale(4),
                    }}
                  >
                    <Image
                      source={HOME_IMAGES.dollarCoins}
                      style={{ width: exactScale(16), height: exactScale(16) }}
                      resizeMode="contain"
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(14),
                        fontWeight: "700",
                        color: tx.amountColor,
                      }}
                    >
                      {tx.amount}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      fontSize: moderateScale(14),
                      fontWeight: "700",
                      color: tx.amountColor,
                    }}
                  >
                    {tx.amount}
                  </Text>
                )}
              </View>
              {idx < transactions.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#F3F4F6",
                    marginHorizontal: exactScale(20),
                  }}
                />
              )}
            </View>
          ))
        )}
      </BottomSheetScrollView>

      {/* See All */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          paddingVertical: exactScale(16),
          alignItems: "center",
        }}
      >
        <Touchable onPress={handleSeeAll} activeOpacity={0.7}>
          <Text
            style={{
              fontSize: moderateScale(14),
              fontWeight: "700",
              color: "#FF8A00",
            }}
          >
            See All
          </Text>
        </Touchable>
      </View>
    </GorhomBottomSheet>
  );
};
