import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const profileStyles = StyleSheet.create({
    // ProfileHeader
    avatarImg:      { width: scale(88), height: scale(88) },
    avatarIcon:     { width: scale(52), height: scale(52) },
    avatarEditBtn:  { width: scale(34), height: scale(34) },
    avatarEditIcon: { width: scale(18), height: scale(18) },
    personName:     { fontSize: moderateScale(20, 0.1) },
    personPhone:    { fontSize: moderateScale(14, 0.1) },

    // ProfileCoinsCard
    coinsTitle:     { fontSize: moderateScale(24, 0.1) },
    coinsSub:       { fontSize: moderateScale(16, 0.1) },
    coinsLabel:     { fontSize: moderateScale(16, 0.1) },
    coinsBold:      { fontSize: moderateScale(16, 0.1) },
    coinsSaved:     { fontSize: moderateScale(14, 0.1) },

    // ProfileInfoList
    sectionTitle:   { fontSize: moderateScale(16, 0.1) },
    infoLabel:      { fontSize: moderateScale(14, 0.1) },
    logoutText:     { fontSize: moderateScale(15, 0.1) },

    // WalletLayout
    walletBalance:  { fontSize: moderateScale(38, 0.1) },
    walletCoins:    { fontSize: moderateScale(34, 0.1) },
    walletLabel:    { fontSize: moderateScale(13, 0.1) },
    walletSub:      { fontSize: moderateScale(12, 0.1) },
    walletBtn:      { fontSize: moderateScale(16, 0.1) },
    walletTitle:    { fontSize: moderateScale(16, 0.1) },
    walletTxTitle:  { fontSize: moderateScale(14, 0.1) },
    walletTxBonus:  { fontSize: moderateScale(14, 0.1) },

    // MyAddressesLayout
    addrTitle:      { fontSize: moderateScale(16, 0.1) },
    addrLabel:      { fontSize: moderateScale(14, 0.1) },
    addrSub:        { fontSize: moderateScale(11, 0.08) },
    addrAction:     { fontSize: moderateScale(13, 0.1) },
    addrAddBtn:     { fontSize: moderateScale(15, 0.1) },

    // AddAddressLayout
    addrFormLabel:  { fontSize: moderateScale(15, 0.1) },
    addrFormInput:  { fontSize: moderateScale(13, 0.1) },
    addrFormBtn:    { fontSize: moderateScale(14, 0.1) },

    // AddPatientLayout / AddPatientSheet
    patientTitle:   { fontSize: moderateScale(18, 0.1) },
    patientLabel:   { fontSize: moderateScale(14, 0.1) },
    patientSub:     { fontSize: moderateScale(13, 0.1) },
    patientInput:   { height: moderateScale(52, 0.3) },

    // PatientDetailsLayout
    patientAvatar:  { width: scale(46), height: scale(46) },
    patientName:    { fontSize: moderateScale(15, 0.1) },
    patientDob:     { fontSize: moderateScale(12, 0.1) },
    patientTag:     { fontSize: moderateScale(11, 0.08) },
    patientDetail:  { fontSize: moderateScale(13, 0.1) },
    patientValue:   { fontSize: moderateScale(14, 0.1) },

    // MyProfileLayout
    profileLabel:   { fontSize: moderateScale(14, 0.1) },
    profileInput:   { height: moderateScale(52, 0.3) },
    profileBtn:     { fontSize: moderateScale(15, 0.1) },

    // HelpLayout / FaqLayout
    helpTitle:      { fontSize: moderateScale(16, 0.1) },
    helpLabel:      { fontSize: moderateScale(13, 0.1) },
    helpValue:      { fontSize: moderateScale(14, 0.1) },
    faqTitle:       { fontSize: moderateScale(15, 0.1) },
    faqBody:        { fontSize: moderateScale(13, 0.1) },

    // LogoutConfirmModal
    logoutImg:      { width: scale(90), height: scale(90) },
    logoutModalBtn: { fontSize: moderateScale(15, 0.1) },

    // WalletInfoModal / TransactionHistorySheet
    walletInfoTitle:  { fontSize: moderateScale(18, 0.1) },
    walletInfoSub:    { fontSize: moderateScale(16, 0.1) },
    walletInfoBody:   { fontSize: moderateScale(12, 0.1) },
    txTitle:          { fontSize: moderateScale(16, 0.1) },
    txLabel:          { fontSize: moderateScale(14, 0.1) },
    txSub:            { fontSize: moderateScale(12, 0.1) },
    txIcon:           { width: scale(16), height: scale(16) },

    // ProfileQuickTiles
    tileLabel:      { fontSize: moderateScale(12, 0.1) },
});
