import type { TriggerOutcome, XpEventType } from '../types';

export const titleThresholds = [
  { title: 'Quiet Force', xp: 300 },
  { title: 'Natural Energy', xp: 150 },
  { title: 'Calm Builder', xp: 75 },
  { title: 'Steady Operator', xp: 25 },
  { title: 'Overstimulated Worker', xp: 0 }
] as const;

export const xpAmounts: Record<XpEventType, number> = {
  log_caffeine: 1,
  log_trigger: 1,
  resisted_craving: 5,
  partial_win: 3,
  stayed_under_cap: 5,
  three_day_streak: 10,
  seven_day_streak: 20,
  setback: 0
};

export function titleForXp(xp: number): string {
  return titleThresholds.find((item) => xp >= item.xp)?.title ?? 'Overstimulated Worker';
}

export function xpForTriggerOutcome(outcome: TriggerOutcome): Array<{ type: XpEventType; amount: number }> {
  if (outcome === 'resisted') {
    return [{ type: 'resisted_craving', amount: xpAmounts.resisted_craving }];
  }

  if (outcome === 'partial_win') {
    return [{ type: 'partial_win', amount: xpAmounts.partial_win }];
  }

  return [{ type: 'setback', amount: xpAmounts.setback }];
}
