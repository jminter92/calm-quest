import { useState } from 'react';
import { toDayKey } from '../lib/dates';
import { capForDay } from '../lib/progress';
import type { AppUser, CalmQuestData } from '../types';

interface SettingsTabProps {
  user: AppUser;
  data: CalmQuestData;
  supabaseReady: boolean;
  onSettings: (patch: {
    caffeine_cap?: number;
    cost_per_shot?: number | null;
    taper_start_day?: string | null;
    taper_end_day?: string | null;
    taper_start_cap?: number | null;
    taper_end_cap?: number | null;
  }) => void;
  onSignIn: (email: string) => void;
  onSignOut: () => void;
}

export function SettingsTab({ user, data, supabaseReady, onSettings, onSignIn, onSignOut }: SettingsTabProps) {
  const [email, setEmail] = useState('');
  const currentCap = capForDay(data.settings);

  return (
    <section className="screen">
      <div className="screen-heading centered-heading">
        <h1>Settings</h1>
      </div>

      <div className="form-card">
        <h2>Daily plan</h2>
        <label>Daily caffeine cap<input type="number" min="0.5" step="0.5" value={data.settings.caffeine_cap} onChange={(event) => onSettings({ caffeine_cap: Number(event.target.value) })} /></label>
        <label>Preferred unit<input value="shots" disabled /></label>
        <label>Cost per shot<input type="number" min="0" step="0.01" value={data.settings.cost_per_shot ?? ''} onChange={(event) => onSettings({ cost_per_shot: event.target.value ? Number(event.target.value) : null })} placeholder="Optional" /></label>
      </div>

      <div className="form-card">
        <h2>Taper plan</h2>
        <p className="empty">Today’s calculated cap is {currentCap} shots.</p>
        <label>Start date<input type="date" value={data.settings.taper_start_day ?? toDayKey()} onChange={(event) => onSettings({ taper_start_day: event.target.value || null })} /></label>
        <label>Start cap<input type="number" min="0.5" step="0.5" value={data.settings.taper_start_cap ?? data.settings.caffeine_cap} onChange={(event) => onSettings({ taper_start_cap: event.target.value ? Number(event.target.value) : null })} /></label>
        <label>Target date<input type="date" value={data.settings.taper_end_day ?? ''} onChange={(event) => onSettings({ taper_end_day: event.target.value || null })} /></label>
        <label>Target cap<input type="number" min="0" step="0.5" value={data.settings.taper_end_cap ?? ''} onChange={(event) => onSettings({ taper_end_cap: event.target.value ? Number(event.target.value) : null })} placeholder="Example: 1" /></label>
        <button className="secondary" type="button" onClick={() => onSettings({ taper_start_day: null, taper_end_day: null, taper_start_cap: null, taper_end_cap: null })}>Clear taper</button>
      </div>

      <div className="form-card">
        <h2>Account</h2>
        {user.mode === 'supabase' ? (
          <>
            <p className="empty">Signed in{user.email ? ` as ${user.email}` : ''}. Your data is stored in Supabase.</p>
            <button type="button" onClick={onSignOut}>Sign out</button>
          </>
        ) : (
          <>
            <p className="empty">{supabaseReady ? 'Use magic link sign-in for cloud-backed data.' : 'Supabase is not configured yet. Demo mode saves on this device.'}</p>
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            <button type="button" disabled={!supabaseReady || !email} onClick={() => onSignIn(email)}>Send magic link</button>
          </>
        )}
      </div>
    </section>
  );
}
