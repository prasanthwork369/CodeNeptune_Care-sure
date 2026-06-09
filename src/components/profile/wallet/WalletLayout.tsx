import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS, HOME_IMAGES } from "@/src/constants/images";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useWalletBalance, useWalletLogs } from "@/src/hooks/queries/useWallet";
import { useNav } from "@/src/hooks/useNav";
import { Transaction, TxIconType, WalletLog } from "@/src/types/wallet";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { profileStyles as s } from '../profile.styles';
import { TransactionHistorySheet } from "./TransactionHistorySheet";
import { WalletInfoModal } from "./WalletInfoModal";

const MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const mon = MONTH[d.getMonth()];
  const yr = d.getFullYear();
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${day} ${mon} ${yr}, ${hr}:${m} ${ampm}`;
}

const TITLE_MAP: Record<WalletLog["referenceType"], string> = {
  signup_bonus: "Welcome Bonus",
  order_purchase: "Medicine Purchase",
  order_refund: "Order Refund",
  admin_adjustment: "Wallet Adjustment",
  wallet_topup: "Wallet Top-up",
};

function logToTransactions(log: WalletLog): Transaction[] {
  const isCredit = log.type === "credit";
  const walletAmt = Number(log.walletAmount);
  const coinsAmt = Number(log.coinsAmount);
  const title = log.description ?? TITLE_MAP[log.referenceType];
  const date = formatDate(log.createdAt);
  const results: Transaction[] = [];

  if (walletAmt > 0) {
    results.push({
      id: `${log.id}_wallet`,
      iconType: log.referenceType === 'wallet_topup' ? 'cash' : isCredit ? 'plus' : 'bag',
      title,
      date,
      amount: `${isCredit ? "+" : "-"}₹${walletAmt.toFixed(2)}`,
      amountColor: isCredit ? "#0F9D58" : "#222222",
      isCoin: false,
    });
  }

  if (coinsAmt > 0) {
    results.push({
      id: `${log.id}_coins`,
      iconType: isCredit ? "coin_credit" : "coin_debit",
      title,
      date,
      amount: `${isCredit ? "+" : "-"}${coinsAmt}`,
      amountColor: isCredit ? "#0F9D58" : "#222222",
      isCoin: true,
    });
  }

  if (results.length === 0) {
    results.push({
      id: log.id,
      iconType: isCredit ? "plus" : "bag",
      title,
      date,
      amount: `${isCredit ? "+" : "-"}₹0.00`,
      amountColor: "#222222",
      isCoin: false,
    });
  }

  return results;
}

const TransactionIcon = ({ type }: { type: TxIconType }) => {
  const isCredit = type === "plus" || type === "coin_credit" || type === "cash";
  const src =
    type === 'coin_credit' ? HOME_IMAGES.coinCredit :
      type === 'coin_debit' ? HOME_IMAGES.coinDebit :
        isCredit ? HOME_IMAGES.accountBalanceCredit :
          HOME_IMAGES.accountBalanceDebit;
  return (
    <View className={`w-10 h-10 rounded-full items-center justify-center ${isCredit ? "bg-[#DFF3E6]" : "bg-[#FCE8E8]"}`}>
      <Image source={src} style={{ width: 24, height: 24 }} resizeMode="contain" />
    </View>
  );
};

export const WalletLayout: React.FC = () => {
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isHistorySheetVisible, setIsHistorySheetVisible] = useState(false);
  const confettiRef = useRef<LottieView>(null);
  const hasPlayedConfetti = useRef(false);

  const router = useNav();
  const { balance, loading: balanceLoading } = useWalletBalance();
  // useQuery reports isLoading=false while disabled (pre-auth), so balance
  // can briefly be null with loading=false — treat that as still pending too.
  const isBalancePending = balanceLoading || balance == null;
  const { logs, loading: logsLoading } = useWalletLogs(20, 0);
  const { data: settings } = useCartWalletSettings();
  const coinValue = settings?.wallet?.coinValueInRupees ?? 1;

  const transactions: Transaction[] = logs.flatMap(logToTransactions);
  const previewTxs = transactions.slice(0, 5);

  useEffect(() => {
    if (!hasPlayedConfetti.current) {
      hasPlayedConfetti.current = true;
      const timer = setTimeout(() => {
        confettiRef.current?.play();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader
        title="My Wallet /  CareSure Coins"
        backgroundColor="#FFFFFF"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <LinearGradient
          colors={["rgba(196, 241, 86, 0.2)", "rgba(80, 181, 59, 0.2)"]}
          locations={[0.1336, 0.9875]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 0.5 }}
          className="rounded-2xl mb-4 overflow-hidden border border-[#919EAB33]"
          style={{ minHeight: 180 }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
          >
            <LottieView
              ref={confettiRef}
              source={ANIMATIONS.confetti}
              autoPlay={false}
              loop={false}
              style={{ width: "100%", height: "100%" }}
            />
          </View>
          <Image
            source={HOME_IMAGES.moneyBag}
            style={{
              position: "absolute",
              right: -2,
              bottom: -2,
              width: 110,
              height: 110,
            }}
            resizeMode="contain"
          />
          <View className="pt-5 px-5 pr-28">
            <Text style={s.walletLabel} className="font-inter-medium text-brand-text">
              Available Balance
            </Text>
            <Touchable
              onPress={() => setIsInfoModalVisible(true)}
              className="absolute top-5 right-5"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <icons.info_dark width={20} height={20} />
            </Touchable>
            {isBalancePending ? (
              <ActivityIndicator
                color="#0F7635"
                style={{ marginTop: 8, alignSelf: "flex-start" }}
              />
            ) : (
              <>
                <Text style={s.walletBalance} className="font-inter-bold text-brand-text leading-none mt-1">
                  ₹{Number(balance?.walletBalance ?? 0).toFixed(2)}
                </Text>
                {balance != null && Number(balance.corporateCredits ?? 0) > 0 && (
                  <View
                    className="self-start mt-2 px-3 py-1 rounded-sm"
                    style={{ borderWidth: 1, borderColor: '#919EAB33', backgroundColor: '#FEFFF3' }}
                  >
                    <Text style={s.walletSub} className="font-inter-medium text-[#454545]">
                      Including Corporate Credits (₹{Number(balance.corporateCredits).toFixed(0)})
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
          <View style={{ height: 1, backgroundColor: '#00000033', marginHorizontal: 20, marginVertical: 16 }} />
          <View className="pb-5 px-5 pr-28">
            <Text style={s.walletLabel} className="font-inter-medium text-brand-text">
              CareSure Coins
            </Text>
            <View className="flex-row items-center mt-1">
              <Image
                source={HOME_IMAGES.dollarCoins}
                style={{ width: 28, height: 28, marginRight: 6 }}
                resizeMode="contain"
              />
              {isBalancePending ? (
                <ActivityIndicator color="#0F7635" />
              ) : (
                <Text style={s.walletCoins} className="font-inter-bold text-[#0F1724] leading-none">
                  {balance?.coinsBalance ?? 0}
                </Text>
              )}
            </View>
            <View
              className="self-start border border-[#919EAB33] rounded-sm mt-2 px-3 py-0.5"
              style={{ backgroundColor: "#FEFFF3" }}
            >
              <Text style={s.walletSub} className="font-inter-medium text-[#454545]">
                1 coin = ₹{coinValue} value
              </Text>
            </View>
          </View>
        </LinearGradient>

        <Touchable
          onPress={() => router.push('/profile/wallet/add-money' as any)}
          activeOpacity={0.85}
          className="bg-[#0F7635] rounded-[14px] py-4 flex-row items-center justify-center mb-6"
        >
          <icons.plus_light width={18} height={18} fill="#FFFFFF" />
          <Text style={s.walletBtn} className="font-inter-semibold text-white ml-2">
            Add Money
          </Text>
        </Touchable>

        <View className="flex-row items-center justify-between mb-3">
          <Text style={s.walletTitle} className="font-inter-extrabold text-brand-text">
            Transaction History
          </Text>
          <Touchable onPress={() => router.push('/profile/wallet/history' as any)}>
            <Text style={s.walletTxTitle} className="font-inter-bold text-[#FF8A00]">
              View All
            </Text>
          </Touchable>
        </View>

        <View className="bg-white rounded-xl border border-[#919EAB33] overflow-hidden p-1">
          {logsLoading ? (
            <ActivityIndicator
              color="#0F7635"
              style={{ paddingVertical: 24 }}
            />
          ) : previewTxs.length === 0 ? (
            <Text style={s.walletLabel} className="font-inter text-brand-subtext text-center py-6">
              No transactions yet
            </Text>
          ) : (
            previewTxs.map((tx: Transaction, idx) => (
              <View key={tx.id}>
                <View className="flex-row items-center px-4 py-3.5">
                  <TransactionIcon type={tx.iconType} />
                  <View className="flex-1 ml-3">
                    <Text style={s.walletTxTitle} className="font-inter-medium text-brand-text">
                      {tx.title}
                    </Text>
                    <Text style={s.walletSub} className="font-inter text-brand-subtext mt-0.5">
                      {tx.date}
                    </Text>
                  </View>
                  {tx.isCoin ? (
                    <View className="flex-row items-center">
                      <Image
                        source={HOME_IMAGES.dollarCoins}
                        style={{ width: 16, height: 16, marginRight: 4 }}
                        resizeMode="contain"
                      />
                      <Text
                        style={[s.walletTxTitle, { color: tx.amountColor }]}
                      >
                        {tx.amount}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      className="text-[14px] font-inter-bold"
                      style={{ color: tx.amountColor }}
                    >
                      {tx.amount}
                    </Text>
                  )}
                </View>
                {idx < previewTxs.length - 1 && (
                  <View className="h-px bg-[#919EAB33] mx-4" />
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <WalletInfoModal
        isVisible={isInfoModalVisible}
        onClose={() => setIsInfoModalVisible(false)}
      />
      <TransactionHistorySheet
        visible={isHistorySheetVisible}
        onClose={() => setIsHistorySheetVisible(false)}
        transactions={transactions}
      />
    </View>
  );
};
