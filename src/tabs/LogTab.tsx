import { useState, type FormEvent } from 'react';
import { dateWithTime, timeValue, toDayKey } from '../lib/dates';
import type { DrinkType, TriggerLabel, TriggerOutcome } from '../types';

const drinkTypes: DrinkType[] = ['coffee', 'tea', 'energy drink', 'cola', 'decaf', 'other'];
const triggers: TriggerLabel[] = [
  'poor sleep',
  'stressful work',
  'boredom',
  'social cafe',
  'afternoon slump',
  'early morning fog',
  'long drive',
  'low mood',
  'autopilot',
  'other'
];

interface LogTabProps {
  onCaffeine: (input: { logged_at: string; shots: number; drink_type: DrinkType; note: string | null; trigger_label: TriggerLabel | null }) => void;
  onTrigger: (input: { logged_at: string; trigger_label: TriggerLabel; craving_intensity: number; outcome: TriggerOutcome; note: string | null }) => void;
  onQuickWin: () => void;
  onQuickDecaf: () => void;
  onQuickUnderPlan: () => void;
  onQuickSetback: () => void;
}

export function LogTab({ onCaffeine, onTrigger, onQuickWin, onQuickDecaf, onQuickUnderPlan, onQuickSetback }: LogTabProps) {
  const [caffeineTime, setCaffeineTime] = useState(timeValue());
  const [shots, setShots] = useState(1);
  const [drinkType, setDrinkType] = useState<DrinkType>('coffee');
  const [caffeineNote, setCaffeineNote] = useState('');
  const [linkedTrigger, setLinkedTrigger] = useState<TriggerLabel | ''>('');
  const [triggerTime, setTriggerTime] = useState(timeValue());
  const [triggerLabel, setTriggerLabel] = useState<TriggerLabel>('stressful work');
  const [intensity, setIntensity] = useState(3);
  const [outcome, setOutcome] = useState<TriggerOutcome>('resisted');
  const [triggerNote, setTriggerNote] = useState('');

  function submitCaffeine(event: FormEvent) {
    event.preventDefault();
    onCaffeine({
      logged_at: dateWithTime(toDayKey(), caffeineTime),
      shots,
      drink_type: drinkType,
      note: caffeineNote.trim() || null,
      trigger_label: linkedTrigger || null
    });
    setCaffeineNote('');
  }

  function submitTrigger(event: FormEvent) {
    event.preventDefault();
    onTrigger({
      logged_at: dateWithTime(toDayKey(), triggerTime),
      trigger_label: triggerLabel,
      craving_intensity: intensity,
      outcome,
      note: triggerNote.trim() || null
    });
    setTriggerNote('');
  }

  return (
    <section className="screen">
      <div className="screen-heading">
        <p>Fast logging</p>
        <h1>Log</h1>
      </div>

      <form className="form-card" onSubmit={submitCaffeine}>
        <h2>Log caffeine</h2>
        <label>Time<input type="time" value={caffeineTime} onChange={(event) => setCaffeineTime(event.target.value)} /></label>
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

      <form className="form-card" onSubmit={submitTrigger}>
        <h2>Log trigger</h2>
        <label>Time<input type="time" value={triggerTime} onChange={(event) => setTriggerTime(event.target.value)} /></label>
        <label>Trigger<select value={triggerLabel} onChange={(event) => setTriggerLabel(event.target.value as TriggerLabel)}>
          {triggers.map((trigger) => <option key={trigger}>{trigger}</option>)}
        </select></label>
        <label>Intensity<select value={intensity} onChange={(event) => setIntensity(Number(event.target.value))}>
          {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
        </select></label>
        <label>Outcome<select value={outcome} onChange={(event) => setOutcome(event.target.value as TriggerOutcome)}>
          <option value="resisted">resisted</option>
          <option value="partial_win">partial win</option>
          <option value="had_caffeine">had caffeine</option>
        </select></label>
        <label>Note<textarea value={triggerNote} onChange={(event) => setTriggerNote(event.target.value)} placeholder="Optional" /></label>
        <button type="submit">Save trigger</button>
      </form>

      <div className="section">
        <h2>One tap</h2>
        <div className="quick-grid">
          <button type="button" onClick={onQuickWin}>Resisted craving</button>
          <button type="button" onClick={onQuickDecaf}>Chose decaf</button>
          <button type="button" onClick={onQuickUnderPlan}>Stayed under plan</button>
          <button type="button" onClick={onQuickSetback}>Went over plan</button>
        </div>
      </div>
    </section>
  );
}
