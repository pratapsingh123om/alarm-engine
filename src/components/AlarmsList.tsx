import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Clock, Bell, BellOff, X, Edit2, Camera, ShieldAlert, CheckCircle } from 'lucide-react';
import { alarmBridge } from '../services/alarmBridge';
import type { Alarm } from '../services/alarmBridge';
import { STATIC_RINGTONES } from './MusicSelector';

interface AlarmsListProps {
  onAlarmsChanged: () => void;
}

export const AlarmsList: React.FC<AlarmsListProps> = ({ onAlarmsChanged }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [timeString, setTimeString] = useState('07:00');
  const [soundUrl, setSoundUrl] = useState<string | undefined>(undefined);
  const [availableTunes, setAvailableTunes] = useState<any[]>([]);
  const [label, setLabel] = useState('');
  const [repeat, setRepeat] = useState(true);
  const [challengeType, setChallengeType] = useState<'math' | 'photo' | 'motion' | 'pushup'>('math');
  const [referencePhoto, setReferencePhoto] = useState<string | undefined>(undefined);
  const [targetReps, setTargetReps] = useState(10);
  const [pushupDuration, setPushupDuration] = useState(60);

  // Camera states for capture
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fetchAlarms = async () => {
    const list = await alarmBridge.getAlarms();
    list.sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
    setAlarms(list);
  };

  useEffect(() => {
    fetchAlarms();
    
    const loadTunes = async () => {
      try {
        const stored = await import('localforage').then(lf => lf.default.getItem('awakure_custom_voice_notes'));
        const custom = stored ? stored as any[] : [];
        setAvailableTunes([...custom, ...STATIC_RINGTONES]);
      } catch(e) {}
    };
    loadTunes();

    return () => {
      stopCamera();
    };
  }, []);

  // Camera helper functions
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setCameraError('Camera access denied or unavailable.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setReferencePhoto(dataUrl);
        stopCamera();
      }
    } catch (e) {
      console.error('Failed to capture frame:', e);
    }
  };

  const handleToggle = async (alarm: Alarm) => {
    const updated = { ...alarm, active: !alarm.active };
    await alarmBridge.saveAlarm(updated);
    fetchAlarms();
    onAlarmsChanged();
  };

  const handleDelete = async (id: string) => {
    await alarmBridge.deleteAlarm(id);
    fetchAlarms();
    onAlarmsChanged();
  };

  const handleEditClick = (alarm: Alarm) => {
    setEditingId(alarm.id);
    
    // Set display time for input (HH:mm)
    const hh = alarm.hour.toString().padStart(2, '0');
    const mm = alarm.minute.toString().padStart(2, '0');
    setTimeString(`${hh}:${mm}`);
    
    setLabel(alarm.label);
    setRepeat(alarm.repeat);
    setChallengeType(alarm.challengeType || 'math');
    setReferencePhoto(alarm.referencePhoto);
    setTargetReps(alarm.targetReps || 10);
    setPushupDuration(alarm.pushupDuration || 60);
    setSoundUrl(alarm.soundUrl);

    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingId(null);
    setLabel('');
    setReferencePhoto(undefined);
    setSoundUrl(undefined);
    stopCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let hour24 = 7;
    let minuteParsed = 0;
    if (timeString) {
      const [h, m] = timeString.split(':');
      hour24 = parseInt(h, 10);
      minuteParsed = parseInt(m, 10);
    }

    // Check if photo mode and referencePhoto is missing
    if (challengeType === 'photo' && !referencePhoto) {
      setCameraError('You must capture a reference photo first!');
      return;
    }

    const alarmData: Alarm = {
      id: editingId || Date.now().toString(),
      hour: hour24,
      minute: minuteParsed,
      label: label.trim() || 'Wake Up',
      active: true,
      repeat,
      challengeType,
      referencePhoto: challengeType === 'photo' ? referencePhoto : undefined,
      targetReps: challengeType === 'motion' ? targetReps : undefined,
      pushupDuration: challengeType === 'pushup' ? pushupDuration : undefined,
      soundUrl: soundUrl
    };

    await alarmBridge.saveAlarm(alarmData);
    fetchAlarms();
    onAlarmsChanged();
    handleFormClose();
  };

  const formatTime = (h: number, m: number) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    let displayHour = h % 12;
    if (displayHour === 0) displayHour = 12;
    const displayMinute = m.toString().padStart(2, '0');
    return {
      time: `${displayHour}:${displayMinute}`,
      suffix
    };
  };

  return (
    <div className="space-y-4">
      {/* Alarms Header Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="text-indigo-400" size={24} />
          <div>
            <h3 className="text-lg font-bold text-white">Alarms Schedule</h3>
            <p className="text-slate-400 text-xs">Wake intention parameters</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (showForm) {
              handleFormClose();
            } else {
              setShowForm(true);
            }
          }}
          className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/10 transition flex items-center justify-center"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Add / Edit Form Sheet */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-2">
            <h4 className="font-bold text-sm text-slate-200">
              {editingId ? 'Edit Scheduled Alarm' : 'Add New Alarm'}
            </h4>
          </div>

          {/* Time pickers */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 flex gap-2 items-center justify-center bg-slate-950/50 p-3 border border-slate-850 rounded-xl">
              <input
                type="time"
                value={timeString}
                onChange={(e) => setTimeString(e.target.value)}
                className="bg-transparent text-4xl font-black text-white focus:outline-none cursor-text w-full text-center"
                required
              />
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alarm Label / Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Gym Session, Work meeting"
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-white rounded-xl placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition text-sm"
            />
          </div>

          {/* Custom Ringtone Selector */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alarm Tune</label>
            <select
              value={soundUrl || ''}
              onChange={(e) => setSoundUrl(e.target.value || undefined)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl focus:outline-none transition text-sm cursor-pointer"
            >
              <option value="">Default App Ringtone</option>
              {availableTunes.map(tune => (
                <option key={tune.id} value={tune.url || ''} className="bg-slate-950">{tune.name}</option>
              ))}
            </select>
          </div>

          {/* Challenge Type Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Wake Challenge Type</label>
            <select
              value={challengeType}
              onChange={(e) => {
                setChallengeType(e.target.value as any);
                setReferencePhoto(undefined);
                stopCamera();
              }}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition text-sm cursor-pointer"
            >
              <option value="math" className="bg-slate-950">Math Problems (Mind Focus)</option>
              <option value="photo" className="bg-slate-950">Photo Match (Get out of Bed)</option>
              <option value="motion" className="bg-slate-950">Shake Device Challenge (Cardio)</option>
              <option value="pushup" className="bg-slate-950">1-Min Pushup Hold (Strength)</option>
            </select>
          </div>

          {/* Challenge Configurations */}
          {challengeType === 'photo' && (
            <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>REFERENCE PHOTO REQUIRED</span>
                {referencePhoto && <CheckCircle size={14} className="text-emerald-400" />}
              </div>

              {isCameraActive ? (
                <div className="relative aspect-video max-w-[200px] mx-auto rounded-lg overflow-hidden border border-slate-800">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-lg"
                  >
                    <Camera size={12} />
                    Capture
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-800 rounded-lg gap-3">
                  {referencePhoto ? (
                    <img src={referencePhoto} className="h-16 w-20 object-cover rounded-lg border border-slate-800" alt="Reference" />
                  ) : (
                    <Camera size={24} className="text-slate-650" />
                  )}
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition"
                  >
                    {referencePhoto ? 'Retake Reference Photo' : 'Activate Camera'}
                  </button>
                </div>
              )}
              {cameraError && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                  <ShieldAlert size={12} />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          )}

          {challengeType === 'motion' && (
            <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Shake Repetitions Target</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={targetReps}
                  onChange={(e) => setTargetReps(parseInt(e.target.value, 10))}
                  className="flex-1 accent-indigo-500 cursor-pointer"
                />
                <span className="text-sm font-black text-indigo-400 w-12 text-right">{targetReps} reps</span>
              </div>
            </div>
          )}

          {challengeType === 'pushup' && (
            <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl space-y-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Push-up / Plank Duration</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={pushupDuration}
                  onChange={(e) => setPushupDuration(parseInt(e.target.value, 10))}
                  className="flex-1 accent-indigo-500 cursor-pointer"
                />
                <span className="text-sm font-black text-indigo-400 w-16 text-right">{pushupDuration}s</span>
              </div>
            </div>
          )}

          {/* Repeat slider */}
          <div className="flex items-center justify-between py-1">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-300">Repeat Daily</span>
              <p className="text-[10px] text-slate-500">Reschedules automatically every 24h</p>
            </div>
            <button
              type="button"
              onClick={() => setRepeat(!repeat)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                repeat ? 'bg-indigo-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  repeat ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleFormClose}
              className="flex-1 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/10 transition"
            >
              {editingId ? 'Save Changes' : 'Create Alarm'}
            </button>
          </div>
        </form>
      )}

      {/* Alarms List Grid */}
      <div className="space-y-3">
        {alarms.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500 text-sm">No alarms scheduled. Click the + button to create one!</p>
          </div>
        ) : (
          alarms.map((alarm) => {
            const timeInfo = formatTime(alarm.hour, alarm.minute);
            return (
              <div
                key={alarm.id}
                className={`p-4 flex items-center justify-between border rounded-2xl transition ${
                  alarm.active
                    ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700/60'
                    : 'bg-slate-950/20 border-slate-900/50 opacity-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggle(alarm)}
                    className={`p-3 border rounded-xl transition ${
                      alarm.active
                        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        : 'bg-slate-950/80 border-slate-850 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {alarm.active ? <Bell size={18} /> : <BellOff size={18} />}
                  </button>
                  
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white leading-none">
                        {timeInfo.time}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        {timeInfo.suffix}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-450 font-medium">
                        {alarm.label}
                      </span>
                      
                      {/* Challenge badges */}
                      <span className="text-[9px] bg-slate-950/60 border border-slate-800/80 px-1.5 py-0.5 rounded text-indigo-400 font-bold uppercase tracking-wider">
                        {alarm.challengeType === 'photo' && '📸 Photo Match'}
                        {alarm.challengeType === 'motion' && `📳 Shake (${alarm.targetReps} reps)`}
                        {alarm.challengeType === 'pushup' && `🧘 Plank (${alarm.pushupDuration}s)`}
                        {(!alarm.challengeType || alarm.challengeType === 'math') && '🧠 Math Solver'}
                      </span>

                      {alarm.repeat && (
                        <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-450 font-bold uppercase tracking-wider">
                          Daily
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(alarm)}
                    className="p-2 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 text-slate-500 hover:text-indigo-450 rounded-lg transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(alarm.id)}
                    className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-slate-550 hover:text-red-400 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
