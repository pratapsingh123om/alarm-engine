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
- **AI & Storage:** Transformers.js (Hugging Face), LocalForage (IndexedDB)

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

### 2. Desktop Setup (Windows .exe)
To spin up the Electron build and generate your portable executable:
```bash
npm run electron:build
```
> The finished `.exe` will output securely into the `dist/` directory.

### 3. Android Setup (APK)
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
