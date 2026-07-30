import { Transaction, WalletLog } from "@/src/types/wallet";

// Deliberately separate from utils/walletTransactions.ts: this screen shows
// whole rupees, its own titles, and amber coins. Merging them would change the UI.

const MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTH[d.getMonth()]} ${d.getFullYear()}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
}

const TITLE_MAP: Record<string, string> = {
  signup_bonus: "Welcome Bonus",
  order_purchase: "Medicine Purchase",
  order_refund: "Refund Received",
  admin_adjustment: "Wallet Adjustment",
  wallet_topup: "Added to Wallet",
};

export function logToTransactions(log: WalletLog): Transaction[] {
  const isCredit = log.type === "credit";
  const walletAmt = Number(log.walletAmount);
  const coinsAmt = Number(log.coinsAmount);
  const title =
    log.description ?? TITLE_MAP[log.referenceType] ?? "Transaction";
  const date = formatDate(log.createdAt);
  const results: Transaction[] = [];

  if (walletAmt > 0) {
    results.push({
      id: `${log.id}_wallet`,
      iconType:
        log.referenceType === "wallet_topup"
          ? "cash"
          : isCredit
            ? "plus"
            : "bag",
      title,
      date,
      amount: `${isCredit ? "+" : "-"}₹${walletAmt.toFixed(0)}`,
      amountColor: isCredit ? "#0F9D58" : "#222222",
      isCoin: false,
    });
  }

  if (coinsAmt > 0) {
    results.push({
      id: `${log.id}_coins`,
      iconType:
        isCredit || log.referenceType === "signup_bonus"
          ? "coin_credit"
          : "coin_debit",
      title,
      date,
      amount: `${isCredit || log.referenceType === "signup_bonus" ? "+" : "-"}${coinsAmt}`,
      amountColor:
        isCredit || log.referenceType === "signup_bonus"
          ? "#F59E0B"
          : "#222222",
      isCoin: true,
    });
  }

  return results;
}

export type WalletTabKey = "All" | "Debited" | "Credited";

// Debits are rendered with a leading "-", credits with a "+".
export function filterTransactions(
  all: Transaction[],
  tab: WalletTabKey,
): Transaction[] {
  if (tab === "All") return all;
  const sign = tab === "Debited" ? "-" : "+";
  return all.filter((tx) => tx.amount.startsWith(sign));
}
