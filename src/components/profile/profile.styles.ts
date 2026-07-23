import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  // ProfileHeader
  avatarImg: { width: exactScale(88), height: exactScale(88) },
  avatarIcon: { width: exactScale(52), height: exactScale(52) },
  avatarEditBtn: { width: exactScale(34), height: exactScale(34) },
  avatarEditIcon: { width: exactScale(18), height: exactScale(18) },
  personName: { fontSize: moderateScale(20) },
  personPhone: { fontSize: moderateScale(14) },

  // ProfileCoinsCard
  coinsTitle: { fontSize: moderateScale(18) },
  coinsSub: { fontSize: moderateScale(15) },
  coinsLabel: { fontSize: moderateScale(15) },
  coinsBold: { fontSize: moderateScale(15) },
  // Figma: Inter Medium 14 / line-height 100% / letter-spacing 0
  coinsSaved: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(14),
    letterSpacing: 0,
  },

  // ProfileInfoList
  sectionTitle: { fontSize: moderateScale(16) },
  infoLabel: { fontSize: moderateScale(14) },
  logoutText: { fontSize: moderateScale(15) },

  // WalletLayout
  walletBalance: { fontSize: moderateScale(38) },
  walletCoins: { fontSize: moderateScale(34) },
  walletLabel: { fontSize: moderateScale(13) },
  walletSub: { fontSize: moderateScale(12) },
  walletBtn: { fontSize: moderateScale(16) },
  walletTitle: { fontSize: moderateScale(16) },
  walletTxTitle: { fontSize: moderateScale(14) },
  walletTxBonus: { fontSize: moderateScale(14) },

  // MyAddressesLayout
  addrTitle: { fontSize: moderateScale(16) },
  addrLabel: { fontSize: moderateScale(14) },
  addrSub: { fontSize: moderateScale(11) },
  addrAction: { fontSize: moderateScale(13) },
  addrAddBtn: { fontSize: moderateScale(15) },

  // AddAddressLayout
  addrFormLabel: { fontSize: moderateScale(15) },
  addrFormInput: { fontSize: moderateScale(13) },
  addrFormBtn: { fontSize: moderateScale(14) },

  // AddPatientLayout / AddPatientSheet
  patientTitle: { fontSize: moderateScale(18) },
  patientLabel: { fontSize: moderateScale(14) },
  patientSub: { fontSize: moderateScale(13) },
  patientInput: { height: exactScale(52) },

  // PatientDetailsLayout
  patientAvatar: { width: exactScale(46), height: exactScale(46) },
  patientName: { fontSize: moderateScale(15) },
  patientDob: { fontSize: moderateScale(12) },
  patientTag: { fontSize: moderateScale(11) },
  patientDetail: { fontSize: moderateScale(13) },
  patientValue: { fontSize: moderateScale(14) },

  // MyProfileLayout
  profileLabel: { fontSize: moderateScale(14) },
  profileInput: { height: exactScale(52) },
  profileBtn: { fontSize: moderateScale(15) },

  // HelpLayout / FaqLayout
  helpTitle: { fontSize: moderateScale(16) },
  helpLabel: { fontSize: moderateScale(13) },
  helpValue: { fontSize: moderateScale(14) },
  faqTitle: { fontSize: moderateScale(15) },
  faqBody: { fontSize: moderateScale(13) },

  // LogoutConfirmModal
  logoutImg: { width: exactScale(90), height: exactScale(90) },
  logoutModalBtn: { fontSize: moderateScale(15) },

  // WalletInfoModal / TransactionHistorySheet
  walletInfoTitle: { fontSize: moderateScale(18) },
  walletInfoSub: { fontSize: moderateScale(16) },
  walletInfoBody: { fontSize: moderateScale(12) },
  txTitle: { fontSize: moderateScale(16) },
  txLabel: { fontSize: moderateScale(14) },
  txSub: { fontSize: moderateScale(12) },
  txIcon: { width: exactScale(16), height: exactScale(16) },

  // ProfileQuickTiles
  tileLabel: { fontSize: moderateScale(12) },
});
