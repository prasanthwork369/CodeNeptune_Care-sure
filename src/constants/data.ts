import type { DeliveryLocation, QuickAction } from "@/src/types/home";
import { icons } from "./icons";
import { HOME_IMAGES } from "./images";

export const APP_TITLE = {
    name: "CareSure",
};

export const HOME_USER = {
    name: "Adrian | JS Mastery",
};

export const DEFAULT_CITY = "Delhi";
export const SUPPORT_PHONE = "9790274711";
export const SUPPORT_EMAIL = "support@caresure.app";

// ─── Tab Navigation ────────────────────────────────────────────────────────────

export const tabs = [
    { name: "index", title: "Home", icon: icons.home, activeIcon: icons.homeActive },
    { name: "categories", title: "Categories", icon: icons.categories, activeIcon: icons.categoriesActive },
    { name: "profile", title: "Profile", icon: icons.profile, activeIcon: icons.profileActive },
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
        bgColor: "#FFF1F3",
        iconColor: "#E91E63",
    },
    {
        id: "substitute",
        label: "Find\nSubstitute",
        icon: HOME_IMAGES.swap,
        bgColor: "#FFF8E1",
        iconColor: "#FFA000",
    },
    {
        id: "call",
        label: "Order Via\nCall",
        icon: HOME_IMAGES.call,
        bgColor: "#F3E5F5",
        iconColor: "#9C27B0",
    },
    {
        id: "whatsapp",
        label: "WhatsApp\nOrder",
        icon: HOME_IMAGES.whatsapp,
        bgColor: "#E8F5E9",
        iconColor: "#2E7D32",
    },
];

export interface HealthProblem {
    id: string;
    label: string;
    emoji: string;
}

export const HEALTH_PROBLEMS: HealthProblem[] = [
    { id: '1',  label: 'Fever & Cold',              emoji: '🤧' },
    { id: '2',  label: 'Diabetes',                  emoji: '🩸' },
    { id: '3',  label: 'Blood Pressure',            emoji: '❤️' },
    { id: '4',  label: 'Thyroid',                   emoji: '🦋' },
    { id: '5',  label: 'Heart Problems',            emoji: '🫀' },
    { id: '6',  label: 'Asthma',                    emoji: '🌬️' },
    { id: '7',  label: 'Nephrology',                emoji: '🫘' },
    { id: '8',  label: 'Neurology',                 emoji: '🧠' },
    { id: '9',  label: 'Lab Report Analysis',       emoji: '🧪' },
    { id: '10', label: 'Hair & Scalp',              emoji: '🧴' },
    { id: '11', label: 'Weight Management',         emoji: '⚖️' },
    { id: '12', label: 'Pregnancy Problems',        emoji: '🤰' },
    { id: '13', label: 'Psychiatric Issues',        emoji: '🤯' },
    { id: '14', label: 'Psychological Counselling', emoji: '🗣️' },
    { id: '15', label: 'Dentistry',                 emoji: '🦷' },
    { id: '16', label: 'Ophthalmology',             emoji: '👁️' },
    { id: '17', label: 'Pulmonology',               emoji: '🫁' },
    { id: '18', label: 'Endocrinology',             emoji: '🧬' },
    { id: '19', label: 'Urology',                   emoji: '💧' },
    { id: '20', label: 'I do not know',             emoji: '🤔' },
];