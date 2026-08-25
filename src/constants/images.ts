export const IMAGES = {
  // Auth Background Medicines
  medicine1: require("../../assets/images/auth/medicine-1.webp"),
  medicine2: require("../../assets/images/auth/medicine-2.webp"),
  medicine3: require("../../assets/images/auth/medicine-3.webp"),
  medicine4: require("../../assets/images/auth/medicine-4.png"),
  medicine5: require("../../assets/images/auth/medicine-5.webp"),
  medicine6: require("../../assets/images/auth/medicine-6.webp"),
  medicine7: require("../../assets/images/auth/medicine-7.webp"),
  medicine8: require("../../assets/images/auth/medicine-8.webp"),
  medicine9: require("../../assets/images/auth/medicine-9.webp"),
  medicine10: require("../../assets/images/auth/medicine-10.webp"),
  medicine11: require("../../assets/images/auth/medicine-11.webp"),
  medicine12: require("../../assets/images/auth/medicine-12.webp"),
} as const;

export const MEDICINE_COLUMNS = {
  column1: [
    IMAGES.medicine1,
    IMAGES.medicine2,
    IMAGES.medicine3,
    IMAGES.medicine4,
  ],
  column2: [
    IMAGES.medicine5,
    IMAGES.medicine6,
    IMAGES.medicine7,
    IMAGES.medicine8,
  ],
  column3: [
    IMAGES.medicine9,
    IMAGES.medicine10,
    IMAGES.medicine11,
    IMAGES.medicine12,
  ],
} as const;

export const HOME_IMAGES = {
  // Product Images
  medicineStrip: require("../../assets/images/products/medicine-strip.webp"),
  medicineStrip1: require("../../assets/images/products/medicine-strip-1.webp"),
  medicineStrip2: require("../../assets/images/products/medicine-strip-2.webp"),
  tablet1: require("../../assets/images/products/tablet-1.webp"),

  // UI Icons
  call: require("../../assets/images/icons/call.webp"),
  whatsapp: require("../../assets/images/icons/whatsapp.webp"),
  updateBell: require("../../assets/images/icons/update-bell.png"),
  wallet: require("../../assets/images/icons/wallet.webp"),
  walletCredit: require("../../assets/images/wallet/wallet-credit.webp"),
  corporateCredit: require("../../assets/images/wallet/corporate-credit.webp"),
  corporateBenefits: require("../../assets/images/wallet/corporate-benefits.webp"),
  giftBoxGreen: require("../../assets/images/wallet/gift-box-green.webp"),
  taxBuilding: require("../../assets/images/wallet/tax-building.webp"),
  walletOutlinePurple: require("../../assets/icons/wallet-outline-purple.png"),
  pillPink: require("../../assets/icons/pill-pink.png"),
  giftOutlineBlue: require("../../assets/icons/gift-outline-blue.png"),
  swap: require("../../assets/images/icons/swap.webp"),
  prescriptions: require("../../assets/images/icons/prescriptions.webp"),
  verifiedUser: require("../../assets/images/icons/verified-user.webp"),
  dollarCoins: require("../../assets/images/wallet/dollar-coins.webp"),
  rupeeCoin: require("../../assets/images/wallet/rupee-coin.webp"),
  addCircle: require("../../assets/images/wallet/add_circle.webp"),
  rupeeMoneyBag: require("../../assets/images/wallet/rupee_money_bag.webp"),
  accountBalanceCredit: require("../../assets/images/icons/account-balance-credit.webp"),
  accountBalanceDebit: require("../../assets/images/icons/account-balance-debit.webp"),
  coinCredit: require("../../assets/images/icons/coin-credit.webp"),
  coinDebit: require("../../assets/images/icons/coin-debit.webp"),

  // Footer & HOME HERO
  shield: require("../../assets/images/icons/shield.webp"),
  bannerMedicine: require("../../assets/images/banners/medicine.webp"),
  bannerPills: require("../../assets/images/banners/medicine-pills.webp"),

  // Cart & Product Details
  productBackground: require("../../assets/images/banners/product-background.webp"),
  chemical: require("../../assets/images/cart/chemical.webp"),
  medicine: require("../../assets/images/cart/medicine-icon.webp"),
  deliveryBox: require("../../assets/images/cart/delivery-box.webp"),
  clockIcon: require("../../assets/images/cart/clock-icon.webp"),
  couponIcon: require("../../assets/images/cart/coupon-icon.webp"),
  couponRibbon: require("../../assets/images/cart/coupon-ribbon.webp"),
  discountTag: require("../../assets/images/cart/discount-tag.webp"),

  // Company Logos
  ciplaLogo: require("../../assets/images/branding/cipla-logo.webp"),
  modiLogo: require("../../assets/images/branding/modi-logo.webp"),
  prescription: require("../../assets/images/prescription/prescription-pending.webp"),
  stethoscope: require("../../assets/images/cart/stethoscope.webp"),
  samplePrescription: require("../../assets/images/prescription/sample-prescription.webp"),
  doctor: require("../../assets/images/cart/doctor.webp"),
  doctorLogo: require("../../assets/images/branding/doctor-logo.webp"),

  // Category Products
  moneyBag: require("../../assets/images/wallet/money.webp"),
  successTick: require("../../assets/images/icons/tick.webp"),
  supplements: require("../../assets/images/products/supplements-bottle.webp"),
  multivitamin: require("../../assets/images/products/multivitamin-bottle.webp"),
  upload_png: require("../../assets/images/icons/upload.webp"),
  prescriptionRejected: require("../../assets/images/prescription/prescription-rejected.webp"),
  prescriptionApproved: require("../../assets/images/prescription/prescription-approved.webp"),
  warningIcon: require("../../assets/images/icons/warning.webp"),
  leaveWarning: require("../../assets/images/icons/leave_warning.webp"),
  presSuccess: require("../../assets/images/icons/pres_success.webp"),
  blockIcon: require("../../assets/images/icons/block.webp"),
  notiHistoryIcon: require("../../assets/images/icons/Noti_history.webp"),
  bucketCheckIcon: require("../../assets/images/icons/bucket_check.webp"),
  prescriptionInfo: require("../../assets/images/prescription/prescription-info.webp"),
  prescriptionInstructions: require("../../assets/images/prescription/prescription-instructions.webp"),
  prescriptionMedicine: require("../../assets/images/prescription/prescription-medicine.webp"),
  noPatient: require("../../assets/images/prescription/no-patient.webp"),
  splashIcon: require("../../assets/images/splash-icon.png"),

  // Orders
  corporateOrderBadge: require("../../assets/images/orders/corporate-order-badge.png"),

  // Delete Account
  deleteAccount: require("../../assets/images/icons/delete-account.webp"),
} as const;

export const UPLOAD_IMAGES = {
  secure: require("../../assets/images/prescription/secure.webp"),
  pharmacist: require("../../assets/images/prescription/pharmacist.webp"),
  fastTime: require("../../assets/images/prescription/fast-time.webp"),
} as const;

export const ANIMATIONS = {
  chemicalBeaker: require("../../assets/animations/chemical-beaker.lottie"),
  emptyCart: require("../../assets/animations/emptycart.lottie"),
  calendar: require("../../assets/animations/calendar.lottie"),
  pharmacy: require("../../assets/animations/pharmacy.lottie"),
  orderPlaced: require("../../assets/animations/order-placed.lottie"),
  confetti: require("../../assets/animations/confetti.lottie"),
  splash: require("../../assets/animations/splash.lottie"),
} as const;
