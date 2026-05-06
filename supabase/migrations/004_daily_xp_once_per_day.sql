drop index if exists xp_events_daily_cap_once;

create unique index if not exists xp_events_daily_outcome_once
on xp_events (user_id, related_date)
where event_type in ('stayed_under_cap', 'over_target_penalty');
