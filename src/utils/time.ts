export function getStartOfWeek(date: Date = new Date()): Date {
  const startOfWeek = new Date(date);
  const dayOfWeek = date.getDay();
  const distanceToMonday = (dayOfWeek + 6) % 7;

  startOfWeek.setDate(date.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0); // Set time to 00:00

  return startOfWeek;
}
