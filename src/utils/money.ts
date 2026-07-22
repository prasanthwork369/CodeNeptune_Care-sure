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
