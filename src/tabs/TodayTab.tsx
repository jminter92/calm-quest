import { MetricCard } from '../components/MetricCard';
import { prettyDate, toDayKey } from '../lib/dates';
import { shotsForDay, streakUnderCap, totalXp } from '../lib/progress';
import { titleForXp, xpAmounts } from '../lib/xp';
import type { AppUser, CalmQuestData } from '../types';

interface TodayTabProps {
  user: AppUser;
  data: CalmQuestData;
  onQuickCaffeine: () => void;
  onQuickTrigger: () => void;
  onQuickWin: () => void;
  onQuickSetback: () => void;
  onCheckin: (field: 'mood' | 'energy' | 'sleep_quality', value: number) => void;
  onAwardDailyCap: () => void;
}

export function TodayTab({
  data,
  onQuickCaffeine,
  onQuickTrigger,
  onQuickWin,
  onQuickSetback,
  onCheckin,
  onAwardDailyCap
}: TodayTabProps) {
  const today = toDayKey();
  const cap = Number(data.settings.caffeine_cap);
  const used = shotsForDay(data.caffeineLogs, today);
  const remaining = Math.max(0, cap - used);
  const percent = Math.min(100, (used / cap) * 100);
  const streak = streakUnderCap(data.caffeineLogs, cap);
  const xp = totalXp(data.xpEvents);
  const title = titleForXp(xp);
  const checkin = data.checkins.find((item) => item.day === today);
  const hasCapXp = data.xpEvents.some((event) => event.related_date === today && event.event_type === 'stayed_under_cap');
  const recentLogs = [
    ...data.caffeineLogs.filter((log) => toDayKey(new Date(log.logged_at)) === today).map((log) => ({
      id: log.id,
      text: `${log.shots} shot ${log.drink_type}`
    })),
    ...data.triggerLogs.filter((log) => toDayKey(new Date(log.logged_at)) === today).map((log) => ({
      id: log.id,
      text: `${log.trigger_label}: ${log.outcome.replace('_', ' ')}`
    }))
  ].slice(0, 5);

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

      <div className="quick-grid">
        <button type="button" onClick={onQuickCaffeine}>Add caffeine</button>
        <button type="button" onClick={onQuickTrigger}>Add trigger</button>
        <button type="button" onClick={onQuickWin}>Log win</button>
        <button type="button" onClick={onQuickSetback}>Log setback</button>
      </div>

      {!hasCapXp && used <= cap ? (
        <button className="full-button" type="button" onClick={onAwardDailyCap}>
          Stayed under plan +{xpAmounts.stayed_under_cap} XP
        </button>
      ) : null}

      <div className="section">
        <h2>Check in</h2>
        <div className="rating-grid">
          <Rating label="Mood" value={checkin?.mood ?? null} onChange={(value) => onCheckin('mood', value)} />
          <Rating label="Energy" value={checkin?.energy ?? null} onChange={(value) => onCheckin('energy', value)} />
          <Rating label="Sleep" value={checkin?.sleep_quality ?? null} onChange={(value) => onCheckin('sleep_quality', value)} />
        </div>
      </div>

      <div className="section">
        <h2>Recent today</h2>
        {recentLogs.length === 0 ? (
          <p className="empty">Nothing logged yet. Start with one quick tap.</p>
        ) : (
          <ul className="plain-list">
            {recentLogs.map((log) => <li key={log.id}>{log.text}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}

function Rating({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number) => void }) {
  return (
    <div className="rating">
      <span>{label}</span>
      <div>
        {[1, 2, 3, 4, 5].map((item) => (
          <button className={value === item ? 'selected' : ''} key={item} type="button" onClick={() => onChange(item)}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
