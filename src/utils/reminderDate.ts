// Shared refill-reminder date formatting. Hermes lacks full Intl, so format
// manually. Two presentations: the profile badge (short, uppercase) and the
// comparison card (full date + time).
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "21 Jul 2026, 10:30 AM"
export const formatReminderDateTime = (d: Date): string => {
  const mins = String(d.getMinutes()).padStart(2, "0");
  const hour12 = d.getHours() % 12 || 12;
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hour12}:${mins} ${ampm}`;
};

// "21 JUL"
export const formatReminderDateShort = (d: Date): string =>
  `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()].toUpperCase()}`;
