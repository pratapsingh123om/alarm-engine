#pragma once

#include <QObject>
#include <QString>
#include <QVariantList>
#include <QTextToSpeech>
#include <QList>
#include <QTimer>

class AlarmEngine;
class ToDoList;

class Bridge : public QObject
{
    Q_OBJECT

public:
    explicit Bridge(QObject *parent = nullptr);

    void setTts(QTextToSpeech *ttsEngine);

signals:
    void alarmsUpdated(const QVariantList &alarms);
    void tasksUpdated(const QVariantList &tasks);
    void alarmTriggered(const QString &time, const QVariantList &tasks);

public slots:
    Q_INVOKABLE void addAlarm(int hour, int minute, const QString &label);
    Q_INVOKABLE void deleteAlarm(int index);
    Q_INVOKABLE QVariantList getAlarms();

    Q_INVOKABLE void addTask(const QString &text);
    Q_INVOKABLE void removeTask(int index);
    Q_INVOKABLE QVariantList getTasks();

    Q_INVOKABLE void speakTasks();

private:
    QTextToSpeech *tts { nullptr };
    struct AlarmItem {
        int hour;
        int minute;
        QString label;
    };
    QList<AlarmItem> alarms;
    QList<QTimer*> alarmTimers;
    QList<QString> tasks;

    void scheduleAlarm(const AlarmItem &alarm);
};

