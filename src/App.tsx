import React, { useState, useEffect } from 'react';
import { Clock, CheckSquare, Music, Coffee, MonitorUp } from 'lucide-react';
import { AlarmsList } from './components/AlarmsList';
import { TasksPanel } from './components/TasksPanel';
import type { Task } from './components/TasksPanel';
import { MusicSelector } from './components/MusicSelector';
import { WakeChallenge } from './components/WakeChallenge';
import { alarmBridge } from './services/alarmBridge';
import type { Alarm } from './services/alarmBridge';
import { soundPlayer } from './services/soundPlayer';
import { ttsBridge } from './services/ttsBridge';
import { LocalNotifications } from '@capacitor/local-notifications';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alarms' | 'tasks' | 'music'>('alarms');
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [triggerListChange, setTriggerListChange] = useState(0);

  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Setup IPC listeners for desktop shortcut
    try {
      if ((window as any).require) {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.on('create-desktop-shortcut-reply', (_: any, success: boolean) => {
          if (success) alert('✅ Shortcut successfully added to your Desktop!');
          else alert('❌ Failed to create desktop shortcut.');
        });
      }
    } catch(e) {}

    // Setup LocalNotifications listener for Android background alarms
    try {
      if ((window as any).Capacitor?.isNative) {
        LocalNotifications.requestPermissions();
        
        LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
          const alarmId = notification.notification.extra?.alarmId;
          if (alarmId) {
            const alarms = await alarmBridge.getAlarms();
            const ringing = alarms.find(a => a.id === alarmId);
            if (ringing) {
              setActiveAlarm(ringing);
              const musicUrl = ringing.soundUrl || localStorage.getItem('awakure_music_url') || undefined;
              soundPlayer.playAlarm(musicUrl);
            }
          }
        });

        LocalNotifications.addListener('localNotificationReceived', async (notification) => {
          const alarmId = notification.extra?.alarmId;
          if (alarmId) {
            const alarms = await alarmBridge.getAlarms();
            const ringing = alarms.find(a => a.id === alarmId);
            if (ringing) {
              setActiveAlarm(ringing);
              const musicUrl = ringing.soundUrl || localStorage.getItem('awakure_music_url') || undefined;
              soundPlayer.playAlarm(musicUrl);
            }
          }
        });
      }
    } catch(e) {
      console.error('LocalNotifications setup failed:', e);
    }

    return () => {
      clearInterval(timer);
      try {
        if ((window as any).require) {
          const { ipcRenderer } = (window as any).require('electron');
          ipcRenderer.removeAllListeners('create-desktop-shortcut-reply');
        }
      } catch(e) {}
    };
  }, []);

  // Alarm checker loop
  useEffect(() => {
    let checkTimer: any;
    
    const checkAlarms = async () => {
      if (activeAlarm) return; // Already ringing

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentSecond = now.getSeconds();

      // We only trigger precisely on the 0th second of the minute
      if (currentSecond !== 0) return;

      const alarms = await alarmBridge.getAlarms();
      const ringing = alarms.find(
        a => a.active && a.hour === currentHour && a.minute === currentMinute
      );

      if (ringing) {
        console.log(`Alarm triggered: ${ringing.label}`);
        setActiveAlarm(ringing);
        
        // Play the ringtone (specific to alarm or fallback to global)
        const musicUrl = ringing.soundUrl || localStorage.getItem('awakure_music_url') || undefined;
        soundPlayer.playAlarm(musicUrl);
        
        // Notify Electron to pop up the window from the tray
        try {
          if ((window as any).require) {
            const { ipcRenderer } = (window as any).require('electron');
            ipcRenderer.send('alarm-triggered');
          }
        } catch(e) {
          console.log('Not running in electron, skipping IPC trigger.');
        }
      }
    };

    // Check immediately and then schedule every second
    checkAlarms();
    checkTimer = setInterval(checkAlarms, 1000);

    return () => clearInterval(checkTimer);
  }, [activeAlarm, triggerListChange]);

  const handleSolveChallenge = async () => {
    if (!activeAlarm) return;
    
    // Stop alarm sound
    soundPlayer.stopAlarm();
    
    const finishedAlarm = activeAlarm;
    setActiveAlarm(null);

    // Turn off alarm if it does not repeat
    if (!finishedAlarm.repeat) {
      const alarms = await alarmBridge.getAlarms();
      const updated = alarms.map(a => 
        a.id === finishedAlarm.id ? { ...a, active: false } : a
      );
      localStorage.setItem('awakure_alarms', JSON.stringify(updated));
      await alarmBridge.saveAlarm({ ...finishedAlarm, active: false });
      setTriggerListChange(prev => prev + 1);
    }

    // Speak morning rundown tasks
    const storedTasks = localStorage.getItem('awakure_tasks');
    const tasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];
    const pendingTasks = tasks.filter(t => !t.completed);

    let intro = `Good morning! You successfully completed your wake challenge. `;
    if (pendingTasks.length > 0) {
      intro += `Here are your pending tasks for today: ${pendingTasks.map((t, idx) => `${idx + 1}. ${t.text}`).join(', ')}`;
    } else {
      intro += `You have no pending tasks. Have a wonderful day ahead!`;
    }

    // Delay speech slightly to let user catch their breath
    setTimeout(() => {
      ttsBridge.speak(intro);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Wake Challenge Overlay Modal */}
      {activeAlarm && (
        <WakeChallenge
          label={activeAlarm.label}
          challengeType={activeAlarm.challengeType || 'math'}
          referencePhoto={activeAlarm.referencePhoto}
          targetReps={activeAlarm.targetReps}
          pushupDuration={activeAlarm.pushupDuration}
          onSolve={handleSolveChallenge}
        />
      )}

      {/* Main Container */}
      <div className="w-full max-w-lg mx-auto px-4 py-8 flex-1 flex flex-col justify-start">
        {/* Header App Title */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white flex items-center justify-center">
              <Coffee size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                Awakure
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Intentional Awakening
              </p>
            </div>
          </div>

          {/* Simple digital clock */}
          <div className="text-right">
            <div className="text-xl font-black text-white tabular-nums">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Tab Navigation Menu */}
        <nav className="flex bg-slate-900/40 border border-slate-800/80 p-1.5 rounded-2xl gap-1 mb-6">
          <button
            onClick={() => setActiveTab('alarms')}
            className={`flex-1 py-3 px-2 flex flex-col sm:flex-row items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'alarms'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <Clock size={16} />
            <span>Alarms</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 px-2 flex flex-col sm:flex-row items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'tasks'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <CheckSquare size={16} />
            <span>Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`flex-1 py-3 px-2 flex flex-col sm:flex-row items-center justify-center gap-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'music'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
            }`}
          >
            <Music size={16} />
            <span>Music</span>
          </button>
        </nav>

        {/* Tab Content Display Area */}
        <main className="p-6 bg-slate-900/25 border border-slate-900/80 rounded-3xl shadow-xl flex-1">
          {activeTab === 'alarms' && (
            <AlarmsList onAlarmsChanged={() => setTriggerListChange(prev => prev + 1)} />
          )}
          {activeTab === 'tasks' && <TasksPanel />}
          {activeTab === 'music' && <MusicSelector />}
        </main>
      </div>

      {/* Footer Branding */}
      <footer className="w-full text-center py-6 border-t border-slate-950 flex flex-col items-center gap-3">
        <button
          onClick={() => {
            try {
              if ((window as any).require) {
                const { ipcRenderer } = (window as any).require('electron');
                ipcRenderer.send('create-desktop-shortcut');
              } else {
                alert('This feature requires the desktop app version.');
              }
            } catch(e) {}
          }}
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-lg text-xs font-bold text-slate-300 transition flex items-center gap-2"
        >
          <MonitorUp size={14} />
          Add to Home Screen (Desktop Shortcut)
        </button>
        <p className="text-[10px] text-slate-650 font-semibold tracking-wider uppercase">
          Awakure Alarm System © 2026
        </p>
      </footer>
    </div>
  );
};

export default App;
