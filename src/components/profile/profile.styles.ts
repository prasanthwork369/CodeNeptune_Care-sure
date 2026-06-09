import { StyleSheet } from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';

export const profileStyles = StyleSheet.create({
    // ProfileHeader
    avatarImg:      { width: scale(88), height: scale(88) },
    avatarIcon:     { width: scale(52), height: scale(52) },
    avatarEditBtn:  { width: scale(34), height: scale(34) },
    avatarEditIcon: { width: scale(18), height: scale(18) },
    personName:     { fontSize: moderateScale(20, 0.3) },
    personPhone:    { fontSize: moderateScale(14, 0.3) },

    // ProfileCoinsCard
    coinsTitle:     { fontSize: moderateScale(24, 0.3) },
    coinsSub:       { fontSize: moderateScale(16, 0.3) },
    coinsLabel:     { fontSize: moderateScale(16, 0.3) },
    coinsBold:      { fontSize: moderateScale(16, 0.3) },
    coinsSaved:     { fontSize: moderateScale(14, 0.3) },

    // ProfileInfoList
    sectionTitle:   { fontSize: moderateScale(16, 0.3) },
    infoLabel:      { fontSize: moderateScale(14, 0.3) },
    logoutText:     { fontSize: moderateScale(15, 0.3) },

    // WalletLayout
    walletBalance:  { fontSize: moderateScale(38, 0.3) },
    walletCoins:    { fontSize: moderateScale(34, 0.3) },
    walletLabel:    { fontSize: moderateScale(13, 0.3) },
    walletSub:      { fontSize: moderateScale(12, 0.3) },
    walletBtn:      { fontSize: moderateScale(16, 0.3) },
    walletTitle:    { fontSize: moderateScale(16, 0.3) },
    walletTxTitle:  { fontSize: moderateScale(14, 0.3) },
    walletTxBonus:  { fontSize: moderateScale(14, 0.3) },

    // MyAddressesLayout
    addrTitle:      { fontSize: moderateScale(16, 0.3) },
    addrLabel:      { fontSize: moderateScale(14, 0.3) },
    addrSub:        { fontSize: moderateScale(11, 0.25) },
    addrAction:     { fontSize: moderateScale(13, 0.3) },
    addrAddBtn:     { fontSize: moderateScale(15, 0.3) },

    // AddAddressLayout
    addrFormLabel:  { fontSize: moderateScale(15, 0.3) },
    addrFormInput:  { fontSize: moderateScale(13, 0.3) },
    addrFormBtn:    { fontSize: moderateScale(14, 0.3) },

    // AddPatientLayout / AddPatientSheet
    patientTitle:   { fontSize: moderateScale(18, 0.3) },
    patientLabel:   { fontSize: moderateScale(14, 0.3) },
    patientSub:     { fontSize: moderateScale(13, 0.3) },
    patientInput:   { height: moderateScale(52, 0.3) },

    // PatientDetailsLayout
    patientAvatar:  { width: scale(46), height: scale(46) },
    patientName:    { fontSize: moderateScale(15, 0.3) },
    patientDob:     { fontSize: moderateScale(12, 0.3) },
    patientTag:     { fontSize: moderateScale(11, 0.25) },
    patientDetail:  { fontSize: moderateScale(13, 0.3) },
    patientValue:   { fontSize: moderateScale(14, 0.3) },

    // MyProfileLayout
    profileLabel:   { fontSize: moderateScale(14, 0.3) },
    profileInput:   { height: moderateScale(52, 0.3) },
    profileBtn:     { fontSize: moderateScale(15, 0.3) },

    // HelpLayout / FaqLayout
    helpTitle:      { fontSize: moderateScale(16, 0.3) },
    helpLabel:      { fontSize: moderateScale(13, 0.3) },
    helpValue:      { fontSize: moderateScale(14, 0.3) },
    faqTitle:       { fontSize: moderateScale(15, 0.3) },
    faqBody:        { fontSize: moderateScale(13, 0.3) },

    // LogoutConfirmModal
    logoutImg:      { width: scale(90), height: scale(90) },
    logoutModalBtn: { fontSize: moderateScale(15, 0.3) },

    // WalletInfoModal / TransactionHistorySheet
    walletInfoTitle:  { fontSize: moderateScale(18, 0.3) },
    walletInfoSub:    { fontSize: moderateScale(16, 0.3) },
    walletInfoBody:   { fontSize: moderateScale(12, 0.3) },
    txTitle:          { fontSize: moderateScale(16, 0.3) },
    txLabel:          { fontSize: moderateScale(14, 0.3) },
    txSub:            { fontSize: moderateScale(12, 0.3) },
    txIcon:           { width: scale(16), height: scale(16) },

    // ProfileQuickTiles
    tileLabel:      { fontSize: moderateScale(12, 0.3) },
});
