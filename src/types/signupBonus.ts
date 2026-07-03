export interface SignupBonusBadge {
  icon: string;
  label: string;
  description: string;
}

export interface SignupBonusData {
  wallet: number;
  coins: number;
}

export interface SignupBonusPopupContent {
  greeting?: string;
  title?: string;
  subtitle?: string;
  giftImage?: string;
  coinImage?: string;
  walletTitle?: string;
  coinsLabel?: string;
  coinsIcon?: string;
  balanceLabel?: string;
  balanceIcon?: string;
  buttonText?: string;
  badges?: SignupBonusBadge[];
}
