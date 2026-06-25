import { Platform, StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";

/**
 * Stylesheet for the Wallet layout component.
 * Organizes design tokens, card layouts, tab bars, transaction lists,
 * and responsive typography using moderateScale for cross-device consistency.
 */
export const styles = StyleSheet.create({
  // Main screen container
  container: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  // ScrollView inner content container
  scrollContent: {
    padding: moderateScale(16, 0.3),
    paddingBottom: moderateScale(40, 0.3),
  },
  // Main wallet/credits/coins dashboard card
  card: {
    backgroundColor: "#F7FFE1",
    borderRadius: moderateScale(26, 0.3),
    borderWidth: 1,
    borderColor: "#919EAB24", // Subtle border that blends in with card background
    paddingHorizontal: moderateScale(20, 0.3),
    paddingVertical: moderateScale(16, 0.3),
    height: moderateScale(242, 0.3),
    position: "relative",
    overflow: "hidden",
    marginBottom: moderateScale(16, 0.3),
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
    borderRadius: moderateScale(100, 0.3), // Perfect capsule layout matching Figma
    marginBottom: moderateScale(12, 0.3),
    zIndex: 20, // Ensure tabs sit above absolute illustrations
    position: "relative",
  },
  // Individual tab item Touchables
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: moderateScale(38, 0.3),
    borderRadius: moderateScale(100, 0.3), // Perfect capsule layout matching Figma
    gap: moderateScale(6, 0.3),
  },
  // Sliding white pill that animates behind the active tab item
  tabPill: {
    position: "absolute",
    top: 0,
    height: moderateScale(38, 0.3),
    borderRadius: moderateScale(100, 0.3), // Perfect capsule layout matching Figma
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
    fontSize: moderateScale(13, 0.1),
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
    paddingRight: moderateScale(120, 0.3), // Keeps text from overlapping wallet illustration
  },
  // Info section wrapper
  cardInfoSection: {
    flex: 1,
    justifyContent: "flex-start",
  },
  // Card title label (e.g. WALLET BALANCE)
  cardLabel: {
    fontSize: moderateScale(12, 0.1),
    fontFamily: "Inter",
    fontWeight: "700", // Figma Bold/SemiBold
    color: "#222222", // Figma neutral muted header color
    letterSpacing: 0.5,
    lineHeight: moderateScale(16, 0.1),
    marginBottom: moderateScale(4, 0.3),
  },
  // Row wrapper for coins icon and balance value
  cardValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(8, 0.3),
  },
  // Main numeric balances
  cardValue: {
    fontSize: moderateScale(32, 0.1),
    fontFamily: "Inter",
    fontWeight: "800", // Figma Extra Bold / Heavy
    color: "#0F7635",
    lineHeight: moderateScale(38, 0.1),
  },
  // Yellow coin icon inside Coins tab value row
  cardCoinIcon: {
    width: moderateScale(28, 0.3),
    height: moderateScale(28, 0.3),
    marginRight: moderateScale(6, 0.3),
  },
  // Subtext description inside the card
  cardSub: {
    fontSize: moderateScale(12, 0.1),
    fontFamily: "Inter",
    fontWeight: "500",
    lineHeight: moderateScale(18, 0.1),
    color: "#565656",
    marginBottom: moderateScale(8, 0.3),
  },
  // Green Add Money touchable button
  addMoneyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F7635",
    paddingHorizontal: moderateScale(16, 0.3),
    paddingVertical: moderateScale(8, 0.3),
    borderRadius: moderateScale(20, 0.3),
    alignSelf: "flex-start",
    gap: moderateScale(8, 0.3),
  },
  // Add Money button icon style
  addMoneyIcon: {
    width: moderateScale(18, 0.3),
    height: moderateScale(18, 0.3),
  },
  // Add Money button label typography
  addMoneyText: {
    color: "#FFFFFF",
    fontSize: moderateScale(13, 0.1),
    fontFamily: "Inter",
    fontWeight: "700",
  },
  // Absolute positioned 3D wallet illustration on the right
  walletIllustration: {
    position: "absolute",
    right: moderateScale(10, 0.3),
    bottom: moderateScale(10, 0.3),
    width: moderateScale(130, 0.3),
    height: moderateScale(130, 0.3),
  },
  // Header section for Transaction list
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: moderateScale(12, 0.3),
  },
  // Container wrapper for transaction list items
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(12, 0.3),
    borderWidth: 1,
    borderColor: "#919EAB33",
    overflow: "hidden",
    padding: moderateScale(4, 0.3),
  },
  // Individual transaction item row
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(16, 0.3),
    paddingVertical: moderateScale(14, 0.3),
  },
  // Transaction description details block
  txDetails: {
    flex: 1,
    marginLeft: moderateScale(12, 0.3),
  },
  // Date subtitle in transaction item
  txDateText: {
    marginTop: moderateScale(2, 0.3),
  },
  // Amount adjusting display text (wallet/credits/coins)
  txAmountText: {
    fontSize: moderateScale(14, 0.1),
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
    width: moderateScale(16, 0.3),
    height: moderateScale(16, 0.3),
    marginRight: moderateScale(4, 0.3),
  },
  // Line separator between transaction list rows
  txSeparator: {
    height: 1,
    backgroundColor: "#919EAB33",
    marginHorizontal: moderateScale(16, 0.3),
  },
  // Transaction circular icon wrapper
  txIconContainer: {
    width: moderateScale(40, 0.3),
    height: moderateScale(40, 0.3),
    borderRadius: moderateScale(20, 0.3),
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
    width: moderateScale(24, 0.3),
    height: moderateScale(24, 0.3),
  },
  // Centered loading indicator inside transaction logs
  loadingIndicatorCenter: {
    paddingVertical: moderateScale(24, 0.3),
  },
  // Left aligned loading indicator inside dashboard info card
  loadingIndicatorLeft: {
    alignSelf: "flex-start",
    marginVertical: moderateScale(4, 0.3),
  },
  // Inline loading indicator for coins tab balance
  loadingIndicatorInline: {
    marginLeft: moderateScale(4, 0.3),
  },
});
