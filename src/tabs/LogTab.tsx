import { useState, type FormEvent } from 'react';
import { dateWithTime, timeValue, toDayKey } from '../lib/dates';
import { xpAmounts } from '../lib/xp';
import type { CalmQuestData, DrinkType, TriggerLabel, XpEventType } from '../types';

const drinkTypes: DrinkType[] = ['coffee', 'tea', 'energy drink', 'cola', 'decaf', 'other'];
const triggers: TriggerLabel[] = [
  'afternoon slump',
  'autopilot',
  'boredom',
  'early morning fog',
  'low mood',
  'poor sleep',
  'social cafe',
  'stressful work',
  'tired',
  'other'
];

const timeShortcuts = [
  { label: 'Now', value: timeValue() },
  { label: 'Morning', value: '08:00' },
  { label: 'Lunch', value: '12:30' },
  { label: 'Afternoon', value: '15:00' },
  { label: 'Evening', value: '19:00' }
];

interface LogTabProps {
  data: CalmQuestData;
  onCaffeine: (input: { logged_at: string; shots: number; drink_type: DrinkType; note: string | null; trigger_label: TriggerLabel | null }) => void;
  onBonusXp: (eventType: XpEventType, amount: number) => void;
}

const decafBonuses: Array<{ type: XpEventType; label: string }> = [
  { type: 'decaf_at_cafe', label: 'Decaf at cafe' },
  { type: 'decaf_when_tired', label: 'Decaf when tired' },
  { type: 'decaf_with_people', label: 'Decaf with family/friends' }
];

export function LogTab({ data, onCaffeine, onBonusXp }: LogTabProps) {
  const [caffeineDay, setCaffeineDay] = useState(toDayKey());
  const [caffeineTime, setCaffeineTime] = useState(timeValue());
  const [shots, setShots] = useState(1);
  const [drinkType, setDrinkType] = useState<DrinkType>('coffee');
  const [caffeineNote, setCaffeineNote] = useState('');
  const [linkedTrigger, setLinkedTrigger] = useState<TriggerLabel | ''>('');
  const [savedNotice, setSavedNotice] = useState('');
  const today = toDayKey();
  const recentLogs = data.caffeineLogs.slice(0, 5);

  function submitCaffeine(event: FormEvent) {
    event.preventDefault();
    onCaffeine({
      logged_at: dateWithTime(caffeineDay, caffeineTime),
      shots,
      drink_type: drinkType,
      note: caffeineNote.trim() || null,
      trigger_label: linkedTrigger || null
    });
    setCaffeineNote('');
    setSavedNotice(`Saved ${shots} shot${shots === 1 ? '' : 's'}.`);
    window.setTimeout(() => setSavedNotice(''), 2200);
  }

  return (
    <section className="screen">
      <div className="screen-heading centered-heading">
        <h1>Log</h1>
      </div>

      <form className="form-card" onSubmit={submitCaffeine}>
        <h2>Log caffeine</h2>
        <label>Date<input type="date" value={caffeineDay} onChange={(event) => setCaffeineDay(event.target.value)} /></label>
        <label>Time<input type="time" value={caffeineTime} onChange={(event) => setCaffeineTime(event.target.value)} /></label>
        <div className="chip-row" aria-label="Time shortcuts">
          {timeShortcuts.map((shortcut) => (
            <button
              className={caffeineTime === shortcut.value ? 'chip selected' : 'chip'}
              key={shortcut.label}
              type="button"
              onClick={() => setCaffeineTime(shortcut.value)}
            >
              {shortcut.label}
            </button>
          ))}
        </div>
        <label>Amount<select value={shots} onChange={(event) => setShots(Number(event.target.value))}>
          {[0.5, 1, 1.5, 2].map((amount) => <option key={amount} value={amount}>{amount} shots</option>)}
        </select></label>
        <label>Type<select value={drinkType} onChange={(event) => setDrinkType(event.target.value as DrinkType)}>
          {drinkTypes.map((type) => <option key={type}>{type}</option>)}
        </select></label>
        <label>Trigger link<select value={linkedTrigger} onChange={(event) => setLinkedTrigger(event.target.value as TriggerLabel | '')}>
          <option value="">None</option>
          {triggers.map((trigger) => <option key={trigger}>{trigger}</option>)}
        </select></label>
        <label>Note<textarea value={caffeineNote} onChange={(event) => setCaffeineNote(event.target.value)} placeholder="Optional" /></label>
        <button type="submit">Save caffeine</button>
        {savedNotice ? <p className="save-notice">{savedNotice} Recent entries will update below.</p> : null}
      </form>

      <div className="section">
        <h2>Decaf bonuses</h2>
        <div className="bonus-grid">
          {decafBonuses.map((bonus) => {
            const claimed = data.xpEvents.some((event) => event.related_date === today && event.event_type === bonus.type);

            return (
              <button
                className={claimed ? 'bonus-button claimed' : 'bonus-button'}
                disabled={claimed}
                key={bonus.type}
                type="button"
                onClick={() => onBonusXp(bonus.type, xpAmounts[bonus.type])}
              >
                {claimed ? 'Claimed' : `${bonus.label} +1 XP`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="section">
        <h2>Recent entries</h2>
        {recentLogs.length === 0 ? (
          <p className="empty">Your latest caffeine logs will appear here.</p>
        ) : (
          <ul className="recent-entry-list">
            {recentLogs.map((log) => (
              <li key={log.id}>
                <div>
                  <strong>{log.shots} shot {log.drink_type}</strong>
                  <span>{formatLogTime(log.logged_at)}</span>
                </div>
                {log.trigger_label ? <small>{log.trigger_label}</small> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function formatLogTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}
