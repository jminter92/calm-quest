export function toDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function prettyDate(date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function timeValue(date = new Date()): string {
  return `${date.getHours()}`.padStart(2, '0') + ':' + `${date.getMinutes()}`.padStart(2, '0');
}

export function dateWithTime(day: string, time: string): string {
  return new Date(`${day}T${time}:00`).toISOString();
}

export function recentDayKeys(count: number, end = new Date()): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (count - index - 1));
    return toDayKey(date);
  });
}

export function formatShortDay(day: string): string {
  const date = new Date(`${day}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);
}
