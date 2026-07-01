import type { DeliveryLocation, QuickAction } from "@/src/types/home";
import { icons } from "./icons";
import { HOME_IMAGES } from "./images";

export const APP_TITLE = {
  name: "CareSure",
};

export const DEFAULT_CITY = "Delhi";
export const SUPPORT_PHONE = "9790274711";
export const SUPPORT_EMAIL = "support@caresure.app";

// ─── Tab Navigation ────────────────────────────────────────────────────────────

export const tabs = [
  {
    name: "index",
    title: "Home",
    icon: icons.home,
    activeIcon: icons.homeActive,
  },
  {
    name: "categories",
    title: "Categories",
    icon: icons.categories,
    activeIcon: icons.categoriesActive,
  },
  {
    name: "profile",
    title: "Profile",
    icon: icons.profile,
    activeIcon: icons.profileActive,
  },
];

// ─── Home Screen ───────────────────────────────────────────────────────────────

export const DELIVERY_LOCATION: DeliveryLocation = {
  label: "DELIVER TO",
  city: "Select Location",
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "upload",
    label: "Upload\nPrescription",
    icon: HOME_IMAGES.prescriptions,
    bgColor: "#FFF1FB",
    iconColor: "#CF1B57",
  },
  {
    id: "substitute",
    label: "Find\nSubstitute",
    icon: HOME_IMAGES.swap,
    bgColor: "#FFFBDF",
    iconColor: "#FFA000",
  },
  {
    id: "call",
    label: "Order Via\nCall",
    icon: HOME_IMAGES.call,
    bgColor: "#F1EDFD",
    iconColor: "#9C27B0",
  },
  {
    id: "whatsapp",
    label: "WhatsApp\nOrder",
    icon: HOME_IMAGES.whatsapp,
    bgColor: "#ECFDF5",
    iconColor: "#2E7D32",
  },
];
