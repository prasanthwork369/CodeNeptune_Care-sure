import type { CategoryCard, CategoryTab, DeliveryLocation, HeroContent, Product, QuickAction, SubstituteProduct } from "@/src/types/home";
import type { CategoryProduct } from "@/src/types/category";
import { icons } from "./icons";
import { HOME_IMAGES, UPLOAD_IMAGES } from "./images";

export const APP_TITLE = {
    name: "CareSure",
};

export const HOME_USER = {
    name: "Adrian | JS Mastery",
};

export const HOME_BALANCE = {
    amount: 2489.48,
    nextRenewalDate: "2026-03-18T09:00:00.000Z",
};

export const REFERRAL_DATA = {
    appName: "Caresure",
    appLink: "https://caresure.app/install",
    referralCode: "CARESURE123",
    shareMessage: (referralCode: string) =>
        `Hi I, ve been using Caresure for my medicines as it offers the same medicines at up to 60% lower prices. install App & use my refferal code ${referralCode} to get 250 on signup https://caresure.app/install`,
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

export const HERO_CONTENT: HeroContent = {
    heading: "Stop overpaying\nfor your",
    highlight: " medicines",
    badge: "Pay less. Feel better",
    image: HOME_IMAGES.representative,
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

export const POPULAR_SUBSTITUTES: Product[] = [
    {
        id: "p1",
        name: "Paracetamol 500mg\nTablet (15s)",
        description: "Strip of 15 tablets",
        price: 59,
        originalPrice: 139,
        discount: '10% OFF',
        image: HOME_IMAGES.medicineStrip,
    },
    {
        id: "p2",
        name: "Levocetirizine 5mg\nTablet (10s)",
        description: "Strip of 10 tablets",
        price: 45,
        originalPrice: 170,
        discount: '15% OFF',
        image: HOME_IMAGES.tablet1,
    },
    {
        id: 'ps3',
        name: 'Levocetirizine Tablets IP 5mg',
        description: 'Swas Levo 5 (10x10 tablets)',
        price: 45,
        originalPrice: 85,
        discount: '47% OFF',
        image: HOME_IMAGES.levoStrip,
    }
];

export const FREQUENT_SUBSTITUTES: SubstituteProduct[] = [
    {
        id: "f1",
        name: "Glimimore MF 2/500mg...",
        description: "Strip of 10 tablets",
        price: 34.00,
        image: HOME_IMAGES.medicineStrip2,
        savings: 45,
    },
    {
        id: "f2",
        name: "Cefasyn 500mg Tablet 4s",
        description: "Strip of 4 tablets",
        price: 32.00,
        image: HOME_IMAGES.medicineStrip3,
        savings: 68,
    },
    {
        id: "f3",
        name: "Cyra 40mg Tablet 10s",
        description: "Strip of 10 tablets",
        price: 62.00,
        image: HOME_IMAGES.tablet2,
        savings: 68,
    },
];

export const CATEGORY_TABS: CategoryTab[] = [
    { id: "personal", label: "Personal", emoji: "🧴", image: HOME_IMAGES.tabPersonal },
    { id: "health", label: "Health", emoji: "❤️", image: HOME_IMAGES.tabHealth },
    { id: "vitamin", label: "Vitamin", emoji: "💊", image: HOME_IMAGES.tabVitamin },
    { id: "baby", label: "Baby", emoji: "🍼", image: HOME_IMAGES.tabBaby },
    { id: "device", label: "Device", emoji: "🌡️", image: HOME_IMAGES.tabDevice },
];

export const CATEGORY_CARDS = [
    // Personal
    { id: "cold-flu",        slug: "cold-flu",        familySlug: "personal", label: "Cough and\nCold",  image: HOME_IMAGES.coldFlu,        bgColor: "#E1F7F3", tabId: "personal" },
    { id: "haircare",        slug: "haircare",        familySlug: "personal", label: "Hair Care",        image: HOME_IMAGES.haircare,       bgColor: "#F0F5FF", tabId: "personal" },
    { id: "body-care",       slug: "body-care",       familySlug: "personal", label: "Body Care",        image: HOME_IMAGES.personalCare,   bgColor: "#F2F9E1", tabId: "personal" },
    { id: "skin-care",       slug: "skin-care",       familySlug: "personal", label: "Skin Care",        image: HOME_IMAGES.skincare,       bgColor: "#FFF0F5", tabId: "personal" },
    { id: "bone-joint",      slug: "bone-joint",      familySlug: "personal", label: "Bone and\nJoint",  image: HOME_IMAGES.painRelief,     bgColor: "#EBF4FF", tabId: "personal" },
    { id: "hygiene",         slug: "hygiene",         familySlug: "personal", label: "Personal\nHygiene",image: HOME_IMAGES.hygiene,        bgColor: "#EBFBFA", tabId: "personal" },
    // Health
    { id: "pain-relief",     slug: "pain-relief",     familySlug: "health",   label: "Pain Relief",      image: HOME_IMAGES.painReliefImg,  bgColor: "#EBF4FF", tabId: "health" },
    { id: "digestive-care",  slug: "digestive-care",  familySlug: "health",   label: "Digestive\nCare",  image: HOME_IMAGES.digestiveCare,  bgColor: "#FFFDE7", tabId: "health" },
    { id: "respiratory-care",slug: "respiratory-care",familySlug: "health",   label: "Respiratory\nCare",image: HOME_IMAGES.respiratoryCare,bgColor: "#E1F7F3", tabId: "health" },
    // Vitamin
    { id: "supplements",     slug: "supplements",     familySlug: "vitamin",  label: "Supplements",      image: HOME_IMAGES.supplementsImg, bgColor: "#EBFBFA", tabId: "vitamin" },
    { id: "multivitamin",    slug: "multivitamin",    familySlug: "vitamin",  label: "Multivitamin",     image: HOME_IMAGES.multivitaminImg,bgColor: "#FFFDE7", tabId: "vitamin" },
    // Device
    { id: "bp-monitor",      slug: "bp-monitor",      familySlug: "device",   label: "BP Monitor",       image: HOME_IMAGES.bpMonitor,      bgColor: "#E1F7F3", tabId: "device" },
    { id: "nebulizers",      slug: "nebulizers",      familySlug: "device",   label: "Nebulizers",       image: HOME_IMAGES.nebulizer,      bgColor: "#FFF0F5", tabId: "device" },
    { id: "vaporizers",      slug: "vaporizers",      familySlug: "device",   label: "Vaporizers",       image: HOME_IMAGES.vaporizer,      bgColor: "#FFFDE7", tabId: "device" },
    // Baby
    { id: "baby-lotion",     slug: "baby-lotion",     familySlug: "baby",     label: "Baby Lotion",      image: HOME_IMAGES.tabBaby1,       bgColor: "#F0F5FF", tabId: "baby" },
    { id: "baby-wash",       slug: "baby-wash",       familySlug: "baby",     label: "Baby Wash",        image: HOME_IMAGES.tabBaby2,       bgColor: "#FFFDE7", tabId: "baby" },
] as CategoryCard[];

export const TRUST_BADGES = [
    {
        id: "genuine",
        label: "100%\nGenuine",
        image: HOME_IMAGES.shield,
    },
    {
        id: "delivery",
        label: "Fast\nDelivery",
        image: HOME_IMAGES.medicalBox,
    },
    {
        id: "doctor",
        label: "Doctor\nTrust",
        image: HOME_IMAGES.doctorTrust,
    },
];

// ─── Product Detail Screen ─────────────────────────────────────────────────────

export const MORE_ABOUT_TABS = [
    {
        id: 'benefits',
        label: 'Benefits',
        heading: 'Pain relief / Treatment of Fever',
        content: 'In Pain relief Paracip 650 Tablet is a common painkiller for treating aches and pains. It is widely used and rarely causes any side effects if taken properly. To get the most benefits, take it as prescribed. Do not take more or for longer than needed as that can be dangerous. In Treatment of Fever Paracip 650 Tablet is also used to reduce a high temperature (fever). It works by blocking the release of certain chemical messengers that cause fever. It may be prescribed alone or in combination with other medicines. Take it as prescribed by the doctor',
    },
    {
        id: 'side_effect',
        label: 'Side Effect',
        heading: 'Common Side Effects',
        content: 'Paracip 650 Tablet is generally well-tolerated. Common side effects may include nausea, stomach pain, or allergic reactions. Consult your doctor if any side effects persist.',
    },
    {
        id: 'how_to_use',
        label: 'How to use',
        heading: 'How to use Paracip',
        content: 'Take Paracip 650 Tablet as directed by your doctor. Swallow it whole with water. Do not chew or crush. Take it with or without food.',
    },
    {
        id: 'how_it_works',
        label: 'How it works',
        heading: 'How Paracip works',
        content: 'Paracip 650 Tablet works by blocking the production of prostaglandins in the brain that cause pain and fever, providing effective relief.',
    },
    {
        id: 'what_if_i_forget_to_take',
        label: 'What is i forget to take',
        heading: '',
        content: 'If a dose of Paracip 650 Tablet is missed, take it promptly. However, if your next dose is approaching, skip the missed dose and resume your regular schedule. Avoid doubling the dose',
    },
    {
        id: 'manufacturer_address',
        label: 'Manufacturer Address',
        heading: '',
        content: 'Cipla House, Peninsula Business Park, Ganpatrao Kadam Marg. Lower Parel. Mumbai- 400013',
    },
];

export const PRODUCT_DISCLAIMER = {
    heading: 'Disclaimer',
    body: 'CareSure is dedicated to delivering dependable and trustworthy information to empower our customers. However, the information presented here is solely for general informational purposes and should not be utilized for diagnosing, preventing, or treating health issues. It is not intended to establish a doctor-patient relationship or serve as a substitute for professional medical advice.',
};

export const SAFETY_ADVICE = [
    {
        id: 'alcohol',
        title: 'Alcohol',
        status: 'UNSAFE',
        statusColor: '#98950E',
        statusBg: '#F8FFDE',
        image: require('@/assets/images/cart/liquor.png'),
        shortDescription: 'Avoid consuming alcohol with Paracip 650 Tablet as it is deemed unsafe',
        fullDescription: 'Avoid consuming alcohol with Paracip 650 Tablet as it is deemed unsafe',
        expandable: false
    },
    {
        id: 'pregnancy',
        title: 'Pregnancy',
        status: 'CONSULT YOUR DOCTOR',
        statusColor: '#006C51',
        statusBg: '#EDFDF4',
        image: require('@/assets/images/cart/pregnant_woman.png'),
        shortDescription: 'Paracip 650 Tablet may be unsafe to use during pregnancy. Although there are limited studies in humans, animal studies',
        fullDescription: 'Paracip 650 Tablet may be unsafe to use during pregnancy. Although there are limited studies in humans, animal studies have shown harmful effects on the developing baby. Your doctor will weigh the benefits and any potential risks before prescribing it to you',
        expandable: true
    },
    {
        id: 'breast_feeding',
        title: 'Breast Feeding',
        status: 'CONSULT YOUR DOCTOR',
        statusColor: '#006C51',
        statusBg: '#EDFDF4',
        image: require('@/assets/images/cart/breastfeeding.png'),
        shortDescription: 'Paracip 650 Tablet is safe to use during breastfeeding. Human studies suggest that the drug does not pass into the',
        fullDescription: 'Paracip 650 Tablet is safe to use during breastfeeding. Human studies suggest that the drug does not pass into the breastmilk in a significant amount and is not harmful to the baby',
        expandable: true
    },
    {
        id: 'driving',
        title: 'Driving',
        status: 'SAFE',
        statusColor: '#006C51',
        statusBg: '#EDFDF4',
        image: require('@/assets/images/cart/directions_car.png'),
        shortDescription: 'Paracip 650 Tablet does not usually affect your ability to drive.',
        fullDescription: 'Paracip 650 Tablet does not usually affect your ability to drive.',
        expandable: false
    },
    {
        id: 'liver',
        title: 'Liver',
        status: 'CAUTION',
        statusColor: '#BC0808',
        statusBg: '#FFE3E3',
        image: require('@/assets/images/cart/liver.png'),
        shortDescription: 'Paracip 650 Tablet should be used with caution in patients with liver disease. Dose adjustment of Paracip 650 Tablet may be needed.',
        fullDescription: 'Paracip 650 Tablet should be used with caution in patients with liver disease. Dose adjustment of Paracip 650 Tablet may be needed. Doctor consultation is advised. However, the use of Paracip 650 Tablet is not recommended in patients with severe liver disease and active liver disease',
        expandable: true
    },
    {
        id: 'kidney',
        title: 'Kidney',
        status: 'CAUTION',
        statusColor: '#BC0808',
        statusBg: '#FFE3E3',
        image: require('@/assets/images/cart/nephrology.png'),
        shortDescription: 'Paracip 650 Tablet should be used with caution in patients with kidney disease. Dose adjustment of Paracip 650 Tablet may',
        fullDescription: 'Paracip 650 Tablet should be used with caution in patients with kidney disease. Dose adjustment of Paracip 650 Tablet may be needed. Doctor consultation is advised. However, Paracip 650 Tablet contains paracetamol which is considered the safest painkiller for kidney disease patients',
        expandable: true
    }
];

export const CATEGORY_PRODUCTS: Record<string, CategoryProduct[]> = (({
    'cold-flu': [
        {
            id: 'cp1',
            name: 'Paracip 650mg Tablet 10s',
            description: 'Strip of 15 tablets',
            price: 179,
            originalPrice: 298,
            discount: '10% OFF',
            image: HOME_IMAGES.paracip,
        },
        {
            id: 'cp2',
            name: 'Vicks Vaporub Xtra Strong 25ml',
            description: 'Jar of 25 ml',
            price: 100,
            originalPrice: 117,
            discount: '14% OFF',
            image: HOME_IMAGES.vicksVapoRub,
        },
        {
            id: 'cp3',
            name: 'Himalaya Koflet Cough Lozenges 10s',
            description: 'Bottle of 10 lozenges',
            price: 18.9,
            originalPrice: 23,
            discount: '18% OFF',
            image: HOME_IMAGES.himalayaKoflet,
        },
        {
            id: 'cp4',
            name: 'Ambrohist Plus Syrup 100ml',
            description: 'Bottle of 100 ml',
            price: 63.0,
            originalPrice: 133,
            discount: '27% OFF',
            image: HOME_IMAGES.ambrohistSyrup,
        }
    ],
    'haircare': [
        {
            id: 'hc1',
            name: 'Streax Shine Hair Serum With Walnut Oil',
            description: '100 ml',
            price: 403,
            originalPrice: 475,
            discount: '15% OFF',
            image: HOME_IMAGES.hairSerum,
        },
        {
            id: 'hc2',
            name: 'Indulekha Bringha Hair Oil',
            description: '100 ml',
            price: 380,
            originalPrice: 432,
            discount: '12% OFF',
            image: HOME_IMAGES.haircare,
        }
    ],
    'body-care': [
        {
            id: 'bc1',
            name: 'Nivea Body Milk Nourishing Lotion',
            description: '400 ml',
            price: 350,
            originalPrice: 499,
            discount: '30% OFF',
            image: HOME_IMAGES.personalCare,
        }
    ],
    'skin-care': [
        {
            id: 'sc1',
            name: 'Cetaphil Gentle Skin Cleanser',
            description: '125 ml',
            price: 333,
            originalPrice: 350,
            discount: '5% OFF',
            image: HOME_IMAGES.skincare,
        }
    ],
    'bone-joint': [
        {
            id: 'bj1',
            name: 'Volini Pain Relief Spray',
            description: '40 gm',
            price: 120,
            originalPrice: 150,
            discount: '20% OFF',
            image: HOME_IMAGES.painRelief,
        }
    ],
    'hygiene': [
        {
            id: 'hy1',
            name: 'Dettol Antiseptic Liquid',
            description: '500 ml',
            price: 180,
            originalPrice: 200,
            discount: '10% OFF',
            image: HOME_IMAGES.hygiene,
        }
    ]
}) as unknown as Record<string, CategoryProduct[]>);

export const PRESCRIPTIONS = [
    {
        id: 'RX10234',
        uploadedDate: '12 Apr 2026',
        patientName: 'Nilesh',
        status: 'Verified',
        image: UPLOAD_IMAGES.prescription,
    },
    {
        id: 'RX10234',
        uploadedDate: '12 Apr 2026',
        patientName: 'Babu',
        status: 'Pending',
        image: UPLOAD_IMAGES.prescription,
    },
    {
        id: 'RX10234',
        uploadedDate: '12 Apr 2026',
        patientName: 'Prabu',
        status: 'Rejected',
        image: UPLOAD_IMAGES.prescription,
    }
];

// ─── Search Screen ─────────────────────────────────────────────────────────────

export const RECENT_SEARCHES = [
    "Paracetamol",
    "Diabetes",
    "Cold & Flu",
    "Vitamins",
    "Pain Relief",
];

export const SEARCH_RESULTS = [
    {
        id: "sr1",
        searched: {
            name: "Dolo 650mg Tablet",
            manufacturer: "Micro Labs Ltd.",
            description: "Strip of 15 tablets",
            price: 32.1,
            unitPrice: 2.1,
            status: "Not for purchase",
            image: HOME_IMAGES.tablet2,
        },
        recommended: {
            name: "Paracip 650mg Tablet",
            manufacturer: "Cipla Ltd",
            description: "Strip of 15 tablets",
            price: 13.9,
            originalPrice: 21.4,
            savingsPercent: 7,
            savings: 120,
            image: HOME_IMAGES.medicineStrip,
        },
    },
    {
        id: "sr2",
        searched: {
            name: "Jackson Paracetamol 500 Tablet",
            manufacturer: "Modi Pharmaceuticals Ltd",
            description: "Strip of 10 tablets",
            price: 25.0,
            unitPrice: 2.5,
            status: "Not for purchase",
            image: HOME_IMAGES.tablet1,
        },
        recommended: {
            name: "Paracip 500mg Tablet 10s",
            manufacturer: "Cipla Ltd",
            description: "Strip of 10 tablets",
            price: 17.0,
            originalPrice: 24.0,
            savingsPercent: 29,
            savings: 120,
            image: HOME_IMAGES.medicineStrip2,
        },
    },
    {
        id: "sr3",
        searched: {
            name: "D1 Best Paracetamol 250mg",
            manufacturer: "Modi Pharmaceuticals Ltd",
            description: "Oral Syrup 60ml",
            price: 40.0,
            unitPrice: 0.67,
            status: "Not for purchase",
            image: HOME_IMAGES.tablet2,
        },
        recommended: {
            name: "Paracip 250mg Oral Syrup 60ml",
            manufacturer: "Cipla Ltd",
            description: "Oral Syrup 60ml",
            price: 27.0,
            originalPrice: 42.0,
            savingsPercent: 36,
            savings: 120,
            image: HOME_IMAGES.medicineStrip3,
        },
    },
];

export const PRODUCT_SECTIONS = [
    {
        id: "skin-care",
        title: "YOUR SKIN, ON ITS BEST DAYS",
        subtitle: "starts with simple care",
        headerColor: "#D6008D",
        subtitleColor: "#DE399B",
        badgeBgColor: "#FFF4FB",
        badgeTextColor: "#E045A1",
        detailsBgColor: "#FFFBFD",
        bgGradient: ["#FFFFFF", "#FFFFFF", "#FFF2FC"],
        headerImages: [HOME_IMAGES.conditionerBottle, HOME_IMAGES.conditionerTub],
        bgLocations: [0, 0.5, 1],
        products: [
            {
                id: "sc1",
                name: "Cetaphil Gentle Skin Cleanser 125ml",
                description: "125 ml",
                price: 333,
                originalPrice: 399,
                discount: "15% OFF",
                image: HOME_IMAGES.cetaphilCleanser,
            },
            {
                id: "sc2",
                name: "Nivea Men Dark Spot Face Wash",
                description: "100 ml",
                price: 170,
                originalPrice: 249,
                discount: "30% OFF",
                image: HOME_IMAGES.niveaFaceWash,
            },
            {
                id: "sc3",
                name: "Nivea Men Dark Spot Face Wash",
                description: "100 ml",
                price: 170,
                originalPrice: 249,
                discount: "30% OFF",
                image: HOME_IMAGES.niveaFaceWash,
            }
        ]
    },
    {
        id: "hair-care",
        title: "Still Struggling with Hair Fall?",
        subtitle: "Let's Fix That Today",
        headerColor: "#0055D6",
        subtitleColor: "#0055D6",
        badgeBgColor: "#ECF8FD",
        badgeTextColor: "#2DAAFF",
        detailsBgColor: "#F7FCFF",
        bgGradient: ["#FFFFFF", "#EFF9FF"],
        bgLocations: [0.001, 1],
        headerImages: [HOME_IMAGES.hairConditioner4, HOME_IMAGES.hairConditioner2],
        products: [
            {
                id: "hc1",
                name: "Streax Shine Hair Serum With Walnut Oil 100ml",
                description: "100 ml",
                price: 195,
                originalPrice: 230,
                discount: "15% OFF",
                image: HOME_IMAGES.hairSerum,
            },
            {
                id: "hc2",
                name: "Pilgrim 10% Vitamin C Face Serum",
                description: "30 ml",
                price: 595,
                originalPrice: 650,
                discount: "8% OFF",
                image: HOME_IMAGES.pilgrimFaceSerum,
            },
            {
                id: "hc3",
                name: "Pilgrim 10% Vitamin C Face Serum",
                description: "30 ml",
                price: 595,
                originalPrice: 650,
                discount: "8% OFF",
                image: HOME_IMAGES.pilgrimFaceSerum,
            }
        ]
    },
    {
        id: "daily-care",
        title: "Don't Skip Your Daily Care",
        subtitle: "We've Got It Ready",
        headerColor: "#6A00D6",
        subtitleColor: "#6A00D6",
        badgeBgColor: "#FAF6FF",
        badgeTextColor: "#6957EB",
        detailsBgColor: "#FDFCFF",
        bgGradient: ["#FFFFFF", "#FFFFFF", "#F3EAFF"],
        bgLocations: [0, 0.5, 1],
        headerImages: [HOME_IMAGES.hairConditioner1, HOME_IMAGES.hairConditioner3],
        products: [
            {
                id: "dc1",
                name: "Apollo Pharmacy Fresh Breath Mouthwash",
                description: "250 ml",
                price: 72,
                originalPrice: 120,
                discount: "40% OFF",
                image: HOME_IMAGES.mouthwash,
            },
            {
                id: "dc2",
                name: "Sensodyne Toothbrush Soft Bristles",
                description: "1 pc",
                price: 45,
                originalPrice: 60,
                discount: "25% OFF",
                image: HOME_IMAGES.sensodyneToothbrush,
            },
            {
                id: "dc3",
                name: "Sensodyne Toothbrush Soft Bristles",
                description: "1 pc",
                price: 45,
                originalPrice: 60,
                discount: "25% OFF",
                image: HOME_IMAGES.sensodyneToothbrush,
            }
        ]
    }
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