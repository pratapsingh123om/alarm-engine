let bridge = null;

function populateAlarms(alarms) {
  const list = document.getElementById('alarms-list');
  list.innerHTML = '';
  alarms.forEach((a, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${a.hour.toString().padStart(2, '0')}:${a.minute.toString().padStart(2, '0')} <span class="muted">${a.label || ''}</span></span>`;
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = () => bridge && bridge.deleteAlarm(idx);
    li.appendChild(del);
    list.appendChild(li);
  });
}

function populateTasks(tasks) {
  const list = document.getElementById('tasks-list');
  list.innerHTML = '';
  tasks.forEach((t, idx) => {
    const li = document.createElement('li');
    li.textContent = t.text || t;
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = () => bridge && bridge.removeTask(idx);
    li.appendChild(del);
    list.appendChild(li);
  });
}

new QWebChannel(qt.webChannelTransport, (channel) => {
  bridge = channel.objects.bridge;

  document.getElementById('add-alarm').onclick = () => {
    const hour = parseInt(document.getElementById('alarm-hour').value, 10) || 0;
    const minute = parseInt(document.getElementById('alarm-minute').value, 10) || 0;
    const label = document.getElementById('alarm-label').value || '';
    bridge.addAlarm(hour, minute, label);
  };

  document.getElementById('add-task').onclick = () => {
    const text = document.getElementById('task-text').value;
    if (text && text.trim().length > 0) {
      bridge.addTask(text.trim());
      document.getElementById('task-text').value = '';
    }
  };

  document.getElementById('speak').onclick = () => bridge.speakTasks();

  // Initial fetch
  Promise.resolve(bridge.getAlarms()).then(populateAlarms);
  Promise.resolve(bridge.getTasks()).then(populateTasks);

  // Listen for updates
  bridge.alarmsUpdated.connect(populateAlarms);
  bridge.tasksUpdated.connect(populateTasks);
  bridge.alarmTriggered.connect((time, tasks) => {
    alert(`Alarm ${time}!`);
    populateTasks(tasks);
  });
});

