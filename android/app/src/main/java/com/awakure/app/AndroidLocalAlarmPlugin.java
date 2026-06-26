package com.awakure.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AndroidLocalAlarm")
public class AndroidLocalAlarmPlugin extends Plugin {
    private static final String TAG = "AndroidLocalAlarmPlugin";

    @PluginMethod
    public void setAlarm(PluginCall call) {
        long delay = call.getLong("delay", 5000L); // delay in ms
        String title = call.getString("title", "Awakure Alarm");
        String message = call.getString("message", "Time to wake up!");
        String idStr = call.getString("id", "default");
        int requestCode = idStr.hashCode();

        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        // Check if Exact Alarms are permitted
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (alarmManager != null && !alarmManager.canScheduleExactAlarms()) {
                call.reject("Exact alarms not permitted. Prompt the user.");
                return;
            }
        }

        Intent intent = new Intent(context, AndroidLocalAlarmReceiver.class);
        intent.setAction("com.awakure.app.ALARM_TRIGGER");
        intent.putExtra("title", title);
        intent.putExtra("message", message);
        intent.putExtra("id", idStr);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        long triggerAtMillis = System.currentTimeMillis() + delay;

        if (alarmManager != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
            }
            Log.d(TAG, "Custom Alarm scheduled for: " + triggerAtMillis + " with id: " + idStr);

            // Also save to shared preferences in case we need to restore on boot
            SharedPreferences prefs = context.getSharedPreferences("AwakureAlarms", Context.MODE_PRIVATE);
            prefs.edit().putLong("alarm_" + idStr, triggerAtMillis).apply();
            
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("triggerTime", triggerAtMillis);
            call.resolve(ret);
        } else {
            call.reject("AlarmManager is null");
        }
    }

    @PluginMethod
    public void cancelAlarm(PluginCall call) {
        String idStr = call.getString("id");
        if (idStr == null) {
            call.reject("Must provide alarm id to cancel");
            return;
        }

        int requestCode = idStr.hashCode();
        Context context = getContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        
        Intent intent = new Intent(context, AndroidLocalAlarmReceiver.class);
        intent.setAction("com.awakure.app.ALARM_TRIGGER");
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_NO_CREATE
        );

        if (pendingIntent != null && alarmManager != null) {
            alarmManager.cancel(pendingIntent);
            pendingIntent.cancel();
            Log.d(TAG, "Cancelled alarm with id: " + idStr);
        }

        SharedPreferences prefs = context.getSharedPreferences("AwakureAlarms", Context.MODE_PRIVATE);
        prefs.edit().remove("alarm_" + idStr).apply();

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
    
    @PluginMethod
    public void checkIntentExtras(PluginCall call) {
        try {
            android.app.Activity activity = getActivity();
            if (activity != null) {
                Intent intent = activity.getIntent();
                boolean isAlarm = intent.getBooleanExtra("is_alarm", false);
                String alarmId = intent.getStringExtra("alarm_id");
                
                JSObject result = new JSObject();
                result.put("isAlarm", isAlarm);
                result.put("alarmId", alarmId);
                
                // Clear extras so we don't trigger it again on regular resume
                intent.removeExtra("is_alarm");
                intent.removeExtra("alarm_id");
                activity.setIntent(intent);
                
                call.resolve(result);
            } else {
                call.resolve(new JSObject().put("isAlarm", false));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking intent extras: " + e.getMessage());
            call.reject("Error checking intent extras", e);
        }
    }
}
