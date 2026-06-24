import { registerPlugin } from '@capacitor/core';

export interface AndroidSettingsPlugin {
  checkPermissions(): Promise<{ exactAlarm: boolean; batteryOptimization: boolean }>;
  openExactAlarmSettings(): Promise<void>;
  openBatteryOptimizationSettings(): Promise<void>;
}

export const AndroidSettings = registerPlugin<AndroidSettingsPlugin>('AndroidSettings');
