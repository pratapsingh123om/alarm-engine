import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { CloudAccountContext } from './CloudAccountContext';
import {
  CLOUD_SYNC_STATUS_EVENT,
  synchronizeAccountData,
  type CloudSyncStatus,
} from '../services/cloudSync';
import { isCloudConfigured, supabase } from '../services/supabaseClient';

interface CloudAccountProviderProps {
  children: ReactNode;
}

interface SyncStatusEventDetail {
  status: CloudSyncStatus;
  error?: string;
}

export const CloudAccountProvider = ({ children }: CloudAccountProviderProps) => {
  const [initializing, setInitializing] = useState(isCloudConfigured);
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const handleSyncStatus = (event: Event) => {
      const detail = (event as CustomEvent<SyncStatusEventDetail>).detail;
      setSyncStatus(detail.status);
      setSyncError(detail.error || null);
    };
    window.addEventListener(CLOUD_SYNC_STATUS_EVENT, handleSyncStatus);
    return () => window.removeEventListener(CLOUD_SYNC_STATUS_EVENT, handleSyncStatus);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return;
      if (error) setSyncError(error.message);
      setUser(data.session?.user || null);
      if (data.session?.user) {
        try {
          await synchronizeAccountData(data.session.user.id);
        } catch {
          // The sync event already exposes the actionable error in the account UI.
        }
      }
      if (active) setInitializing(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user || null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Cloud accounts are not configured yet.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) await synchronizeAccountData(data.user.id);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Cloud accounts are not configured yet.');
    const redirectUrl = new URL(window.location.href);
    redirectUrl.searchParams.set('app', '1');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl.toString() },
    });
    if (error) throw error;
    if (data.session && data.user) {
      await synchronizeAccountData(data.user.id);
      return 'signed-in';
    }
    return 'check-email';
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
    setSyncStatus('idle');
    setSyncError(null);
  }, []);

  const syncNow = useCallback(async () => {
    if (!user) return;
    await synchronizeAccountData(user.id);
  }, [user]);

  const value = useMemo(
    () => ({
      configured: isCloudConfigured,
      initializing,
      user,
      syncStatus,
      syncError,
      signIn,
      signUp,
      signOut,
      syncNow,
    }),
    [initializing, signIn, signOut, signUp, syncError, syncNow, syncStatus, user],
  );

  return <CloudAccountContext.Provider value={value}>{children}</CloudAccountContext.Provider>;
};
