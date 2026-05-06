import type {
  AppUser,
  CaffeineLog,
  CalmQuestData,
  DailyCheckin,
  DailySettings,
  TriggerLog,
  XpEvent,
  XpEventType
} from '../types';
import { toDayKey } from './dates';
import { supabase } from './supabase';

const demoUserId = 'demo-user';
const localKey = 'calm-quest-demo-data';

function nowIso() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

export function defaultData(userId = demoUserId): CalmQuestData {
  const now = nowIso();

  return {
    settings: {
      id: id(),
      user_id: userId,
      caffeine_cap: 3,
      cost_per_shot: null,
      taper_start_day: null,
      taper_end_day: null,
      taper_start_cap: null,
      taper_end_cap: null,
      created_at: now,
      updated_at: now
    },
    caffeineLogs: [],
    triggerLogs: [],
    checkins: [],
    xpEvents: []
  };
}

export function demoUser(): AppUser {
  return { id: demoUserId, mode: 'demo' };
}

function readLocal(): CalmQuestData {
  const raw = localStorage.getItem(localKey);
  if (!raw) return defaultData();
  return JSON.parse(raw) as CalmQuestData;
}

function writeLocal(data: CalmQuestData) {
  localStorage.setItem(localKey, JSON.stringify(data));
}

export async function loadData(user: AppUser): Promise<CalmQuestData> {
  if (user.mode === 'demo' || !supabase) return readLocal();

  const [settings, caffeineLogs, triggerLogs, checkins, xpEvents] = await Promise.all([
    supabase.from('daily_settings').select('*').eq('user_id', user.id).order('created_at').limit(1).maybeSingle(),
    supabase.from('caffeine_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }),
    supabase.from('trigger_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }),
    supabase.from('daily_checkins').select('*').eq('user_id', user.id).order('day', { ascending: false }),
    supabase.from('xp_events').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  ]);

  if (settings.error) throw settings.error;
  if (caffeineLogs.error) throw caffeineLogs.error;
  if (triggerLogs.error) throw triggerLogs.error;
  if (checkins.error) throw checkins.error;
  if (xpEvents.error) throw xpEvents.error;

  let activeSettings = settings.data as DailySettings | null;
  if (!activeSettings) {
    const created = defaultData(user.id).settings;
    const result = await supabase.from('daily_settings').insert(created).select('*').single();
    if (result.error) throw result.error;
    activeSettings = result.data as DailySettings;
  }

  return {
    settings: activeSettings,
    caffeineLogs: (caffeineLogs.data ?? []) as CaffeineLog[],
    triggerLogs: (triggerLogs.data ?? []) as TriggerLog[],
    checkins: (checkins.data ?? []) as DailyCheckin[],
    xpEvents: (xpEvents.data ?? []) as XpEvent[]
  };
}

export async function saveSettings(user: AppUser, current: CalmQuestData, patch: Partial<DailySettings>) {
  const settings = { ...current.settings, ...patch, updated_at: nowIso() };

  if (user.mode === 'demo' || !supabase) {
    const data = { ...current, settings };
    writeLocal(data);
    return data;
  }

  const result = await supabase.from('daily_settings').upsert(settings).select('*').single();
  if (result.error) throw result.error;
  return { ...current, settings: result.data as DailySettings };
}

export async function saveCheckin(user: AppUser, current: CalmQuestData, patch: Partial<DailyCheckin>) {
  const day = patch.day ?? toDayKey();
  const existing = current.checkins.find((checkin) => checkin.day === day);
  const checkin: DailyCheckin = {
    id: existing?.id ?? id(),
    user_id: user.id,
    day,
    caffeine_cap_override: Object.prototype.hasOwnProperty.call(patch, 'caffeine_cap_override')
      ? patch.caffeine_cap_override ?? null
      : existing?.caffeine_cap_override ?? null,
    mood: patch.mood ?? existing?.mood ?? null,
    energy: patch.energy ?? existing?.energy ?? null,
    sleep_quality: patch.sleep_quality ?? existing?.sleep_quality ?? null,
    created_at: existing?.created_at ?? nowIso(),
    updated_at: nowIso()
  };

  if (user.mode === 'demo' || !supabase) {
    const checkins = [checkin, ...current.checkins.filter((item) => item.id !== checkin.id)];
    const data = { ...current, checkins };
    writeLocal(data);
    return data;
  }

  const result = await supabase.from('daily_checkins').upsert(checkin, { onConflict: 'user_id,day' }).select('*').single();
  if (result.error) throw result.error;
  return { ...current, checkins: [result.data as DailyCheckin, ...current.checkins.filter((item) => item.id !== checkin.id)] };
}

function xpEvent(userId: string, type: XpEventType, amount: number, relatedDate: string | null): XpEvent {
  return {
    id: id(),
    user_id: userId,
    event_type: type,
    xp_amount: amount,
    related_date: relatedDate,
    created_at: nowIso()
  };
}

async function persistXpEvents(user: AppUser, events: XpEvent[]) {
  if (events.length === 0) return [];
  if (user.mode === 'demo' || !supabase) return events;

  const result = await supabase.from('xp_events').insert(events).select('*');
  if (result.error) throw result.error;
  return (result.data ?? []) as XpEvent[];
}

export async function addCaffeineLog(
  user: AppUser,
  current: CalmQuestData,
  input: Pick<CaffeineLog, 'logged_at' | 'shots' | 'drink_type' | 'note' | 'trigger_label'>
) {
  const log: CaffeineLog = {
    id: id(),
    user_id: user.id,
    created_at: nowIso(),
    ...input
  };
  const xp = xpEvent(user.id, 'log_caffeine', 1, toDayKey(new Date(log.logged_at)));

  if (user.mode === 'demo' || !supabase) {
    const data = { ...current, caffeineLogs: [log, ...current.caffeineLogs], xpEvents: [xp, ...current.xpEvents] };
    writeLocal(data);
    return data;
  }

  const result = await supabase.from('caffeine_logs').insert(log).select('*').single();
  if (result.error) throw result.error;
  const insertedXp = await persistXpEvents(user, [xp]);
  return {
    ...current,
    caffeineLogs: [result.data as CaffeineLog, ...current.caffeineLogs],
    xpEvents: [...insertedXp, ...current.xpEvents]
  };
}

export async function addTriggerLog(
  user: AppUser,
  current: CalmQuestData,
  input: Pick<TriggerLog, 'logged_at' | 'trigger_label' | 'craving_intensity' | 'outcome' | 'note'>,
  extraXp: Array<{ type: XpEventType; amount: number }>
) {
  const log: TriggerLog = {
    id: id(),
    user_id: user.id,
    created_at: nowIso(),
    ...input
  };
  const day = toDayKey(new Date(log.logged_at));
  const xp = [xpEvent(user.id, 'log_trigger', 1, day), ...extraXp.map((event) => xpEvent(user.id, event.type, event.amount, day))];

  if (user.mode === 'demo' || !supabase) {
    const data = { ...current, triggerLogs: [log, ...current.triggerLogs], xpEvents: [...xp, ...current.xpEvents] };
    writeLocal(data);
    return data;
  }

  const result = await supabase.from('trigger_logs').insert(log).select('*').single();
  if (result.error) throw result.error;
  const insertedXp = await persistXpEvents(user, xp);
  return {
    ...current,
    triggerLogs: [result.data as TriggerLog, ...current.triggerLogs],
    xpEvents: [...insertedXp, ...current.xpEvents]
  };
}

export async function addXpEvents(user: AppUser, current: CalmQuestData, events: Array<{ type: XpEventType; amount: number; day?: string }>) {
  const xp = events.map((event) => xpEvent(user.id, event.type, event.amount, event.day ?? toDayKey()));

  if (user.mode === 'demo' || !supabase) {
    const data = { ...current, xpEvents: [...xp, ...current.xpEvents] };
    writeLocal(data);
    return data;
  }

  const insertedXp = await persistXpEvents(user, xp);
  return { ...current, xpEvents: [...insertedXp, ...current.xpEvents] };
}

export function exportJson(data: CalmQuestData) {
  return JSON.stringify(data, null, 2);
}

export function importJson(json: string): CalmQuestData {
  const data = JSON.parse(json) as CalmQuestData;
  writeLocal(data);
  return data;
}

export function resetLocalData() {
  const data = defaultData();
  writeLocal(data);
  return data;
}
