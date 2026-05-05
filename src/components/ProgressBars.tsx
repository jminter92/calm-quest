import { formatShortDay } from '../lib/dates';

interface ProgressBarsProps {
  days: Array<{ day: string; shots: number }>;
  cap: number;
  compact?: boolean;
}

export function ProgressBars({ days, cap, compact = false }: ProgressBarsProps) {
  const max = Math.max(cap, ...days.map((day) => day.shots), 1);

  return (
    <div className={compact ? 'bars compact-bars' : 'bars'}>
      {days.map((day) => {
        const height = Math.max(8, (day.shots / max) * 100);
        return (
          <div className="bar-item" key={day.day}>
            <div className="bar-track" aria-label={`${day.day}: ${day.shots} shots`}>
              <div className={day.shots > cap ? 'bar-fill over' : 'bar-fill'} style={{ height: `${height}%` }} />
            </div>
            {!compact ? <small>{formatShortDay(day.day)}</small> : null}
          </div>
        );
      })}
    </div>
  );
}
