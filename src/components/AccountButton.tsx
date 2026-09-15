import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  CloudOff,
  LoaderCircle,
  LogOut,
  RefreshCw,
  UserRound,
  X,
} from 'lucide-react';
import { useCloudAccount } from '../context/CloudAccountContext';

type FormMode = 'sign-in' | 'sign-up';

const friendlyError = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export const AccountButton = () => {
  const account = useCloudAccount();
  const [open, setOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setMessage(null);
    try {
      if (formMode === 'sign-in') {
        await account.signIn(email.trim(), password);
        setMessage('Signed in. Your local data and cloud data are now in sync.');
      } else {
        const result = await account.signUp(email.trim(), password);
        setMessage(
          result === 'check-email'
            ? 'Check your email to confirm the account, then return here to sign in.'
            : 'Account created. Cloud sync is active.',
        );
      }
      setPassword('');
    } catch (error) {
      setFormError(friendlyError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async () => {
    setFormError(null);
    try {
      await account.syncNow();
    } catch (error) {
      setFormError(friendlyError(error));
    }
  };

  const handleSignOut = async () => {
    setFormError(null);
    try {
      await account.signOut();
      setMessage('Signed out. Your alarms and tasks remain available on this device.');
    } catch (error) {
      setFormError(friendlyError(error));
    }
  };

  const label = account.initializing
    ? 'Loading'
    : account.user
      ? account.syncStatus === 'syncing'
        ? 'Syncing'
        : 'Cloud on'
      : 'Guest';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-indigo-500/50 hover:text-white"
        aria-label="Open account and cloud sync settings"
      >
        {account.initializing ? (
          <LoaderCircle size={15} className="animate-spin" />
        ) : account.user ? (
          <Cloud size={15} className="text-emerald-400" />
        ) : (
          <UserRound size={15} className="text-indigo-400" />
        )}
        <span className="hidden sm:inline">{label}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/85 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-title"
            className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-black/50"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-indigo-400">
                  Optional cloud backup
                </p>
                <h2 id="account-title" className="text-2xl font-black text-white">
                  {account.user ? 'Your Awakure account' : 'Guest or cloud — you choose'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Guest mode always works locally. An account adds private cross-device sync for alarms,
                  tasks and preferences.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-800 p-2 text-slate-400 transition hover:text-white"
                aria-label="Close account settings"
              >
                <X size={18} />
              </button>
            </div>

            {!account.configured ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <CloudOff size={18} /> Guest mode is active
                </div>
                <p className="mt-2 text-sm leading-6 text-amber-100/70">
                  Cloud accounts will appear after the Supabase public environment variables are added to
                  this deployment. Nothing blocks local use in the meantime.
                </p>
              </div>
            ) : account.user ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 size={18} /> Cloud sync enabled
                  </div>
                  <p className="mt-2 break-all text-sm text-emerald-100/70">{account.user.email}</p>
                  <p className="mt-2 text-xs text-emerald-100/60">
                    {account.syncStatus === 'syncing'
                      ? 'Syncing your latest changes…'
                      : account.syncStatus === 'synced'
                        ? 'Your data is up to date.'
                        : 'Local changes will sync automatically.'}
                  </p>
                </div>

                {(formError || account.syncError) && (
                  <p className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {formError || account.syncError}
                  </p>
                )}
                {message && <p className="text-sm text-slate-300">{message}</p>}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleSync}
                    disabled={account.syncStatus === 'syncing'}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-400 disabled:opacity-60"
                  >
                    <RefreshCw
                      size={16}
                      className={account.syncStatus === 'syncing' ? 'animate-spin' : ''}
                    />
                    Sync now
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-red-500/40 hover:text-red-300"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-900 p-1.5">
                  {(['sign-in', 'sign-up'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setFormMode(mode);
                        setFormError(null);
                        setMessage(null);
                      }}
                      className={`rounded-xl px-3 py-2.5 text-xs font-black transition ${
                        formMode === mode
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block text-xs font-bold text-slate-300">
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                      className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                      placeholder="you@example.com"
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-300">
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={formMode === 'sign-in' ? 'current-password' : 'new-password'}
                      minLength={6}
                      required
                      className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                      placeholder="At least 6 characters"
                    />
                  </label>

                  {(formError || account.syncError) && (
                    <p className="flex items-start gap-2 text-sm text-red-300">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      {formError || account.syncError}
                    </p>
                  )}
                  {message && <p className="text-sm leading-6 text-emerald-300">{message}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-400 disabled:opacity-60"
                  >
                    {submitting && <LoaderCircle size={16} className="animate-spin" />}
                    {formMode === 'sign-in' ? 'Sign in & sync' : 'Create account'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-xs font-bold text-slate-500 transition hover:text-slate-300"
                >
                  Continue as guest — no account needed
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
};
