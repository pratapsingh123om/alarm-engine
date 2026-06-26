package com.awakure.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;

import androidx.core.app.NotificationCompat;

public class AndroidLocalAlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AndroidLocalAlarmReceiver";
    private static final String CHANNEL_ID = "awakure_alarm_channel";
    private static final int NOTIFICATION_ID = 9999;

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "Alarm received! Action: " + intent.getAction());

        if ("com.awakure.app.ALARM_TRIGGER".equals(intent.getAction())) {
            String title = intent.getStringExtra("title");
            String message = intent.getStringExtra("message");
            String idStr = intent.getStringExtra("id");

            PowerManager powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            PowerManager.WakeLock wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                "Awakure::AlarmWakeLock"
            );
            wakeLock.acquire(3 * 60 * 1000L); // 3 minutes

            try {
                createNotificationChannel(context);

                // This intent opens the main activity
                Intent fullScreenIntent = new Intent(context, MainActivity.class);
                fullScreenIntent.putExtra("is_alarm", true);
                fullScreenIntent.putExtra("alarm_id", idStr);
                
                // Clear any running tasks and bring this to front
                fullScreenIntent.addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK |
                    Intent.FLAG_ACTIVITY_CLEAR_TOP |
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
                );

                PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                    context, 
                    idStr != null ? idStr.hashCode() : 0, 
                    fullScreenIntent, 
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                // Use the default launcher icon since we know it exists
                int iconResId = context.getResources().getIdentifier("ic_launcher", "mipmap", context.getPackageName());
                if (iconResId == 0) {
                    iconResId = android.R.drawable.ic_dialog_info;
                }

                NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(iconResId)
                    .setContentTitle(title)
                    .setContentText(message)
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setFullScreenIntent(fullScreenPendingIntent, true) // This wakes the screen
                    .setAutoCancel(true);

                NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
                if (notificationManager != null) {
                    notificationManager.notify(NOTIFICATION_ID, builder.build());
                    Log.d(TAG, "Full-screen notification fired!");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error showing alarm notification: " + e.getMessage());
            } finally {
                if (wakeLock.isHeld()) {
                    wakeLock.release();
                }
            }
        }
    }

    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Awakure Alarms",
                    NotificationManager.IMPORTANCE_HIGH // Must be high for full screen intent
                );
                channel.setDescription("Shows full screen alarms");
                channel.enableVibration(true);
                // We let the React app handle the actual sound, or we could set a default sound here
                channel.setSound(null, null); 
                nm.createNotificationChannel(channel);
            }
        }
    }
}
