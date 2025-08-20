// Simple in-memory store with localStorage persistence for preview
const STORE_KEY = 'awakure_preview_state';
const state = loadState() || {
  alarms: [
    { hour: 7, minute: 0, label: 'Wake up' },
    { hour: 7, minute: 30, label: 'Workout' }
  ],
  tasks: ['Drink water', '5-min stretch', 'Check calendar']
};

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}
function loadState() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; }
}

function pad2(n) { return String(n).padStart(2, '0'); }

function renderAlarms() {
  const list = document.getElementById('alarms-list');
  list.innerHTML = '';
  state.alarms.forEach((a, idx) => {
    const li = document.createElement('li');

    const left = document.createElement('div');
    left.className = 'item-left';
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = `${pad2(a.hour)}:${pad2(a.minute)}`;
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = a.label ? `• ${a.label}` : '';
    left.append(time, label);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const test = document.createElement('button');
    test.className = 'secondary';
    test.textContent = 'Test';
    test.onclick = () => simulateAlarm(a);

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = () => {
      state.alarms.splice(idx, 1);
      saveState(); renderAlarms();
    };

    actions.append(test, del);
    li.append(left, actions);
    list.appendChild(li);
  });
}

function renderTasks() {
  const list = document.getElementById('tasks-list');
  list.innerHTML = '';
  state.tasks.forEach((t, idx) => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.className = 'item-left';
    const txt = document.createElement('span');
    txt.textContent = t;
    left.append(txt);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = () => {
      state.tasks.splice(idx, 1);
      saveState(); renderTasks();
    };
    actions.append(del);
    li.append(left, actions);
    list.appendChild(li);
  });
}

function simulateAlarm(alarm) {
  alert(`Alarm ${pad2(alarm.hour)}:${pad2(alarm.minute)}!`);
  speakTasks();
}

function speakTasks() {
  // Preview speech using Web Speech API (if available)
  const text =
    state.tasks.length === 0
      ? 'Good morning! You have no tasks.'
      : `Good morning! Here are your tasks: ${state.tasks.map((t, i) => `${i + 1}. ${t}.`).join(' ')}`;

  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } else {
    alert(text);
  }
}

function wireEvents() {
  document.getElementById('add-alarm').onclick = () => {
    const hour = Math.max(0, Math.min(23, parseInt(document.getElementById('alarm-hour').value || '0', 10)));
    const minute = Math.max(0, Math.min(59, parseInt(document.getElementById('alarm-minute').value || '0', 10)));
    const label = document.getElementById('alarm-label').value || '';
    state.alarms.push({ hour, minute, label });
    saveState(); renderAlarms();
    document.getElementById('alarm-hour').value = '';
    document.getElementById('alarm-minute').value = '';
    document.getElementById('alarm-label').value = '';
  };

  document.getElementById('add-task').onclick = () => {
    const text = (document.getElementById('task-text').value || '').trim();
    if (!text) return;
    state.tasks.push(text);
    saveState(); renderTasks();
    document.getElementById('task-text').value = '';
  };

  document.getElementById('speak').onclick = speakTasks;
}

wireEvents();
renderAlarms();
renderTasks();