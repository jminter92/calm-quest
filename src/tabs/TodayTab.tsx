import { MetricCard } from '../components/MetricCard';
import { prettyDate, toDayKey } from '../lib/dates';
import { activeDayKeys, capForDay, shotsForDay, streakUnderCap, totalXp } from '../lib/progress';
import { titleForXp, xpAmounts } from '../lib/xp';
import type { CalmQuestData } from '../types';

interface TodayTabProps {
  data: CalmQuestData;
  onAwardDailyCap: () => void;
}

export function TodayTab({ data, onAwardDailyCap }: TodayTabProps) {
  const today = toDayKey();
  const cap = capForDay(data.settings, today);
  const used = shotsForDay(data.caffeineLogs, today);
  const remaining = Math.max(0, cap - used);
  const percent = Math.min(100, (used / Math.max(cap, 0.5)) * 100);
  const activeDays = activeDayKeys(data.caffeineLogs, data.triggerLogs, data.checkins, data.xpEvents);
  const streak = streakUnderCap(data.caffeineLogs, cap, activeDays);
  const xp = totalXp(data.xpEvents);
  const title = titleForXp(xp);
  const hasDailyTargetXp = data.xpEvents.some((event) => event.related_date === today && event.event_type === 'stayed_under_cap');
  const isAtOrBelowTarget = used <= cap;

  return (
    <section className="screen">
      <div className="hero">
        <div>
          <p>{prettyDate()}</p>
          <h1>Calm Quest</h1>
        </div>
        <div className="title-pill">{title}</div>
      </div>

      <div className="cap-panel">
        <div className="cap-row">
          <span>Today</span>
          <strong>
            {used} / {cap} shots
          </strong>
        </div>
        <div className="progress-track">
          <div className={used > cap ? 'progress-fill over' : 'progress-fill'} style={{ width: `${percent}%` }} />
        </div>
        <div className="cap-row subtle">
          <span>{remaining} remaining</span>
          <span>{used > cap ? 'Over plan, no drama. Log it and continue.' : 'Within today’s plan.'}</span>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Daily cap" value={cap} detail="shots" />
        <MetricCard label="Streak" value={streak} detail="days under cap" />
        <MetricCard label="XP" value={xp} detail="total earned" />
      </div>

      <div className="cap-panel daily-xp-panel">
        <div>
          <h2>Today’s XP</h2>
          <p className="empty">Stay at or below target: +{xpAmounts.stayed_under_cap} XP</p>
        </div>
        {hasDailyTargetXp ? (
          <strong className="xp-status">Claimed today</strong>
        ) : isAtOrBelowTarget ? (
          <button type="button" onClick={onAwardDailyCap}>Claim +{xpAmounts.stayed_under_cap} XP</button>
        ) : (
          <strong className="xp-status over">Not available today</strong>
        )}
      </div>
    </section>
  );
}
