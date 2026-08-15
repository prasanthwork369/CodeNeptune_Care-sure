import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { Platform, StyleSheet } from "react-native";

/**
 * Stylesheet for the Wallet layout component.
 * Organizes design tokens, card layouts, tab bars, transaction lists,
 * and responsive typography using exactScale for UI dimensions and moderateScale for typography.
 */
export const styles = StyleSheet.create({
  // Main screen container
  container: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  // ScrollView inner content container
  scrollContent: {
    padding: exactScale(16),
    paddingBottom: exactScale(40),
  },
  // Main wallet/credits/coins dashboard card
  card: {
    backgroundColor: "#F7FFE1",
    borderRadius: exactScale(26),
    borderWidth: 1,
    borderColor: "#919EAB24", // Subtle border that blends in with card background
    paddingHorizontal: exactScale(12),
    paddingVertical: exactScale(12),
    height: exactScale(242),
    position: "relative",
    overflow: "hidden",
    marginBottom: exactScale(16),
  },
  // Container overlay for confetti animation
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  // Confetti lottie size
  confettiAnim: {
    width: "100%",
    height: "100%",
  },
  // Segmented tab bar container
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ECF7E4",
    borderRadius: exactScale(100), // Perfect capsule layout matching Figma
    marginBottom: exactScale(16),
    zIndex: 20, // Ensure tabs sit above absolute illustrations
    position: "relative",
  },
  // Individual tab item Touchables
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: exactScale(46),
    borderRadius: exactScale(100), // Perfect capsule layout matching Figma
    gap: exactScale(6),
  },
  // Sliding white pill that animates behind the active tab item
  tabPill: {
    position: "absolute",
    top: 0,
    height: exactScale(46),
    borderRadius: exactScale(100), // Perfect capsule layout matching Figma
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 0.5,
      },
    }),
  },
  // Unselected tab label typography
  tabText: {
    fontSize: moderateScale(14),
    fontFamily: "Inter",
    fontWeight: "500",
    color: "#222222", // Matches dark charcoal unselected text in mockup
  },
  // Selected tab label typography
  activeTabText: {
    fontWeight: "700",
    color: "#111827", // Active text color
  },
  // Container for active tab contents
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingRight: exactScale(120), // Keeps text from overlapping wallet illustration
  },
  // Info section wrapper
  cardInfoSection: {
    flex: 1,
    justifyContent: "flex-start",
    maxWidth: exactScale(185),
  },
  // Card title label (e.g. WALLET BALANCE)
  cardLabel: {
    fontSize: moderateScale(12),
    fontFamily: "Inter",
    fontWeight: "700", // Figma Bold/SemiBold
    color: "#222222", // Figma neutral muted header color
    letterSpacing: 0.5,
    lineHeight: moderateScale(16),
    marginBottom: exactScale(4),
  },
  // Row wrapper for coins icon and balance value
  cardValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: exactScale(8),
  },
  // Main numeric balances
  cardValue: {
    fontSize: moderateScale(32),
    fontFamily: "Inter",
    fontWeight: "800", // Figma Extra Bold / Heavy
    color: "#0F7635",
    lineHeight: moderateScale(38),
  },
  // Yellow coin icon inside Coins tab value row
  cardCoinIcon: {
    width: exactScale(28),
    height: exactScale(28),
    marginRight: exactScale(6),
  },
  // Subtext description inside the card
  cardSub: {
    fontSize: moderateScale(12),
    fontFamily: "Inter",
    fontWeight: "500",
    lineHeight: moderateScale(18),
    color: "#565656",
    marginBottom: exactScale(8),
  },
  // Green Add Money touchable button
  addMoneyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F7635",
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(8),
    borderRadius: exactScale(20),
    alignSelf: "flex-start",
    gap: exactScale(8),
  },
  // Add Money button icon style
  addMoneyIcon: {
    width: exactScale(18),
    height: exactScale(18),
  },
  // Add Money button label typography
  addMoneyText: {
    color: "#FFFFFF",
    fontSize: moderateScale(13),
    fontFamily: "Inter",
    fontWeight: "700",
  },
  // Absolute positioned 3D wallet illustration on the right
  walletIllustration: {
    position: "absolute",
    right: exactScale(10),
    bottom: exactScale(10),
    width: exactScale(130),
    height: exactScale(130),
  },
  // Header section for Transaction list
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: exactScale(12),
  },
  // Container wrapper for transaction list items
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#919EAB33",
    overflow: "hidden",
  },
  // Individual transaction item row
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: exactScale(10),
    paddingVertical: exactScale(20),
  },
  // Transaction description details block
  txDetails: {
    flex: 1,
    marginLeft: exactScale(16),
  },
  // Date subtitle in transaction item
  txDateText: {
    marginTop: exactScale(2),
  },
  // Amount adjusting display text (wallet/credits/coins)
  txAmountText: {
    fontSize: moderateScale(16),
    fontFamily: "Inter",
    fontWeight: "700",
  },
  // Wrapper for coin transactions amount display
  coinTxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Dollar Coins image in transaction list row
  coinTxIcon: {
    width: exactScale(16),
    height: exactScale(16),
    marginRight: exactScale(4),
  },
  // Line separator between transaction list rows
  txSeparator: {
    height: 1,
    backgroundColor: "#919EAB33",
  },
  // Transaction circular icon wrapper
  txIconContainer: {
    width: exactScale(44),
    height: exactScale(44),
    borderRadius: exactScale(22),
    alignItems: "center",
    justifyContent: "center",
  },
  // Credit transaction background shade
  txIconCreditBg: {
    backgroundColor: "#DFF3E6",
  },
  // Debit transaction background shade
  txIconDebitBg: {
    backgroundColor: "#FCE8E8",
  },
  // Transaction icon image inside the circle
  txIconImage: {
    width: exactScale(18),
    height: exactScale(18),
  },
  // Centered loading indicator inside transaction logs
  loadingIndicatorCenter: {
    paddingVertical: exactScale(24),
  },
  // Left aligned loading indicator inside dashboard info card
  loadingIndicatorLeft: {
    alignSelf: "flex-start",
    marginVertical: exactScale(4),
  },
  // Inline loading indicator for coins tab balance
  loadingIndicatorInline: {
    marginLeft: exactScale(4),
  },
});
