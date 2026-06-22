import React, { useState, useEffect, useRef } from 'react';
import { Brain, Camera, Activity, Volume2, ShieldAlert, Award, Timer } from 'lucide-react';

interface WakeChallengeProps {
  label: string;
  challengeType: 'math' | 'photo' | 'motion' | 'pushup';
  referencePhoto?: string;
  targetReps?: number;
  pushupDuration?: number;
  onSolve: () => void;
}

export const WakeChallenge: React.FC<WakeChallengeProps> = ({
  label,
  challengeType,
  referencePhoto,
  targetReps = 10,
  pushupDuration = 60,
  onSolve
}) => {
  // Common states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Math Puzzle States
  const [mathProblem, setMathProblem] = useState({ text: '', answer: 0 });
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathError, setMathError] = useState(false);

  // 2. Photo Match States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // 3. Motion Shake States
  const [motionReps, setMotionReps] = useState(0);
  const [isMotionListening, setIsMotionListening] = useState(false);
  const motionLastTimeRef = useRef<number>(0);
  const motionLastForceRef = useRef<number>(0);
  // Desktop webcam motion fallback states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);

  // 4. Pushup Hold States
  const [pushupTimer, setPushupDurationTimer] = useState(pushupDuration);
  const [isPushupPositionActive, setIsPushupPositionActive] = useState(false);
  const [calibratedBrightness, setCalibratedBrightness] = useState<number | null>(null);
  const [currentBrightness, setCurrentBrightness] = useState(0);

  // Initialize Challenges
  useEffect(() => {
    if (challengeType === 'math') {
      generateMathProblem();
    } else if (challengeType === 'photo' || challengeType === 'pushup') {
      startCamera();
    } else if (challengeType === 'motion') {
      setupMotionTracking();
    }

    return () => {
      stopCamera();
      cleanupMotionTracking();
    };
  }, [challengeType]);

  // --- CAMERA HELPERS ---
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setErrorMsg('Webcam access required for this challenge.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // --- 1. MATH CHALLENGE LOGIC ---
  const generateMathProblem = () => {
    const types = ['add', 'subtract', 'multiply'];
    const type = types[Math.floor(Math.random() * types.length)];
    let a = 0, b = 0, text = '', answer = 0;

    if (type === 'add') {
      a = Math.floor(Math.random() * 89) + 10;
      b = Math.floor(Math.random() * 89) + 10;
      text = `${a} + ${b}`;
      answer = a + b;
    } else if (type === 'subtract') {
      a = Math.floor(Math.random() * 89) + 10;
      b = Math.floor(Math.random() * (a - 10)) + 10;
      text = `${a} - ${b}`;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 9) + 3; // 3 - 11
      b = Math.floor(Math.random() * 9) + 3;
      text = `${a} × ${b}`;
      answer = a * b;
    }

    setMathProblem({ text, answer });
    setMathAnswer('');
    setMathError(false);
  };

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathAnswer.trim(), 10) === mathProblem.answer) {
      onSolve();
    } else {
      setMathError(true);
      setMathAnswer('');
    }
  };

  // --- 2. PHOTO MATCH CHALLENGE LOGIC ---
  const getGrayscaleData = (imgData: ImageData) => {
    const data = imgData.data;
    const grayscale = new Float32Array(imgData.width * imgData.height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      // Standard brightness formula
      grayscale[i / 4] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
    return grayscale;
  };

  const comparePhotos = async () => {
    if (!videoRef.current || !referencePhoto || isComparing) return;
    setIsComparing(true);
    setErrorMsg(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get 2d context');

      // 1. Draw and extract live feed grayscale values
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const liveData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const liveGray = getGrayscaleData(liveData);

      // 2. Draw and extract reference photo grayscale values
      const refImg = new Image();
      refImg.src = referencePhoto;
      await new Promise((res, rej) => {
        refImg.onload = res;
        refImg.onerror = rej;
      });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(refImg, 0, 0, canvas.width, canvas.height);
      const refData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const refGray = getGrayscaleData(refData);

      // 3. Compute Mean Absolute Error (MAE)
      let diffSum = 0;
      for (let i = 0; i < liveGray.length; i++) {
        diffSum += Math.abs(liveGray[i] - refGray[i]);
      }
      const avgDiff = diffSum / liveGray.length;
      console.log('Grayscale Image Average Difference:', avgDiff);

      // Threshold: 0.18 (18%) difference allows some minor light difference
      if (avgDiff <= 0.18) {
        stopCamera();
        onSolve();
      } else {
        setErrorMsg('Photos do not match. Move closer or fix lighting.');
        setTimeout(() => setErrorMsg(null), 3000);
      }
    } catch (e) {
      console.error('Image compare error:', e);
      setErrorMsg('Matching failed. Try again.');
    } finally {
      setIsComparing(false);
    }
  };

  // --- 3. MOTION SHAKE CHALLENGE LOGIC ---
  const setupMotionTracking = () => {
    if ('DeviceMotionEvent' in window) {
      setIsMotionListening(true);
      window.addEventListener('devicemotion', handleDeviceMotion);
    } else {
      // Fallback: Start camera-based motion check
      startCamera();
      setErrorMsg('No motion sensors detected. Using camera motion tracking.');
    }
  };

  const cleanupMotionTracking = () => {
    if (isMotionListening) {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      setIsMotionListening(false);
    }
  };

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    const acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    // Throttle shake checks to 250ms to count cycles
    if (now - motionLastTimeRef.current > 250) {
      if (magnitude > 15 && Math.abs(magnitude - motionLastForceRef.current) > 8) {
        setMotionReps(prev => {
          const next = prev + 1;
          if (next >= targetReps) {
            cleanupMotionTracking();
            onSolve();
          }
          return next;
        });
        motionLastTimeRef.current = now;
      }
      motionLastForceRef.current = magnitude;
    }
  };

  // Desktop Camera Motion Detector loop (analyzes raw camera frame changes)
  useEffect(() => {
    if (challengeType !== 'motion' || isMotionListening || !cameraStream) return;

    const interval = setInterval(() => {
      if (!videoRef.current) return;
      try {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvasRef.current = canvas;
        canvas.width = 48;
        canvas.height = 36;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (prevFrameRef.current) {
          const prev = prevFrameRef.current.data;
          const curr = currentFrame.data;
          let diffSum = 0;
          for (let i = 0; i < curr.length; i += 4) {
            // Difference in pixel brightness
            const diff = Math.abs(curr[i] - prev[i]) + Math.abs(curr[i+1] - prev[i+1]) + Math.abs(curr[i+2] - prev[i+2]);
            diffSum += diff / 3;
          }
          const avgDiff = diffSum / (canvas.width * canvas.height);

          // If change is large, it means user moved actively
          if (avgDiff > 25) {
            setMotionReps(prev => {
              const next = prev + 1;
              if (next >= targetReps) {
                stopCamera();
                onSolve();
              }
              return next;
            });
          }
        }
        prevFrameRef.current = currentFrame;
      } catch (e) {
        console.error(e);
      }
    }, 400); // Check frame diff every 400ms

    return () => clearInterval(interval);
  }, [challengeType, isMotionListening, cameraStream, targetReps]);

  // --- 4. PUSH-UP / PLANK HOLD CHALLENGE LOGIC ---
  useEffect(() => {
    if (challengeType !== 'pushup' || !cameraStream) return;

    // 1. Calibration & Brightness Check Interval
    const brightnessInterval = setInterval(() => {
      if (!videoRef.current) return;
      try {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvasRef.current = canvas;
        canvas.width = 16;
        canvas.height = 12;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += (0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
        }
        const avgBrightness = sum / (data.length / 4);
        setCurrentBrightness(avgBrightness);

        if (calibratedBrightness === null) {
          // Calibrate baseline ambient light (takes 2 seconds)
          setCalibratedBrightness(avgBrightness);
        } else {
          // If shadow blocks light (brightness drops significantly below baseline)
          // Or if it drops below a fixed threshold (e.g. 45/255 representing dark shadow)
          const threshold = Math.max(calibratedBrightness * 0.5, 40);
          const inPosition = avgBrightness < threshold;
          setIsPushupPositionActive(inPosition);
        }
      } catch (e) {
        console.error(e);
      }
    }, 250);

    // 2. Push-up timer countdown (ticks only when hovering is active)
    const timerInterval = setInterval(() => {
      if (isPushupPositionActive) {
        setPushupDurationTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            clearInterval(brightnessInterval);
            stopCamera();
            onSolve();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      clearInterval(brightnessInterval);
      clearInterval(timerInterval);
    };
  }, [challengeType, cameraStream, calibratedBrightness, isPushupPositionActive]);

  const repsProgressPercent = challengeType === 'motion' ? Math.min(Math.round((motionReps / targetReps) * 100), 100) : 0;
  const pushupProgressPercent = challengeType === 'pushup' ? Math.min(Math.round(((pushupDuration - pushupTimer) / pushupDuration) * 100), 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md p-8 bg-slate-900/80 border border-slate-700/50 rounded-3xl shadow-2xl backdrop-blur-xl text-center">
        
        <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl mb-4 animate-pulse">
          <Volume2 size={36} />
        </div>
        
        <h2 className="text-2xl font-black text-white tracking-tight mb-1">
          Rise and Shine!
        </h2>
        
        <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-6">
          Alarm: {label || 'Wake Up'}
        </p>

        {/* MATH CHALLENGE VIEW */}
        {challengeType === 'math' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl">
              <div className="flex justify-center items-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider mb-2">
                <Brain size={12} className="text-indigo-400" />
                <span>🧠 MATH CHALLENGE</span>
              </div>
              <div className="text-4xl font-black text-white tracking-wider my-4">
                {mathProblem.text}
              </div>
            </div>

            <form onSubmit={handleMathSubmit} className="space-y-4">
              <input
                type="number"
                pattern="[0-9]*"
                inputMode="numeric"
                required
                value={mathAnswer}
                onChange={(e) => {
                  setMathAnswer(e.target.value);
                  setMathError(false);
                }}
                placeholder="Enter result"
                className={`w-full px-5 py-4 bg-slate-950 text-center text-xl font-bold text-white rounded-xl border ${
                  mathError ? 'border-red-500' : 'border-slate-800 focus:border-indigo-500'
                } focus:outline-none transition`}
                autoFocus
              />
              {mathError && (
                <p className="text-red-400 text-xs font-semibold">Incorrect answer, try again.</p>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={generateMathProblem}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition"
                >
                  Skip Problem
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/10 transition"
                >
                  Silence
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PHOTO MATCH CHALLENGE VIEW */}
        {challengeType === 'photo' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider">
              <Camera size={12} className="text-indigo-400" />
              <span>📸 TAKE PHOTO OF REFERENCE OBJECT</span>
            </div>

            {errorMsg && (
              <p className="p-3 bg-red-500/10 border border-red-500/20 text-red-450 rounded-xl text-xs font-semibold">
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Reference</span>
                <div className="aspect-square bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex items-center justify-center">
                  {referencePhoto ? (
                    <img src={referencePhoto} className="w-full h-full object-cover" alt="Ref" />
                  ) : (
                    <span className="text-xs text-slate-600">No Reference</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Live Camera</span>
                <div className="aspect-square bg-slate-950 border border-slate-850 rounded-xl overflow-hidden relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                </div>
              </div>
            </div>

            <button
              onClick={comparePhotos}
              disabled={isComparing}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
            >
              {isComparing ? 'Matching...' : 'Capture & Match'}
            </button>
          </div>
        )}

        {/* MOTION SHAKE CHALLENGE VIEW */}
        {challengeType === 'motion' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider">
              <Activity size={12} className="text-indigo-400" />
              <span>📳 SHAKE DEVICE ACTIVELY</span>
            </div>

            {errorMsg && (
              <p className="text-slate-500 text-xs italic">{errorMsg}</p>
            )}

            {/* Circular rep progress */}
            <div className="relative flex items-center justify-center h-32 w-32 mx-auto my-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  className="stroke-indigo-500 transition-all duration-300 ease-out"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - repsProgressPercent / 100)}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white">{motionReps}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">of {targetReps} reps</span>
              </div>
            </div>

            {/* Webcam video tracking visible when sensors are missing */}
            {!isMotionListening && (
              <div className="aspect-video bg-slate-950 border border-slate-850 rounded-xl overflow-hidden relative max-w-[200px] mx-auto my-4 transform -scale-x-100">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* PUSH-UP / PLANK HOLD CHALLENGE VIEW */}
        {challengeType === 'pushup' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-bold tracking-wider">
              <Timer size={12} className="text-indigo-400" />
              <span>🧘 PUSH-UP / PLANK HOLD CHALLENGE</span>
            </div>

            {errorMsg && (
              <p className="text-red-400 text-xs font-semibold">{errorMsg}</p>
            )}

            {/* Circular Timer progress */}
            <div className="relative flex items-center justify-center h-32 w-32 mx-auto my-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  className={`transition-all duration-1000 ease-linear ${
                    isPushupPositionActive ? 'stroke-emerald-400' : 'stroke-slate-700'
                  }`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - pushupProgressPercent / 100)}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{pushupTimer}s</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Time Remaining</span>
              </div>
            </div>

            <div className="aspect-video bg-slate-950 border border-slate-850 rounded-xl overflow-hidden relative max-w-[200px] mx-auto my-4 transform -scale-x-100">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>

            {/* Position active status check */}
            <div className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 transition ${
              isPushupPositionActive 
                ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400 animate-pulse' 
                : 'bg-slate-950/60 border-slate-850 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                {isPushupPositionActive ? (
                  <>
                    <Award size={16} />
                    <span className="font-bold text-sm">Position Active! (Hold plank)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} className="text-amber-500" />
                    <span className="font-medium text-xs">Get down! Hover chest over camera/screen</span>
                  </>
                )}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                Ambient Light: {Math.round(currentBrightness)} (Threshold: {calibratedBrightness !== null ? Math.round(Math.max(calibratedBrightness * 0.5, 40)) : '--'})
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
