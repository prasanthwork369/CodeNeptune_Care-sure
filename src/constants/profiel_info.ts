export const INFO_ITEMS = [
  { label: "My Profile", icon: "person", route: "/profile/my-profile" },
  { label: "My Order", icon: "package_icon", route: "/profile/orders" },
  { label: "Cart", icon: "cart_outline_profile", route: "/(modal)/cart" },
  {
    label: "Frequently Ordered List",
    icon: "article",
    route: "/profile/orders/frequent",
  },
  { label: "My Address", icon: "location_on", route: "/profile/addresses" },
  {
    label: "My Wallet /  CareSure Coins",
    icon: "account_balance_wallet",
    route: "/profile/wallet",
  },
  {
    label: "Prescriptions",
    icon: "prescriptions_list",
    route: "/profile/orders/prescriptions",
  },
  {
    label: "Patient Details",
    icon: "clinical_notes",
    route: "/profile/patients/details",
  },
  { label: "Need Help", icon: "help", route: "/profile/support/help" },
  {
    label: "Notification",
    icon: "notifications",
    route: "/profile/support/notifications",
  },
  { label: "FAQ", icon: "faq_info", route: "/profile/support/faq" },
  { label: "About App", icon: "info_outline", route: "/profile/about" },
] as const;
