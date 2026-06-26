# Alarm Engine Error Log & Lessons Learned

## Issue: Alarm doesn't kick back when the app is closed (Android)
**Problem:** Android's aggressive battery optimizations and background execution limits prevented the Capacitor plugin from firing exact alarms and waking the screen.
**Root Causes:**
1. **Missing Full Screen Intent Permission:** `android.permission.USE_FULL_SCREEN_INTENT` was missing from `AndroidManifest.xml`. Without this, the system won't allow the app to launch an activity over the lock screen.
2. **Missing Activity Flags:** `MainActivity` lacked `android:showWhenLocked="true"` and `android:turnScreenOn="true"`, preventing the screen from waking up.
3. **Missing System Alert Window:** `android.permission.SYSTEM_ALERT_WINDOW` was missing, which is a fallback permission sometimes needed by some Android versions to draw over other apps.
4. **Permissions Not Explicitly Requested:** Android 12+ requires explicit user consent for `SCHEDULE_EXACT_ALARM`, and Android 13+ requires it for `POST_NOTIFICATIONS`. Furthermore, battery optimization must be turned off manually by the user.

## Solution Implemented
1. Added all required permissions to `AndroidManifest.xml`.
2. Created a native Capacitor plugin `AndroidSettingsPlugin.java` to open `ACTION_REQUEST_SCHEDULE_EXACT_ALARM` and `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` intents because they cannot be requested via standard dialogs.
3. Added a dedicated `PermissionsModal.tsx` UI to guide the user to enable Notifications, Exact Alarms, and Unrestricted Battery settings.

## Future Prevention
- Always verify exact alarm permissions via `AlarmManager.canScheduleExactAlarms()` on Android 12+.
- Always check if the app is ignoring battery optimizations via `PowerManager.isIgnoringBatteryOptimizations()`.
- Ensure new activities intended for alarms always have `showWhenLocked` and `turnScreenOn`.
