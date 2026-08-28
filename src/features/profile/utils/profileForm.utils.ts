export { GENDERS } from "../constants/profile.constants";

/**
 * Normalizes a Date object or ISO date string to a stable "YYYY-MM-DD" string.
 */
export const normalizeDob = (
  dateInput?: string | Date | null,
): string => {
  if (!dateInput) return "";

  const d =
    typeof dateInput === "string"
      ? new Date(dateInput)
      : dateInput;

  if (Number.isNaN(d.getTime())) return "";

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
};
