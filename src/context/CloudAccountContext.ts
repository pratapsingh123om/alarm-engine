import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { CloudSyncStatus } from '../services/cloudSync';

export interface CloudAccountValue {
  configured: boolean;
  initializing: boolean;
  user: User | null;
  syncStatus: CloudSyncStatus;
  syncError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<'signed-in' | 'check-email'>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
}

export const CloudAccountContext = createContext<CloudAccountValue | null>(null);

export const useCloudAccount = () => {
  const value = useContext(CloudAccountContext);
  if (!value) throw new Error('useCloudAccount must be used inside CloudAccountProvider.');
  return value;
};
