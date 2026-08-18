export type TxIconType = "plus" | "bag" | "coin_debit" | "coin_credit" | "cash";

export type Transaction = {
  id: string;
  iconType: TxIconType;
  title: string;
  date: string;
  amount: string;
  amountColor: string;
  isCoin: boolean;
};

export * from "./api.types";
