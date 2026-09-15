// Parses a price-like value (string, number, null, undefined) into a finite
// number, defaulting to 0 for anything that doesn't parse — so a missing or
// malformed backend price (e.g. a delisted medicine) can never poison a
// running cart/bill total into NaN.
export const parseMoney = (value: unknown): number => {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
};

// Money must be exact to the paise. JS floats can't hold values like 0.1
// exactly, and rounding to 1 decimal (the old `Math.round(x * 10) / 10`)
// silently dropped paise — e.g. 180.31 became 180.30. Round to paise instead,
// nudging by EPSILON so a true .xx5 rounds up rather than down from float noise.
export const roundToPaise = (rupees: number): number =>
  Math.round((rupees + Number.EPSILON) * 100) / 100;

// Rupees → integer paise, for exact addition (never add raw decimals).
export const toPaise = (rupees: number): number =>
  Math.round((rupees + Number.EPSILON) * 100);

// Integer paise → rupees.
export const fromPaise = (paise: number): number => paise / 100;
