alter table daily_settings
add column if not exists taper_start_day date,
add column if not exists taper_end_day date,
add column if not exists taper_start_cap numeric,
add column if not exists taper_end_cap numeric;
