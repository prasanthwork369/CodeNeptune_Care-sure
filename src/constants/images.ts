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
  medicineStrip: require("../../assets/images/products/medicine-strip.png"),
  medicineStrip1: require("../../assets/images/products/medicine-strip-1.png"),
  medicineStrip2: require("../../assets/images/products/medicine-strip-2.png"),
  tablet1: require("../../assets/images/products/tablet-1.png"),

  // UI Icons
  call: require("../../assets/images/icons/call.png"),
  whatsapp: require("../../assets/images/icons/whatsapp.png"),
  wallet: require("../../assets/images/icons/wallet.png"),
  walletCredit: require("../../assets/images/wallet/wallet-credit.png"),
  swap: require("../../assets/images/icons/swap.png"),
  prescriptions: require("../../assets/images/icons/prescriptions.png"),
  verifiedUser: require("../../assets/images/icons/verified-user.png"),
  dollarCoins: require("../../assets/images/wallet/dollar-coins.png"),
  rupeeCoin: require("../../assets/images/wallet/rupee-coin.png"),
  cash: require("../../assets/images/wallet/cash.png"),
  bonusGift: require("../../assets/images/wallet/bonus_gift.png"),
  accountBalanceCredit: require("../../assets/images/icons/account-balance-credit.png"),
  accountBalanceDebit: require("../../assets/images/icons/account-balance-debit.png"),
  coinCredit: require("../../assets/images/icons/coin-credit.png"),
  coinDebit: require("../../assets/images/icons/coin-debit.png"),

  // Footer & HOME HERO
  shield: require("../../assets/images/icons/shield.png"),
  bannerMedicine: require("../../assets/images/banners/medicine.png"),
  bannerPills: require("../../assets/images/banners/medicine-pills.png"),

  // Cart & Product Details
  productBackground: require("../../assets/images/banners/product-background.png"),
  chemical: require("../../assets/images/cart/chemical.png"),
  medicine: require("../../assets/images/cart/medicine-icon.png"),
  deliveryBox: require("../../assets/images/cart/delivery-box.png"),
  clockIcon: require("../../assets/images/cart/clock-icon.png"),
  couponIcon: require("../../assets/images/cart/coupon-icon.png"),
  couponRibbon: require("../../assets/images/cart/coupon-ribbon.png"),
  discountTag: require("../../assets/images/cart/discount-tag.png"),

  // Company Logos
  ciplaLogo: require("../../assets/images/branding/cipla-logo.png"),
  modiLogo: require("../../assets/images/branding/modi-logo.png"),
  prescription: require("../../assets/images/prescription/prescription-pending.png"),
  stethoscope: require("../../assets/images/cart/stethoscope.png"),
  samplePrescription: require("../../assets/images/prescription/sample-prescription.png"),
  doctor: require("../../assets/images/cart/doctor.png"),
  doctorLogo: require("../../assets/images/branding/doctor-logo.png"),

  // Category Products
  moneyBag: require("../../assets/images/wallet/money.png"),
  successTick: require("../../assets/images/icons/tick.png"),
  supplements: require("../../assets/images/products/supplements-bottle.png"),
  multivitamin: require("../../assets/images/products/multivitamin-bottle.png"),
  upload_png: require("../../assets/images/icons/upload.png"),
  prescriptionRejected: require("../../assets/images/prescription/prescription-rejected.png"),
  prescriptionApproved: require("../../assets/images/prescription/prescription-approved.png"),
  warningIcon: require("../../assets/images/icons/warning.png"),
  blockIcon: require("../../assets/images/icons/block.png"),
  notiHistoryIcon: require("../../assets/images/icons/Noti_history.png"),
  bucketCheckIcon: require("../../assets/images/icons/bucket_check.png"),
} as const;

export const UPLOAD_IMAGES = {
  secure: require("../../assets/images/prescription/secure.png"),
  pharmacist: require("../../assets/images/prescription/pharmacist.png"),
  fastTime: require("../../assets/images/prescription/fast-time.png"),
} as const;

export const ANIMATIONS = {
  chemicalBeaker: require("../../assets/animations/chemical-beaker.lottie"),
  emptyCart: require("../../assets/animations/emptycart.lottie"),
  calendar: require("../../assets/animations/calendar.lottie"),
  pharmacy: require("../../assets/animations/pharmacy.lottie"),
  orderPlaced: require("../../assets/animations/order-placed.lottie"),
  confetti: require("../../assets/animations/confetti.lottie"),
} as const;
