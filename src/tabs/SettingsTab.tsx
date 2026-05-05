import { useState } from 'react';
import { exportJson } from '../lib/storage';
import type { AppUser, CalmQuestData } from '../types';

interface SettingsTabProps {
  user: AppUser;
  data: CalmQuestData;
  supabaseReady: boolean;
  onSettings: (patch: { caffeine_cap?: number; cost_per_shot?: number | null }) => void;
  onImport: (json: string) => void;
  onReset: () => void;
  onSignIn: (email: string) => void;
  onSignOut: () => void;
}

export function SettingsTab({ user, data, supabaseReady, onSettings, onImport, onReset, onSignIn, onSignOut }: SettingsTabProps) {
  const [email, setEmail] = useState('');
  const [importText, setImportText] = useState('');

  function downloadExport() {
    const blob = new Blob([exportJson(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'calm-quest-export.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="screen">
      <div className="screen-heading">
        <p>Preferences</p>
        <h1>Settings</h1>
      </div>

      <div className="form-card">
        <h2>Daily plan</h2>
        <label>Daily caffeine cap<input type="number" min="0.5" step="0.5" value={data.settings.caffeine_cap} onChange={(event) => onSettings({ caffeine_cap: Number(event.target.value) })} /></label>
        <label>Preferred unit<input value="shots" disabled /></label>
        <label>Cost per shot<input type="number" min="0" step="0.01" value={data.settings.cost_per_shot ?? ''} onChange={(event) => onSettings({ cost_per_shot: event.target.value ? Number(event.target.value) : null })} placeholder="Optional" /></label>
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

      <div className="form-card">
        <h2>Data</h2>
        <button type="button" onClick={downloadExport}>Export data</button>
        <label>Import JSON<textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="Paste export JSON" /></label>
        <button type="button" disabled={!importText.trim()} onClick={() => onImport(importText)}>Import data</button>
        <button className="secondary" type="button" onClick={onReset}>Reset demo data</button>
      </div>
    </section>
  );
}
