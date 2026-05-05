import { useState, type FormEvent } from 'react';
import { dateWithTime, timeValue, toDayKey } from '../lib/dates';
import type { DrinkType, TriggerLabel } from '../types';

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
  onCaffeine: (input: { logged_at: string; shots: number; drink_type: DrinkType; note: string | null; trigger_label: TriggerLabel | null }) => void;
}

export function LogTab({ onCaffeine }: LogTabProps) {
  const [caffeineDay, setCaffeineDay] = useState(toDayKey());
  const [caffeineTime, setCaffeineTime] = useState(timeValue());
  const [shots, setShots] = useState(1);
  const [drinkType, setDrinkType] = useState<DrinkType>('coffee');
  const [caffeineNote, setCaffeineNote] = useState('');
  const [linkedTrigger, setLinkedTrigger] = useState<TriggerLabel | ''>('');

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
      </form>

    </section>
  );
}
