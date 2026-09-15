import type { Alarm } from './alarmBridge';
import { isCloudConfigured, supabase } from './supabaseClient';

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export const CLOUD_DATA_APPLIED_EVENT = 'awakure:cloud-data-applied';
export const CLOUD_SYNC_STATUS_EVENT = 'awakure:cloud-sync-status';

const ALARMS_KEY = 'awakure_alarms';
const TASKS_KEY = 'awakure_tasks';
const RINGTONE_KEY = 'awakure_ringtone_id';
const MUSIC_URL_KEY = 'awakure_music_url';
const TTS_VOICE_KEY = 'awakure_tts_voice_name';
const UPDATED_AT_KEY = 'awakure_local_updated_at';
const EMPTY_TIMESTAMP = '1970-01-01T00:00:00.000Z';

interface StoredTask {
  id: string;
  text: string;
  completed: boolean;
}

interface CloudPreferences {
  ringtoneId?: string;
  musicUrl?: string;
  ttsVoiceName?: string;
}

interface CloudSnapshot {
  alarms: Alarm[];
  tasks: StoredTask[];
  preferences: CloudPreferences;
  updatedAt: string;
}

interface CloudRow {
  alarms: Alarm[] | null;
  tasks: StoredTask[] | null;
  preferences: CloudPreferences | null;
  updated_at: string;
}

interface SyncStatusDetail {
  status: CloudSyncStatus;
  error?: string;
}

let uploadTimer: number | undefined;

const emitStatus = (detail: SyncStatusDetail) => {
  window.dispatchEvent(new CustomEvent<SyncStatusDetail>(CLOUD_SYNC_STATUS_EVENT, { detail }));
};

const readArray = <T>(key: string): T[] => {
  try {
    const stored = localStorage.getItem(key);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const hasLocalData = (alarms: Alarm[], tasks: StoredTask[], preferences: CloudPreferences) =>
  alarms.length > 0 || tasks.length > 0 || Object.keys(preferences).length > 0;

const readLocalSnapshot = (): CloudSnapshot => {
  const alarms = readArray<Alarm>(ALARMS_KEY);
  const tasks = readArray<StoredTask>(TASKS_KEY);
  const preferences: CloudPreferences = {};
  const ringtoneId = localStorage.getItem(RINGTONE_KEY);
  const musicUrl = localStorage.getItem(MUSIC_URL_KEY);
  const ttsVoiceName = localStorage.getItem(TTS_VOICE_KEY);

  if (ringtoneId) preferences.ringtoneId = ringtoneId;
  // Blob/data URLs represent device-local recordings and should not be copied to the cloud.
  if (musicUrl && !musicUrl.startsWith('blob:') && !musicUrl.startsWith('data:')) {
    preferences.musicUrl = musicUrl;
  }
  if (ttsVoiceName) preferences.ttsVoiceName = ttsVoiceName;

  let updatedAt = localStorage.getItem(UPDATED_AT_KEY) || EMPTY_TIMESTAMP;
  if (updatedAt === EMPTY_TIMESTAMP && hasLocalData(alarms, tasks, preferences)) {
    updatedAt = new Date().toISOString();
    localStorage.setItem(UPDATED_AT_KEY, updatedAt);
  }

  return { alarms, tasks, preferences, updatedAt };
};

const applyCloudSnapshot = (snapshot: CloudSnapshot) => {
  localStorage.setItem(ALARMS_KEY, JSON.stringify(snapshot.alarms));
  localStorage.setItem(TASKS_KEY, JSON.stringify(snapshot.tasks));

  const preferenceEntries: Array<[string, string | undefined]> = [
    [RINGTONE_KEY, snapshot.preferences.ringtoneId],
    [MUSIC_URL_KEY, snapshot.preferences.musicUrl],
    [TTS_VOICE_KEY, snapshot.preferences.ttsVoiceName],
  ];
  preferenceEntries.forEach(([key, value]) => {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  });

  localStorage.setItem(UPDATED_AT_KEY, snapshot.updatedAt);
  window.dispatchEvent(new Event(CLOUD_DATA_APPLIED_EVENT));
};

const uploadSnapshot = async (userId: string, snapshot: CloudSnapshot) => {
  if (!supabase) return;

  const { error } = await supabase.from('awakure_user_data').upsert(
    {
      user_id: userId,
      alarms: snapshot.alarms,
      tasks: snapshot.tasks,
      preferences: snapshot.preferences,
      payload_version: 1,
      updated_at: snapshot.updatedAt,
    },
    { onConflict: 'user_id' },
  );

  if (error) throw error;
};

export const synchronizeAccountData = async (userId: string) => {
  if (!supabase) return;
  emitStatus({ status: 'syncing' });

  try {
    const localSnapshot = readLocalSnapshot();
    const { data, error } = await supabase
      .from('awakure_user_data')
      .select('alarms,tasks,preferences,updated_at')
      .eq('user_id', userId)
      .maybeSingle<CloudRow>();

    if (error) throw error;

    if (!data) {
      const firstSnapshot = {
        ...localSnapshot,
        updatedAt:
          localSnapshot.updatedAt === EMPTY_TIMESTAMP ? new Date().toISOString() : localSnapshot.updatedAt,
      };
      localStorage.setItem(UPDATED_AT_KEY, firstSnapshot.updatedAt);
      await uploadSnapshot(userId, firstSnapshot);
    } else {
      const cloudSnapshot: CloudSnapshot = {
        alarms: Array.isArray(data.alarms) ? data.alarms : [],
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        preferences: data.preferences || {},
        updatedAt: data.updated_at,
      };

      if (new Date(localSnapshot.updatedAt).getTime() > new Date(cloudSnapshot.updatedAt).getTime()) {
        await uploadSnapshot(userId, localSnapshot);
      } else {
        applyCloudSnapshot(cloudSnapshot);
      }
    }

    emitStatus({ status: 'synced' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cloud sync failed.';
    emitStatus({ status: 'error', error: message });
    throw error;
  }
};

export const queueCloudUpload = () => {
  if (!isCloudConfigured || !supabase) return;
  const client = supabase;
  if (uploadTimer) window.clearTimeout(uploadTimer);

  uploadTimer = window.setTimeout(async () => {
    const { data } = await client.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return;

    emitStatus({ status: 'syncing' });
    try {
      await uploadSnapshot(userId, readLocalSnapshot());
      emitStatus({ status: 'synced' });
    } catch (error) {
      emitStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Cloud sync failed.',
      });
    }
  }, 700);
};

export const markLocalDataChanged = () => {
  localStorage.setItem(UPDATED_AT_KEY, new Date().toISOString());
  queueCloudUpload();
};
