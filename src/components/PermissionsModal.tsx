import React, { useState, useEffect } from 'react';
import { AlertTriangle, BellRing, Battery, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { AlarmNotification } from '@scalejet/capacitor-alarm-notification';
import { AndroidSettings } from '../services/androidSettingsBridge';
import { getPlatform } from '../services/alarmBridge';

export const PermissionsModal: React.FC<{ onAllGranted: () => void }> = ({ onAllGranted }) => {
  const [loading, setLoading] = useState(true);
  const [isAndroid, setIsAndroid] = useState(false);
  const [perms, setPerms] = useState({
    notifications: true,
    exactAlarm: true,
    batteryOptimized: true,
  });

  const checkAll = async () => {
    setLoading(true);
    try {
      if (getPlatform() !== 'android') {
        onAllGranted();
        return;
      }
      setIsAndroid(true);

      // Notification permission
      let notifRes = { hasPermission: true };
      try {
        notifRes = await AlarmNotification.checkPermission();
      } catch(e) {}
      
      // Native settings
      let nativeRes = { exactAlarm: true, batteryOptimization: true };
      try {
        nativeRes = await AndroidSettings.checkPermissions();
      } catch (e) {
        console.warn('Native settings plugin not available', e);
      }

      const status = {
        notifications: notifRes.hasPermission || false,
        exactAlarm: nativeRes.exactAlarm,
        batteryOptimized: nativeRes.batteryOptimization,
      };

      setPerms(status);

      if (status.notifications && status.exactAlarm && status.batteryOptimized) {
        onAllGranted();
      }
    } catch (e) {
      console.error('Error checking permissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAll();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAll();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (loading || !isAndroid) return null;
  if (perms.notifications && perms.exactAlarm && perms.batteryOptimized) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 bg-gradient-to-br from-rose-500/20 to-orange-500/10 border-b border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Action Required</h2>
            <p className="text-xs text-rose-200/80 font-medium mt-1">Please grant permissions for alarms to work reliably in the background.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Notifications */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${perms.notifications ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {perms.notifications ? <CheckCircle2 size={20} /> : <BellRing size={20} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                <p className="text-[10px] text-slate-400">Allows alarms to show up</p>
              </div>
            </div>
            {!perms.notifications && (
              <button onClick={() => AlarmNotification.requestPermission().then(checkAll)} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition">
                Allow
              </button>
            )}
          </div>

          {/* Exact Alarms */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${perms.exactAlarm ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {perms.exactAlarm ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Exact Alarms</h3>
                <p className="text-[10px] text-slate-400">Ensures alarm rings exactly on time</p>
              </div>
            </div>
            {!perms.exactAlarm && (
              <button onClick={() => AndroidSettings.openExactAlarmSettings()} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition">
                Fix
              </button>
            )}
          </div>

          {/* Battery Optimization */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${perms.batteryOptimized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                {perms.batteryOptimized ? <CheckCircle2 size={20} /> : <Battery size={20} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Unrestricted Battery</h3>
                <p className="text-[10px] text-slate-400">Prevents Android from killing the app</p>
              </div>
            </div>
            {!perms.batteryOptimized && (
              <button onClick={() => AndroidSettings.openBatteryOptimizationSettings()} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition">
                Fix
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-center">
          <button onClick={checkAll} className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition text-xs font-bold">
            <RefreshCw size={14} /> Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
};
