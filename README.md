# Calm Quest

Calm Quest is a very small mobile-first React PWA for tracking caffeine reduction. It is a hosted web app that can be added to an Android home screen, not a native Android app.

## What It Does

- Tracks daily caffeine shots, triggers, outcomes, notes, and daily cap.
- Shows today’s shots vs cap, streak under cap, recent triggers, and 7/30 day progress.
- Awards simple XP for honest logging, resisting triggers, and staying under plan.
- Supports Android Add to Home Screen with a PWA manifest, service worker, and PNG icons.
- Uses Supabase Auth and database persistence when configured.
- Includes demo mode using local device storage when Supabase env vars are missing.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Add your Supabase values to `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Start the app:

```bash
npm run dev
```

Without Supabase values, the app still runs in demo mode and saves data in the browser on that device.

## Supabase Setup

1. Create a free Supabase project.
2. Open the SQL editor.
3. Run `supabase/migrations/001_initial_schema.sql`.
4. In Supabase Auth settings, enable Email provider.
5. Add your local and deployed URLs to Auth redirect URLs:
   - `http://localhost:5173`
   - your Netlify site URL after deploy

The app uses email magic links. Each signed-in user can only read and write their own data through row-level security policies.

## Netlify Deployment

1. Push this project to GitHub.
2. In Netlify, choose **Add new site** then **Import an existing project**.
3. Select the repository.
4. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy.
7. Copy the final Netlify URL into Supabase Auth redirect URLs.

`netlify.toml` already includes the SPA redirect needed for reloads and magic link returns.

## Android Add To Home Screen

You do not need Android Studio, an APK, the Play Store, or a native mobile build. Deploy the web app to Netlify, open the HTTPS URL on your phone, then install it from Chrome.

1. Open the deployed Netlify URL in Chrome on Android.
2. Sign in or use demo mode.
3. Tap the in-app **Install app** button if Chrome shows it.
4. If the button does not appear, open Chrome’s three-dot menu and choose **Add to Home screen** or **Install app**.
5. Launch Calm Quest from the home screen. It should open in standalone app mode.

Installability usually requires HTTPS, a valid manifest, service worker, and icons. Netlify provides HTTPS automatically. Chrome controls whether the install prompt appears; the menu option is the fallback.

## Architecture

The app is intentionally simple:

- `src/App.tsx` owns auth state, loading, tab selection, and save actions.
- `src/tabs/*` contains the four bottom-nav screens.
- `src/lib/storage.ts` provides one persistence API with Supabase and local demo implementations.
- `src/lib/progress.ts` calculates streaks, averages, triggers, and milestones.
- `src/lib/xp.ts` contains title thresholds and XP rules.
- `vite-plugin-pwa` generates the service worker and app manifest.

There is no router, no game engine, no charting dependency, and no complex achievement system. That keeps the app quick to load and easy to maintain.

## XP And Titles

- Log caffeine honestly: +1 XP
- Log trigger honestly: +1 XP
- Resisted craving: +5 XP
- Partial win: +3 XP
- Stayed under daily cap: +5 XP
- Setback: 0 XP

Titles:

- Overstimulated Worker: default
- Steady Operator: 25 XP
- Calm Builder: 75 XP
- Natural Energy: 150 XP
- Quiet Force: 300 XP

## Notes

The local demo mode is useful for trying the app quickly, but long-term use should be cloud-backed through Supabase so data survives phone changes and browser storage cleanup.
