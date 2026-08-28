import { icons } from "@/src/constants/icons";
import type { PaymentMethod } from "../types";
import React from "react";

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "COD",
    title: "Cash on Delivery",
    subtitle: "Pay Via Cash on Delivery",
    icon: (
      <icons.account_balance_wallet width={24} height={24} fill="#0F7635" />
    ),
  },
  {
    id: "CARD",
    title: "Credit / Debit Card",
    subtitle: "Pay via Visa, Mastercard & more",
    icon: <icons.credit_card width={24} height={24} fill="#0F7635" />,
  },
];

export const CONFETTI_COLORS = [
  "#0F7635",
  "#36B37E",
  "#8BC34A",
  "#FFD700",
  "#FFA726",
  "#FF7043",
  "#4FC3F7",
  "#AB47BC",
  "#EC407A",
];
