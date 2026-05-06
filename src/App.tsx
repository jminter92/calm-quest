import { type ReactElement, useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { addCaffeineLog, addXpEvents, demoUser, loadData, saveCheckin, saveSettings } from './lib/storage';
import { hasSupabaseConfig, supabase } from './lib/supabase';
import { toDayKey } from './lib/dates';
import { dailyTargetXp, xpAmounts } from './lib/xp';
import { LogTab } from './tabs/LogTab';
import { ProgressTab } from './tabs/ProgressTab';
import { QuestTab } from './tabs/QuestTab';
import { SettingsTab } from './tabs/SettingsTab';
import { TodayTab } from './tabs/TodayTab';
import type { AppUser, CalmQuestData, DrinkType, TabKey, TriggerLabel, XpEventType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [user, setUser] = useState<AppUser>(demoUser());
  const [data, setData] = useState<CalmQuestData | null>(null);
  const [message, setMessage] = useState('Loading Calm Quest...');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      if (supabase) {
        const session = await supabase.auth.getSession();
        const sessionUser = session.data.session?.user;
        if (sessionUser && mounted) {
          setUser({ id: sessionUser.id, email: sessionUser.email ?? undefined, mode: 'supabase' });
          return;
        }
      }

      if (mounted) setUser(demoUser());
    }

    boot();
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? undefined, mode: 'supabase' });
      } else {
        setUser(demoUser());
      }
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setMessage('Loading your tracker...');
    loadData(user)
      .then((nextData) => {
        if (!mounted) return;
        setData(nextData);
        setMessage(user.mode === 'demo' ? 'Demo mode' : 'Synced');
      })
      .catch((error: Error) => setMessage(error.message));

    return () => {
      mounted = false;
    };
  }, [user]);

  async function run(action: () => Promise<CalmQuestData>, success: string) {
    setBusy(true);
    try {
      const nextData = await action();
      setData(nextData);
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return <main className="app-shell"><p className="status">{message}</p></main>;
  }

  function requireData() {
    if (!data) throw new Error('Data is still loading.');
    return data;
  }

  function logCaffeine(input: { logged_at: string; shots: number; drink_type: DrinkType; note: string | null; trigger_label: TriggerLabel | null }) {
    run(() => addCaffeineLog(user, requireData(), input), 'Caffeine logged. Honest data counts.');
  }

  function recordDailyXp(eventType: XpEventType, amount: number) {
    const today = toDayKey();
    const current = requireData();
    const alreadyAwarded = current.xpEvents.some((event) =>
      event.related_date === today && (event.event_type === 'stayed_under_cap' || event.event_type === 'over_target_penalty')
    );
    if (alreadyAwarded) {
      setMessage('Already recorded daily XP for today.');
      return;
    }

    run(() => addXpEvents(user, current, [{ type: eventType, amount, day: today }]), amount >= 0 ? 'Daily XP added.' : 'Daily XP penalty recorded.');
  }

  function recordBonusXp(eventType: XpEventType, amount: number) {
    const today = toDayKey();
    const current = requireData();
    const alreadyAwarded = current.xpEvents.some((event) => event.related_date === today && event.event_type === eventType);
    if (alreadyAwarded) {
      setMessage('Already claimed that bonus today.');
      return;
    }

    run(() => addXpEvents(user, current, [{ type: eventType, amount, day: today }]), 'Bonus XP added.');
  }

  const screen = {
    today: (
      <TodayTab
        data={data}
        onRecordDailyXp={recordDailyXp}
        onSetTodayCap={(cap) => run(() => saveCheckin(user, requireData(), { day: toDayKey(), caffeine_cap_override: cap }), 'Today’s target updated.')}
      />
    ),
    log: (
      <LogTab
        data={data}
        onCaffeine={logCaffeine}
        onBonusXp={recordBonusXp}
      />
    ),
    progress: <ProgressTab data={data} />,
    quest: <QuestTab data={data} />,
    settings: (
      <SettingsTab
        user={user}
        data={data}
        supabaseReady={hasSupabaseConfig}
        onSettings={(patch) => run(() => saveSettings(user, requireData(), patch), 'Settings saved.')}
        onSignIn={(email) =>
          run(async () => {
            if (!supabase) throw new Error('Supabase is not configured.');
            const result = await supabase.auth.signInWithOtp({
              email,
              options: { emailRedirectTo: window.location.origin }
            });
            if (result.error) throw result.error;
            return requireData();
          }, 'Magic link sent. Check your email.')
        }
        onSignOut={() =>
          run(async () => {
            await supabase?.auth.signOut();
            return loadData(demoUser());
          }, 'Signed out. Demo mode is ready.')
        }
      />
    )
  } satisfies Record<TabKey, ReactElement>;

  return (
    <main className="app-shell">
      {busy ? <div className="status-row"><span>Saving...</span></div> : null}
      {screen[activeTab]}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </main>
  );
}
