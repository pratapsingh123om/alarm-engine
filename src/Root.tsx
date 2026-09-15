import { lazy, Suspense } from 'react';
import { MarketingSite } from './MarketingSite';

const AlarmApp = lazy(() => import('./App').then((module) => ({ default: module.AlarmApp })));

export function Root() {
  const showAlarmApp = new URLSearchParams(window.location.search).get('app') === '1';

  if (!showAlarmApp) return <MarketingSite />;

  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-slate-950 text-sm font-bold text-slate-400">
          Opening Awakure…
        </div>
      }
    >
      <AlarmApp />
    </Suspense>
  );
}

export default Root;
