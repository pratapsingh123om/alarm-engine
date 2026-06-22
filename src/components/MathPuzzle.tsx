import React, { useState, useEffect } from 'react';
import { Brain, Volume2 } from 'lucide-react';

interface MathPuzzleProps {
  label: string;
  onSolve: () => void;
}

export const MathPuzzle: React.FC<MathPuzzleProps> = ({ label, onSolve }) => {
  const [problem, setProblem] = useState({ text: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState(false);

  const generateProblem = () => {
    const types = ['add', 'subtract', 'multiply'];
    const type = types[Math.floor(Math.random() * types.length)];
    let a = 0, b = 0, text = '', answer = 0;

    if (type === 'add') {
      a = Math.floor(Math.random() * 89) + 10; // 10 - 98
      b = Math.floor(Math.random() * 89) + 10;
      text = `${a} + ${b}`;
      answer = a + b;
    } else if (type === 'subtract') {
      a = Math.floor(Math.random() * 89) + 10;
      b = Math.floor(Math.random() * (a - 10)) + 10; // Ensure positive result
      text = `${a} - ${b}`;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 11) + 2; // 2 - 12
      b = Math.floor(Math.random() * 11) + 2;
      text = `${a} × ${b}`;
      answer = a * b;
    }

    setProblem({ text, answer });
    setUserAnswer('');
    setError(false);
  };

  useEffect(() => {
    generateProblem();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(userAnswer.trim(), 10) === problem.answer) {
      onSolve();
    } else {
      setError(true);
      setUserAnswer('');
      // Vibrate if mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md p-8 bg-slate-900/80 border border-slate-700/50 rounded-3xl shadow-2xl backdrop-blur-xl text-center">
        <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl mb-6 animate-pulse">
          <Volume2 size={36} />
        </div>
        
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Rise and Shine!
        </h2>
        
        <p className="text-slate-400 text-sm mb-6 uppercase tracking-wider font-semibold">
          Alarm: {label || 'Wake Up'}
        </p>

        <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl mb-6">
          <div className="flex justify-center items-center gap-2 text-slate-400 text-xs font-semibold mb-2">
            <Brain size={14} className="text-emerald-400" />
            <span>COGNITIVE WAKE CHALLENGE</span>
          </div>
          <div className="text-4xl font-black text-white tracking-widest my-4">
            {problem.text}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="number"
              pattern="[0-9]*"
              inputMode="numeric"
              required
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
                setError(false);
              }}
              placeholder="Your Answer"
              className={`w-full px-6 py-4 bg-slate-950 text-center text-2xl font-bold text-white rounded-2xl border ${
                error ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/50'
              } focus:outline-none focus:ring-4 transition`}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-xs font-medium mt-2">
                Incorrect answer! Try again.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={generateProblem}
              className="flex-1 py-4 bg-slate-800/80 border border-slate-700/50 hover:bg-slate-700/80 text-white font-semibold rounded-2xl transition"
            >
              Skip Problem
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition"
            >
              Solve & Silence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
