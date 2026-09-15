<div align="center">
  <br />
  <h1>🌅 Awakure</h1>
  <p><strong>Intentional Awakening • Alarm & Morning Routine Engine</strong></p>
  <br />
</div>

**Awakure** is a cross-platform, ultra-premium alarm system and morning routine engine. Designed to pull you out of bed intentionally, Awakure requires you to complete physical or cognitive challenges (like Math equations or Push-ups) to silence the alarm. Once you're awake, its offline neural AI voice engine greets you and reads out your daily tasks.

## ✨ Core Features

*   **🛡️ Wake Challenges:** No more snoozing. Turn off your alarm by completing dynamic, interactive challenges:
    *   🧮 **Math Puzzles:** Solve arithmetic equations to wake up your brain.
    *   📸 **Photo Match:** Snap a photo matching a target to prove you are out of bed.
    *   🏋️ **Motion/Fitness:** Hold a plank or do push-ups in front of your camera.
*   **🧠 Offline AI Voice Engine (TTS):** A fully private, 100% offline 140MB Text-to-Speech neural network built with `Transformers.js`. Once awake, Awakure reads your morning tasks to you in a melodious voice.
*   **🎶 Massive Custom Soundtracks:** Integrated with IndexedDB (`localforage`), bypassing the standard 5MB browser limits so you can upload and loop high-quality alarm tunes.
*   **✅ Built-in Task Manager:** Organize your day the night before. Awakure will synthesize and narrate your pending tasks upon waking.
*   **☁️ Optional Cloud Accounts:** Guest mode stores everything on-device. Email accounts can privately sync alarms, tasks, and lightweight preferences through Supabase with per-user Row Level Security.
*   **👻 Bulletproof Background Execution:** 
    *   **Desktop:** Runs silently in the Windows System Tray, overriding close events to ensure you never accidentally kill your alarm.
    *   **Android:** Injects native Capacitor Local Notifications with Doze-mode bypass (`allowWhileIdle: true`) and Exact Alarm permissions. 

## 🚀 Platforms

Awakure is built on a unified **React + Vite + Tailwind CSS** frontend, seamlessly bridged to native platforms.

### 💻 Windows Desktop (Electron)
Fully packaged into a portable executable. 
- Features a **"Create Desktop Shortcut"** button to auto-generate a `.lnk` right from the UI.
- Native System Tray integration.

### 📱 Android Mobile (Capacitor)
Safely shielded WebView that hooks directly into the Android OS for native functionality.
- Bypasses deep battery-saving suspensions.
- Requests `POST_NOTIFICATIONS` and `SCHEDULE_EXACT_ALARM`.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Desktop Wrapper:** Electron & Electron Builder
- **Mobile Wrapper:** Capacitor v8 (Android)
- **AI & Storage:** Transformers.js (Hugging Face), LocalForage (IndexedDB), optional Supabase Auth + Postgres
- **Web Backend:** Vercel Functions with `@supabase/server` user-token verification

## 📦 Installation & Build

### Prerequisites
- Node.js & npm
- Java SDK & Android Studio (For Android compilation)

### 1. Clone & Install
```bash
git clone https://github.com/pratapsingh123om/alarm-engine.git
cd alarm-engine
npm install
```

### 2. Web development and production build

The public marketing page lives at `/`; the working alarm application lives at `/?app=1`.

```bash
npm run dev
npm run build
```

The production output is generated in `dist/`.

### 3. Optional Supabase accounts

Guest mode needs no configuration. To enable cloud accounts:

1. Open the Supabase SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql). It creates one private snapshot row per user and enables owner-only Row Level Security policies.
2. In Supabase Auth URL Configuration, set your Vercel production URL as the Site URL and add `https://YOUR-DOMAIN/?app=1` as an allowed redirect URL.
3. Copy `.env.example` to `.env.local` for local development. Never put `SUPABASE_SECRET_KEY` in a `VITE_` variable.
4. Add the same variables to the Vercel project settings for Production and Preview, then redeploy.

The browser only receives `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The `/api/session` Vercel Function verifies signed-in user tokens with `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_JWKS_URL`. `SUPABASE_SECRET_KEY` stays server-only and is reserved for future admin-only handlers.

Custom recordings and uploaded ringtones stay in local IndexedDB; they are never copied to the cloud. Alarms (including photo-challenge references), tasks, and lightweight ringtone/voice preferences are synced for signed-in users.

### 4. Deploy to Vercel

Import [the GitHub repository](https://github.com/pratapsingh123om/alarm-engine) into Vercel. Vercel detects Vite automatically; use `npm run build` and `dist` if it asks for explicit settings. Configure the Supabase variables above before the production deployment.

### 5. Desktop Setup (Windows .exe)
To spin up the Electron build and generate your portable executable:
```bash
npm run electron:build
```
> The finished `.exe` will output securely into the `dist/` directory.

### 6. Android Setup (APK)
Because of Windows file locks, compile the web assets safely to an alternate directory and sync native plugins:
```bash
npx vite build --outDir dist-web
npx cap sync android
```
Open the generated `android/` folder in **Android Studio**, let Gradle sync, and click **Build APK(s)** to deploy to your phone.

---

## 🔒 Permissions required (Android)
- `CAMERA` - Required for Plank/Push-up tracking and Photo Match.
- `RECORD_AUDIO` - Required for voice functionalities.
- `MODIFY_AUDIO_SETTINGS` - To override volume controls when the alarm rings.
- `SCHEDULE_EXACT_ALARM` - To bypass Doze mode.
- `POST_NOTIFICATIONS` - Mandatory for Android 13+ background execution.

<br />
<div align="center">
  <sub>Awakure Alarm System © 2026</sub>
</div>
