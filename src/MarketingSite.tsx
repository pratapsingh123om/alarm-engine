import {
  AlarmClock,
  ArrowRight,
  Brain,
  Camera,
  Check,
  ChevronRight,
  Dumbbell,
  Code2,
  Headphones,
  LockKeyhole,
  Monitor,
  MoonStar,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sunrise,
  Volume2,
  Zap,
} from 'lucide-react';

const githubUrl = 'https://github.com/pratapsingh123om/alarm-engine';

const challenges = [
  { icon: Brain, number: '01', title: 'Solve it', description: 'Clear a quick math problem before the alarm can stop.', accent: 'text-violet-300' },
  { icon: Camera, number: '02', title: 'Match it', description: 'Recreate a photo in another room and get out of bed for real.', accent: 'text-amber-300' },
  { icon: Zap, number: '03', title: 'Move it', description: 'Shake your device until your body catches up with the morning.', accent: 'text-cyan-300' },
  { icon: Dumbbell, number: '04', title: 'Hold it', description: 'Complete a timed plank or push-up hold to silence the sound.', accent: 'text-emerald-300' },
];

export function MarketingSite() {
  return (
    <div className="marketing-page min-h-screen overflow-hidden bg-[#07080d] text-white selection:bg-violet-400/30">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#07080d]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <a href="#top" className="group flex items-center gap-3" aria-label="Awakure home">
            <span className="grid size-10 place-items-center rounded-[14px] bg-gradient-to-br from-violet-500 to-indigo-700 shadow-[0_8px_30px_rgba(124,58,237,0.28)] transition-transform group-hover:-rotate-3"><Sunrise size={21} strokeWidth={2.25} /></span>
            <span>
              <span className="block text-[17px] font-extrabold leading-none tracking-[-0.02em]">Awakure</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.22em] text-white/38">Intentional awakening</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/58 md:flex" aria-label="Primary navigation">
            <a className="transition hover:text-white" href="#how-it-works">How it works</a>
            <a className="transition hover:text-white" href="#challenges">Challenges</a>
            <a className="transition hover:text-white" href="#privacy">Privacy</a>
          </nav>

          <a href="?app=1" className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white px-4 text-sm font-extrabold text-[#090a10] transition hover:bg-violet-100 sm:px-5">
            Open app <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </header>

      <main id="top">
        <section className="relative isolate mx-auto grid min-h-[820px] max-w-[1440px] items-center gap-14 px-5 pb-20 pt-36 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:px-12 lg:pt-28">
          <div className="pointer-events-none absolute left-[8%] top-28 -z-10 size-[440px] rounded-full bg-violet-700/16 blur-[120px]" />
          <div className="relative z-10 max-w-[650px] lg:pl-8">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/8 px-3.5 py-2 text-xs font-bold text-violet-200">
              <Sparkles size={14} /> Built for people who can sleep through anything
            </div>
            <h1 className="max-w-[680px] text-[clamp(3.3rem,7vw,6.9rem)] font-black leading-[0.88] tracking-[-0.065em]">
              An alarm you have to <span className="sunrise-word">earn</span> the right to silence.
            </h1>
            <p className="mt-8 max-w-[590px] text-lg leading-8 text-white/58 sm:text-xl">
              Awakure replaces half-asleep taps with a real wake challenge—then reads your morning plan when you are actually ready to hear it.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="?app=1" className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#f1f6ef] px-6 text-[15px] font-black text-[#090a10] shadow-[0_16px_50px_rgba(237,244,233,0.12)] transition hover:-translate-y-0.5 hover:bg-white">
                <Play size={17} fill="currentColor" /> Try the web app <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#download" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 text-[15px] font-bold text-white transition hover:border-white/25 hover:bg-white/8">
                Get Awakure <ChevronRight size={16} />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/42">
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-300" /> No account</span>
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-300" /> Offline voice</span>
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-300" /> Local-first data</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[760px] lg:mr-[-5vw] lg:max-w-none">
            <div className="hero-frame relative aspect-[16/11] overflow-hidden rounded-[32px] border border-white/10 bg-[#12131c] shadow-[0_40px_120px_rgba(0,0,0,0.58)] sm:rounded-[44px]">
              <img src="./awakure-hero.png" alt="A phone showing a 6:00 AM math challenge beside a bed at sunrise" className="h-full w-full object-cover object-[59%_center]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080910]/42 via-transparent to-transparent" />
              <div className="absolute left-5 top-5 rounded-2xl border border-white/12 bg-[#090a10]/66 px-4 py-3 backdrop-blur-xl sm:left-7 sm:top-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Next alarm</p>
                <p className="mt-1 text-xl font-black tracking-tight sm:text-2xl">6:00 AM</p>
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-white/12 bg-[#090a10]/74 p-3.5 backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-auto sm:w-[290px] sm:p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-violet-500 text-white"><Brain size={19} /></span>
                  <div><p className="text-xs font-bold text-white/45">Wake challenge</p><p className="mt-0.5 text-sm font-extrabold">Solve 7 × 8 to silence</p></div>
                </div>
                <span className="size-2.5 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
              </div>
            </div>
            <div className="absolute -bottom-7 right-[8%] hidden items-center gap-3 rounded-2xl border border-amber-200/16 bg-[#17130d]/90 px-4 py-3 shadow-2xl backdrop-blur-xl sm:flex">
              <Volume2 size={18} className="text-amber-300" />
              <div><p className="text-xs font-extrabold">Morning rundown ready</p><p className="mt-0.5 text-[11px] text-white/42">3 tasks queued for voice</p></div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/7 bg-white/[0.018]">
          <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-px px-5 sm:px-8 md:grid-cols-4">
            {[
              ['04', 'wake challenges'], ['100%', 'offline-capable'], ['03', 'platform targets'], ['00', 'accounts required'],
            ].map(([value, label]) => (
              <div key={label} className="border-white/7 px-4 py-8 text-center first:border-l-0 md:border-l">
                <p className="text-2xl font-black tracking-[-0.04em] text-white">{value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/32">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-[1180px] px-5 py-28 sm:px-8 sm:py-36">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="section-kicker">The morning sequence</p>
              <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">From ringing to ready in three deliberate moves.</h2>
              <p className="mt-6 max-w-lg text-lg leading-8 text-white/50">A wake-up flow that closes the gap between opening your eyes and starting your day.</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: AlarmClock, step: '01', title: 'Set a real intention', copy: 'Choose your time, sound, repeat schedule, and the challenge that will work on tomorrow-you.', color: 'bg-violet-400 text-violet-950' },
                { icon: Dumbbell, step: '02', title: 'Prove you are awake', copy: 'The sound keeps going until your chosen mental, photo, or movement challenge is complete.', color: 'bg-amber-300 text-amber-950' },
                { icon: Headphones, step: '03', title: 'Hear the day ahead', copy: 'Once the challenge is cleared, Awakure reads your pending tasks aloud so momentum has somewhere to go.', color: 'bg-emerald-300 text-emerald-950' },
              ].map(({ icon: Icon, step, title, copy, color }) => (
                <article key={step} className="group grid gap-5 rounded-[28px] border border-white/8 bg-white/[0.035] p-6 transition hover:border-white/15 hover:bg-white/[0.055] sm:grid-cols-[70px_1fr_auto] sm:items-center sm:p-8">
                  <span className={`grid size-14 place-items-center rounded-2xl ${color}`}><Icon size={24} /></span>
                  <div><p className="text-xs font-black tracking-[0.16em] text-white/28">STEP {step}</p><h3 className="mt-2 text-2xl font-black tracking-[-0.03em]">{title}</h3><p className="mt-2 max-w-xl leading-7 text-white/48">{copy}</p></div>
                  <ChevronRight className="hidden text-white/20 transition group-hover:translate-x-1 group-hover:text-white/50 sm:block" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="challenges" className="relative border-y border-white/7 bg-[#0c0d14] px-5 py-28 sm:px-8 sm:py-36">
          <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 max-w-3xl bg-violet-600/10 blur-[120px]" />
          <div className="relative mx-auto max-w-[1180px]">
            <div className="max-w-3xl"><p className="section-kicker">Pick your resistance</p><h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Your sleepy brain has tricks. So does Awakure.</h2></div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {challenges.map(({ icon: Icon, number, title, description, accent }) => (
                <article key={title} className="challenge-card group min-h-[330px] rounded-[28px] border border-white/8 bg-[#11131c] p-6">
                  <div className="flex items-center justify-between"><span className={`grid size-12 place-items-center rounded-2xl bg-white/5 ${accent}`}><Icon size={22} /></span><span className="text-xs font-black tracking-[0.16em] text-white/18">{number}</span></div>
                  <div className="mt-28"><h3 className="text-2xl font-black tracking-[-0.03em]">{title}</h3><p className="mt-3 text-[15px] leading-7 text-white/46">{description}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="privacy" className="mx-auto max-w-[1180px] px-5 py-28 sm:px-8 sm:py-36">
          <div className="overflow-hidden rounded-[36px] border border-emerald-200/12 bg-gradient-to-br from-[#111a18] via-[#0b1112] to-[#11101b] p-7 sm:p-12 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-end">
              <div>
                <span className="grid size-14 place-items-center rounded-2xl bg-emerald-300 text-emerald-950"><ShieldCheck size={26} /></span>
                <p className="section-kicker mt-8 !text-emerald-200/72">Private by default</p>
                <h2 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Your mornings stay on your device.</h2>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/50">Alarm schedules, tasks, custom sounds, and voice playback are designed to work locally. No account setup. No daily routine uploaded just to wake you up.</p>
              </div>
              <div className="grid gap-3">
                {[
                  { icon: LockKeyhole, title: 'Local-first storage', copy: 'Your routine remains available without a cloud account.' },
                  { icon: MoonStar, title: 'Works offline', copy: 'Core alarms, challenges, sounds, and voice do not depend on morning Wi-Fi.' },
                  { icon: ShieldCheck, title: 'Permission-aware', copy: 'Camera and notification access are requested only for the features that need them.' },
                ].map(({ icon: Icon, title, copy }) => (
                  <div key={title} className="flex gap-4 rounded-2xl border border-white/8 bg-black/15 p-4">
                    <Icon className="mt-0.5 shrink-0 text-emerald-300" size={19} />
                    <div><p className="font-extrabold">{title}</p><p className="mt-1 text-sm leading-6 text-white/42">{copy}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="download" className="border-t border-white/7 px-5 py-28 sm:px-8 sm:py-36">
          <div className="mx-auto max-w-[1180px]">
            <div className="mx-auto max-w-3xl text-center"><p className="section-kicker">Get Awakure</p><h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">Start with the web app. Take it native when you’re ready.</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/50">The live web experience is available now. Windows and Android packaging are the next public-release milestone.</p></div>
            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              <article className="rounded-[28px] border border-violet-300/20 bg-violet-400/8 p-6 sm:p-8">
                <div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-violet-400 text-violet-950"><Play size={21} fill="currentColor" /></span><span className="rounded-full bg-emerald-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-950">Available now</span></div>
                <h3 className="mt-10 text-2xl font-black">Web app</h3><p className="mt-3 min-h-14 text-sm leading-6 text-white/48">Try the alarm planner, tasks, sounds, and challenge flow in your browser.</p><a href="?app=1" className="group mt-7 inline-flex items-center gap-2 font-extrabold text-violet-200">Launch Awakure <ArrowRight size={16} className="transition group-hover:translate-x-1" /></a>
              </article>
              <article className="rounded-[28px] border border-white/8 bg-white/[0.035] p-6 sm:p-8">
                <div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-white/8 text-white"><Monitor size={21} /></span><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/36">Packaging next</span></div>
                <h3 className="mt-10 text-2xl font-black">Windows</h3><p className="mt-3 min-h-14 text-sm leading-6 text-white/48">A portable desktop build with tray protection and a desktop shortcut.</p><a href={`${githubUrl}#-installation--build`} target="_blank" rel="noreferrer" className="group mt-7 inline-flex items-center gap-2 font-extrabold text-white/72 hover:text-white">Build from source <ArrowRight size={16} className="transition group-hover:translate-x-1" /></a>
              </article>
              <article className="rounded-[28px] border border-white/8 bg-white/[0.035] p-6 sm:p-8">
                <div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-white/8 text-white"><Smartphone size={21} /></span><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/36">Packaging next</span></div>
                <h3 className="mt-10 text-2xl font-black">Android</h3><p className="mt-3 min-h-14 text-sm leading-6 text-white/48">Native exact-alarm support designed to wake reliably through idle mode.</p><a href={`${githubUrl}#-installation--build`} target="_blank" rel="noreferrer" className="group mt-7 inline-flex items-center gap-2 font-extrabold text-white/72 hover:text-white">Build from source <ArrowRight size={16} className="transition group-hover:translate-x-1" /></a>
              </article>
            </div>
            <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-[24px] border border-white/8 bg-white/[0.025] p-5 text-center sm:flex-row sm:p-6 sm:text-left">
              <div className="flex items-center gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-black"><Code2 size={21} /></span><div><p className="font-extrabold">Follow the public build</p><p className="mt-1 text-sm text-white/40">Source, packaging instructions, and future downloads live on GitHub.</p></div></div>
              <a href={githubUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 px-5 text-sm font-extrabold transition hover:bg-white hover:text-black">View repository <ArrowRight size={15} /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/7 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-violet-500"><Sunrise size={18} /></span><div><p className="font-extrabold">Awakure</p><p className="text-xs text-white/30">Wake up with intent.</p></div></div>
          <p className="text-xs font-semibold text-white/28">© 2026 Awakure. Built for better mornings.</p>
        </div>
      </footer>
    </div>
  );
}
