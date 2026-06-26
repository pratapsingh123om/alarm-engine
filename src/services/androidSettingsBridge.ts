import { registerPlugin } from '@capacitor/core';

export interface AndroidSettingsPlugin {
  checkPermissions(): Promise<{ 
    exactAlarm: boolean; 
    batteryOptimization: boolean;
    fullScreenIntent: boolean;
    systemAlertWindow: boolean;
  }>;
  openExactAlarmSettings(): Promise<void>;
  openBatteryOptimizationSettings(): Promise<void>;
  openFullScreenIntentSettings(): Promise<void>;
  openSystemAlertWindowSettings(): Promise<void>;
}

export const AndroidSettings = registerPlugin<AndroidSettingsPlugin>('AndroidSettings');
