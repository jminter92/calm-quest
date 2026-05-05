import { MetricCard } from '../components/MetricCard';
import { ProgressBars } from '../components/ProgressBars';
import { activeDayKeys, averageShots, capForDay, commonTriggers, countOutcomes, milestoneStatus, shotsByDay, streakUnderCap, totalXp } from '../lib/progress';
import { recentDayKeys } from '../lib/dates';
import { titleForXp } from '../lib/xp';
import type { CalmQuestData } from '../types';

interface ProgressTabProps {
  data: CalmQuestData;
}

export function ProgressTab({ data }: ProgressTabProps) {
  const cap = capForDay(data.settings);
  const xp = totalXp(data.xpEvents);
  const title = titleForXp(xp);
  const activeDays = activeDayKeys(data.caffeineLogs, data.triggerLogs, data.checkins, data.xpEvents);
  const sevenDays = shotsByDay(data.caffeineLogs, recentDayKeys(7));
  const thirtyDays = shotsByDay(data.caffeineLogs, recentDayKeys(30));
  const outcomes = countOutcomes(data.triggerLogs);
  const triggers = commonTriggers(data.triggerLogs);

  return (
    <section className="screen">
      <div className="screen-heading centered-heading">
        <h1>Progress</h1>
      </div>

      <div className="metric-grid">
        <MetricCard label="Week avg" value={averageShots(data.caffeineLogs, 7)} detail="shots/day" />
        <MetricCard label="Month avg" value={averageShots(data.caffeineLogs, 30)} detail="shots/day" />
        <MetricCard label="Streak" value={streakUnderCap(data.caffeineLogs, cap, activeDays)} detail="days under cap" />
        <MetricCard label="XP" value={xp} detail={title} />
      </div>

      <div className="section">
        <h2>Last 7 days</h2>
        <ProgressBars days={sevenDays} cap={cap} />
      </div>

      <div className="section">
        <h2>Last 30 days</h2>
        <ProgressBars days={thirtyDays} cap={cap} compact />
      </div>

      <div className="metric-grid">
        <MetricCard label="Resisted" value={outcomes.resisted} detail="wins logged" />
        <MetricCard label="Setbacks" value={outcomes.setbacks} detail="logged calmly" />
      </div>

      <div className="section">
        <h2>Common triggers</h2>
        {triggers.length === 0 ? (
          <p className="empty">Triggers will appear here as you log them.</p>
        ) : (
          <ul className="plain-list">
            {triggers.map((trigger) => (
              <li key={trigger.label}>
                <span>{trigger.label}</span>
                <strong>{trigger.count}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="section">
        <h2>Milestones</h2>
        <ul className="milestone-list">
          {milestoneStatus(data.caffeineLogs, cap, activeDays).map((milestone) => (
            <li className={milestone.done ? 'done' : ''} key={milestone.label}>
              <span>{milestone.done ? 'Done' : 'Open'}</span>
              {milestone.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
