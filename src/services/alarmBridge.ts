export interface Alarm {
  id: string;
  hour: number;      // 0-23
  minute: number;    // 0-59
  label: string;
  active: boolean;
  repeat: boolean;
  challengeType?: 'math' | 'photo' | 'motion' | 'pushup';
  referencePhoto?: string; // base64 string
  targetReps?: number;     // e.g. 10 shakes
  pushupDuration?: number; // e.g. 60 seconds
  soundUrl?: string;       // Custom ringtone URL
}

import { registerPlugin } from '@capacitor/core';

export interface AndroidLocalAlarmPlugin {
  setAlarm(options: { delay: number; title: string; message: string; id: string }): Promise<{ success: boolean; triggerTime: number }>;
  cancelAlarm(options: { id: string }): Promise<{ success: boolean }>;
}
const AndroidLocalAlarm = registerPlugin<AndroidLocalAlarmPlugin>('AndroidLocalAlarm');

const ALARMS_KEY = 'awakure_alarms';

// Helper to check what platform we are running on
export const getPlatform = (): 'android' | 'desktop' | 'web' => {
  if ((window as any).Capacitor?.isNative) {
    return 'android';
  }
  if ((window as any).__TAURI__) {
    return 'desktop';
  }
  return 'web';
};

export const alarmBridge = {
  async getAlarms(): Promise<Alarm[]> {
    const platform = getPlatform();
    
    if (platform === 'web') {
      const stored = localStorage.getItem(ALARMS_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    
    if (platform === 'android') {
      try {
        // Fallback to localStorage if Capacitor plugin not fully initialized
        const stored = localStorage.getItem(ALARMS_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Android getAlarms error:', e);
        return [];
      }
    }
    
    if (platform === 'desktop') {
      try {
        // In Tauri we can invoke a rust function, or use localStorage
        const stored = localStorage.getItem(ALARMS_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }
    
    return [];
  },

  async saveAlarm(alarm: Alarm): Promise<void> {
    const alarms = await this.getAlarms();
    const index = alarms.findIndex(a => a.id === alarm.id);
    if (index >= 0) {
      alarms[index] = alarm;
    } else {
      alarms.push(alarm);
    }
    
    localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
    
    const platform = getPlatform();
    if (platform === 'android') {
      try {
        // Sync the specific alarm
        await AndroidLocalAlarm.cancelAlarm({ id: alarm.id }).catch(() => {});
        
        if (alarm.active) {
          const now = new Date();
          let targetDate = new Date();
          targetDate.setHours(alarm.hour, alarm.minute, 0, 0);
          
          if (targetDate.getTime() <= now.getTime()) {
            targetDate.setDate(targetDate.getDate() + 1);
          }
          
          const delayMs = targetDate.getTime() - now.getTime();
          
          await AndroidLocalAlarm.setAlarm({
            delay: delayMs,
            title: 'Awakure Alarm',
            message: alarm.label || 'Time to wake up!',
            id: alarm.id
          });
        }
      } catch (e) {
        console.error('Failed to schedule alarm via AndroidLocalAlarm:', e);
      }
    } else if (platform === 'desktop') {
      // Notify Tauri Rust background task
      try {
        const tauri = (window as any).__TAURI__;
        if (tauri) {
          await tauri.invoke('schedule_alarm', { alarm });
        }
      } catch (e) {
        console.error('Failed to schedule alarm on Tauri:', e);
      }
    }
  },

  async deleteAlarm(id: string): Promise<void> {
    const alarms = await this.getAlarms();
    const updated = alarms.filter(a => a.id !== id);
    localStorage.setItem(ALARMS_KEY, JSON.stringify(updated));
    
    const platform = getPlatform();
    if (platform === 'android') {
      try {
        await AndroidLocalAlarm.cancelAlarm({ id });
      } catch (e) {
        console.error('Failed to cancel alarm on Android:', e);
      }
    } else if (platform === 'desktop') {
      try {
        const tauri = (window as any).__TAURI__;
        if (tauri) {
          await tauri.invoke('cancel_alarm', { id });
        }
      } catch (e) {
        console.error('Failed to cancel alarm on Tauri:', e);
      }
    }
  }
};
