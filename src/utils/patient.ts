export const DOB_MAX_AGE_YEARS = 120;

// Latest allowed DOB — today (newborns accepted)
export const getMaxDob = (): Date => new Date();

// Earliest allowed DOB — today minus 120 years
export const getMinDob = (): Date => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - DOB_MAX_AGE_YEARS);
  return d;
};

// Extract [year, month, day] from "YYYY-MM-DD" or ISO string without UTC parsing
function parseDobParts(s: string): [number, number, number] | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

// Validates a DOB string — returns { valid } or { valid, error }
export const validateDob = (
  isoString: string,
): { valid: boolean; error?: string } => {
  if (!isoString) {
    return { valid: false, error: "Date of birth is required." };
  }

  const parts = parseDobParts(isoString);
  if (!parts) {
    return { valid: false, error: "Please enter a valid date of birth." };
  }

  const [y, mo, d] = parts;

  // Confirm the calendar date is real (rejects Feb 30, etc.)
  const candidate = new Date(y, mo - 1, d);
  if (
    candidate.getFullYear() !== y ||
    candidate.getMonth() !== mo - 1 ||
    candidate.getDate() !== d
  ) {
    return { valid: false, error: "Please enter a valid date of birth." };
  }

  const now = new Date();
  const ty = now.getFullYear();
  const tm = now.getMonth() + 1;
  const td = now.getDate();

  const isFuture =
    y > ty || (y === ty && mo > tm) || (y === ty && mo === tm && d > td);
  if (isFuture) {
    return { valid: false, error: "Date of birth cannot be in the future." };
  }

  const min = getMinDob();
  const my = min.getFullYear();
  const mm = min.getMonth() + 1;
  const md = min.getDate();

  const tooOld =
    y < my || (y === my && mo < mm) || (y === my && mo === mm && d < md);
  if (tooOld) {
    return { valid: false, error: "Please enter a valid date of birth." };
  }

  return { valid: true };
};

export const formatDobDisplay = (s: string): string => {
  if (!s) return "";
  const date = new Date(s);
  if (isNaN(date.getTime())) return s;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
};

export const getAge = (dob: string): string => {
  const birth = new Date(dob);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - birth.getTime()) / 86400000);

  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;

  const diffMonths = Math.floor(diffDays / 30.44);
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""}`;

  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  return `${years} yr${years !== 1 ? "s" : ""}`;
};
