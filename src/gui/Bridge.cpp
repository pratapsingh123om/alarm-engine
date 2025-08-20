#include "Bridge.hpp"

#include <QVariant>
#include <QVariantList>
#include <QDateTime>
#include <QTime>

Bridge::Bridge(QObject *parent)
    : QObject(parent)
{
}

void Bridge::setTts(QTextToSpeech *ttsEngine)
{
    tts = ttsEngine;
}

void Bridge::addAlarm(int hour, int minute, const QString &label)
{
    AlarmItem item { hour, minute, label };
    alarms.append(item);
    scheduleAlarm(item);

    QVariantList out;
    for (const auto &a : alarms) {
        QVariantMap m; m["hour"] = a.hour; m["minute"] = a.minute; m["label"] = a.label; out.push_back(m);
    }
    emit alarmsUpdated(out);
}

void Bridge::deleteAlarm(int index)
{
    if (index < 0 || index >= alarms.size()) return;
    alarms.removeAt(index);

    // Rebuild timers simply: clear all and reschedule
    for (auto *t : alarmTimers) {
        t->stop();
        t->deleteLater();
    }
    alarmTimers.clear();
    for (const auto &a : alarms) scheduleAlarm(a);

    QVariantList out;
    for (const auto &a : alarms) {
        QVariantMap m; m["hour"] = a.hour; m["minute"] = a.minute; m["label"] = a.label; out.push_back(m);
    }
    emit alarmsUpdated(out);
}

QVariantList Bridge::getAlarms()
{
    QVariantList out;
    for (const auto &a : alarms) {
        QVariantMap m; m["hour"] = a.hour; m["minute"] = a.minute; m["label"] = a.label; out.push_back(m);
    }
    return out;
}

void Bridge::addTask(const QString &text)
{
    tasks.append(text);
    QVariantList out;
    for (const auto &t : tasks) out.push_back(QVariantMap{{"text", t}});
    emit tasksUpdated(out);
}

void Bridge::removeTask(int index)
{
    if (index < 0 || index >= tasks.size()) return;
    tasks.removeAt(index);
    QVariantList out;
    for (const auto &t : tasks) out.push_back(QVariantMap{{"text", t}});
    emit tasksUpdated(out);
}

QVariantList Bridge::getTasks()
{
    QVariantList out;
    for (const auto &t : tasks) out.push_back(QVariantMap{{"text", t}});
    return out;
}

void Bridge::speakTasks()
{
    if (tts == nullptr) return;
    if (tasks.isEmpty()) { tts->say("Good morning! You have no tasks."); return; }
    QString spoken = "Good morning! Here are your tasks: ";
    for (int i = 0; i < tasks.size(); ++i) {
        spoken += QString::number(i + 1) + ". " + tasks[i] + ". ";
    }
    tts->say(spoken);
}

void Bridge::scheduleAlarm(const AlarmItem &alarm)
{
    // Calculate milliseconds until next occurrence today or tomorrow
    QTime target(alarm.hour, alarm.minute);
    QTime now = QTime::currentTime();
    qint64 msecs = now.msecsTo(target);
    if (msecs <= 0) msecs += 24ll * 60 * 60 * 1000; // next day

    QTimer *timer = new QTimer(this);
    timer->setSingleShot(true);
    connect(timer, &QTimer::timeout, this, [this, alarm, timer]() {
        // Speak tasks then re-schedule for next day
        speakTasks();
        QVariantList out;
        for (const auto &t : tasks) out.push_back(QVariantMap{{"text", t}});
        const QString timeStr = QString("%1:%2").arg(QString::number(alarm.hour).rightJustified(2, '0'))
                                               .arg(QString::number(alarm.minute).rightJustified(2, '0'));
        emit alarmTriggered(timeStr, out);
        // schedule same timer for next day (24h)
        timer->start(24 * 60 * 60 * 1000);
    });
    timer->start(static_cast<int>(msecs));
    alarmTimers.append(timer);
}

