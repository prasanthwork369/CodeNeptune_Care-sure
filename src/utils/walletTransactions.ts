import { Transaction, WalletLog } from "@/src/types/wallet";

// Calendar months dictionary for localized transaction date formatting
const MONTH = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Formats an ISO date string to a human-readable format: "D MMM YYYY, HH:MM AM/PM"
 * @param iso ISO datetime string
 */
function formatDate(iso: string): string {
    const d = new Date(iso);
    const day = d.getDate();
    const mon = MONTH[d.getMonth()];
    const yr = d.getFullYear();
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${day} ${mon} ${yr}, ${hr}:${m} ${ampm}`;
}

// Maps system-level wallet transaction reference types to front-facing titles
const TITLE_MAP: Record<WalletLog["referenceType"], string> = {
    signup_bonus: "Welcome Bonus",
    order_purchase: "Medicine Purchase",
    order_refund: "Order Refund",
    admin_adjustment: "Wallet Adjustment",
    wallet_topup: "Wallet Top-up",
};

/**
 * Converts a backend WalletLog item into display-ready transaction object(s).
 * Handles separating transaction rows if both cash wallet and coins adjustments co-occur.
 * @param log System WalletLog record
 */
export function logToTransactions(log: WalletLog): Transaction[] {
    const isCredit = log.type === "credit";
    const walletAmt = Number(log.walletAmount);
    const coinsAmt = Number(log.coinsAmount);
    const title = log.description ?? TITLE_MAP[log.referenceType];
    const date = formatDate(log.createdAt);
    const results: Transaction[] = [];

    // 1. Process cash wallet ledger records
    if (walletAmt > 0) {
        results.push({
            id: `${log.id}_wallet`,
            iconType: log.referenceType === 'wallet_topup' ? 'cash' : isCredit ? 'plus' : 'bag',
            title,
            date,
            amount: `${isCredit ? "+" : "-"}₹${walletAmt.toFixed(2)}`,
            amountColor: isCredit ? "#0F9D58" : "#222222",
            isCoin: false,
        });
    }

    // 2. Process CareSure Coins ledger records
    if (coinsAmt > 0) {
        results.push({
            id: `${log.id}_coins`,
            iconType: isCredit ? "coin_credit" : "coin_debit",
            title,
            date,
            amount: `${isCredit ? "+" : "-"}${coinsAmt}`,
            amountColor: isCredit ? "#0F9D58" : "#222222",
            isCoin: true,
        });
    }

    // 3. Fallback record if absolute values are zero
    if (results.length === 0) {
        results.push({
            id: log.id,
            iconType: isCredit ? "plus" : "bag",
            title,
            date,
            amount: `${isCredit ? "+" : "-"}₹0.00`,
            amountColor: "#222222",
            isCoin: false,
        });
    }

    return results;
}
