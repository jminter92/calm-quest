import type { CaffeineLog, TriggerLog, XpEvent } from '../types';
import { recentDayKeys, toDayKey } from './dates';

export function totalXp(events: XpEvent[]): number {
  return events.reduce((sum, event) => sum + event.xp_amount, 0);
}

export function shotsForDay(logs: CaffeineLog[], day: string): number {
  return logs
    .filter((log) => toDayKey(new Date(log.logged_at)) === day)
    .reduce((sum, log) => sum + Number(log.shots), 0);
}

export function shotsByDay(logs: CaffeineLog[], days: string[]): Array<{ day: string; shots: number }> {
  return days.map((day) => ({ day, shots: shotsForDay(logs, day) }));
}

export function averageShots(logs: CaffeineLog[], dayCount: number): number {
  const days = recentDayKeys(dayCount);
  const total = days.reduce((sum, day) => sum + shotsForDay(logs, day), 0);
  return Number((total / dayCount).toFixed(1));
}

export function streakUnderCap(logs: CaffeineLog[], cap: number, end = new Date()): number {
  let streak = 0;

  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - offset);
    const day = toDayKey(date);

    if (shotsForDay(logs, day) <= cap) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

export function commonTriggers(logs: TriggerLog[], limit = 5): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  logs.forEach((log) => counts.set(log.trigger_label, (counts.get(log.trigger_label) ?? 0) + 1));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export function countOutcomes(logs: TriggerLog[]) {
  return {
    resisted: logs.filter((log) => log.outcome === 'resisted').length,
    setbacks: logs.filter((log) => log.outcome === 'had_caffeine').length
  };
}

export function milestoneStatus(logs: CaffeineLog[], cap: number) {
  const thirtyDays = recentDayKeys(30);
  const streak = streakUnderCap(logs, cap);
  const dayTotals = thirtyDays.map((day) => shotsForDay(logs, day));
  const sevenDayTotals = recentDayKeys(7).map((day) => shotsForDay(logs, day));
  const bestWeek = sevenDayTotals.reduce((sum, shots) => sum + shots, 0) <= cap * 7;

  return [
    { label: 'First 3 days under cap', done: streak >= 3 },
    { label: 'First 7 days under cap', done: streak >= 7 },
    { label: 'First day at 2 shots', done: dayTotals.some((shots) => shots > 0 && shots <= 2) },
    { label: 'First day at 1 shot', done: dayTotals.some((shots) => shots > 0 && shots <= 1) },
    { label: 'Best week so far', done: bestWeek }
  ];
}
