import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Square, Check, Mic, SquareDot, Save, ChevronDown, Volume2 } from 'lucide-react';
import { soundPlayer } from '../services/soundPlayer';
import { ttsBridge } from '../services/ttsBridge';
import localforage from 'localforage';
import { localTTS } from '../services/LocalTTS';

export interface Ringtone {
  id: string;
  name: string;
  url: string | undefined; // undefined means use synthesized alarm
  description: string;
  isCustom?: boolean;
}

export const STATIC_RINGTONES: Ringtone[] = [
  {
    id: 'synth_alarm',
    name: 'Synthesized Buzz (Default)',
    url: undefined,
    description: 'Pulsing dual-tone alert. Hard to ignore.'
  },
  {
    id: 'custom_tune',
    name: 'My Custom Tune',
    url: '/sounds/tune.mpeg',
    description: 'User selected local audio file (tune.mpeg).'
  },
  {
    id: 'local_alarm',
    name: 'Standard Bell Sound',
    url: '/sounds/alarm.mp3',
    description: 'A classic mechanical ringing bell sound.'
  },
  {
    id: 'spotify_alarm',
    name: 'Spotify Playlist Hook',
    url: 'spotify:playlist:37i9dQZF1DX4sWSpwq3LiO',
    description: 'Launches your Spotify app on wake (requires client).'
  }
];

export const MusicSelector: React.FC = () => {
  const [selectedId, setSelectedId] = useState('synth_alarm');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [customRingtones, setCustomRingtones] = useState<Ringtone[]>([]);

  // Voice Note Recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedName, setRecordedName] = useState('');
  const [recorderError, setRecorderError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Natural TTS Voice states
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);

  useEffect(() => {
    // Load active ringtone selection
    const stored = localStorage.getItem('awakure_ringtone_id');
    if (stored) {
      setSelectedId(stored);
    }

    // Load custom voice notes asynchronously
    loadCustomVoiceNotes();

    // Load TTS Voices
    const loadVoicesList = () => {
      const allVoices = ttsBridge.getVoices();
      // Filter primarily English or let the user choose all
      const englishVoices = allVoices.sort((a, b) => a.name.localeCompare(b.name));
      setVoices(englishVoices);
    };

    loadVoicesList();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoicesList;
    }

    const storedVoiceName = localStorage.getItem('awakure_tts_voice_name');
    if (storedVoiceName) {
      setSelectedVoice(storedVoiceName);
    }
  }, []);

  const loadCustomVoiceNotes = async () => {
    try {
      // Migrate from old localStorage to bypass 5MB limit
      const oldStored = localStorage.getItem('awakure_custom_voice_notes');
      if (oldStored) {
        const parsed = JSON.parse(oldStored);
        await localforage.setItem('awakure_custom_voice_notes', parsed);
        localStorage.removeItem('awakure_custom_voice_notes');
        setCustomRingtones(parsed);
      } else {
        const stored: Ringtone[] | null = await localforage.getItem('awakure_custom_voice_notes');
        if (stored) {
          setCustomRingtones(stored);
        }
      }
    } catch (e) {
      console.error('Failed to load custom voice notes via IndexedDB:', e);
    }
  };

  const getFullRingtones = () => {
    return [...customRingtones, ...STATIC_RINGTONES];
  };

  const selectRingtone = (ringtone: Ringtone) => {
    setSelectedId(ringtone.id);
    localStorage.setItem('awakure_ringtone_id', ringtone.id);
    if (ringtone.url) {
      localStorage.setItem('awakure_music_url', ringtone.url);
    } else {
      localStorage.removeItem('awakure_music_url');
    }
  };

  const handleTest = (ringtone: Ringtone) => {
    if (testingId === ringtone.id) {
      soundPlayer.stopAlarm();
      setTestingId(null);
    } else {
      soundPlayer.stopAlarm();
      setTestingId(ringtone.id);
      soundPlayer.playAlarm(ringtone.url);
    }
  };

  // Voice Note Recording functions
  const startRecording = async () => {
    setRecorderError(null);
    setAudioUrl(null);
    setRecordedChunks([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setRecordedChunks(chunks);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access error:', err);
      setRecorderError('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const saveVoiceNote = () => {
    if (recordedChunks.length === 0 || !recordedName.trim()) return;

    const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      const newVoiceNote: Ringtone = {
        id: `voice_note_${Date.now()}`,
        name: `🎙️ ${recordedName.trim()}`,
        url: base64Audio,
        description: `Voice Note - recorded on ${new Date().toLocaleDateString()}`,
        isCustom: true
      };

      const updated = [newVoiceNote, ...customRingtones];
      setCustomRingtones(updated);
      await localforage.setItem('awakure_custom_voice_notes', updated);
      
      // Auto select newly recorded voice note
      selectRingtone(newVoiceNote);

      // Reset recorder states
      setAudioUrl(null);
      setRecordedName('');
      setRecordedChunks([]);
    };
  };

  const deleteVoiceNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customRingtones.filter(r => r.id !== id);
    setCustomRingtones(updated);
    await localforage.setItem('awakure_custom_voice_notes', updated);
    if (selectedId === id) {
      selectRingtone(STATIC_RINGTONES[0]); // Fallback to synthesized buzzer
    }
  };

  // TTS Voice Selection functions
  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedVoice(val);
    localStorage.setItem('awakure_tts_voice_name', val);
  };

  const testVoiceSpeech = async () => {
    if (isPreviewingVoice) return;
    setIsPreviewingVoice(true);
    await ttsBridge.speak("Good morning! This is a preview of your selected wake-up voice engine.");
    setIsPreviewingVoice(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      const newTune: Ringtone = {
        id: `local_tune_${Date.now()}`,
        name: `🎵 ${file.name}`,
        url: base64Audio,
        description: 'Locally uploaded audio file',
        isCustom: true
      };

      const updated = [newTune, ...customRingtones];
      setCustomRingtones(updated);
      await localforage.setItem('awakure_custom_voice_notes', updated);
      selectRingtone(newTune);
    };
  };

  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const initLocalTTS = async () => {
    try {
      await localTTS.init((info) => {
        if (info.status === 'progress') {
          // Approximate percentage based on typical sizes
          setDownloadProgress(Math.round(info.progress));
        } else if (info.status === 'ready') {
          setDownloadProgress(null);
        }
      });
      // Force UI refresh
      setDownloadProgress(null);
    } catch (e) {
      console.error(e);
      setDownloadProgress(null);
    }
  };

  useEffect(() => {
    return () => {
      soundPlayer.stopAlarm();
    };
  }, []);

  return (
    <div className="space-y-6">
      
      {/* 🎙️ Voice Recorder Panel */}
      <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="text-indigo-400" size={20} />
          <h4 className="font-bold text-sm text-slate-200">Record Alarm Voice Note</h4>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="w-full sm:w-auto px-5 py-3 bg-red-500 hover:bg-red-650 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition animate-pulse"
            >
              <SquareDot size={18} />
              Stop Recording
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="w-full sm:w-auto px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Mic size={18} />
              Record Message
            </button>
          )}

          {audioUrl && (
            <div className="flex-1 flex gap-2 w-full">
              <input
                type="text"
                value={recordedName}
                onChange={(e) => setRecordedName(e.target.value)}
                placeholder="Name your Voice Note"
                className="flex-1 px-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-white rounded-xl placeholder-slate-600 focus:outline-none transition text-sm"
              />
              <button
                onClick={saveVoiceNote}
                disabled={!recordedName.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-650 text-white font-bold rounded-xl flex items-center gap-1 transition disabled:opacity-50 text-sm"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          )}
        </div>

        {recorderError && (
          <p className="text-red-400 text-xs font-semibold">{recorderError}</p>
        )}
      </div>

      {/* 🗣️ Natural TTS Voices dropdown */}
      <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="text-indigo-400" size={20} />
          <h4 className="font-bold text-sm text-slate-200">Natural TTS voice selector</h4>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <select
              value={selectedVoice}
              onChange={handleVoiceChange}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-200 rounded-xl focus:outline-none transition text-sm cursor-pointer appearance-none"
            >
              <option value="">Default English Voice (Natural/Google)</option>
              <option value="offline_melodious">🌟 Offline Melodious Voice Clone (SpeechT5)</option>
              {voices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <button
            onClick={testVoiceSpeech}
            disabled={isPreviewingVoice || localTTS.isDownloading}
            className="w-full sm:w-auto px-5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-indigo-400 font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm"
          >
            <Volume2 size={16} />
            {isPreviewingVoice ? 'Speaking...' : 'Preview Voice'}
          </button>
        </div>

        {selectedVoice === 'offline_melodious' && !localTTS.isReady && (
          <div className="p-3 mt-2 border border-emerald-500/30 bg-emerald-500/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
            <div className="flex flex-col text-xs text-emerald-400">
              <span className="font-bold">Model Download Required (~140MB)</span>
              <span>One-time download to enable true offline natural voice cloning.</span>
            </div>
            <button
              onClick={initLocalTTS}
              disabled={localTTS.isDownloading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition disabled:opacity-50 min-w-[120px] text-center"
            >
              {downloadProgress !== null ? `Downloading... ${downloadProgress}%` : 'Download Model'}
            </button>
          </div>
        )}
      </div>

      {/* Ringtone List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Music className="text-indigo-400" size={18} />
            <h4 className="font-bold text-sm text-slate-200">Ringtones & Audio Files</h4>
          </div>
          <label className="cursor-pointer px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-lg text-xs font-bold text-slate-300 transition">
            Upload File
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-1">
          {getFullRingtones().map((ringtone) => {
            const isSelected = selectedId === ringtone.id;
            const isTesting = testingId === ringtone.id;

            return (
              <div
                key={ringtone.id}
                onClick={() => selectRingtone(ringtone)}
                className={`p-4 flex items-center justify-between gap-4 border rounded-2xl cursor-pointer transition ${
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500/50'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/60'
                }`}
              >
                <div className="space-y-1 overflow-hidden flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-250 truncate block">{ringtone.name}</span>
                    {isSelected && (
                      <span className="inline-flex items-center justify-center p-0.5 bg-indigo-500 text-white rounded-full">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <p className="text-slate-550 text-xs truncate block">{ringtone.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTest(ringtone);
                    }}
                    className={`p-3 border rounded-xl transition ${
                      isTesting
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isTesting ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                  </button>

                  {ringtone.isCustom && (
                    <button
                      onClick={(e) => deleteVoiceNote(ringtone.id, e)}
                      className="p-3 border border-transparent hover:border-red-500/20 bg-transparent text-slate-500 hover:text-red-400 rounded-xl transition"
                    >
                      <Trash2 size={16} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Simple stub for Trash2 to avoid missing exports
const Trash2: React.FC<{className?: string, size?: number}> = ({ className, size=16 }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
      <line x1="10" x2="10" y1="11" y2="17"/>
      <line x1="14" x2="14" y1="11" y2="17"/>
    </svg>
  );
};
