import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Volume2, CheckCircle, Circle, RefreshCw } from 'lucide-react';
import { ttsBridge } from '../services/ttsBridge';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TASKS_KEY = 'awakure_tasks';

export const TasksPanel: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [announcing, setAnnouncing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TASKS_KEY);
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  }, []);

  const saveTasks = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem(TASKS_KEY, JSON.stringify(updated));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    };
    saveTasks([...tasks, task]);
    setNewTaskText('');
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTask = (id: string) => {
    saveTasks(
      tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAnnounce = async () => {
    const pendingTasks = tasks.filter(t => !t.completed);
    if (pendingTasks.length === 0) {
      setAnnouncing(true);
      await ttsBridge.speak("You have no pending tasks. Have a wonderful day!");
      setAnnouncing(false);
      return;
    }

    const text = `You have ${pendingTasks.length} pending task${
      pendingTasks.length > 1 ? 's' : ''
    } for today: ${pendingTasks.map((t, idx) => `${idx + 1}. ${t.text}`).join(', ')}`;

    setAnnouncing(true);
    await ttsBridge.speak(text);
    setAnnouncing(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Dashboard Progress Panel */}
      <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-bold text-white">Daily Tasks Overview</h3>
          <p className="text-slate-400 text-sm">
            Pending tasks are read out when your morning alarm triggers.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
            <button
              onClick={handleAnnounce}
              disabled={announcing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 font-semibold text-xs rounded-xl transition disabled:opacity-50"
            >
              {announcing ? <RefreshCw size={14} className="animate-spin" /> : <Volume2 size={14} />}
              {announcing ? 'Speaking...' : 'Listen to Run-down'}
            </button>
          </div>
        </div>

        {/* Progress Circle Ring */}
        <div className="relative flex items-center justify-center h-24 w-24">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="38"
              className="stroke-slate-800"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="38"
              className="stroke-indigo-500 transition-all duration-500 ease-out"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 38}
              strokeDashoffset={2 * Math.PI * 38 * (1 - progressPercent / 100)}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-lg font-black text-white">{progressPercent}%</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Done</span>
          </div>
        </div>
      </div>

      {/* Task input */}
      <form onSubmit={addTask} className="flex gap-3">
        <input
          type="text"
          value={newTaskText}
          onChange={e => setNewTaskText(e.target.value)}
          placeholder="What is your morning objective?"
          className="flex-1 px-5 py-3.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
        />
        <button
          type="submit"
          className="p-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/10 transition flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </form>

      {/* List of Tasks */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-500 text-sm">No tasks added for today. Add one above!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`p-4 flex items-center justify-between gap-4 border rounded-xl transition ${
                task.completed
                  ? 'bg-slate-900/10 border-slate-900/40 opacity-60'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/60'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-3 text-left flex-1"
              >
                {task.completed ? (
                  <CheckCircle className="text-emerald-400 shrink-0" size={20} />
                ) : (
                  <Circle className="text-slate-600 hover:text-indigo-400 shrink-0" size={20} />
                )}
                <span
                  className={`text-sm font-semibold transition ${
                    task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}
                >
                  {task.text}
                </span>
              </button>

              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
