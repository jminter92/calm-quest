create unique index if not exists xp_events_decaf_bonus_once
on xp_events (user_id, event_type, related_date)
where event_type in ('decaf_at_cafe', 'decaf_when_tired', 'decaf_with_people');
