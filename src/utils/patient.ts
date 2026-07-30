export const getMaxDob = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
};

export const formatDobDisplay = (d: string): string => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
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
