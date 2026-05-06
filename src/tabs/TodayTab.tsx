import { MetricCard } from '../components/MetricCard';
import { prettyDate, toDayKey } from '../lib/dates';
import { activeDayKeys, capForDay, shotsForDay, streakUnderCap, totalXp } from '../lib/progress';
import { dailyTargetXp, titleForXp, xpAmounts } from '../lib/xp';
import type { CalmQuestData, XpEventType } from '../types';

interface TodayTabProps {
  data: CalmQuestData;
  onRecordDailyXp: (eventType: XpEventType, amount: number) => void;
  onSetTodayCap: (cap: number | null) => void;
}

export function TodayTab({ data, onRecordDailyXp, onSetTodayCap }: TodayTabProps) {
  const today = toDayKey();
  const checkin = data.checkins.find((item) => item.day === today);
  const plannedCap = capForDay(data.settings, today);
  const cap = checkin?.caffeine_cap_override ?? plannedCap;
  const used = shotsForDay(data.caffeineLogs, today);
  const remaining = Math.max(0, cap - used);
  const percent = Math.min(100, (used / Math.max(cap, 0.5)) * 100);
  const activeDays = activeDayKeys(data.caffeineLogs, data.triggerLogs, data.checkins, data.xpEvents);
  const streak = streakUnderCap(data.caffeineLogs, cap, activeDays);
  const xp = totalXp(data.xpEvents);
  const title = titleForXp(xp);
  const hasDailyTargetXp = data.xpEvents.some((event) =>
    event.related_date === today && (event.event_type === 'stayed_under_cap' || event.event_type === 'over_target_penalty')
  );
  const isAtOrBelowTarget = used <= cap;
  const targetXp = dailyTargetXp(streak);

  return (
    <section className="screen">
      <div className="hero">
        <div>
          <p>{prettyDate()}</p>
          <h1>Calm Quest</h1>
        </div>
      </div>

      <div className="level-panel">
        <span>Current level</span>
        <strong>{title}</strong>
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

      <div className="cap-panel target-override-panel">
        <div>
          <h2>Today’s target</h2>
          <p className="empty">
            {checkin?.caffeine_cap_override == null ? `Using taper plan: ${plannedCap} shots.` : `Override set for today. Taper plan is ${plannedCap} shots.`}
          </p>
        </div>
        <div className="target-control">
          <button type="button" onClick={() => onSetTodayCap(Math.max(0, cap - 0.5))}>-0.5</button>
          <strong>{cap}</strong>
          <button type="button" onClick={() => onSetTodayCap(cap + 0.5)}>+0.5</button>
        </div>
        {checkin?.caffeine_cap_override != null ? (
          <button className="secondary" type="button" onClick={() => onSetTodayCap(null)}>Use taper plan</button>
        ) : null}
      </div>

      <div className="metric-grid">
        <MetricCard label="Daily cap" value={cap} detail="shots" />
        <MetricCard label="Streak" value={streak} detail="days under cap" />
        <MetricCard label="XP" value={xp} detail="total earned" />
      </div>

      <div className="cap-panel daily-xp-panel">
        <div>
          <h2>Today’s XP</h2>
          <p className="empty">
            {isAtOrBelowTarget
              ? `Stay at or below target: +${targetXp} XP. Streak bonus grows up to +7 XP/day.`
              : `Over target today: ${xpAmounts.over_target_penalty} XP.`}
          </p>
        </div>
        {hasDailyTargetXp ? (
          <strong className="xp-status">Recorded today</strong>
        ) : isAtOrBelowTarget ? (
          <button type="button" onClick={() => onRecordDailyXp('stayed_under_cap', targetXp)}>Claim +{targetXp} XP</button>
        ) : (
          <button className="penalty-button" type="button" onClick={() => onRecordDailyXp('over_target_penalty', xpAmounts.over_target_penalty)}>Record {xpAmounts.over_target_penalty} XP</button>
        )}
      </div>
    </section>
  );
}
